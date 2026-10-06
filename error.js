exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
exports.errorHandler = (err, req, res, next) => {
  let status = res.statusCode >= 400 ? res.statusCode : 500, message = err.message;
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.code === 11000) { status = 409; message = 'Duplicate value: already exists'; }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  res.status(status).json({ message });
};
