const store = require('../config/storage');

exports.create = async (req, res, next) => {
	try {
		const { student_id, subject_id, exam_year, marks, max_marks, remarks } = req.body;
		const result = await store.createMark({ student_id, subject_id, exam_year, marks, max_marks, remarks });
		res.status(201).json({ id: result.insertId });
	} catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
	try {
		    const rows = await store.getAllMarks();
		    res.json(rows);
	} catch (err) { next(err); }
};

exports.getByStudent = async (req, res, next) => {
	try {
		const studentId = req.params.id;
		if (req.user && req.user.role === 'student' && Number(req.user.id) !== Number(studentId)) return res.status(403).json({ message: 'Forbidden' });
		const rows = await store.getMarksByStudent(studentId);
		res.json(rows);
	} catch (err) { next(err); }
};

exports.getBySubject = async (req, res, next) => {
	try {
		const subjectId = req.params.id;
		const rows = await store.getMarksBySubject(subjectId);
		res.json(rows);
	} catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
	try {
		const id = req.params.id;
		const { marks, max_marks, remarks } = req.body;
		await store.updateMark(id, { marks: Number(marks), max_marks: Number(max_marks||100), remarks: remarks||null });
		res.json({ message: 'Updated' });
	} catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
	try {
		const id = req.params.id;
		await store.removeMark(id);
		res.json({ message: 'Deleted' });
	} catch (err) { next(err); }
};

