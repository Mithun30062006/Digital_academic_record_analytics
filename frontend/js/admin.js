document.addEventListener('DOMContentLoaded', () => {
  // Select all cards for interactive testing
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const label = card.querySelector('.card-label').innerText;
      console.log(`Navigating to: ${label}`);
      // Add custom routing logic here based on the action
    });
  });

  // Logout handling
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('User signed out.');
      // Add actual logout logic (e.g., clearing tokens / localStorage)
      window.location.href = 'index.html';
    });
  }
});
