// Wraps async route handlers so thrown errors (e.g. assertRiderOwnsRequest)
// are passed to Express's error handler instead of causing an unhandled rejection.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
