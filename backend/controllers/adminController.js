const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../config/storage');
require('dotenv').config();

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

exports.register = async (req, res, next) => {
	try {
		const { username, password, full_name, email } = req.body;
		if (!username || !password) return res.status(400).json({ message: 'username and password required' });
		const hash = await bcrypt.hash(password, 10);
		const result = await store.createAdmin({ username, password_hash: hash, full_name, email });
		res.status(201).json({ id: result.insertId, username });
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) return res.status(400).json({ message: 'username and password required' });
		const admin = await store.findAdminByUsername(username);
		if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
		const match = await bcrypt.compare(password, admin.password_hash);
		if (!match) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken({ id: admin.id, role: 'admin', username: admin.username });
		res.json({ token });
	} catch (err) {
		next(err);
	}
};

exports.me = async (req, res, next) => {
	try {
		const admin = await store.getAdminById(req.user.id);
		if (!admin) return res.status(404).json({ message: 'Not found' });
		res.json({ id: admin.id, username: admin.username, full_name: admin.full_name, email: admin.email, created_at: admin.created_at });
	} catch (err) {
		next(err);
	}
};

