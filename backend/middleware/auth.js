const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (roles.length && !roles.includes(payload.role)) return res.status(403).json({ message: 'Forbidden' });
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = { authenticate };
