function showMessage(message) {
  const thinkBox = document.getElementById('thinkbox');
  const thinkContent = document.getElementById('thinkcontent');

  thinkContent.textContent = message;
  thinkBox.classList.add('show');

  clearTimeout(window.thinkBoxTimeout);
  window.thinkBoxTimeout = setTimeout(() => {
    thinkBox.classList.remove('show');
  }, 5000); // auto-hide after 5s
}
