from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, MemeUploadSerializer
from rest_framework.response import Response
from .models import Meme, UserVote
from .serializers import MemeSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.views import APIView
from django.db import transaction
from ai.services import get_image_context, generate_meme_captions, meme_with_captions
from django.core.files.base import ContentFile
import io
from ai.services import get_image_context, generate_meme_captions, meme_with_captions
from django.core.files.base import ContentFile
import io

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)

class ProfileView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

# Get meme by id
class MemeDetailView(generics.RetrieveAPIView):
    queryset = Meme.objects.all()
    serializer_class = MemeSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = 'id'

    def get_serializer_context(self):
        return {'request': self.request}

# Get memes by username
class MemeListByUserView(generics.ListAPIView):
    serializer_class = MemeSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        username = self.kwargs['username']
        return Meme.objects.filter(user__username=username)

    def get_serializer_context(self):
        return {'request': self.request}

# Get all memes
class MemeListView(generics.ListAPIView):
    queryset = Meme.objects.all().order_by('-created_at')
    serializer_class = MemeSerializer
    permission_classes = (permissions.AllowAny,)

    def get_serializer_context(self):
        return {'request': self.request}

# Upload meme
class MemeUploadView(generics.CreateAPIView):
    serializer_class = MemeUploadSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # save meme first to get the image path
        meme = serializer.save(user=self.request.user)
        image_source = meme.image.path if meme.image else meme.image_url
             
        if image_source:
            try:
                context = get_image_context(image_source)
                captions = generate_meme_captions(context)
                final_meme = meme_with_captions(image_source, captions)
                
                meme.caption = "\n".join(captions)

                buffer = io.BytesIO()
                final_meme.save(buffer, format='JPEG', quality=90)
                buffer.seek(0)
                
                filename = f"ai_meme_{meme.id}.jpg"
                meme.image.save(
                    filename,
                    ContentFile(buffer.read()),
                    save=False
                )
                meme.save()
            except Exception as e:
                pass

class MemeUpvoteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request, id):
        meme = get_object_or_404(Meme, id=id)
        user = request.user
        
        # Get or create user vote
        user_vote, created = UserVote.objects.get_or_create(
            user=user, 
            meme=meme,
            defaults={'vote_type': 'upvote'}
        )
        
        if not created:
            if user_vote.vote_type == 'upvote':
                # User is removing their upvote
                user_vote.delete()
                meme.upvote = max(0, meme.upvote - 1)
            else:
                # User is changing from downvote to upvote
                user_vote.vote_type = 'upvote'
                user_vote.save()
                meme.upvote += 1
                meme.downvote = max(0, meme.downvote - 1)
        else:
            # New upvote
            meme.upvote += 1
            
        meme.save()
        return Response({'upvote': meme.upvote, 'downvote': meme.downvote}, status=status.HTTP_200_OK)

class MemeDownvoteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request, id):
        meme = get_object_or_404(Meme, id=id)
        user = request.user
        
        # Get or create user vote
        user_vote, created = UserVote.objects.get_or_create(
            user=user, 
            meme=meme,
            defaults={'vote_type': 'downvote'}
        )
        
        if not created:
            if user_vote.vote_type == 'downvote':
                # User is removing their downvote
                user_vote.delete()
                meme.downvote = max(0, meme.downvote - 1)
            else:
                # User is changing from upvote to downvote
                user_vote.vote_type = 'downvote'
                user_vote.save()
                meme.downvote += 1
                meme.upvote = max(0, meme.upvote - 1)
        else:
            # New downvote
            meme.downvote += 1
            
        meme.save()
        return Response({'upvote': meme.upvote, 'downvote': meme.downvote}, status=status.HTTP_200_OK)