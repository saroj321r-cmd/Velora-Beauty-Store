/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).render('404', {
    title: 'Page Not Found - VELORA',
    url: req.originalUrl
  });
};

/**
 * Global Error Handler
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('[Error Stack]:', err.stack || err);
  const statusCode = err.status || 500;
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }

  res.status(statusCode).render('404', {
    title: 'Something Went Wrong - VELORA',
    url: req.originalUrl,
    error: process.env.NODE_ENV === 'development' ? err : null
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
