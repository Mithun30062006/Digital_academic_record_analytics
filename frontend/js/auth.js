function $(id) { return document.getElementById(id) }

document.getElementById('login-btn').addEventListener('click', async () => {
  const role = $('role').value;
  const username = $('username').value.trim();
  const password = $('password').value;
  if (!username || !password) { Swal.fire('Notice', 'Please enter username and password', 'warning'); return; }

  try {
    let res, j;
    if (role === 'admin') {
      res = await fetch(`${API_URL}/admin/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) });
    } else {
      // student
      res = await fetch(`${API_URL}/students/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ student_number: username, password }) });
    }
    j = await res.json();
    if (res.ok && j.token) {
      localStorage.setItem('token', j.token);
      localStorage.setItem('role', role);
      if (role === 'student' && j.student) {
        localStorage.setItem('student_id', j.student.student_id);
        localStorage.setItem('db_id', j.student._id);
      }
      location.href = role === 'admin' ? 'admin.html' : 'student.html';
    } else {
      Swal.fire('Login Failed', j.message || 'Login failed', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Network error', 'error');
  }
});

// single password toggle using images (eye / eye-off)
const tpi = document.getElementById('toggle-password-img');
const EYE_SRC = 'img/eye.svg';
const EYE_OFF_SRC = 'img/eye-off.svg';
if (tpi) {
  tpi.addEventListener('click', () => {
    const input = document.getElementById('password');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      tpi.src = EYE_OFF_SRC;
      tpi.alt = 'Hide password';
    } else {
      input.type = 'password';
      tpi.src = EYE_SRC;
      tpi.alt = 'Show password';
    }
    input.focus();
  });
}
