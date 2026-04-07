const store = require('../config/storage');

exports.create = async (req, res, next) => {
	try {
		const { student_id, course_code, course_name, course_type, mark, semester, exam_type } = req.body;
		const result = await store.createMark({ 
			student_id, 
			course_code, 
			course_name, 
			course_type, 
			mark, 
			semester, 
			exam_type 
		});
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
		const { semester, exam_type, view_all } = req.query;
		const isAdmin = req.user && req.user.role === 'admin';
		
		if (!isAdmin && req.user && String(req.user.student_id) !== String(studentId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Default to strict student visibility (ONLY published marks)
    // ONLY show drafts if the requester is an admin AND specifically asked for them (view_all=true)
    const isStudentMode = !(isAdmin && view_all === 'true');
    
		const rows = await store.getMarksByStudent(studentId, { semester, exam_type }, isStudentMode);
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
		const studentId = req.query.student_id;
		const { mark, course_code, course_name, course_type } = req.body;
		await store.updateMark(id, { student_id: studentId, mark: Number(mark), course_code, course_name, course_type });
		res.json({ message: 'Updated' });
	} catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
	try {
		const id = req.params.id;
		const studentId = req.query.student_id;
		await store.removeMark(id, studentId);
		res.json({ message: 'Deleted' });
	} catch (err) { next(err); }
};

exports.saveBatch = async (req, res, next) => {
	try {
		const { student_id, semester, exam_type, records, is_publish } = req.body;
		if (!student_id || !semester || !exam_type || !records) {
      return res.status(400).json({ message: 'Missing required fields for batch save' });
    }
		await store.saveMarksBatch(student_id, semester, exam_type, records, is_publish);
		res.json({ message: 'Batch marks saved successfully' });
	} catch (err) { next(err); }
};

exports.removeBatch = async (req, res, next) => {
	try {
		const { student_id, semester, exam_type } = req.query;
		console.log('Batch Delete Request:', { student_id, semester, exam_type });
		if (!student_id || !semester || !exam_type) {
      return res.status(400).json({ message: 'Missing student_id, semester, or exam_type' });
    }
		const result = await store.unpublishMarksBatch(student_id, semester, exam_type);
		res.json({ message: 'Batch marks unpublished successfully', count: result.count });
	} catch (err) { next(err); }
};

