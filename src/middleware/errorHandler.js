module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  console.error(err.stack || err);
  res.status(err.statusCode || 500).json({
    error: { message: err.statusCode ? err.message : 'Internal server error' }
  });
};
