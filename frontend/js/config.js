// CENTRAL CONFIGURATION - Change your links here!
const BACKEND_URL = (function () {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal ? 'http://localhost:3000' : 'https://digital-academic-record-analytics.onrender.com';
})();

// Derived URLs
const API_URL = `${BACKEND_URL}/api`;
const BASE_URL = BACKEND_URL;
