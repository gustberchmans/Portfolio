document.addEventListener('DOMContentLoaded', () => {
  const loginPopup = document.querySelector('.login-popup');
  const loginForm = document.getElementById('login-form');

  // Show popup when page loads
  loginPopup.style.display = 'block';

  // Handle form submission
  loginForm.addEventListener('submit', (event) => {
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

    loginPopup.style.display = 'none';
  });

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
});