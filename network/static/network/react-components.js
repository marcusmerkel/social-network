class LikeButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.login) {
      return null;
    }

    if (this.props.liked) {
      return /*#__PURE__*/React.createElement("div", {
        className: "like_button_container d-inline mr-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          this.props.onClick(this.props.postId);
        },
        className: "btn btn-outline-secondary"
      }, "Unlike"));
    } else {
      return /*#__PURE__*/React.createElement("div", {
        className: "like_button_container d-inline mr-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          this.props.onClick(this.props.postId);
        },
        className: "btn btn-outline-primary"
      }, "Like"));
    }
  }

}

function editLink(props) {
  return /*#__PURE__*/React.createElement("a", {
    href: props.href,
    onClick: props.onClick,
    className: "ml-3"
  }, "Edit this post");
}

function authorLink(props) {
  const href = "/profile/" + props.author;
  return /*#__PURE__*/React.createElement("a", {
    href: href
  }, props.author);
}

class Post extends React.Component {
  constructor(props) {
    super(props);
    const liked = this.props.likers.includes(this.props.username) ? true : false;
    this.state = {
      liked: liked,
      likes: this.props.likes,
      text: this.props.text,
      editing: false
    };
  }

  handleClick(postId) {
    console.log("Click on " + postId + "!");
    const csrftoken = getCookie('csrftoken');
    const request = new Request(`/posts/${postId}`, {
      headers: {
        'X-CSRFToken': csrftoken
      }
    });
    let liked;

    if (this.state.liked) {
      this.setState({
        liked: false,
        likes: this.state.likes - 1
      });
      liked = false;
    } else {
      this.setState({
        liked: true,
        likes: this.state.likes + 1
      });
      liked = true;
    }

    fetch(request, {
      method: 'PUT',
      mode: 'same-origin',
      body: JSON.stringify({
        username: this.props.username,
        liked: liked
      })
    });
  }

  handleEditClick(postId) {
    this.setState({
      editing: true
    });
  }

  handleEditSave(postId) {
    const csrftoken = getCookie('csrftoken');
    const edit_text = document.querySelector('#edit-text').value;
    const request = new Request(`/posts/${postId}/edit`, {
      headers: {
        'X-CSRFToken': csrftoken
      }
    });
    fetch(request, {
      method: 'PUT',
      mode: 'same-origin',
      body: JSON.stringify({
        text: edit_text
      })
    }).then(response => {
      if (response.status === 201) {
        this.setState({
          editing: false,
          text: edit_text
        });
      }
    });
  }

  render() {
    // if normal post view
    if (this.state.editing === false) {
      const edit = this.props.author === this.props.username ? editLink({
        href: "#",
        onClick: () => this.handleEditClick(this.props.id)
      }) : "";
      const author = authorLink({
        author: this.props.author
      });
      const login = this.props.username ? true : false;
      return /*#__PURE__*/React.createElement("div", {
        className: "border p-3 my-2",
        id: this.props.id
      }, /*#__PURE__*/React.createElement("div", {
        className: "mt-2"
      }, /*#__PURE__*/React.createElement("strong", null, author), " ", /*#__PURE__*/React.createElement("span", {
        className: "text-muted"
      }, "on ", this.props.pub_date), " ", edit), /*#__PURE__*/React.createElement("div", {
        className: "mt-2"
      }, this.state.text), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(LikeButton, {
        liked: this.state.liked,
        postId: this.props.id,
        login: login,
        onClick: () => this.handleClick(this.props.id)
      }), /*#__PURE__*/React.createElement("div", {
        className: "mt-2 d-inline"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-danger"
      }, "\u2665"), " ", this.state.likes));
    } else {
      // if editing post
      return /*#__PURE__*/React.createElement("div", {
        className: "border p-3 my-2",
        id: this.props.id
      }, /*#__PURE__*/React.createElement("div", {
        className: "mt-2"
      }, /*#__PURE__*/React.createElement("strong", null, "Edit this post"), " ", /*#__PURE__*/React.createElement("span", {
        className: "text-muted"
      }, /*#__PURE__*/React.createElement("i", null, "from ", this.props.pub_date))), /*#__PURE__*/React.createElement("div", {
        className: "mt-2"
      }, /*#__PURE__*/React.createElement("textarea", {
        id: "edit-text",
        className: "form-control",
        defaultValue: this.state.text
      }), /*#__PURE__*/React.createElement("input", {
        type: "submit",
        onClick: () => this.handleEditSave(this.props.id),
        value: "Save post",
        className: "btn btn-primary mt-2"
      })));
    }
  }

}

class NewPostForm extends React.Component {
  render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "New Post"), /*#__PURE__*/React.createElement("form", {
      id: "new_post_form"
    }, /*#__PURE__*/React.createElement("textarea", {
      name: "text",
      id: "new_post_text",
      rows: "3",
      className: "form-control"
    }), /*#__PURE__*/React.createElement("input", {
      type: "submit",
      className: "btn btn-outline-success mt-2",
      value: "Post"
    })));
  }

}

class FollowButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.followed) {
      return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", {
        className: "mb-2 d-block"
      }, "You are following ", this.props.username, "."), /*#__PURE__*/React.createElement("button", {
        onClick: () => this.props.onClick(this.props.username),
        className: "btn btn-danger lead",
        id: "follow-btn"
      }, "Unfollow ", this.props.username));
    } else {
      return /*#__PURE__*/React.createElement("button", {
        onClick: () => this.props.onClick(this.props.username),
        className: "btn btn-success lead",
        id: "follow-btn"
      }, "Follow ", this.props.username);
    }
  }

}

class ProfileHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      followed: this.props.followed,
      following: this.props.following,
      followers: this.props.followers
    };
  }

  handleClick() {
    const csrftoken = getCookie('csrftoken');
    const loginuser = document.querySelector('#username').innerHTML.slice(1, -1);
    const request = new Request(`/profile/${this.props.username}/data`, {
      headers: {
        'X-CSRFToken': csrftoken
      }
    });
    let followed;

    if (this.state.followed) {
      this.setState({
        followed: false,
        followers: this.state.followers - 1
      });
      followed = false;
    } else {
      this.setState({
        followed: true,
        followers: this.state.followers + 1
      });
      followed = true;
    }

    fetch(request, {
      method: 'PUT',
      mode: 'same-origin',
      body: JSON.stringify({
        username: this.props.username,
        loginuser: loginuser,
        followed: followed
      })
    });
  }

  render() {
    const loginuser = document.querySelector('#username').innerHTML.slice(1, -1);
    const followBtn = loginuser != this.props.username ? /*#__PURE__*/React.createElement(FollowButton, {
      onClick: () => this.handleClick(username),
      username: this.props.username,
      followed: this.state.followed
    }) : "";
    let newPost;

    if (this.props.owner) {
      // if viewer is owner of this profile
      newPost = /*#__PURE__*/React.createElement("div", {
        id: "new_post",
        className: "border p-4 my-4"
      }, /*#__PURE__*/React.createElement(NewPostForm, null));
    } else {
      newPost = "";
    }

    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      id: "heading"
    }, this.props.username), followBtn, /*#__PURE__*/React.createElement("div", {
      className: "my-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "border p-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: "lead"
    }, this.state.followers, " Followers")), /*#__PURE__*/React.createElement("div", {
      className: "border p-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: "lead"
    }, "Following ", this.state.following))), newPost);
  }

}

class Navi extends React.Component {
  render() {
    if (this.props.disabled) {
      return /*#__PURE__*/React.createElement("li", {
        className: "page-item disabled"
      }, /*#__PURE__*/React.createElement("a", {
        className: "page-link"
      }, this.props.text));
    } else {
      return /*#__PURE__*/React.createElement("li", {
        className: "page-item",
        onClick: this.props.onClick
      }, /*#__PURE__*/React.createElement("a", {
        className: "page-link"
      }, this.props.text));
    }
  }

}

class PageNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actualPage: 1
    };
  }

  handleClick(pageNum) {
    if (this.state.actualPage + pageNum < 1 || this.state.actualPage + pageNum > this.props.page_count) {
      return;
    } else {
      this.setState({
        actualPage: this.state.actualPage + pageNum
      });
    }
  }

  render() {
    const prevDisabled = this.state.actualPage === 1 ? true : false;
    const nextDisabled = this.state.actualPage === this.props.page_count ? true : false;
    let prev = /*#__PURE__*/React.createElement(Navi, {
      text: "Previous",
      disabled: prevDisabled,
      onClick: () => this.handleClick(-1)
    });
    let next = /*#__PURE__*/React.createElement(Navi, {
      text: "Next",
      disabled: nextDisabled,
      onClick: () => this.handleClick(1)
    });
    load_posts(this.props.category, this.state.actualPage);
    return /*#__PURE__*/React.createElement("nav", {
      id: "page-nav"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "pagination justify-content-center"
    }, prev, next));
  }

}