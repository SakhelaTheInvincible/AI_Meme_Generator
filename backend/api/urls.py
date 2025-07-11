from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileView, MemeDetailView, MemeListByUserView, MemeListView, MemeUploadView, MemeUpvoteView, MemeDownvoteView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('memes/<int:id>/', MemeDetailView.as_view(), name='meme-detail'),
    path('memes/user/<str:username>/', MemeListByUserView.as_view(), name='memes-by-user'),
    path('memes/', MemeListView.as_view(), name='memes-list'),
    path('memes/upload/', MemeUploadView.as_view(), name='meme-upload'),
    path('memes/<int:id>/upvote/', MemeUpvoteView.as_view(), name='meme-upvote'),
    path('memes/<int:id>/downvote/', MemeDownvoteView.as_view(), name='meme-downvote'),
] 

