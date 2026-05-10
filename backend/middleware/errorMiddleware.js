export const notFound = (req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (err.name === 'CastError')        { err.message = 'Invalid ID'; statusCode = 404; }
  if (err.code === 11000)              { err.message = `${Object.keys(err.keyValue || {})[0] || 'Field'} already exists`; statusCode = 409; }
  if (err.name === 'ValidationError')  { err.message = Object.values(err.errors).map(e => e.message).join(', '); statusCode = 400; }
  if (err.name === 'JsonWebTokenError'){ err.message = 'Invalid token'; statusCode = 401; }
  if (err.name === 'TokenExpiredError'){ err.message = 'Token expired'; statusCode = 401; }

  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  res.status(statusCode).json({ error: err.message || 'Server error' });
};
