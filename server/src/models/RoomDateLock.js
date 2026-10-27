const mongoose = require("mongoose");

const roomDateLockSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  bookingDate: { type: String, required: true },
  lockedUntil: { type: Date, required: true },
  owner: { type: String, required: true },
});

roomDateLockSchema.index({ roomId: 1, bookingDate: 1 }, { unique: true });

const RoomDateLock = mongoose.model("RoomDateLock", roomDateLockSchema);

module.exports = { RoomDateLock };
