const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    floor: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

roomSchema.index({ slug: 1 }, { unique: true });

roomSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    capacity: this.capacity,
    floor: this.floor,
  };
};

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room };
