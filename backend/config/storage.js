const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const StudentDetail = require('../models/StudentDetail');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');

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
async function getSubjectById(id) { const s = await load('subjects'); return s.find(x => Number(x.id) === Number(id)); }
async function updateSubject(id, { code, name, credits }) {
  const subjects = await load('subjects');
  const idx = subjects.findIndex(x => Number(x.id) === Number(id)); if (idx === -1) return false;
  subjects[idx] = { ...subjects[idx], code, name, credits: credits || 0 };
  await save('subjects', subjects); return true;
}
async function removeSubject(id) { const subjects = await load('subjects'); const n = subjects.filter(x => Number(x.id) !== Number(id)); await save('subjects', n); return; }

/* Students (MongoDB API via Mongoose) */
function getStudentModel(collectionName) {
  const mongoose = require('mongoose');
  if (mongoose.models[collectionName]) return mongoose.models[collectionName];
  return mongoose.model(collectionName, StudentDetail.schema, collectionName);
}

// We use the Mark model directly from models/Mark.js

async function createStudent(obj, collectionName = 'student_details') {
  const Model = getStudentModel(collectionName);
  const newStudent = new Model({
    name: obj.name,
    student_id: obj.student_id,
    email: obj.email,
    password: obj.password,
    mobile: obj.mobile,
    batch: obj.batch,
    semester: obj.semester,
    department: obj.department,
    year: obj.year
  });
  const saved = await newStudent.save();
  return { insertId: saved._id };
}

async function getAllStudents() {
  const students = await StudentDetail.find().sort({ created_at: -1 });
  // Map MongoDB _id to id for compatibility
  return students.map(s => {
    const obj = s.toObject();
    obj.id = obj._id;
    return obj;
  });
}

async function getStudentById(id) {
  const Model = getStudentModel('student_details');
  const mongoose = require('mongoose');
  let student;
  
  if (mongoose.Types.ObjectId.isValid(id)) {
    student = await Model.findById(id);
  }
  
  if (!student) {
    student = await Model.findOne({ student_id: id });
  }

  if (!student) return null;
  const obj = student.toObject();
  obj.id = obj._id;
  return obj;
}

async function findStudentByNumber(student_number) {
  // 1. Try master collection first
  let student = await StudentDetail.findOne({ student_id: student_number });
  
  // 2. Fallback to student-specific collection
  if (!student) {
    const specificCollection = `${student_number}_student`;
    const Model = getStudentModel(specificCollection);
    student = await Model.findOne({ student_id: student_number });
  }

  if (!student) return null;
  const obj = student.toObject();
  obj.id = obj._id;
  return obj;
}

async function updateStudent(id, fields, student_number = null) {
  let updated = null;
  
  // 1. Get current student data to check if student_id is changing
  // ONLY call findById if id is a valid ObjectId hex string to avoid CastError
  const isValidId = mongoose.Types.ObjectId.isValid(id);
  const currentStudent = isValidId ? await StudentDetail.findById(id) : null;
  const oldStudentId = currentStudent ? currentStudent.student_id : null;
  const newStudentId = fields.student_id;

  // 2. Perform the update
  if (student_number) {
    const Model = getStudentModel(`${student_number}_student`);
    updated = await Model.findByIdAndUpdate(id, fields, { new: true });
  }
  if (!updated) updated = await StudentDetail.findByIdAndUpdate(id, fields, { new: true });

  // 3. If student_id changed, migrate related data
  if (updated && oldStudentId && newStudentId && oldStudentId !== newStudentId) {
    console.log(`Migrating data for student ${id}: ${oldStudentId} -> ${newStudentId}`);
    try {
      // Update Mark collection
      await Mark.updateMany({ student_id: oldStudentId }, { $set: { student_id: newStudentId } });
      
      // Update Attendance collection
      await Attendance.updateMany({ student_id: oldStudentId }, { $set: { student_id: newStudentId } });
      
      console.log(`Successfully migrated marks and attendance for ${newStudentId}`);
    } catch (err) {
      console.error('Error migrating student data:', err);
    }
  }

  return !!updated;
}

async function removeStudent(id, student_number = null) {
  if (student_number) {
    const Model = getStudentModel(`${student_number}_student`);
    await Model.findByIdAndDelete(id);
  }
  await StudentDetail.findByIdAndDelete(id);
  return;
}

/* Admins */
async function createAdmin(obj) { const admins = await load('admins'); const id = nextId(admins); const item = { id, username: obj.username, password_hash: obj.password_hash || null, full_name: obj.full_name || null, email: obj.email || null, created_at: new Date().toISOString() }; admins.push(item); await save('admins', admins); return { insertId: id }; }
async function findAdminByUsername(username) { const a = await load('admins'); return a.find(x => x.username === username); }
async function getAdminById(id) { const a = await load('admins'); return a.find(x => String(x.id) === String(id)); }

async function resolveStudentId(id) {
  const student = await getStudentById(id);
  return student ? student.student_id : id;
}

/* Marks (Unified MongoDB Collection) */
async function createMark(obj) {
  const Model = Mark.model;
  const newMark = new Model({
    ...obj,
    mark: Number(obj.mark)
  });
  const saved = await newMark.save();
  return { insertId: saved._id };
}

async function saveMarksBatch(studentId, semester, examType, records, published = false) {
  const Model = Mark.model;

  // Clear existing records for this specific student and session
  // But wait, if we want to keep them, we should actually UPDATE them.
  // Actually, we delete and re-insert is fine, as long as we keep the published state if needed.
  // Or just set the newState.
  await Model.deleteMany({ student_id: studentId, semester, exam_type: examType });

  if (records.length === 0) return { success: true };

  // Insert new records
  const docs = records.map((r, index) => ({
    ...r,
    student_id: studentId,
    semester,
    exam_type: examType,
    mark: Number(r.mark),
    published: !!published,
    order: index // Use array index as the order
  }));

  await Model.insertMany(docs);
  return { success: true };
}
async function publishMarksBatch(studentId, semester, examType) {
  const Model = Mark.model;
  const result = await Model.updateMany(
    { student_id: studentId, semester, exam_type: examType },
    { $set: { published: true } }
  );
  return { success: true, count: result.modifiedCount };
}
async function unpublishMarksBatch(studentId, semester, examType) {
  const Model = Mark.model;
  const result = await Model.updateMany(
    { student_id: studentId, semester, exam_type: examType },
    { $set: { published: false } }
  );
  return { success: true, count: result.modifiedCount };
}
async function removeMarksBatch(studentId, semester, examType) {
  const Model = Mark.model;
  const result = await Model.deleteMany({ student_id: studentId, semester, exam_type: examType });
  console.log(`Deleted ${result.deletedCount} marks for student ${studentId}`);
  return { success: true, count: result.deletedCount };
}

async function getAllMarks() {
  // To get ALL marks across ALL students, we would normally use a master collection.
  // For now, we return empty or implement a master find if needed.
  return [];
}

async function getMarksByStudent(idOrString, filters = {}, isStudent = false) {
  const Model = Mark.model;
  const studentId = await resolveStudentId(idOrString);
  const query = { student_id: studentId };
  if (filters.semester) query.semester = filters.semester;
  if (filters.exam_type) query.exam_type = filters.exam_type;
  if (isStudent) query.published = true;

  const studentMarks = await Model.find(query).sort({ order: 1, created_at: 1 });
  return studentMarks.map(m => {
    return {
      id: m._id,
      student_id: m.student_id,
      course_code: m.course_code,
      course_name: m.course_name,
      course_type: m.course_type,
      mark: m.mark,
      semester: m.semester,
      exam_type: m.exam_type,
      published: !!m.published,
      order: m.order || 0
    };
  });
}
async function getMarksBySubject(subjectId) { return []; }
async function updateMark(id, fields) {
  const Model = Mark.model;
  // studentId filter is good but not strictly required if using global ID,
  // but it's safer to ensure we only update the record we mean to.
  const query = { _id: id };
  if (fields.student_id) query.student_id = fields.student_id;
  
  const updated = await Model.findOneAndUpdate(query, fields, { new: true });
  return !!updated;
}
async function getPerformanceAverages(idOrString) {
  const Model = Mark.model;
  const studentId = await resolveStudentId(idOrString) || idOrString;
  const semesterMap = {
    "1": "I", "1ST": "I", "ONE": "I", "I": "I", "2": "II", "2ND": "II", "TWO": "II", "II": "II",
    "3": "III", "3RD": "III", "THREE": "III", "III": "III", "4": "IV", "4TH": "IV", "FOUR": "IV", "IV": "IV",
    "5": "V", "5TH": "V", "FIVE": "V", "V": "V", "6": "VI", "6TH": "VI", "SIX": "VI", "VI": "VI",
    "7": "VII", "7TH": "VII", "SEVEN": "VII", "VII": "VII", "8": "VIII", "8TH": "VIII", "EIGHT": "VIII", "VIII": "VIII"
  };

  const metrics = await Model.aggregate([
    { $match: { student_id: { $regex: new RegExp(`^${studentId}$`, 'i') } } },
    { $addFields: { u_exam: { $trim: { input: { $toUpper: "$exam_type" } } } } },
    { $group: {
        _id: { sem: { $trim: { input: { $toUpper: "$semester" } } }, code: { $trim: { input: { $toUpper: "$course_code" } } } },
        h1: { $max: { $cond: [{ $eq: ["$u_exam", "HALF 1"] }, { $toDouble: "$mark" }, 0] } },
        h2: { $max: { $cond: [{ $eq: ["$u_exam", "HALF 2"] }, { $toDouble: "$mark" }, 0] } },
        mod: { $max: { $cond: [{ $eq: ["$u_exam", "MODEL"] }, { $toDouble: "$mark" }, 0] } },
        sem: { $max: { $cond: [{ $eq: ["$u_exam", "SEMESTER"] }, { $toDouble: "$mark" }, 0] } },
        hasSem: { $max: { $cond: [{ $eq: ["$u_exam", "SEMESTER"] }, 1, 0] } }
    }},
    { $lookup: {
        from: "department_course",
        let: { c: "$_id.code" },
        pipeline: [{ $match: { $expr: { $eq: [{ $trim: { input: { $toUpper: "$code" } } }, "$$c"] } } }],
        as: "info"
    }},
    { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
    { $project: {
        semester: "$_id.sem",
        credits: { $toDouble: { $ifNull: ["$info.credit", { $ifNull: ["$info.credits", 3] }] } },
        isLab: { $or: [
          { $gt: ["$mod", 0] },
          { $ne: [{ $indexOfCP: [{ $toUpper: { $ifNull: ["$info.type", ""] } }, "LAB"] }, -1] }
        ]},
        fMark: {
          $cond: [
            { $or: [{ $gt: ["$mod", 0] }, { $ne: [{ $indexOfCP: [{ $toUpper: { $ifNull: ["$info.type", ""] } }, "LAB"] }, -1] }] },
            { $round: [{ $add: [{ $multiply: [{ $divide: [{ $add: ["$h1", "$h2"] }, 2] }, 0.3] }, { $multiply: ["$mod", 0.1] }, { $multiply: ["$sem", 0.6] }] }, 0] },
            { $round: [{ $add: [{ $multiply: [{ $divide: [{ $add: ["$h1", "$h2"] }, 2] }, 0.4] }, { $multiply: ["$sem", 0.6] }] }, 0] }
          ]
        },
        passed: { $eq: ["$hasSem", 1] }
    }},
    { $project: {
        semester: 1, credits: 1, passed: 1,
        gp: { $cond: [ "$passed", {
          $switch: { branches: [
            { case: { $gte: ["$fMark", 91] }, then: 10 }, { case: { $gte: ["$fMark", 81] }, then: 9 },
            { case: { $gte: ["$fMark", 71] }, then: 8 }, { case: { $gte: ["$fMark", 61] }, then: 7 },
            { case: { $gte: ["$fMark", 51] }, then: 6 }, { case: { $gte: ["$fMark", 50] }, then: 5 }
          ], default: 0 }
        }, 0 ] }
    }},
    { $group: {
        _id: "$semester",
        pts: { $sum: { $multiply: ["$gp", "$credits"] } },
        creds: { $sum: { $cond: ["$passed", "$credits", 0] } }
    }},
    { $project: { semester: "$_id", sgpa: { $cond: [{ $eq: ["$creds", 0] }, 0, { $round: [{ $divide: ["$pts", "$creds"] }, 2] }] }, _id: 0 } }
  ]);

  const chartRaw = await Model.aggregate([
    { $match: { student_id: { $regex: new RegExp(`^${studentId}$`, 'i') } } },
    { $group: { _id: { s: { $trim: { input: { $toUpper: "$semester" } } }, t: { $trim: { input: { $toUpper: "$exam_type" } } } }, avg: { $avg: "$mark" } } },
    { $group: { _id: "$_id.s", m: { $push: {
      k: { $switch: { branches: [
        { case: { $eq: ["$_id.t", "HALF 1"] }, then: "h1" }, { case: { $eq: ["$_id.t", "HALF 2"] }, then: "h2" },
        { case: { $eq: ["$_id.t", "MODEL"] }, then: "mod" }, { case: { $eq: ["$_id.t", "SEMESTER"] }, then: "sem" }
      ], default: "other" } },
      v: { $round: ["$avg", 2] }
    } } } },
    { $project: { semester: "$_id", data: { $arrayToObject: "$m" }, _id: 0 } }
  ]);

  const final = chartRaw.map(c => {
    const s = metrics.find(m => String(semesterMap[String(m.semester).toUpperCase()] || m.semester).toUpperCase() === String(semesterMap[String(c.semester).toUpperCase()] || c.semester).toUpperCase());
    return { ...c, semester: semesterMap[String(c.semester).toUpperCase()] || c.semester, sgpa: s ? s.sgpa : 0.00 };
  });

  const order = { 'I':1, 'II':2, 'III':3, 'IV':4, 'V':5, 'VI':6, 'VII':7, 'VIII':8 };
  return final.sort((a,b) => (order[a.semester] || 99) - (order[b.semester] || 99));
}


async function removeMark(id, studentId) {
  const Model = Mark.model;
  const query = { _id: id };
  if (studentId) query.student_id = studentId;
  await Model.findOneAndDelete(query);
  return;
}

/* Reports helpers */
async function resolveYear(year) { if (year) return Number(year); const marksArr = await load('marks'); const max = marksArr.reduce((m, r) => r.exam_year && r.exam_year > m ? r.exam_year : m, 0); return max || new Date().getFullYear(); }

async function studentSummary(year) {
  const marksArr = await load('marks'); const students = await load('students');
  const marksForYear = marksArr.filter(m => Number(m.exam_year) === Number(year));
  const grouped = {};
  for (const m of marksForYear) {
    const id = m.student_id; grouped[id] = grouped[id] || { total_marks: 0, total_max: 0, failures: 0 };
    grouped[id].total_marks += Number(m.marks || 0); grouped[id].total_max += Number(m.max_marks || 0);
    if (Number(m.marks) < (Number(m.max_marks || 100) * 0.33)) grouped[id].failures += 1;
  }
  const rows = Object.entries(grouped).map(([sid, v]) => {
    const s = students.find(x => Number(x.id) === Number(sid)) || {}; const avg = v.total_max ? (v.total_marks / v.total_max * 100) : 0;
    return { student_id: Number(sid), student_number: s.student_number, first_name: s.first_name, last_name: s.last_name, total_marks: v.total_marks, total_max_marks: v.total_max, average_percentage: Number(avg.toFixed(2)), failures: v.failures };
  }).sort((a, b) => b.total_marks - a.total_marks);
  return rows.map(r => ({ student_id: r.student_id, student_number: r.student_number, name: `${r.first_name || ''} ${r.last_name || ''}`.trim(), total_marks: Number(r.total_marks) || 0, total_max_marks: Number(r.total_max_marks) || 0, average_percentage: Number(r.average_percentage) || 0, grade: (r.average_percentage >= 85) ? 'A' : (r.average_percentage >= 70) ? 'B' : (r.average_percentage >= 50) ? 'C' : 'F', passed_all_subjects: (r.failures == 0) }));
}

async function topper(year) { const rows = await studentSummary(year); return rows[0] || null; }

async function subjectTopper(subjectId, year) { const marksArr = await load('marks'); const students = await load('students'); const filtered = marksArr.filter(m => Number(m.subject_id) === Number(subjectId) && Number(m.exam_year) === Number(year)); if (!filtered.length) return null; filtered.sort((a, b) => b.marks - a.marks); const top = filtered[0]; const s = students.find(x => Number(x.id) === Number(top.student_id)) || {}; return { student_id: top.student_id, student_number: s.student_number, name: `${s.first_name || ''} ${s.last_name || ''}`.trim(), marks: top.marks }; }

async function passFail(year) {
  const marksArr = await load('marks'); const students = await load('students'); const marksForYear = marksArr.filter(m => Number(m.exam_year) === Number(year)); const map = {};
  for (const m of marksForYear) { map[m.student_id] = map[m.student_id] || { failures: 0 }; if (Number(m.marks) < (Number(m.max_marks || 100) * 0.33)) map[m.student_id].failures += 1; }
  const total = Object.keys(map).length; const passed = Object.values(map).filter(x => x.failures === 0).length; const failed = total - passed; const passPercent = total ? (passed / total * 100) : 0; return { total_students: total, passed, failed, passPercent: Number(passPercent.toFixed(2)) };
}

async function subjectStats(subjectId, year) { const marksArr = await load('marks'); const filtered = marksArr.filter(m => Number(m.subject_id) === Number(subjectId) && Number(m.exam_year) === Number(year)); const total = filtered.length; const passed = filtered.filter(m => Number(m.marks) >= (Number(m.max_marks || 100) * 0.33)).length; const passPercent = total ? (passed / total * 100) : 0; const avg = filtered.length ? (filtered.reduce((s, m) => s + Number(m.marks || 0), 0) / filtered.length) : 0; const max = filtered.length ? Math.max(...filtered.map(m => Number(m.marks || 0))) : 0; const min = filtered.length ? Math.min(...filtered.map(m => Number(m.marks || 0))) : 0; return { total_entries: total, passed_count: passed, passPercent: Number(passPercent.toFixed(2)), avg_marks: Number(avg.toFixed(2)), max_marks: Number(max), min_marks: Number(min) }; }

async function findStudentsByFilter(department, year) {
  // Query against the master student_details collection
  const query = {};
  if (department) query.department = department;
  if (year) query.year = year;
  
  const students = await StudentDetail.find(query).sort({ name: 1 });
  return students.map(s => {
    const obj = s.toObject();
    obj.id = obj._id;
    return obj;
  });
}

/* Reports helpers */

async function saveAttendance(records) {
  // Use bulkWrite for efficiency and to handle upserts (update if exists, insert if not)
  const operations = records.map(record => ({
    updateOne: {
      filter: { 
        student_id: record.student_id, 
        date: record.date, 
        session: record.session 
      },
      update: { $set: { status: record.status, created_at: new Date() } },
      upsert: true
    }
  }));

  if (operations.length === 0) return { success: true, count: 0 };
  
  const result = await Attendance.bulkWrite(operations);
  return { 
    success: true, 
    upsertedCount: result.upsertedCount, 
    modifiedCount: result.modifiedCount 
  };
}

async function getAttendanceByFilter(date, studentIds) {
  // Resolve any possible internal IDs in studentIds to official student_id strings
  const resolvedIds = await Promise.all(studentIds.map(id => resolveStudentId(id)));
  
  // Query attendance for specific students. Optionally filter by date.
  const query = { student_id: { $in: resolvedIds } };
  if (date) {
    query.date = date;
  }
  const records = await Attendance.find(query);
  return records;
}

module.exports = {
  createSubject, getAllSubjects, getSubjectById, updateSubject, removeSubject,
  createStudent, getAllStudents, getStudentById, findStudentByNumber, updateStudent, removeStudent,
  createAdmin, findAdminByUsername, getAdminById,
  createMark, getAllMarks, getMarksByStudent, getMarksBySubject, updateMark, removeMark,
  saveMarksBatch, publishMarksBatch, unpublishMarksBatch, removeMarksBatch,
  resolveYear, studentSummary, topper, subjectTopper, passFail, subjectStats,
  findStudentsByFilter,
  saveAttendance,
  getAttendanceByFilter,
  getPerformanceAverages
};
