export function notFound(req, res, _next) {
  res.status(404).json({
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, _next) {
  if (process.env.NODE_ENV !== 'test') {
    console.error('API Error:', err.message);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ message: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'record';
    return res.status(409).json({ message: `A record with this ${field} already exists.` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid security token. Please sign in again.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.'
  });
}
