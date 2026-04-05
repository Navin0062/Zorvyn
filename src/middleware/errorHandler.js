function notFound(req, res) {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
}

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message,
      details: err.details || []
    });
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({
        error: 'A record with this value already exists'
      });
    }
    return res.status(400).json({
      error: 'Database constraint violation'
    });
  }

  // Permission errors
  if (err.message.includes('permission') || err.message.includes('Permission')) {
    return res.status(403).json({
      error: err.message
    });
  }

  // Not found errors
  if (err.message.includes('not found') || err.message.includes('Not found')) {
    return res.status(404).json({
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error'
  });
}

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

module.exports = {
  notFound,
  errorHandler,
  AppError
};
