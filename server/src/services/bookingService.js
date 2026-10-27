const crypto = require("crypto");
const { Booking } = require("../models/Booking");
const { Room } = require("../models/Room");
const { RoomDateLock } = require("../models/RoomDateLock");
const { AppError } = require("../utils/appError");
const { timesOverlap, todayIst, now } = require("../utils/dateTime");
const { requireObjectId } = require("../utils/ids");
const { validateBookingInput } = require("../validators/bookingValidators");

const LOCK_TTL_MS = 8000;
const LOCK_RETRIES = 12;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sortByDateAndStart(a, b) {
  if (a.bookingDate !== b.bookingDate) {
    return a.bookingDate.localeCompare(b.bookingDate);
  }
  return a.startTime.localeCompare(b.startTime);
}

function conflictMessage(room, booking) {
  return `${room.name} is already booked from ${booking.startTime} to ${booking.endTime}.`;
}

async function acquireRoomDateLock(roomId, bookingDate) {
  const owner = crypto.randomUUID();

  for (let attempt = 0; attempt < LOCK_RETRIES; attempt += 1) {
    const current = now();
    const lockedUntil = new Date(current.getTime() + LOCK_TTL_MS);

    const renewed = await RoomDateLock.findOneAndUpdate(
      { roomId, bookingDate, lockedUntil: { $lte: current } },
      { $set: { lockedUntil, owner } },
      { new: true }
    );
    if (renewed) {
      return { owner, roomId, bookingDate };
    }

    try {
      await RoomDateLock.create({ roomId, bookingDate, lockedUntil, owner });
      return { owner, roomId, bookingDate };
    } catch (error) {
      if (!error || error.code !== 11000) {
        throw error;
      }
    }

    await sleep(40 + Math.floor(Math.random() * 80));
  }

  throw new AppError("This room is busy. Please try booking again.", 409, "LOCK_BUSY");
}

async function releaseRoomDateLock({ roomId, bookingDate, owner }) {
  await RoomDateLock.updateOne(
    { roomId, bookingDate, owner },
    { $set: { lockedUntil: new Date(0) } }
  );
}

async function findRoomOrThrow(roomId) {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError("Room not found.", 404, "ROOM_NOT_FOUND");
  }
  return room;
}

async function createBooking(userId, body) {
  const input = validateBookingInput(body);
  const room = await findRoomOrThrow(input.roomId);
  const lock = await acquireRoomDateLock(room._id, input.bookingDate);

  try {
    const existing = await Booking.find({
      roomId: room._id,
      bookingDate: input.bookingDate,
      status: "active",
    });

    const conflict = existing.find((booking) =>
      timesOverlap(input.startTime, input.endTime, booking.startTime, booking.endTime)
    );

    if (conflict) {
      throw new AppError(conflictMessage(room, conflict), 409, "BOOKING_CONFLICT");
    }

    const booking = await Booking.create({
      roomId: room._id,
      userId,
      title: input.title,
      bookingDate: input.bookingDate,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "active",
    });

    await booking.populate([{ path: "roomId" }, { path: "userId", select: "name email" }]);
    return booking.toPublicJSON();
  } finally {
    await releaseRoomDateLock(lock);
  }
}

async function listRoomBookings(roomId, date) {
  requireObjectId(roomId, "room ID");
  if (!date) {
    throw new AppError("Date is required.", 400, "VALIDATION_ERROR");
  }

  const room = await findRoomOrThrow(roomId);
  const bookings = await Booking.find({
    roomId: room._id,
    bookingDate: date,
    status: "active",
  })
    .populate("userId", "name email")
    .populate("roomId")
    .sort({ startTime: 1 });

  return {
    room: room.toPublicJSON(),
    bookings: bookings.map((booking) => booking.toPublicJSON()),
  };
}

async function listMyUpcomingBookings(userId) {
  const today = todayIst();
  const nowTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now());

  const bookings = await Booking.find({
    userId,
    status: "active",
    bookingDate: { $gte: today },
  })
    .populate("roomId")
    .populate("userId", "name email");

  return bookings
    .filter((booking) => booking.bookingDate > today || booking.endTime > nowTime)
    .sort(sortByDateAndStart)
    .map((booking) => booking.toPublicJSON());
}

async function cancelBooking(userId, bookingId) {
  requireObjectId(bookingId, "booking ID");
  const booking = await Booking.findById(bookingId).populate("roomId").populate("userId", "name email");

  if (!booking) {
    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.userId._id.toString() !== String(userId)) {
    throw new AppError("You can only cancel your own bookings.", 403, "FORBIDDEN");
  }

  if (booking.status === "cancelled") {
    throw new AppError("This booking is already cancelled.", 409, "ALREADY_CANCELLED");
  }

  booking.status = "cancelled";
  await booking.save();
  return booking.toPublicJSON();
}

async function listRooms() {
  const rooms = await Room.find().sort({ name: 1 });
  return rooms.map((room) => room.toPublicJSON());
}

async function getRoom(roomId) {
  requireObjectId(roomId, "room ID");
  const room = await findRoomOrThrow(roomId);
  return room.toPublicJSON();
}

module.exports = {
  createBooking,
  listRoomBookings,
  listMyUpcomingBookings,
  cancelBooking,
  listRooms,
  getRoom,
};
