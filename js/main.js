document.addEventListener('DOMContentLoaded', () => {
    const postButton = document.querySelector('[data-post-button]');
    const textarea = document.querySelector('[data-post-textarea]');

    if (postButton && textarea) {
        postButton.addEventListener('click', () => {
            const content = textarea.value.trim();
            if (content) {
                createPost(content);
                textarea.value = '';
            } else {
                alert("Post content cannot be empty.");
            }
        });
    }

    function createPost(content) {
        const postsContainer = document.querySelector('[data-posts-container]');
        if (postsContainer) {
            const postElement = document.createElement('div');
            postElement.classList.add('anonymous-post');
            postElement.innerHTML = `
                <br>
                <p>Anonymous Post</p>
                <hr class="w3-clear">
                <p>${DOMPurify.sanitize(content)}</p>
            `;
            postsContainer.appendChild(postElement);
        }
    }
});