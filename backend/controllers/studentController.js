const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../config/storage');
require('dotenv').config();

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

exports.create = async (req, res, next) => {
	try {
		const { student_number, first_name, last_name, dob, gender, email, class_name, enrollment_date, status, password } = req.body;
		const pwd = password || 'changeme';
		const hash = await bcrypt.hash(pwd, 10);
		const result = await store.createStudent({ student_number, first_name, last_name, dob, gender, email, class_name, enrollment_date, status, password_hash: hash });
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
		if (req.user && req.user.role === 'student' && Number(req.user.id) !== Number(id)) return res.status(403).json({ message: 'Forbidden' });
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
		if (up.password) {
			const hash = await bcrypt.hash(up.password, 10);
			up.password_hash = hash;
			delete up.password;
		}
		if (Object.keys(up).length === 0) return res.status(400).json({ message: 'No fields to update' });
		await store.updateStudent(id, up);
		res.json({ message: 'Updated' });
	} catch (err) {
		next(err);
	}
};

exports.remove = async (req, res, next) => {
	try {
		const id = req.params.id;
		await store.removeStudent(id);
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { student_number, password } = req.body;
		if (!student_number || !password) return res.status(400).json({ message: 'student_number and password required' });
		const studentNumberNorm = String(student_number).trim().toUpperCase();
		const student = await store.findStudentByNumber(studentNumberNorm);
		if (!student) return res.status(401).json({ message: 'Invalid credentials' });
		if (!student.password_hash) return res.status(401).json({ message: 'No password set for student' });
		const match = await bcrypt.compare(password, student.password_hash);
		if (!match) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken({ id: student.id, role: 'student', student_number: student.student_number });
		res.json({ token });
	} catch (err) {
		next(err);
	}
};

