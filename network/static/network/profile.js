document.addEventListener('DOMContentLoaded', function() {
    // loading user posts & profile
    const user_to_display = window.location.pathname.split("/").slice(-1)[0];
    load_user(user_to_display);
});
