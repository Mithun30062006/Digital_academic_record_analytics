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
  // populate hero
  const fullName = `${profile.first_name||''} ${profile.last_name||''}`.trim() || profile.name || 'Student Name';
  document.getElementById('student-name').innerText = fullName;
  document.getElementById('student-meta').innerText = `Student ID: ${profile.student_number||'--'} | Batch: ${profile.batch||'--'}`;
  const avatar = document.getElementById('avatar');
  if (profile.first_name){ avatar.innerText = (profile.first_name[0]||'').toUpperCase() + (profile.last_name? (profile.last_name[0]||'').toUpperCase() : ''); }
  document.getElementById('email').innerText = profile.email || profile.contact_email || '—';
  document.getElementById('course').innerText = profile.course || profile.program || '—';
  document.getElementById('class').innerText = `Class: ${profile.class_name||profile.class||'—'}`;
  document.getElementById('phone').innerText = profile.phone || profile.contact_number || '—';
  document.getElementById('year').innerText = profile.year || profile.current_year || '—';
  document.getElementById('incharge').innerText = `Class Incharge: ${profile.class_incharge||'—'}`;
  const studentRegNo = payload.student_id;
  const marksRes = await apiFetch(`/marks/student/${studentRegNo}`);
  const marks = await marksRes.json();
  // fill marks table and compute simple metrics
  const table = document.getElementById('student-marks');
  if (table){
    table.innerHTML = '<tr><th>Subject</th><th>Year</th><th>Marks</th></tr>' + marks.map(m=>`<tr><td>${m.subject_name||m.subject_code||m.subject_id}</td><td>${m.exam_year||'--'}</td><td>${m.marks||0}/${m.max_marks||100}</td></tr>`).join('');
  }
  if (marks && marks.length){
    const total = marks.reduce((s,m)=>s+(m.marks||0),0);
    const maxTotal = marks.reduce((s,m)=>s+(m.max_marks||100),0);
    const avgPerc = maxTotal? (total/maxTotal)*100 : 0;
    // approximate CGPA/SGPA values for demo if not provided by API
    const cgpa = (profile.cumulative_cgpa !== undefined) ? profile.cumulative_cgpa : (avgPerc/12).toFixed(2);
    const sgpa = (profile.current_sgpa !== undefined) ? profile.current_sgpa : (avgPerc/12).toFixed(2);
    document.getElementById('sgpa').innerText = sgpa;
    document.getElementById('cgpa').innerText = cgpa;
    document.getElementById('attendance').innerText = (profile.attendance !== undefined) ? `${profile.attendance}%` : `${Math.round(Math.min(100, avgPerc))}%`;
    document.getElementById('arrears').innerText = profile.arrears !== undefined ? profile.arrears : (profile.arrear_count||0);
  }

  // render performance chart if present (charts.js handles canvas by id)
}

// Tab switching logic for sidebar
function initTabs(){
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.getAttribute('data-tab');
      // navigate to separate page for each tab
      // pages are: overview.html, academic.html, courses.html, attendance.html, comparison.html
      location.href = `${target}.html`;
    });
  });
}

// update small overview values in sidebar
// run tab init after DOM content loaded
document.addEventListener('DOMContentLoaded', ()=>{
  initTabs();
});

init();
