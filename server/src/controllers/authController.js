const authService = require("../services/authService");

function authController(env) {
  return {
    async register(req, res, next) {
      try {
        const result = await authService.registerUser(req.body || {}, env.jwtSecret, env.jwtExpiresIn);
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    },
    async login(req, res, next) {
      try {
        const result = await authService.loginUser(req.body || {}, env.jwtSecret, env.jwtExpiresIn);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
    async me(req, res, next) {
      try {
        const user = await authService.getUserById(req.userId);
        res.json({ user });
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = { authController };
