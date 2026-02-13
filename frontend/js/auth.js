function $(id){return document.getElementById(id)}
const roleSelect = document.getElementById('role');
roleSelect.addEventListener('change', ()=>{
  const role = roleSelect.value;
  document.getElementById('admin-form').style.display = role==='admin'? 'block':'none';
  document.getElementById('student-form').style.display = role==='student'? 'block':'none';
});

document.getElementById('admin-login').addEventListener('click', async ()=>{
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  const res = await fetch(`${API_URL}/admin/login`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})});
  const j = await res.json();
  if (res.ok && j.token){ localStorage.setItem('token', j.token); localStorage.setItem('role','admin'); location.href='admin.html'; }
  else alert(j.message||'Login failed');
});

document.getElementById('student-login').addEventListener('click', async ()=>{
  const student_number = document.getElementById('student-number').value;
  const password = document.getElementById('student-password').value;
  const res = await fetch(`${API_URL}/students/login`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({student_number,password})});
  const j = await res.json();
  if (res.ok && j.token){ localStorage.setItem('token', j.token); localStorage.setItem('role','student'); location.href='student.html'; }
  else alert(j.message||'Login failed');
});

// Password show/hide toggles
document.querySelectorAll('.toggle-password').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;
    if (input.type === 'password'){
      input.type = 'text';
      btn.textContent = 'Hide';
    } else {
      input.type = 'password';
      btn.textContent = 'Show';
    }
    input.focus();
  });
});
