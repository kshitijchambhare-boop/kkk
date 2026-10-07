const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), User = require('./User');
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
exports.register = async (req, res, next) => { try {
  const { name, email, phone, password, location, village, district, state } = req.body;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and password (min 6 chars) are required' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Invalid email' });
  if (phone && !/^[0-9+\-\s]{7,15}$/.test(phone)) return res.status(400).json({ message: 'Invalid phone number' });
  const u = await User.create({ name, email, phone, location, village, district, state, role: 'farmer', password: await bcrypt.hash(password, 10) });
  res.status(201).json({ message: 'Registered successfully', id: u._id });
} catch (e) { next(e); } };
exports.login = async (req, res, next) => { try {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() }).select('+password');
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(401).json({ message: 'Invalid email or password' });
  if (u.status === 'disabled') return res.status(403).json({ message: 'Account disabled' });
  const user = u.toObject(); delete user.password; res.json({ token: sign(u), user });
} catch (e) { next(e); } };
exports.me = (req, res) => res.json(req.user);
