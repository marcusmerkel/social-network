class LikeButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        if (!this.props.login) {
            return null;
        }
        if (this.props.liked) {
            return (
                <div className="like_button_container d-inline mr-2">
                    <button 
                        onClick={() => {this.props.onClick(this.props.postId)}} 
                        className="btn btn-outline-secondary" 
                    >
                        Unlike
                    </button>
                </div>
            );
        } else {
            return (
                <div className="like_button_container d-inline mr-2">
                    <button 
                        onClick={() => {this.props.onClick(this.props.postId)}} 
                        className="btn btn-outline-primary" 
                    >
                        Like
                    </button>
                </div>
            );
        }
    }
}

function editLink(props) {
    return (
        <a href={props.href} onClick={props.onClick} className="ml-3">Edit this post</a>
    ); 
}

function authorLink(props) {
    const href = "/profile/" + props.author;
    return (
        <a href={href}>{props.author}</a>
    )
}

class Post extends React.Component {
    constructor(props) {
        super(props);
        const liked = this.props.likers.includes(this.props.username) ? true : false;
        this.state = {
            liked: liked,
            likes: this.props.likes,
            text: this.props.text,
            editing: false,
        }
    }

    handleClick(postId) {
        console.log("Click on " + postId + "!");
        const csrftoken = getCookie('csrftoken');

        const request = new Request(
            `/posts/${postId}`,
            {headers: {'X-CSRFToken': csrftoken}}
        );

        let liked;

        if (this.state.liked) {
            this.setState({liked: false, likes: this.state.likes - 1});
            liked = false;
        } else {
            this.setState({liked: true, likes: this.state.likes + 1});
            liked = true;
        }

        fetch(request, {
            method: 'PUT',
            mode: 'same-origin',
            body: JSON.stringify({
                username: this.props.username,
                liked: liked,
            })
        });
    }

    handleEditClick(postId) {
        this.setState({editing: true});
    }

    handleEditSave(postId) {
        const csrftoken = getCookie('csrftoken');
        const edit_text = document.querySelector('#edit-text').value;

        const request = new Request(
            `/posts/${postId}/edit`,
            {headers: {'X-CSRFToken': csrftoken}}
        );

        fetch(request, {
            method: 'PUT',
            mode: 'same-origin',
            body: JSON.stringify({
                text: edit_text
            })
        })
        .then(response => {
            if (response.status === 201) {
                this.setState({
                    editing: false,
                    text: edit_text,
                });
            }
        });
    }

    render() {
        // if normal post view
        if (this.state.editing === false) {
            const edit = (this.props.author === this.props.username) ? editLink({href: "#", onClick: () => this.handleEditClick(this.props.id)}) : "";
            const author = authorLink({author: this.props.author});
            const login = this.props.username ? true : false;
    
            return (
                <div className="border p-3 my-2" id={this.props.id}>
                    <div className="mt-2">
                        <strong>{author}</strong> <span className="text-muted">on {this.props.pub_date}</span> {edit}
                    </div>
                    <div className="mt-2">{this.state.text}</div><br />
                    <LikeButton liked={this.state.liked} postId={this.props.id} login={login} onClick={() => this.handleClick(this.props.id)} />
                    <div className="mt-2 d-inline"><span className="text-danger">&hearts;</span> {this.state.likes}</div>
                </div>
            ); 
        } else {
            // if editing post
            return (
                <div className="border p-3 my-2" id={this.props.id}>
                    <div className="mt-2">
                        <strong>Edit this post</strong> <span className="text-muted"><i>from {this.props.pub_date}</i></span>
                    </div>
                    <div className="mt-2"><textarea id="edit-text" className="form-control" defaultValue={this.state.text}></textarea>
                    <input type="submit" onClick={() => this.handleEditSave(this.props.id)} value="Save post" className="btn btn-primary mt-2"></input></div>
                </div>
            )
        }
        
    }
}

class NewPostForm extends React.Component {
    render() {
        return (
            <div>
                <h4>New Post</h4>
                <form id="new_post_form">
                    <textarea name="text" id="new_post_text" rows="3" className="form-control"></textarea>
                    <input type="submit" className="btn btn-outline-success mt-2" value="Post" />
                </form>
            </div>
        );
    }
}

class FollowButton extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        if (this.props.followed) {
            return (
                <div>
                    <small className="mb-2 d-block">You are following {this.props.username}.</small>
                    <button onClick={() => this.props.onClick(this.props.username)} className="btn btn-danger lead" id="follow-btn">Unfollow {this.props.username}</button>
                </div>
            );
        } else {
            return <button onClick={() => this.props.onClick(this.props.username)} className="btn btn-success lead" id="follow-btn">Follow {this.props.username}</button>;
        }
    }
    
}

class ProfileHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            followed: this.props.followed,
            following: this.props.following,
            followers: this.props.followers,
        }
    }

    handleClick() {
        const csrftoken = getCookie('csrftoken');
        const loginuser = document.querySelector('#username').innerHTML.slice(1, -1);

        const request = new Request(
            `/profile/${this.props.username}/data`,
            {headers: {'X-CSRFToken': csrftoken}}
        );
        
        let followed;
        
        if (this.state.followed) {
            this.setState({followed: false, followers: this.state.followers - 1});
            followed = false;
        } else {
            this.setState({followed: true, followers: this.state.followers + 1});
            followed = true;
        }
        
        fetch(request, {
            method: 'PUT',
            mode: 'same-origin',
            body: JSON.stringify({
                username: this.props.username,
                loginuser: loginuser,
                followed: followed,
            })
        });

    }
    
    render() {
        const loginuser = document.querySelector('#username').innerHTML.slice(1, -1);
        const followBtn = loginuser != this.props.username ? <FollowButton onClick={() => this.handleClick(username)} username={this.props.username} followed={this.state.followed} /> : "";

        let newPost;
        if (this.props.owner) { // if viewer is owner of this profile
            newPost = <div id="new_post" className="border p-4 my-4"><NewPostForm /></div>;
        } else {
            newPost = "";
        }
        return (
            <div>
                <h2 id="heading">{this.props.username}</h2>
                {followBtn}
                <div className="my-3">
                    <div className="border p-4">
                        <span className="lead">{this.state.followers} Followers</span>
                    </div>
                    <div className="border p-4">
                        <span className="lead">Following {this.state.following}</span>
                    </div>
                </div>
                {newPost}
            </div>
        )
    }
}

class Navi extends React.Component {
    render() {
        if (this.props.disabled) {
            return (
                <li className="page-item disabled">
                    <a className="page-link">{this.props.text}</a>
                </li>
            )
        } else {
            return (
                <li className="page-item" onClick={this.props.onClick}>
                    <a className="page-link">{this.props.text}</a>
                </li>        )
        }
    }
}


class PageNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            actualPage: 1
        }
    }

    handleClick(pageNum) {
        if (this.state.actualPage + pageNum < 1 || this.state.actualPage + pageNum > this.props.page_count) {
            return;
        } else {
            this.setState({
                actualPage: this.state.actualPage + pageNum,
            });
        }
    }

    render() {
        const prevDisabled = this.state.actualPage === 1 ? true : false;
        const nextDisabled = this.state.actualPage === this.props.page_count ? true : false;
        let prev = <Navi text="Previous" disabled={prevDisabled} onClick={() => this.handleClick(-1)} />;
        let next = <Navi text="Next" disabled={nextDisabled} onClick={() => this.handleClick(1)} />;
        load_posts(this.props.category, this.state.actualPage);
        return (
            <nav id="page-nav">
                <ul className="pagination justify-content-center">
                    {prev}
                    {next}
                </ul>
            </nav>
        );
    }
}