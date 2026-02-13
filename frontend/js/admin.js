function apiFetch(path, opts={}){
  const token = localStorage.getItem('token');
  const headers = opts.headers || {};
  headers['content-type'] = headers['content-type'] || 'application/json';
  if (token) headers['authorization'] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, {...opts, headers});
}

function ensureAuth(){
  const role = localStorage.getItem('role');
  if (role!=='admin') location.href='index.html';
}

document.getElementById('logout').addEventListener('click', ()=>{ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='index.html'; });

ensureAuth();

async function loadStudents(){
  const res = await apiFetch('/students');
  const rows = await res.json();
  const table = document.getElementById('students-table');
  table.innerHTML = '<tr><th>ID</th><th>Number</th><th>Name</th><th>Class</th><th>Actions</th></tr>' + rows.map(r=>`<tr><td>${r.id}</td><td>${r.student_number}</td><td>${r.first_name} ${r.last_name}</td><td>${r.class_name||''}</td><td><button data-id="${r.id}" class="del-student">Delete</button></td></tr>`).join('');
  table.querySelectorAll('.del-student').forEach(btn=>btn.addEventListener('click', async e=>{
    const id = e.target.dataset.id; await apiFetch(`/students/${id}`,{method:'DELETE'}); loadStudents();
  }));
}

async function loadSubjects(){
  const res = await apiFetch('/subjects');
  const rows = await res.json();
  const table = document.getElementById('subjects-table');
  table.innerHTML = '<tr><th>ID</th><th>Code</th><th>Name</th><th>Credits</th><th>Actions</th></tr>' + rows.map(r=>`<tr><td>${r.id}</td><td>${r.code}</td><td>${r.name}</td><td>${r.credits}</td><td><button data-id="${r.id}" class="del-subject">Delete</button></td></tr>`).join('');
  table.querySelectorAll('.del-subject').forEach(btn=>btn.addEventListener('click', async e=>{ const id=e.target.dataset.id; await apiFetch(`/subjects/${id}`,{method:'DELETE'}); loadSubjects(); }));
}

async function loadMarks(){
  const res = await apiFetch('/marks');
  const rows = await res.json();
  const table = document.getElementById('marks-table');
  table.innerHTML = '<tr><th>ID</th><th>Student</th><th>Subject</th><th>Year</th><th>Marks</th><th>Actions</th></tr>' + rows.map(r=>`<tr><td>${r.id}</td><td>${r.student_number} ${r.first_name} ${r.last_name}</td><td>${r.subject_name}</td><td>${r.exam_year}</td><td>${r.marks}/${r.max_marks}</td><td><button data-id="${r.id}" class="del-mark">Delete</button></td></tr>`).join('');
  table.querySelectorAll('.del-mark').forEach(btn=>btn.addEventListener('click', async e=>{ const id=e.target.dataset.id; await apiFetch(`/marks/${id}`,{method:'DELETE'}); loadMarks(); }));
}

document.getElementById('student-form').addEventListener('submit', async e=>{
  e.preventDefault();
  const fd = new FormData(e.target); const body = Object.fromEntries(fd.entries());
  await apiFetch('/students',{method:'POST',body:JSON.stringify(body)}); e.target.reset(); loadStudents();
});

document.getElementById('subject-form').addEventListener('submit', async e=>{
  e.preventDefault(); const fd=new FormData(e.target); const body=Object.fromEntries(fd.entries()); await apiFetch('/subjects',{method:'POST',body:JSON.stringify(body)}); e.target.reset(); loadSubjects();
});

document.getElementById('marks-form').addEventListener('submit', async e=>{
  e.preventDefault(); const fd=new FormData(e.target); const body=Object.fromEntries(fd.entries()); await apiFetch('/marks',{method:'POST',body:JSON.stringify(body)}); e.target.reset(); loadMarks();
});

loadStudents(); loadSubjects(); loadMarks();
