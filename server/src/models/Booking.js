const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    bookingDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

bookingSchema.index({ roomId: 1, bookingDate: 1, status: 1, startTime: 1 });
bookingSchema.index({ userId: 1, bookingDate: 1, status: 1, startTime: 1 });

function refId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value._id) return value._id.toString();
  return value.toString();
}

bookingSchema.methods.toPublicJSON = function toPublicJSON() {
  const room = this.roomId && this.roomId.name ? this.roomId : null;
  const user = this.userId && this.userId.name ? this.userId : null;

  return {
    id: this._id.toString(),
    title: this.title,
    date: this.bookingDate,
    startTime: this.startTime,
    endTime: this.endTime,
    status: this.status,
    room: room
      ? { id: room._id.toString(), name: room.name, capacity: room.capacity, floor: room.floor }
      : { id: refId(this.roomId), name: "Unknown room" },
    bookedBy: user
      ? { id: user._id.toString(), name: user.name }
      : { id: refId(this.userId), name: "Unknown user" },
    createdAt: this.createdAt,
  };
};

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = { Booking };
