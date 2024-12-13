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
const messageDiv = document.getElementById('message');
const registerForm = document.getElementById('register-form');

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

document.addEventListener('DOMContentLoaded', () => {

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
        showMessage('Failed', result.message);
    }
})
})