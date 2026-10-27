const express = require("express");
const { authController } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

function createAuthRouter(env) {
  const router = express.Router();
  const controller = authController(env);

  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.get("/me", authMiddleware(env.jwtSecret), controller.me);

  return router;
}

module.exports = { createAuthRouter };
