const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const { Booking } = require("../src/models/Booking");
const { Room } = require("../src/models/Room");
const { User } = require("../src/models/User");
const { seedRooms } = require("../src/seed/seedRooms");

describe("MongoDB reliability", () => {
  test("MongoDB connection failure is handled gracefully", async () => {
    if (mongoose.connection.readyState !== 0) {
      await disconnectDatabase();
    }

    await expect(
      connectDatabase("mongodb://127.0.0.1:59999/meeting_room_booking_fail", {
        serverSelectionTimeoutMS: 800,
      })
    ).rejects.toBeTruthy();
  });

  test("bookings persist after a reconnect", async () => {
    if (mongoose.connection.readyState !== 0) {
      await disconnectDatabase();
    }

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connectDatabase(uri);
    await seedRooms();

    const user = await User.create({
      name: "Persist User",
      email: "persist@example.com",
      passwordHash: "hashed-password-value",
    });
    const room = await Room.findOne({ slug: "room-a" });
    await Booking.create({
      roomId: room._id,
      userId: user._id,
      title: "Persisted meeting",
      bookingDate: "2026-12-01",
      startTime: "10:00",
      endTime: "11:00",
      status: "active",
    });

    await disconnectDatabase();
    await connectDatabase(uri);

    const found = await Booking.findOne({ title: "Persisted meeting" });
    expect(found).toBeTruthy();
    expect(found.status).toBe("active");

    await disconnectDatabase();
    await mongod.stop();
  });
});
