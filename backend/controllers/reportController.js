const store = require('../config/storage');

async function resolveYear(year){
  return await store.resolveYear(year);
}

exports.studentSummary = async (req, res, next) => {
  try {
    const year = await resolveYear(req.query.year);
    const data = await store.studentSummary(year);
    res.json({ year, data });
  } catch (err) { next(err); }
};

exports.topper = async (req, res, next) => {
  try {
    const year = await resolveYear(req.query.year);
    const top = await store.topper(year);
    res.json({ year, topper: top ? { student_id: top.student_id, student_number: top.student_number, name: top.name, total_marks: top.total_marks } : null });
  } catch (err) { next(err); }
};

exports.subjectTopper = async (req, res, next) => {
  try {
    const subjectId = req.params.subjectId;
    const year = await resolveYear(req.query.year);
    const top = await store.subjectTopper(subjectId, year);
    res.json({ year, subjectId, topper: top });
  } catch (err) { next(err); }
};

exports.passFail = async (req, res, next) => {
  try {
    const year = await resolveYear(req.query.year);
    const stats = await store.passFail(year);
    res.json({ year, total_students: stats.total_students, passed: stats.passed, failed: stats.failed, passPercent: stats.passPercent });
  } catch (err) { next(err); }
};

exports.subjectStats = async (req, res, next) => {
  try {
    const subjectId = req.params.subjectId;
    const year = await resolveYear(req.query.year);
    const r = await store.subjectStats(subjectId, year);
    res.json({ year, subjectId, total_entries: r.total_entries, passed_count: r.passed_count, passPercent: r.passPercent, avg_marks: r.avg_marks, max_marks: r.max_marks, min_marks: r.min_marks });
  } catch (err) { next(err); }
};
