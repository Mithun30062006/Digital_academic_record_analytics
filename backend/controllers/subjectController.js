const store = require('../config/storage');

exports.create = async (req, res, next) => {
	try {
		const { code, name, credits } = req.body;
		const result = await store.createSubject({ code, name, credits });
		res.status(201).json({ id: result.insertId });
	} catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
	try {
		const rows = await store.getAllSubjects();
		res.json(rows);
	} catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
	try {
		const id = req.params.id;
		const row = await store.getSubjectById(id);
		if (!row) return res.status(404).json({ message: 'Not found' });
		res.json(row);
	} catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
	try {
		const id = req.params.id;
		const { code, name, credits } = req.body;
		await store.updateSubject(id, { code, name, credits });
		res.json({ message: 'Updated' });
	} catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
	try {
		const id = req.params.id;
		await store.removeSubject(id);
		res.json({ message: 'Deleted' });
	} catch (err) { next(err); }
};

