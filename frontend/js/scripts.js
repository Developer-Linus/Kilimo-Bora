function validateRegisterForm() {
    let isValid = true;
  
      // First name validation
      let firstName = document.getElementById('first-name').value;
      if (firstName.trim() === "") {
          document.getElementById('firstNameError').textContent = "First name is required.";
          isValid = false;
      } else {
          document.getElementById('firstNameError').textContent = "";

       // Last name validation
    let lastName = document.getElementById('last-name').value;
    if (lastName.trim() === "") {
        document.getElementById('lastNameError').textContent = "Last name is required.";
        isValid = false;
    } else {
        document.getElementById('lastNameError').textContent = "";
    }
  
    // Email validation
    let email = document.getElementById('email').value;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = "Invalid email format.";
        isValid = false;
    } else {
        document.getElementById('emailError').textContent = "";
    }
  
    // Password validation
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirm-password').value;
    if (password === "") {
        document.getElementById('passwordError').textContent = "Password is required.";
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirm-passwordError').textContent = "Passwords do not match.";
        isValid = false;
    } else {
        document.getElementById('passwordError').textContent = "";
        document.getElementById('confirm-passwordError').textContent = "";
    }
  
  
    // Terms and conditions validation
    let terms = document.getElementById('terms').checked;
    if (!terms) {
        document.getElementById('termsError').textContent = "You must agree to the terms and conditions.";
        isValid = false;
    } else {
        document.getElementById('termsError').textContent = "";
    }
  
    return isValid;
  }

    // Display data only if valid
    if (isValid) {
        // Store form data in an object
        const formData = {
            name: firstName, 
            name: lastName,
            email: email,
            termsAccepted: terms
        };

        // Display data
        displayFormData(formData);
    }

    return isValid; // Prevent form submission if invalid



    function displayFormData(data) {
        const summaryDiv = document.getElementById('formSummary');
        summaryDiv.innerHTML = `
            <h3>Form Summary</h3>
            <p><strong>First Name:</strong> ${data.firstName}</p>
            <p><strong>Last Name:</strong> ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Terms Accepted:</strong> ${data.termsAccepted ? "Yes" : "No"}</p>
            <p><em>Form submitted successfully!</em></p>
        `;
}
}

//login validation form
function validateLoginForm(){
    let valid = true;
    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //clearing previous error messages
    document.getElementById("loginEmailError").innerHTML="";
    document.getElementById("loginPasswordError").innerHTML="";
    //email validation
    let emailLogin = document.getElementById("loginEmail").Value;
    if(emailLogin===""){
         document.getElementById("loginEmailError").innerHTML="Error! please input your email address"; 
         valid = false ;
    }else if(!emailPattern.test(emailPattern)) { 
        document.getElementById("loginEmailError").innerHTML="Error! please input the correct email address format eg linus@gmail.com"; 
        valid = false ;
     }
     //password validation
     let passwordField = document.getElementById("loginPassword").innerHTML="";
     if( passwordField.length<8){
        document.getElementById("loginPasswordError").innerHTML="Error! your password should be atleast eight characters";
        valid = false;
     }
     return valid;
}
