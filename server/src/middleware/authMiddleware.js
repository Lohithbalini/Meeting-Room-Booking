const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/appError");

function authMiddleware(jwtSecret) {
  return function requireAuth(req, _res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(new AppError("Authentication required.", 401, "UNAUTHENTICATED"));
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
      if (!payload || !payload.sub) {
        return next(new AppError("Invalid or expired token.", 401, "UNAUTHENTICATED"));
      }
      req.userId = payload.sub;
      return next();
    } catch (_error) {
      return next(new AppError("Invalid or expired token.", 401, "UNAUTHENTICATED"));
    }
  };
}

module.exports = { authMiddleware };
