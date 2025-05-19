// Get references to DOM elements
const postForm = document.getElementById('postForm');
const postTitleInput = document.getElementById('postTitle');
const postAuthorInput = document.getElementById('postAuthor');
const postsList = document.getElementById('postsList');

// Load posts from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  posts.forEach(post => addPostToDOM(post));
});

// Handle form submission
postForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = postTitleInput.value.trim();
  const author = postAuthorInput.value.trim();

  if (!title || !author) return;

  const post = {
    title,
    author,
    timestamp: new Date().toISOString(),
    comments: [] // Add a comments array to store comments for this post
  };

  addPostToDOM(post);
  savePost(post);

  postForm.reset();
});

// Add a post to the DOM
function addPostToDOM(post) {
  const postCard = document.createElement('div');
  postCard.className = 'card mb-3';

  const postTime = new Date(post.timestamp).toLocaleString();

  postCard.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${escapeHTML(post.title)}</h5>
      <h6 class="card-subtitle mb-2 text-muted">Posted by ${escapeHTML(post.author)} on ${postTime}</h6>
      
      <!-- Toggle Comments button -->
      <button class="btn btn-sm btn-info toggle-comments-btn">Comments</button>
      
      <!-- Remove Post button -->
      <button class="btn btn-sm btn-danger mt-2 remove-post-btn">Remove Post</button>
      
      <!-- Comments Section -->
      <div class="comments-section" style="display: none;">
        <h6>Comments:</h6>
        <div class="comments-list"></div>
        
        <!-- Comment Input Fields -->
        <div class="form-group">
          <input type="text" class="form-control comment-author" placeholder="Your Name" required>
          <textarea class="form-control comment-text" placeholder="Your Comment" required></textarea>
        </div>
        <button class="btn btn-primary post-comment-btn">Post Comment</button>
      </div>
    </div>
  `;

  // Toggle comments visibility
  postCard.querySelector('.toggle-comments-btn').addEventListener('click', () => {
    const commentsSection = postCard.querySelector('.comments-section');
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
  });

  // Remove Post button functionality
  postCard.querySelector('.remove-post-btn').addEventListener('click', () => {
    postCard.remove();
    removePost(post.timestamp);
  });

  // Post comment functionality
  postCard.querySelector('.post-comment-btn').addEventListener('click', () => {
    const commentAuthor = postCard.querySelector('.comment-author').value.trim();
    const commentText = postCard.querySelector('.comment-text').value.trim();

    if (!commentAuthor || !commentText) return;

    const comment = {
      author: commentAuthor,
      text: commentText,
      timestamp: new Date().toISOString()
    };

    addCommentToDOM(post, comment);
    saveComment(post, comment);

    // Clear input fields
    postCard.querySelector('.comment-author').value = '';
    postCard.querySelector('.comment-text').value = '';
  });

  postsList.prepend(postCard);
}

// Add a comment to the DOM
function addCommentToDOM(post, comment) {
  const postCard = [...postsList.children].find(card => {
    const postTitle = card.querySelector('.card-title').textContent;
    return postTitle === post.title;
  });

  const commentsList = postCard.querySelector('.comments-list');
  
  const commentDiv = document.createElement('div');
  commentDiv.className = 'comment mb-2';
  commentDiv.innerHTML = `
    <p><strong>${escapeHTML(comment.author)}:</strong> ${escapeHTML(comment.text)}</p>
    <button class="btn btn-sm btn-danger delete-comment-btn">X</button>
  `;

  // Delete comment functionality
  commentDiv.querySelector('.delete-comment-btn').addEventListener('click', () => {
    commentDiv.remove();
    deleteComment(post, comment.timestamp);
  });

  commentsList.appendChild(commentDiv);
}

// Save a post to localStorage
function savePost(post) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  posts.push(post);
  localStorage.setItem('posts', JSON.stringify(posts));
}

// Save a comment to localStorage
function saveComment(post, comment) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const postIndex = posts.findIndex(p => p.timestamp === post.timestamp);
  if (postIndex !== -1) {
    posts[postIndex].comments.push(comment);
    localStorage.setItem('posts', JSON.stringify(posts));
  }
}

// Delete a comment from localStorage
function deleteComment(post, commentTimestamp) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const postIndex = posts.findIndex(p => p.timestamp === post.timestamp);
  if (postIndex !== -1) {
    posts[postIndex].comments = posts[postIndex].comments.filter(c => c.timestamp !== commentTimestamp);
    localStorage.setItem('posts', JSON.stringify(posts));
  }
}

// Remove a post from localStorage
function removePost(timestamp) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const updatedPosts = posts.filter(post => post.timestamp !== timestamp);
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
}

// Simple HTML escaping to prevent XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
