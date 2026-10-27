const express = require("express");
const { bookingController } = require("../controllers/bookingController");

function createBookingRouter() {
  const router = express.Router();
  const controller = bookingController();

  router.post("/", controller.create);
  router.get("/my", controller.myBookings);
  router.delete("/:bookingId", controller.cancel);

  return router;
}

module.exports = { createBookingRouter };
