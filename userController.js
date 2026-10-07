const esc = x => String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const User = require('./User');
exports.list = async (req, res, next) => { try { const s = req.query.search; res.json(await User.find(s ? { $or: [{ name: new RegExp(esc(s), 'i') }, { email: new RegExp(esc(s), 'i') }] } : {}).sort('-createdAt')); } catch (e) { next(e); } };
exports.get = async (req, res, next) => { try { const u = await User.findById(req.params.id); u ? res.json(u) : res.status(404).json({ message: 'User not found' }); } catch (e) { next(e); } };
exports.update = async (req, res, next) => { try {
  const allowed = ['name','phone','location','village','district','state']; if (req.user.role === 'admin') allowed.push('role', 'status');
  if (req.user.role !== 'admin' && req.params.id !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
  const patch = {}; allowed.forEach(k => req.body[k] !== undefined && (patch[k] = req.body[k]));
  const u = await User.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true }); u ? res.json(u) : res.status(404).json({ message: 'User not found' });
} catch (e) { next(e); } };
exports.remove = async (req, res, next) => { try { if (req.params.id === String(req.user._id)) return res.status(400).json({ message: 'Cannot delete yourself' }); await User.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (e) { next(e); } };
