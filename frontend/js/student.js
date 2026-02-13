function apiFetch(path, opts={}){
  const token = localStorage.getItem('token');
  const headers = opts.headers || {};
  headers['content-type'] = headers['content-type'] || 'application/json';
  if (token) headers['authorization'] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, {...opts, headers});
}

function getTokenPayload(){
  const token = localStorage.getItem('token'); if (!token) return null;
  const parts = token.split('.'); if (parts.length<2) return null;
  try{ return JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/'))); }catch(e){return null}
}

document.getElementById('logout').addEventListener('click', ()=>{ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='index.html'; });

async function init(){
  const role = localStorage.getItem('role'); if (role!=='student') return location.href='index.html';
  const payload = getTokenPayload(); if (!payload || !payload.id) return location.href='index.html';
  const id = payload.id;
  const res = await apiFetch(`/students/${id}`);
  const profile = await res.json();
  document.getElementById('profile').innerText = `${profile.first_name} ${profile.last_name} (${profile.student_number})`;
  const marksRes = await apiFetch(`/marks/student/${id}`);
  const marks = await marksRes.json();
  const table = document.getElementById('student-marks');
  table.innerHTML = '<tr><th>Subject</th><th>Year</th><th>Marks</th></tr>' + marks.map(m=>`<tr><td>${m.subject_name||m.subject_code||m.subject_id}</td><td>${m.exam_year}</td><td>${m.marks}/${m.max_marks}</td></tr>`).join('');
  if (marks.length){
    const total = marks.reduce((s,m)=>s+(m.marks||0),0);
    const maxTotal = marks.reduce((s,m)=>s+(m.max_marks||100),0);
    const avgPerc = (total/maxTotal)*100;
    let grade = 'F'; if (avgPerc>=85) grade='A'; else if (avgPerc>=70) grade='B'; else if (avgPerc>=50) grade='C';
    document.getElementById('analytics').innerText = `Total: ${total} / ${maxTotal}  —  Average: ${avgPerc.toFixed(2)}%  —  Grade: ${grade}`;
  }
}

init();
