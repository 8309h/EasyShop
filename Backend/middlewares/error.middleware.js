function errorHandler(err, req, res, next) {
  console.error("🔥 ERROR LOG:");
  console.error({
    message: err.message,
    stack: err.stack,
    name: err.name
  });

  // Send clean error to client
  res.status(err.status || 500).json({
    msg: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}

module.exports = { errorHandler };
