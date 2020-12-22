import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie

from .models import User, Post


@ensure_csrf_cookie
def index(request):
    return render(request, "network/index.html", {
        "page": "all",
    })


@ensure_csrf_cookie
@login_required
def index_following(request):
    return render(request, "network/index.html", {
        "page": "following",
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@login_required
def profile_view(request, username):
    """Rendering Profile View"""

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return redirect("index")
    return render(request, "network/profile.html")


@login_required
def profile_data(request, username):
    """API route to retrieve user data"""

    try:
        user = User.objects.get(username=username)
        loginuser = User.objects.get(username=request.user.username)
    except User.DoesNotExist:
        return JsonResponse({"error": f"User {username} does not exist."}, status=402)

    # PUT triggered by pushing the followButton
    if request.method == "PUT":
        data = json.loads(request.body)
        # if loginuser just followed username 
        if data.get("followed"):
            loginuser.following.add(user)
            print(f"Adding {loginuser} as a follower of {user}!")
        # if loginuser just unfollowed username
        else:
            loginuser.following.remove(user)
            print(f"Removing {loginuser} as a follower of {user}!")
        loginuser.save()
        return HttpResponse(status=201)

    # GET request to receive profile data
    elif request.method == "GET":
        
        followed = True if loginuser.following.filter(username=username).exists() else False
        following = user.following.count()
        followers = user.follower.count()

        return JsonResponse({
            "username": username, 
            "followers": followers, 
            "following": following, 
            "followed": followed
            })

    else:
        return JsonResponse({"error": "Incorrect method"}, status=304)


def page_count(request, category):
    """Returning the number of posts for "all", "following" or <username>"""
    
    if request.method != "GET":
        return redirect("index")
    
    if category == "all":
        post_count = Post.objects.all().count()
    elif category == "following":
        loginuser = User.objects.get(username=request.user.username)
        post_count = 0
        for u in loginuser.following.all():
            post_count += u.posts.all().count()
    else:
        try:
            user = User.objects.get(username=category)
        except User.DoesNotExist:
            return JsonResponse({"error": f"Category {category} does not exist."}, status=402)
        post_count = Post.objects.filter(author=user).all().count()    
    
    page_count = post_count // 10 if post_count >= 10 else 1
    page_count += 1 if post_count % 10 != 0 else page_count

    print(f"page count: {page_count}, post count: {post_count}")

    return JsonResponse({"post_count": post_count, "page_count": page_count})


def all_posts(request, page):
    """API route to retrieve all posts by page number"""
    posts = Paginator(Post.objects.order_by("-pub_date").all(), 10)
    posts_page = posts.page(page).object_list
    return JsonResponse([post.serialize() for post in posts_page], safe=False)


@login_required
def user_posts(request, username, page):
    """API route to retrieve all posts by user"""

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": f"User {username} does not exist."}, status=402)
    posts = Paginator(Post.objects.filter(author=user).order_by("-pub_date").all(), 10)
    posts_page = posts.page(page).object_list
    return JsonResponse([post.serialize() for post in posts_page], safe=False)


@login_required
def following_posts(request, page):
    """API route to retrieve the posts of all users 
    that are being followed by loginuser
    by page number"""

    loginuser = User.objects.get(username=request.user.username)
    posts = []
    for u in loginuser.following.all():
        for p in u.posts.all():
            posts.append(p)

    posts = Paginator(sorted(posts, key=lambda i: i.pub_date, reverse=True), 10)
    posts_page = posts.page(page).object_list

    return JsonResponse([post.serialize() for post in posts_page], safe=False)



@login_required
def new_post(request):
    """Creating a new post"""

    if (request.method != "POST"):
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)
    try:
        user = User.objects.get(username=data.get("username"))
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exist."}, status=302)
    text = data.get("text")

    post = Post(text=text, author=user)
    post.save()

    return JsonResponse({"message": "Posted successfully."}, status=201)


@login_required
def post(request, post_id):
    """Getting post data via GET request 
    or saving a like on a post via PUT"""

    # Query for requested post
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    if request.method == "GET":
        return JsonResponse(post.serialize())

    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("liked"):
            post.likes.add(request.user)
            print(f"Adding {request.user}'s like!")
        else:
            post.likes.remove(request.user)
            print(f"Removing {request.user}'s like!")
        post.save()
        return HttpResponse(status=201)

    
@login_required
def post_edit(request, post_id):
    """Editing a post via PUT"""

    # Query for requested post
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        post.text = data.get("text")
        post.save()
        return HttpResponse(status=201)
    else:
        return JsonResponse({"error": "Incorrect method"}, status=304)
    
