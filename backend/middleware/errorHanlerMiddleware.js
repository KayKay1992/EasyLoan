// Error handler middleware (this should be used globally)
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;  // Default to 500 if no status code is set
    res.status(statusCode).json({
      message: err.message,
    //   stack: err.stack,
    });
  };

  module.exports = errorHandler