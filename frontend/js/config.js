const API_URL = (function(){
  // In production (Vercel), use relative path; locally use localhost:3000
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal ? 'http://localhost:3000/api' : '/api';
})();

const BASE_URL = (function(){
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal ? 'http://localhost:3000' : '';
})();
