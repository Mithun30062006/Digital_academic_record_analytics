// CENTRAL CONFIGURATION - Change your links here!
const BACKEND_URL = 'http://localhost:3000'; // Change this to your online server link later

// Derived URLs
const API_URL = `${BACKEND_URL}/api`;
const BASE_URL = BACKEND_URL;

// Auto-Detection Fallback (uncomment and use if you want automatic switching)
/*
const API_URL = (function () {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal ? 'http://localhost:3000/api' : '/api';
})();
*/
