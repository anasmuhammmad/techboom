
// JavaScript to toggle the OTP input when the "Verify" button is clicked
// document.getElementById('verifyEmailButton').addEventListener('click', function () {
//   const otpInputContainer = document.getElementById('otpInputContainer');
//   const otpSentMessage = document.getElementById('otpSentMessage');
//   otpInputContainer.style.display = 'block'; // Show the OTP input
//   otpSentMessage.style.display = 'block';
  
// });


function togglePasswordVisibility(passwordInputId, buttonId) {
    const passwordInput = document.getElementById(passwordInputId);
    const passwordButton = document.getElementById(buttonId);

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = "password";
        passwordButton.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Add event listeners for both "Show Password" buttons
document.getElementById('showPasswordOne').addEventListener('click', function () {
    togglePasswordVisibility('password', 'showPasswordOne');
});

document.getElementById('showPasswordTwo').addEventListener('click', function () {
    togglePasswordVisibility('confirmPassword', 'showPasswordTwo');
});


// <!--  to handle auto redirection to next input field -->
function moveToNextInput(input, nextInputID) {
    const maxLength = input.getAttribute('maxlength');
    if (input.value.length === parseInt(maxLength)) {
        const nextInput = document.getElementById(nextInputID);
        if (nextInput) {
            nextInput.focus();
        }
    }
}
