from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Meme, UserVote

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class MemeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meme
        fields = ('image', 'image_url', 'caption')

class MemeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    image = serializers.SerializerMethodField()
    userVote = serializers.SerializerMethodField()

    class Meta:
        model = Meme
        fields = ('id', 'user', 'image', 'image_url', 'caption', 'created_at', 'upvote', 'downvote', 'userVote')
        read_only_fields = ('user', 'created_at')

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_userVote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                user_vote = UserVote.objects.get(user=request.user, meme=obj)
                return user_vote.vote_type
            except UserVote.DoesNotExist:
                return None
        return None 