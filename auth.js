const jwt = require('jsonwebtoken'); const User = require('./User');
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authenticated' });
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user || user.status === 'disabled') return res.status(401).json({ message: 'Account unavailable' });
    req.user = user; next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
};
exports.adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access only' });
