const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../config/storage');
require('dotenv').config();

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

exports.create = async (req, res, next) => {
	try {
		const { name, email, mobile, batch, semester, department, year, password } = req.body;
		const student_id = req.body.student_id || req.body.studentId;

		const result = await store.createStudent({
			name,
			student_id,
			email,
			mobile,
			batch,
			semester,
			department,
			year,
			password: password || '123456'
		});
		res.status(201).json({ id: result.insertId });
	} catch (err) {
		next(err);
	}
};

exports.getAll = async (req, res, next) => {
	try {
		const rows = await store.getAllStudents();
		res.json(rows);
	} catch (err) {
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const id = req.params.id;
		if (req.user && req.user.role === 'student') {
			const isMatch = String(req.user.id) === String(id) || String(req.user.student_id) === String(id);
			if (!isMatch) return res.status(403).json({ message: 'Forbidden' });
		}
		const row = await store.getStudentById(id);
		if (!row) return res.status(404).json({ message: 'Not found' });
		res.json(row);
	} catch (err) {
		next(err);
	}
};

exports.update = async (req, res, next) => {
	try {
		const id = req.params.id;
		const up = { ...req.body };
		const student = await store.getStudentById(id);
		const student_id = student ? student.student_id : null;
		
		if (Object.keys(up).length === 0) return res.status(400).json({ message: 'No fields to update' });
		await store.updateStudent(id, up, student_id);
		res.json({ message: 'Updated' });
	} catch (err) {
		next(err);
	}
};

exports.remove = async (req, res, next) => {
	try {
		const id = req.params.id;
		const student = await store.getStudentById(id);
		const student_id = student ? student.student_id : null;
		await store.removeStudent(id, student_id);
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const student_id = req.body.student_number || req.body.student_id;
		const password = req.body.password;
		if (!student_id || !password) return res.status(400).json({ message: 'student_number and password required' });

		const student = await store.findStudentByNumber(student_id);
		if (!student) return res.status(401).json({ message: 'Invalid credentials' });

		const match = (password === student.password);
		if (!match) return res.status(401).json({ message: 'Invalid credentials' });

		const token = signToken({ id: student.id, role: 'student', student_id: student.student_id });
		res.json({ token, student });
	} catch (err) {
		next(err);
	}
};


exports.filterByDeptAndYear = async (req, res, next) => {
	try {
		const { department, year } = req.query;
		if (!department || !year) return res.status(400).json({ message: 'department and year are required' });
		const rows = await store.findStudentsByFilter(department, year);
		res.json(rows);
	} catch (err) {
		next(err);
	}
};
