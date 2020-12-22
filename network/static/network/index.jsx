document.addEventListener('DOMContentLoaded', function() {
    // loading standard set of all posts
    const page_to_load = document.querySelector('#page').innerHTML.slice(1, -1);
    fetch(`/posts/${page_to_load}/count`)
    .then(response => response.json())
    .then(result => {
      const post_count = result.post_count;
      const page_count = result.page_count;
      if (result.post_count > 10) {
        ReactDOM.render(<PageNav category={page_to_load} page_count={result.page_count} />, document.querySelector('#page-nav-container'));
      } else {
        load_posts(page_to_load, 1);
      }
    });
    console.log(`loading ${page_to_load}`);
});

