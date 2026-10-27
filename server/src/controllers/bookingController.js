const bookingService = require("../services/bookingService");

function bookingController() {
  return {
    async create(req, res, next) {
      try {
        const booking = await bookingService.createBooking(req.userId, req.body || {});
        res.status(201).json({ booking });
      } catch (error) {
        next(error);
      }
    },
    async myBookings(req, res, next) {
      try {
        const bookings = await bookingService.listMyUpcomingBookings(req.userId);
        res.json({ bookings });
      } catch (error) {
        next(error);
      }
    },
    async cancel(req, res, next) {
      try {
        const booking = await bookingService.cancelBooking(req.userId, req.params.bookingId);
        res.json({ booking, message: "Booking cancelled." });
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = { bookingController };
