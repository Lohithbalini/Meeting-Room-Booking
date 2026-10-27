const express = require("express");
const { roomController } = require("../controllers/roomController");

function createRoomRouter() {
  const router = express.Router();
  const controller = roomController();

  router.get("/", controller.list);
  router.get("/:roomId/bookings", controller.listBookings);
  router.get("/:roomId", controller.get);

  return router;
}

module.exports = { createRoomRouter };
