const { AppError } = require("../utils/appError");

function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Route not found.", code: "NOT_FOUND" });
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload.", code: "INVALID_JSON" });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  if (err && err.name === "CastError") {
    return res.status(400).json({ error: "Invalid identifier.", code: "INVALID_ID" });
  }

  console.error("Unhandled server error:", err && err.message ? err.message : err);
  return res.status(500).json({ error: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
}

module.exports = { errorHandler, notFoundHandler };
