from django.db import models
from django.contrib.auth.models import User

class Meme(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memes')
    image = models.ImageField(upload_to='memes/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    caption = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    upvote = models.IntegerField(default=0)
    downvote = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.caption[:20] if self.caption else ''}"

class UserVote(models.Model):
    VOTE_CHOICES = [
        ('upvote', 'Upvote'),
        ('downvote', 'Downvote'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    meme = models.ForeignKey(Meme, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'meme')  # One vote per user per meme
    
    def __str__(self):
        return f"{self.user.username} {self.vote_type}d {self.meme.id}"
