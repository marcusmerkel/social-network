function load_posts(category, page) { // category i.e. "all", "following"
    fetch(`/posts/${category}/${page}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        if (category === "all") {
            document.querySelector('#posts').innerHTML = '<h2 id="heading">All Posts</h2><div class="container border my-4 p-4" id="new_post"></div>';
        } else if (category === "following") {
            document.querySelector('#posts').innerHTML = '<h2 id="heading" class="mb-3">Posts of people that you are following</h2><div class="container border my-4 p-4" id="new_post"></div>';
        } else {
            document.querySelector('#posts').innerHTML = '';
        }
        posts.forEach(post => {
            add_post(post);
        });
    })
    .then(() => {
        if (category === "all") {
            ReactDOM.render(<NewPostForm />, document.querySelector('#new_post'));

            document.querySelector('#new_post_form').onsubmit = (evt) => {
                console.log('posting new post...');
                evt.preventDefault();
                new_post();
            }
        } else if (category === "following") {
            document.querySelector('#new_post').style.display = "none";
        }
    })
} // Displaying post view for 'all' or 'following'


function load_user(username) {
    const profile_div = document.querySelector('#profile');
    const loginuser = document.querySelector('#username').innerHTML.slice(1, -1);
    const owner = loginuser === username ? true : false;

    fetch(`/profile/${username}/data`)
    .then(response => response.json())
    .then(data => {
        ReactDOM.render(<ProfileHeader username={data.username} followers={data.followers} following={data.following} followed={data.followed} owner={owner} />, profile_div);
    })
    .then(() => {
        if (owner) {
            document.querySelector('#new_post_form').onsubmit = (evt) => {
                console.log('posting new post...');
                evt.preventDefault();
                new_post();
            }
        }
    });

    fetch(`/posts/${username}/count`)
    .then(response => response.json())
    .then(result => {
      const post_count = result.post_count;
      const page_count = result.page_count;
      if (result.post_count > 10) {
        ReactDOM.render(<PageNav category={username} page_count={result.page_count} />, document.querySelector('#page-nav-container'));
      } else if (result.post_count > 0) {
        load_posts(username, 1);
      } else {
        document.querySelector('#posts').innerHTML = '<div class="mt-3 lead">There are no posts to display.</div>';
      }
    });
    
} // Displaying the USER PROFILE with profile page and user posts

function add_post(post) {
    const username = document.querySelector('#username').innerHTML.slice(1, -1);
    const post_div = document.createElement('div');
    post_div.id = post.id;

    document.querySelector('#posts').appendChild(post_div);
    ReactDOM.render(<Post key={post.id} id={post.id} text={post.text} author={post.author} pub_date={post.pub_date} likes={post.likes} likers={post.likers} username={username} />, document.getElementById(post.id));
}

function new_post() {
    const csrftoken = getCookie('csrftoken');
    const username = document.querySelector('#username').innerHTML.slice(1, -1);
    const text = document.querySelector('#new_post_text').value;
    const delay = ms => new Promise(res => setTimeout(res, ms));

    const request = new Request(
        `/posts`,
        {headers: {'X-CSRFToken': csrftoken}}
    );

    fetch(request, {
        method: 'POST',
        mode: 'same-origin',
        body: JSON.stringify({
            username: username,
            text: text,
        })
    })
    .then(async response => {
        if (response.status === 201) {
            const newPost = document.querySelector('#new_post');
            newPost.innerHTML = '<h5 class="text-success">Posted successfully!</h3>';
            newPost.style.opacity = 1;
            await delay(1000);
            (function fade(){
                (newPost.style.opacity-=.1) < 0 ? newPost.style.display = "none" : setTimeout(fade,70);
            })();

            await delay(500);
            location.reload();
        }
    });
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
} // from Django Documentation: https://docs.djangoproject.com/en/3.1/ref/csrf/
