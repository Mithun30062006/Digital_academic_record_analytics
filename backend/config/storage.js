const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const files = {
  admins: path.join(dataDir, 'admins.json'),
  students: path.join(dataDir, 'students.json'),
  subjects: path.join(dataDir, 'subjects.json'),
  marks: path.join(dataDir, 'marks.json')
};

async function ensureFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  for (const f of Object.values(files)) {
    try { await fs.access(f); } catch (e) { await fs.writeFile(f, '[]'); }
  }
}

async function load(table) {
  await ensureFiles();
  const data = await fs.readFile(files[table], 'utf8');
  return JSON.parse(data || '[]');
}

async function save(table, data) {
  await ensureFiles();
  await fs.writeFile(files[table], JSON.stringify(data, null, 2), 'utf8');
}

function nextId(arr) {
  const max = arr.reduce((m, it) => (it.id && it.id > m ? it.id : m), 0);
  return max + 1;
}

/* Subjects */
async function createSubject({ code, name, credits }) {
  const subjects = await load('subjects');
  const id = nextId(subjects);
  const item = { id, code, name, credits: credits || 0, created_at: new Date().toISOString() };
  subjects.push(item);
  await save('subjects', subjects);
  return { insertId: id };
}

async function getAllSubjects() { return await load('subjects'); }
async function getSubjectById(id) { const s = await load('subjects'); return s.find(x=>Number(x.id)===Number(id)); }
async function updateSubject(id, { code, name, credits }) {
  const subjects = await load('subjects');
  const idx = subjects.findIndex(x=>Number(x.id)===Number(id)); if (idx===-1) return false;
  subjects[idx] = { ...subjects[idx], code, name, credits: credits||0 };
  await save('subjects', subjects); return true;
}
async function removeSubject(id) { const subjects = await load('subjects'); const n = subjects.filter(x=>Number(x.id)!==Number(id)); await save('subjects', n); return; }

/* Students */
async function createStudent(obj) {
  const students = await load('students');
  const id = nextId(students);
  const item = { id, student_number: obj.student_number, first_name: obj.first_name, last_name: obj.last_name, dob: obj.dob||null, gender: obj.gender||'O', email: obj.email||null, class_name: obj.class_name||null, enrollment_date: obj.enrollment_date||null, status: obj.status||'active', password_hash: obj.password_hash||null, created_at: new Date().toISOString() };
  students.push(item); await save('students', students); return { insertId: id };
}
async function getAllStudents() { return await load('students'); }
async function getStudentById(id) { const s = await load('students'); return s.find(x=>Number(x.id)===Number(id)); }
async function findStudentByNumber(student_number) { const s = await load('students'); return s.find(x=>x.student_number===student_number); }
async function updateStudent(id, fields) { const students = await load('students'); const idx = students.findIndex(x=>Number(x.id)===Number(id)); if (idx===-1) return false; students[idx] = { ...students[idx], ...fields }; await save('students', students); return true; }
async function removeStudent(id) { const students = await load('students'); const n = students.filter(x=>Number(x.id)!==Number(id)); await save('students', n); return; }

/* Admins */
async function createAdmin(obj) { const admins = await load('admins'); const id = nextId(admins); const item = { id, username: obj.username, password_hash: obj.password_hash||null, full_name: obj.full_name||null, email: obj.email||null, created_at: new Date().toISOString() }; admins.push(item); await save('admins', admins); return { insertId: id }; }
async function findAdminByUsername(username) { const a = await load('admins'); return a.find(x=>x.username===username); }
async function getAdminById(id) { const a = await load('admins'); return a.find(x=>String(x.id)===String(id)); }

/* Marks */
async function createMark({ student_id, subject_id, exam_year, marks, max_marks, remarks }) {
  const marksArr = await load('marks'); const id = nextId(marksArr); const item = { id, student_id: Number(student_id), subject_id: Number(subject_id), exam_year: Number(exam_year), marks: Number(marks), max_marks: Number(max_marks||100), remarks: remarks||null, created_at: new Date().toISOString() }; marksArr.push(item); await save('marks', marksArr); return { insertId: id };
}
async function getAllMarks() {
  const marksArr = await load('marks'); const students = await load('students'); const subjects = await load('subjects');
  return marksArr.map(m=>({
    ...m,
    first_name: (students.find(s=>Number(s.id)===Number(m.student_id))||{}).first_name,
    last_name: (students.find(s=>Number(s.id)===Number(m.student_id))||{}).last_name,
    student_number: (students.find(s=>Number(s.id)===Number(m.student_id))||{}).student_number,
    subject_name: (subjects.find(s=>Number(s.id)===Number(m.subject_id))||{}).name,
    subject_code: (subjects.find(s=>Number(s.id)===Number(m.subject_id))||{}).code
  }));
}
async function getMarksByStudent(studentId) { const marksArr = await load('marks'); const subjects = await load('subjects'); return marksArr.filter(m=>Number(m.student_id)===Number(studentId)).map(m=>({ ...m, subject_name: (subjects.find(s=>Number(s.id)===Number(m.subject_id))||{}).name, subject_code: (subjects.find(s=>Number(s.id)===Number(m.subject_id))||{}).code })); }
async function getMarksBySubject(subjectId) { const marksArr = await load('marks'); const students = await load('students'); return marksArr.filter(m=>Number(m.subject_id)===Number(subjectId)).map(m=>({ ...m, first_name: (students.find(s=>Number(s.id)===Number(m.student_id))||{}).first_name, last_name: (students.find(s=>Number(s.id)===Number(m.student_id))||{}).last_name, student_number: (students.find(s=>Number(s.id)===Number(m.student_id))||{}).student_number })); }
async function updateMark(id, fields) { const marksArr = await load('marks'); const idx = marksArr.findIndex(x=>Number(x.id)===Number(id)); if (idx===-1) return false; marksArr[idx] = { ...marksArr[idx], ...fields }; await save('marks', marksArr); return true; }
async function removeMark(id) { const marksArr = await load('marks'); const n = marksArr.filter(x=>Number(x.id)!==Number(id)); await save('marks', n); return; }

/* Reports helpers */
async function resolveYear(year){ if (year) return Number(year); const marksArr = await load('marks'); const max = marksArr.reduce((m, r)=> r.exam_year && r.exam_year>m ? r.exam_year : m, 0); return max || new Date().getFullYear(); }

async function studentSummary(year){
  const marksArr = await load('marks'); const students = await load('students');
  const marksForYear = marksArr.filter(m=>Number(m.exam_year)===Number(year));
  const grouped = {};
  for (const m of marksForYear){
    const id = m.student_id; grouped[id] = grouped[id]||{ total_marks:0, total_max:0, failures:0 };
    grouped[id].total_marks += Number(m.marks||0); grouped[id].total_max += Number(m.max_marks||0);
    if (Number(m.marks) < (Number(m.max_marks||100)*0.33)) grouped[id].failures +=1;
  }
  const rows = Object.entries(grouped).map(([sid, v])=>{
    const s = students.find(x=>Number(x.id)===Number(sid))||{}; const avg = v.total_max? (v.total_marks/v.total_max*100):0;
    return { student_id: Number(sid), student_number: s.student_number, first_name: s.first_name, last_name: s.last_name, total_marks: v.total_marks, total_max_marks: v.total_max, average_percentage: Number(avg.toFixed(2)), failures: v.failures };
  }).sort((a,b)=>b.total_marks - a.total_marks);
  return rows.map(r=>({ student_id: r.student_id, student_number: r.student_number, name: `${r.first_name||''} ${r.last_name||''}`.trim(), total_marks: Number(r.total_marks)||0, total_max_marks: Number(r.total_max_marks)||0, average_percentage: Number(r.average_percentage)||0, grade: (r.average_percentage>=85)?'A':(r.average_percentage>=70)?'B':(r.average_percentage>=50)?'C':'F', passed_all_subjects: (r.failures==0) }));
}

async function topper(year){ const rows = await studentSummary(year); return rows[0]||null; }

async function subjectTopper(subjectId, year){ const marksArr = await load('marks'); const students = await load('students'); const filtered = marksArr.filter(m=>Number(m.subject_id)===Number(subjectId) && Number(m.exam_year)===Number(year)); if (!filtered.length) return null; filtered.sort((a,b)=>b.marks - a.marks); const top = filtered[0]; const s = students.find(x=>Number(x.id)===Number(top.student_id))||{}; return { student_id: top.student_id, student_number: s.student_number, name: `${s.first_name||''} ${s.last_name||''}`.trim(), marks: top.marks } }

async function passFail(year){ const marksArr = await load('marks'); const students = await load('students'); const marksForYear = marksArr.filter(m=>Number(m.exam_year)===Number(year)); const map = {};
  for (const m of marksForYear){ map[m.student_id]=map[m.student_id]||{ failures:0 }; if (Number(m.marks) < (Number(m.max_marks||100)*0.33)) map[m.student_id].failures +=1; }
  const total = Object.keys(map).length; const passed = Object.values(map).filter(x=>x.failures===0).length; const failed = total - passed; const passPercent = total? (passed/total*100):0; return { total_students: total, passed, failed, passPercent: Number(passPercent.toFixed(2)) };
}

async function subjectStats(subjectId, year){ const marksArr = await load('marks'); const filtered = marksArr.filter(m=>Number(m.subject_id)===Number(subjectId) && Number(m.exam_year)===Number(year)); const total = filtered.length; const passed = filtered.filter(m=>Number(m.marks) >= (Number(m.max_marks||100)*0.33)).length; const passPercent = total? (passed/total*100):0; const avg = filtered.length? (filtered.reduce((s,m)=>s+Number(m.marks||0),0)/filtered.length):0; const max = filtered.length? Math.max(...filtered.map(m=>Number(m.marks||0))):0; const min = filtered.length? Math.min(...filtered.map(m=>Number(m.marks||0))):0; return { total_entries: total, passed_count: passed, passPercent: Number(passPercent.toFixed(2)), avg_marks: Number(avg.toFixed(2)), max_marks: Number(max), min_marks: Number(min) } }

module.exports = {
  createSubject, getAllSubjects, getSubjectById, updateSubject, removeSubject,
  createStudent, getAllStudents, getStudentById, findStudentByNumber, updateStudent, removeStudent,
  createAdmin, findAdminByUsername, getAdminById,
  createMark, getAllMarks, getMarksByStudent, getMarksBySubject, updateMark, removeMark,
  resolveYear, studentSummary, topper, subjectTopper, passFail, subjectStats
};
