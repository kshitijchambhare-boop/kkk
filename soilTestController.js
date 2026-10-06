const SoilTest = require('../models/SoilTest'), Crop = require('../models/Crop'), Fertilizer = require('../models/Fertilizer'), Report = require('../models/Report'), User = require('../models/User');
const { analyzeSoil } = require('../utils/soilAnalysis'), { recommendCrops } = require('../utils/cropRecommendation'), { recommendFertilizers } = require('../utils/fertilizerRecommendation');
const owned = (req, id) => SoilTest.findOne(req.user.role === 'admin' ? { _id: id } : { _id: id, userId: req.user._id });
const fields = ['farmerName','location','village','district','state','soilType','crop','previousCrop','irrigationType','ph','nitrogen','phosphorus','potassium','organicCarbon','moisture','testDate','notes'];
const applyAnalysis = t => Object.assign(t, analyzeSoil({ pH: t.ph, nitrogen: t.nitrogen, phosphorus: t.phosphorus, potassium: t.potassium, organicCarbon: t.organicCarbon, moisture: t.moisture }));
async function full(t) {
  const [crops, ferts] = await Promise.all([Crop.find(), Fertilizer.find()]);
  return { ...t.toObject(), cropRecommendations: recommendCrops(t, t.nutrientStatus, crops), fertilizerRecommendations: recommendFertilizers(t.deficiencies, ferts) };
}
exports.create = async (req, res, next) => { try {
  const t = new SoilTest({ userId: req.user._id }); fields.forEach(f => req.body[f] !== undefined && (t[f] = req.body[f]));
  applyAnalysis(t); await t.save(); res.status(201).json(await full(t));
} catch (e) { next(e); } };
exports.list = async (req, res, next) => { try {
  res.json(await SoilTest.find(req.user.role === 'admin' ? {} : { userId: req.user._id }).sort('-testDate'));
} catch (e) { next(e); } };
exports.get = async (req, res, next) => { try { const t = await owned(req, req.params.id); if (!t) return res.status(404).json({ message: 'Test not found' }); res.json(await full(t)); } catch (e) { next(e); } };
exports.update = async (req, res, next) => { try {
  const t = await owned(req, req.params.id); if (!t) return res.status(404).json({ message: 'Test not found' });
  fields.forEach(f => req.body[f] !== undefined && (t[f] = req.body[f])); applyAnalysis(t); await t.save(); res.json(await full(t));
} catch (e) { next(e); } };
exports.analyze = async (req, res, next) => { try {
  const t = await owned(req, req.params.id); if (!t) return res.status(404).json({ message: 'Test not found' });
  applyAnalysis(t); await t.save(); res.json(await full(t));
} catch (e) { next(e); } };
exports.remove = async (req, res, next) => { try {
  const t = await owned(req, req.params.id); if (!t) return res.status(404).json({ message: 'Test not found' });
  await t.deleteOne(); await Report.deleteMany({ soilTestId: t._id }); res.json({ message: 'Deleted' });
} catch (e) { next(e); } };
exports.createReport = async (req, res, next) => { try {
  const t = await owned(req, req.body.soilTestId); if (!t) return res.status(404).json({ message: 'Test not found' });
  res.status(201).json(await Report.create({ userId: req.user._id, soilTestId: t._id, reportData: await full(t) }));
} catch (e) { next(e); } };
exports.listReports = async (req, res, next) => { try { res.json(await Report.find(req.user.role === 'admin' ? {} : { userId: req.user._id }).sort('-createdAt')); } catch (e) { next(e); } };
exports.getReport = async (req, res, next) => { try {
  const r = await Report.findById(req.params.id); if (!r || (req.user.role !== 'admin' && String(r.userId) !== String(req.user._id))) return res.status(404).json({ message: 'Report not found' }); res.json(r);
} catch (e) { next(e); } };
exports.stats = async (req, res, next) => { try {
  const admin = req.user.role === 'admin', q = admin ? {} : { userId: req.user._id };
  const tests = await SoilTest.find(q).sort('-testDate');
  const healthy = tests.filter(t => ['Excellent', 'Good'].includes(t.fertilityLevel)).length;
  const dist = {}, deficiency = {}, perMonth = {};
  tests.forEach(t => { dist[t.fertilityLevel] = (dist[t.fertilityLevel] || 0) + 1; t.deficiencies.forEach(d => deficiency[d] = (deficiency[d] || 0) + 1);
    const k = new Date(t.testDate).toISOString().slice(0, 7); perMonth[k] = (perMonth[k] || 0) + 1; });
  const out = { totalTests: tests.length, healthy, deficient: tests.length - healthy, reports: await Report.countDocuments(q), distribution: dist, deficiencyStats: deficiency, testsPerMonth: perMonth, recent: tests.slice(0, 5), latest: tests[0] || null };
  if (admin) out.totalUsers = await User.countDocuments();
  res.json(out);
} catch (e) { next(e); } };
