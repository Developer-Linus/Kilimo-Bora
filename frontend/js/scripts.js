// Section for registration and login frontend form validation


// Registration form validation
function validateRegisterForm(event) {
    let isValid = true;

    // Cache DOM elements
    const firstName = document.getElementById('regFirstName');
    const firstNameError = document.getElementById('firstNameError');

    const lastName = document.getElementById('regLastName');
    const lastNameError = document.getElementById('lastNameError');

    const email = document.getElementById('regEmail');
    const emailError = document.getElementById('emailError');

    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('regConfirmPassword');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    const terms = document.getElementById('terms');
    const termsError = document.getElementById('termsError');

    // First name validation
    if (firstName.value.trim() === "") {
        firstNameError.textContent = "First name is required.";
        isValid = false;
    } else {
        firstNameError.textContent = "";
    }

    // Last name validation
    if (lastName.value.trim() === "") {
        lastNameError.textContent = "Last name is required.";
        isValid = false;
    } else {
        lastNameError.textContent = "";
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email.value)) {
        emailError.textContent = "Invalid email format.";
        isValid = false;
    } else {
        emailError.textContent = "";
    }

    // Password validation
    if (password.value.trim() === "") {
        passwordError.textContent = "Password is required.";
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        confirmPasswordError.textContent = "Passwords do not match.";
        isValid = false;
    } else {
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
    }

    // Terms and conditions validation
    if (!terms.checked) {
        termsError.textContent = "You must agree to the terms and conditions.";
        isValid = false;
    } else {
        termsError.textContent = "";
    }

    return isValid; // Return the validation result
}

// Login validation form
function validateLoginForm() {
    let valid = true;

    // Email regex pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Clearing previous error messages
    document.getElementById("loginEmailError").textContent = "";
    document.getElementById("loginPasswordError").textContent = "";

    // Email validation
    const emailLogin = document.getElementById("loginEmail").value.trim();
    if (emailLogin === "") {
        document.getElementById("loginEmailError").textContent = 
            "Error! Please input your email address.";
        valid = false;
    } else if (!emailPattern.test(emailLogin)) {
        document.getElementById("loginEmailError").textContent = 
            "Error! Please enter a valid email address.";
        valid = false;
    }

    // Password validation
    const passwordField = document.getElementById("loginPassword").value.trim();
    if (passwordField === "") {
        document.getElementById("loginPasswordError").textContent = 
            "Error! Please enter your password.";
        valid = false;
    } else if (passwordField.length < 8) {
        document.getElementById("loginPasswordError").textContent = 
            "Error! Your password must be at least 8 characters long.";
        valid = false;
    }

    return valid;
}


// Section for frontend and backend connection

document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.getElementById('message');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const contactForm = document.getElementById('message-form');
    const profileBtn = document.getElementById('profile-btn');
    const profileSection = document.getElementById('profile-section');
    const dashboardCards = document.getElementById('dashboard-cards');
    const tipsContainer = document.getElementById("tips-section");
    const getTipsBtn = document.getElementById("get-tips-btn");





    // Function for displaying the message when user submits a form
function showMessage(type, text) {
    messageDiv.style.display = 'block';
    if (type == 'success') {
        messageDiv.style.color = 'green';
    } else {
        messageDiv.style.color = 'red';
    }
    
    messageDiv.textContent = text; // Display the actual message text

    // Use setTimeout to hide the message after 3 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 4000);
}


    // Farmer Registration
registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form submission default behaviour

    // Get registration form input values
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    // Send a POST request to the server to register the user
    const response = await fetch('/auth/POST/register', {
        method: 'POST', // Use POST for user registration
        headers: {
            'Content-Type' : 'application/json'
        },

        // Prepare form data as JSON to be sent to backend
        body: JSON.stringify({ 
            firstName,
            lastName,
            email,
            password
        })
    });

    // Parse the response from the server
    const result = await response.json();

    // Handle the response based on status code
    if(response.status === 201){
        // Successful registration
        showMessage('success', result.message);
        registerForm.reset();
    }else{
        // Failed registration
        showMessage('error', result.message);
    }
})


// User login
loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get login input values
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Check if email and password are not empty (basic validation)
    if (!email || !password) {
        showMessage('error', 'Email and password are required');
        return;
    }

    try {
        // Send a POST request to the server to login the user
        const response = await fetch('/auth/POST/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        // Parse the response from the server
        const result = await response.json();

        // Handle response based on status code
        if (response.status === 200) {
            // Successful login
            showMessage('success', result.message);
            loginForm.reset();
            localStorage.setItem('jwtToken', result.token); // Store the JWT token
            localStorage.setItem('userDetails', JSON.stringify(result.user));// optionally store user details
            window.location.href = '../public/dashboard.html'; // Redirect to dashboard
        } else {
            // Failed login
            showMessage('error', result.message);
        }
    } catch (error) {
        // Handle network or unexpected errors
        console.error('Login error:', error);
        showMessage('error', 'An unexpected error occurred. Please try again later.');
    }
});

// View user profile
profileBtn?.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default behavior (navigating) for debugging
    await getUser(); // Call the getUser function when the profile button is clicked
});

// Function to fetch user details
async function getUser() {
    const token = localStorage.getItem('jwtToken'); // Retrieve the token

    if (!token) {
        console.log('No token found, user may not be logged in');
        window.location.href = '../public/login.html'; // Redirect to login page if no token
        return;
    }

      // Select DOM elements
      const firstNameSpan = document.getElementById('profileFirstName');
      const lastNameSpan = document.getElementById('profileLastName');
      const emailSpan = document.getElementById('profileEmail');

      if (!firstNameSpan || !lastNameSpan || !emailSpan) {
        console.error('One or more profile elements not found in DOM.');
        return;
    }

    try {
        // Fetch user profile from backend
        const response = await fetch('/auth/GET/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Send token in Authorization header
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json(); // Wait for JSON response
        console.log(result);

        if (response.status === 200) {
            dashboardCards.style.display = 'none'; // Hide dashboard cards

            profileSection.style.display = 'block';

            // Access nested data correctly
            firstNameSpan.textContent = result.user.firstName;
            lastNameSpan.textContent = result.user.lastName;
            emailSpan.textContent = result.user.email;
        } else {
            console.log('Failed to fetch user details', result.message);
        }
    } catch (error) {
        console.log('Error fetching user profile:', error);
    }
}


// Add contact us message
contactForm?.addEventListener('submit', async(event) => {
    event.preventDefault(); // Prevent form from refreshing the page

// Get contact us input values
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
// Send a POST request to the server to record the message
        const response = await fetch('/auth/POST/contactus', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });
        // Parse the response from the server
        const result = await response.json();

        // Handle response based on status code
        if (response.status === 201) {
            // Successful record of contact us message
            showMessage('success', result.message);
            contactForm.reset(); // Reset the form fields
        } else {
           // Unsuccessful record of contact us message
           showMessage('error', result.message);
        }
});

// Handle profile update form submission
document.getElementById('editProfileForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('jwtToken'); // Retrieve JWT token from localStorage

    if (!token) {
        console.log('No token found, user may not be logged in');
        return;
    }

    const formData = new FormData(document.getElementById('editProfileForm'));

    try {
        const response = await fetch('/auth/POST/updateProfile', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Send token in authorization header
            },
            body: formData,
        });

        const result = await response.json();

        if (response.status === 200) {
            alert('Profile updated successfully!');
            window.location.reload(); // Reload page to reflect changes
        } else {
            alert('Failed to update profile: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating your profile.');
    }
});

// Logout function
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('jwtToken'); // Remove JWT token from localStorage
    window.location.href = '../public/login.html'; // Redirect to login page
});


// WORKING ON IT
let currentPage = 1; // Tracks the current page of posts for infinite scrolling.
let isLoading = false; // Prevents multiple simultaneous fetch requests.

async function fetchPosts(page = 1) {
    try {
        if (isLoading) return; // Prevent overlapping requests.
        isLoading = true; // Indicate that a fetch request is ongoing.

        // Fetch posts for the given page from the backend.
        const response = await fetch(`/auth/GET/tips?page=${page}`);
        const posts = await response.json();

        // Log the response to check its structure
        console.log('Fetched posts:', posts);

        // Ensure the response contains the 'tips' array
        if (Array.isArray(posts.tips)) {
            renderPosts(posts.tips); // Display the fetched posts.
        } else {
            console.error('Expected an array but received:', posts.tips);
        }
        isLoading = false; // Allow new requests after rendering posts.
    } catch (error) {
        console.error('Error fetching posts:', error); // Log fetch errors.
        isLoading = false; // Reset loading status after error.
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById('posts-container'); // Locate the container for posts.

    posts.forEach(post => {
        const postCard = document.createElement('div'); // Create a container for each post.
        postCard.className = 'post-card'; // Add a CSS class for styling.

        // Populate the card with title, content, author, comments, and likes.
        postCard.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <p><strong>Author:</strong> ${post.author}</p>
            <p>
                <strong>Comments:</strong> 
                <span id="comment-count-${post.tip_id}">${post.comments}</span> 
                <button onclick="toggleComments(${post.tip_id})">View Comments</button>
            </p>
            <div id="comments-${post.tip_id}" class="comments-section" style="display: none;"></div>
            <p>
                <strong>Likes:</strong> 
                <span id="like-count-${post.tip_id}">${post.likes}</span> 
                <button onclick="likePost(${post.tip_id})">Like</button>
            </p>
        `;

        postsContainer.appendChild(postCard); // Append the card to the container.
    });
}

// Global function to toggle comments for a post
async function toggleComments(tipId) {
    const commentsSection = document.getElementById(`comments-${tipId}`); // Find the comments section.

    if (commentsSection.style.display === 'none') {
        try {
            const response = await fetch(`/auth/GET/tips/${tipId}/comments`); // Fetch comments for the post.
            const comments = await response.json();

            commentsSection.innerHTML = ''; // Clear any existing comments.

            // Render fetched comments.
            comments.forEach(comment => {
                const commentItem = document.createElement('p');
                commentItem.textContent = `${comment.user_name}: ${comment.comment}`;
                commentsSection.appendChild(commentItem);
            });

            commentsSection.style.display = 'block'; // Show the comments section.
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    } else {
        commentsSection.style.display = 'none'; // Hide the comments section.
    }
}

// Global function to handle "like" functionality
async function likePost(tipId) {
    try {
        // Send a POST request to toggle the like for the tip.
        const response = await fetch(`/auth/posts/${tipId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 1 }) // Example user ID. Replace with dynamic ID if available.
        });
        const result = await response.json();

        if (result.success) {
            // Update the like count dynamically.
            const likeCountElement = document.getElementById(`like-count-${tipId}`);
            const currentLikes = parseInt(likeCountElement.textContent);
            likeCountElement.textContent = result.action === 'liked' ? currentLikes + 1 : currentLikes - 1; // Adjust based on the action.
        } else {
            console.error('Failed to toggle like:', result.message);
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

// Infinite Scrolling functionality
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        currentPage++; // Move to the next page.
        fetchPosts(currentPage); // Load the next set of posts.
    }
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(currentPage); // Fetch posts when the page loads.
});

// Event listener for the "Get Tips" button
if (getTipsBtn) {
    getTipsBtn.addEventListener('click', function () {
      
        // Hide the dashboard
        if (dashboardCards) dashboardCards.style.display = 'none';
        
        // Show the tips container
        if (tipsContainer) tipsContainer.style.display = 'block';
        
        // Fetch and display tips after the page switch
        fetchPosts(1); // Optionally, fetch posts for the first page or the desired page
    });
} else {
    console.error('Get Tips button not found');
}




  
  
  
  







})