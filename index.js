const r = require('express').Router(), { protect, adminOnly } = require('../middleware/auth');
const a = require('../controllers/authController'), u = require('../controllers/userController'), s = require('../controllers/soilTestController');
const crop = require('../controllers/crudFactory')(require('../models/Crop')), fert = require('../controllers/crudFactory')(require('../models/Fertilizer'));
r.post('/auth/register', a.register); r.post('/auth/login', a.login); r.get('/auth/me', protect, a.me);
r.get('/users', protect, adminOnly, u.list); r.get('/users/:id', protect, adminOnly, u.get); r.put('/users/:id', protect, u.update); r.delete('/users/:id', protect, adminOnly, u.remove);
r.route('/soil-tests').post(protect, s.create).get(protect, s.list);
r.route('/soil-tests/:id').get(protect, s.get).put(protect, s.update).delete(protect, s.remove);
r.post('/soil-tests/:id/analyze', protect, s.analyze);
[['crops', crop], ['fertilizers', fert]].forEach(([p, c]) => {
  r.get(`/${p}`, protect, c.list); r.post(`/${p}`, protect, adminOnly, c.create); r.put(`/${p}/:id`, protect, adminOnly, c.update); r.delete(`/${p}/:id`, protect, adminOnly, c.remove); });
r.route('/reports').post(protect, s.createReport).get(protect, s.listReports); r.get('/reports/:id', protect, s.getReport);
r.get('/dashboard/stats', protect, s.stats);
module.exports = r;
