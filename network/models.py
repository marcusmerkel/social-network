from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("self", related_name="follower", symmetrical=False)

    def __str__(self):
        return self.username


class Post(models.Model):
    text = models.CharField(max_length=128)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    pub_date = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    
    def __str__(self):
        return f"Post by {self.author} on {self.pub_date}"

    def serialize(self):
        return {
            "id": self.id,
            "text": self.text,
            "author": self.author.username,
            "pub_date": self.pub_date.strftime("%b %-d %Y, %-I:%M %p"),
            "likes": self.likes.count(),
            "likers": [user.username for user in self.likes.all()],
        }

