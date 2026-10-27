const bookingService = require("../services/bookingService");
const { isValidDateString } = require("../utils/dateTime");
const { AppError } = require("../utils/appError");

function roomController() {
  return {
    async list(_req, res, next) {
      try {
        const rooms = await bookingService.listRooms();
        res.json({ rooms });
      } catch (error) {
        next(error);
      }
    },
    async get(req, res, next) {
      try {
        const room = await bookingService.getRoom(req.params.roomId);
        res.json({ room });
      } catch (error) {
        next(error);
      }
    },
    async listBookings(req, res, next) {
      try {
        const date = req.query.date;
        if (!isValidDateString(date)) {
          throw new AppError("Date must be a valid calendar date in YYYY-MM-DD format.", 400, "VALIDATION_ERROR");
        }
        const result = await bookingService.listRoomBookings(req.params.roomId, date);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = { roomController };
