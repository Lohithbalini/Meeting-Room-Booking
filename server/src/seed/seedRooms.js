const { Room } = require("../models/Room");

const DEFAULT_ROOMS = [
  { slug: "room-a", name: "Room A", capacity: 4, floor: 1 },
  { slug: "room-b", name: "Room B", capacity: 6, floor: 1 },
  { slug: "room-c", name: "Room C", capacity: 8, floor: 2 },
  { slug: "room-d", name: "Room D", capacity: 10, floor: 2 },
  { slug: "room-e", name: "Room E", capacity: 12, floor: 3 },
];

async function seedRooms() {
  for (const room of DEFAULT_ROOMS) {
    await Room.findOneAndUpdate(
      { slug: room.slug },
      { $set: room },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  return Room.find({ slug: { $in: DEFAULT_ROOMS.map((room) => room.slug) } }).sort({ name: 1 });
}

module.exports = { seedRooms, DEFAULT_ROOMS };
