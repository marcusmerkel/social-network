
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following", views.index_following, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts", views.new_post, name="new_post"),
    path("posts/all/<int:page>", views.all_posts, name="all_posts"),
    path("posts/following/<int:page>", views.following_posts, name="following_posts"),
    path("posts/<str:category>/count", views.page_count, name="page_count"),
    path("posts/<int:post_id>", views.post, name="post"),
    path("posts/<int:post_id>/edit", views.post_edit, name="edit_post"),
    path("posts/<str:username>/<int:page>", views.user_posts, name="user_posts"),
    path("profile/<str:username>", views.profile_view, name="profile"),
    path("profile/<str:username>/data", views.profile_data, name="profile_data"),
]
