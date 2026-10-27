const express = require("express");
const cors = require("cors");
const { createAuthRouter } = require("./routes/authRoutes");
const { createRoomRouter } = require("./routes/roomRoutes");
const { createBookingRouter } = require("./routes/bookingRoutes");
const { authMiddleware } = require("./middleware/authMiddleware");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

function createApp(env) {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", createAuthRouter(env));
  app.use("/api/rooms", authMiddleware(env.jwtSecret), createRoomRouter());
  app.use("/api/bookings", authMiddleware(env.jwtSecret), createBookingRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
