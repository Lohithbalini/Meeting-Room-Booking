const { AppError } = require("../utils/appError");
const { isValidDateString, isValidTime, compareTimes, isBookingInPast } = require("../utils/dateTime");
const { requireObjectId } = require("../utils/ids");

const OFFICE_START = "09:00";
const OFFICE_END = "19:00";

function requireTrimmedString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${field} is required.`, 400, "VALIDATION_ERROR");
  }
  return value.trim();
}

function validateBookingInput(body) {
  if (!body || typeof body !== "object") {
    throw new AppError("Room, title, date, start time, and end time are required.", 400, "VALIDATION_ERROR");
  }

  if (body.roomId == null || body.roomId === "") {
    throw new AppError("Room is required.", 400, "VALIDATION_ERROR");
  }
  const roomId = requireObjectId(String(body.roomId), "room ID");

  if (body.title == null) {
    throw new AppError("Title is required.", 400, "VALIDATION_ERROR");
  }
  const title = requireTrimmedString(body.title, "Title");

  if (body.date == null || body.date === "") {
    throw new AppError("Date is required.", 400, "VALIDATION_ERROR");
  }
  if (!isValidDateString(body.date)) {
    throw new AppError("Date must be a valid calendar date in YYYY-MM-DD format.", 400, "VALIDATION_ERROR");
  }

  if (body.startTime == null || body.startTime === "") {
    throw new AppError("Start time is required.", 400, "VALIDATION_ERROR");
  }
  if (!isValidTime(body.startTime)) {
    throw new AppError("Start time must use HH:mm format.", 400, "VALIDATION_ERROR");
  }

  if (body.endTime == null || body.endTime === "") {
    throw new AppError("End time is required.", 400, "VALIDATION_ERROR");
  }
  if (!isValidTime(body.endTime)) {
    throw new AppError("End time must use HH:mm format.", 400, "VALIDATION_ERROR");
  }

  if (compareTimes(body.startTime, body.endTime) <= 0) {
    throw new AppError("End time must be later than start time.", 400, "VALIDATION_ERROR");
  }

  if (compareTimes(OFFICE_START, body.startTime) < 0) {
    throw new AppError("Start time must be at or after 09:00 IST.", 400, "VALIDATION_ERROR");
  }

  if (compareTimes(body.endTime, OFFICE_END) < 0) {
    throw new AppError("End time must be at or before 19:00 IST.", 400, "VALIDATION_ERROR");
  }

  if (isBookingInPast(body.date, body.startTime)) {
    throw new AppError("Bookings cannot be created in the past.", 400, "VALIDATION_ERROR");
  }

  return {
    roomId,
    title,
    bookingDate: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
  };
}

module.exports = { validateBookingInput, OFFICE_START, OFFICE_END };
