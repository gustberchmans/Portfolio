document.addEventListener('DOMContentLoaded', function() {
  const loginPopup = document.querySelector('.login-popup');
  const loginForm = document.getElementById('login-form');

  // Show popup when page loads
  loginPopup.style.display = 'block';

  // Handle form submission
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate email
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Validate password
    if (password.trim() === '') {
      alert('Please enter a password.');
      return;
    }

    // Here you can add your logic for handling the login credentials
    console.log('Email:', email);
    console.log('Password:', password);
    // For demo purposes, let's just close the popup
    loginPopup.style.display = 'none';
  });

  // Function to validate email
  function isValidEmail(email) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
