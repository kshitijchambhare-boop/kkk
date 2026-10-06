const esc = x => String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
module.exports = Model => ({
  list: async (req, res, next) => { try { const s = req.query.search; res.json(await Model.find(s ? { name: new RegExp(esc(s), 'i') } : {}).sort('name')); } catch (e) { next(e); } },
  create: async (req, res, next) => { try { res.status(201).json(await Model.create(req.body)); } catch (e) { next(e); } },
  update: async (req, res, next) => { try { const d = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); d ? res.json(d) : res.status(404).json({ message: 'Not found' }); } catch (e) { next(e); } },
  remove: async (req, res, next) => { try { const d = await Model.findByIdAndDelete(req.params.id); d ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Not found' }); } catch (e) { next(e); } }
});
