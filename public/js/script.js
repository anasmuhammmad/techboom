
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


        // JavaScript function to handle the countdown timer and resend functionality
        function startCountdown() {
            let countdown = 60; // Set the initial countdown time in seconds

            const countdownTimer = document.getElementById('countdown');
            const resendLink = document.getElementById('resendLink');

            // Function to update the countdown timer
            function updateCountdown() {
                countdown--;
                countdownTimer.textContent = countdown;

                if (countdown <= 0) {
                    clearInterval(timerInterval);
                    resendLink.style.display = 'inline'; // Show the "Resend" link
                    countdownTimer.style.display = 'none'; // Hide the countdown timer
                }
            }

            // Start the countdown timer
            let timerInterval = setInterval(updateCountdown, 1000);

            // Add an event listener to the "Resend" link
            resendLink.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent the link from navigating

                // Add code here to resend the OTP
                // You can make an AJAX request to your server to resend the OTP

                // Reset the countdown and show the timer
                countdown = 60;
                countdownTimer.style.display = 'inline';
                resendLink.style.display = 'none';
                timerInterval = setInterval(updateCountdown, 1000); // Restart the timer
            });
        }

        // Call the startCountdown function to initialize the countdown timer
        startCountdown();
