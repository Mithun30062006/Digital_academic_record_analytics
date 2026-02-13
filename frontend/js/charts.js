function apiFetch(path, opts={}){
  const token = localStorage.getItem('token');
  const headers = opts.headers || {};
  headers['content-type'] = headers['content-type'] || 'application/json';
  if (token) headers['authorization'] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, {...opts, headers});
}

// Admin: load pass/fail and topper
async function renderAdminReports(){
  try{
    const topperRes = await apiFetch('/reports/topper');
    const topper = await topperRes.json();
    const topperInfo = document.getElementById('topper-info');
    topperInfo.innerText = topper.topper ? `${topper.topper.name} — ${topper.topper.total_marks}` : 'No data';

    const pfRes = await apiFetch('/reports/passfail');
    const pf = await pfRes.json();
    const ctx = document.getElementById('passfailChart').getContext('2d');
    new Chart(ctx, { type:'pie', data:{ labels:['Passed','Failed'], datasets:[{ data:[pf.passed, pf.failed], backgroundColor:['#4CAF50','#F44336'] }] }, options:{responsive:true} });

    document.getElementById('load-subject-stats').addEventListener('click', async ()=>{
      const subId = document.getElementById('subject-stats-id').value.trim(); if(!subId) return alert('Enter subject id');
      const r = await apiFetch(`/reports/subject-stats/${subId}`); const data = await r.json();
      document.getElementById('subject-stats-info').innerText = `Avg: ${data.avg_marks}  Max: ${data.max_marks}  Min: ${data.min_marks}  Pass%: ${data.passPercent}`;
      const ctx2 = document.getElementById('subjectStatsChart').getContext('2d');
      new Chart(ctx2, { type:'bar', data:{ labels:['Average','Max','Min','Pass%'], datasets:[{ label:'Value', data:[data.avg_marks, data.max_marks, data.min_marks, data.passPercent], backgroundColor:['#2196F3','#4CAF50','#FFC107','#9C27B0'] }] }, options:{responsive:true} });
    });
  }catch(err){ console.error(err); }
}

// Student: render performance chart
async function renderStudentPerformance(){
  try{
    const token = localStorage.getItem('token'); if(!token) return;
    const payload = (function(){ try{ return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); }catch(e){return null} })();
    if(!payload || !payload.id) return;
    const id = payload.id;
    const res = await apiFetch(`/marks/student/${id}`);
    const marks = await res.json();
    if(!marks || !marks.length) return;
    const labels = marks.map(m=> m.subject_name || m.subject_code || m.subject_id);
    const dataPerc = marks.map(m=> Math.round((m.marks / (m.max_marks||100))*100));
    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'% Score', data: dataPerc, backgroundColor:'#42A5F5' }] }, options:{scales:{y:{beginAtZero:true, max:100}} } });
  }catch(err){ console.error(err); }
}

// Auto-run depending on page
document.addEventListener('DOMContentLoaded', ()=>{
  if (document.getElementById('passfailChart')) renderAdminReports();
  if (document.getElementById('performanceChart')) renderStudentPerformance();
});
