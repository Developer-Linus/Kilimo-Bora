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
