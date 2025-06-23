from django.db import models
from django.contrib.auth.models import User

class Meme(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memes')
    image = models.ImageField(upload_to='memes/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    caption = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.caption[:20] if self.caption else ''}"
