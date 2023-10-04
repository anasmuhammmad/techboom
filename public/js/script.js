
// JavaScript to toggle the OTP input when the "Verify" button is clicked
document.getElementById('verifyEmailButton').addEventListener('click', function () {
  const otpInputContainer = document.getElementById('otpInputContainer');
  const otpSentMessage = document.getElementById('otpSentMessage');
  otpInputContainer.style.display = 'block'; // Show the OTP input
  otpSentMessage.style.display = 'block';
  
});


function togglePasswordVisibility(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
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