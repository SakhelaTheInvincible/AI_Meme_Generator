from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.response import Response
from .models import Meme
from .serializers import MemeSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

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

# Get memes by username
class MemeListByUserView(generics.ListAPIView):
    serializer_class = MemeSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        username = self.kwargs['username']
        return Meme.objects.filter(user__username=username)

# Get all memes
class MemeListView(generics.ListAPIView):
    queryset = Meme.objects.all().order_by('-created_at')
    serializer_class = MemeSerializer
    permission_classes = (permissions.AllowAny,)

# Upload meme
class MemeUploadView(generics.CreateAPIView):
    serializer_class = MemeSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)