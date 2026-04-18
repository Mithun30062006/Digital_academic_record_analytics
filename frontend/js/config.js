// CENTRAL CONFIGURATION - Change your links here!
var BACKEND_URL = (function () {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal ? 'http://localhost:3000' : 'https://digital-academic-record-analytics.onrender.com';
})();

// Derived URLs
var API_URL = `${BACKEND_URL}/api`;
var BASE_URL = BACKEND_URL;
