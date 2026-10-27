const mongoose = require("mongoose");
const request = require("supertest");
const { Booking } = require("../src/models/Booking");
const { Room } = require("../src/models/Room");
const {
  startTestApp,
  stopTestApp,
  resetData,
  authHeader,
  freezeIstMorning,
  getApp,
} = require("./helpers");

const DATE = "2026-12-01";

let roomA;
let roomB;
let tokenHeader;

beforeAll(async () => {
  await startTestApp();
});

afterAll(async () => {
  await stopTestApp();
});

beforeEach(async () => {
  await resetData();
  freezeIstMorning();
  roomA = await Room.findOne({ slug: "room-a" });
  roomB = await Room.findOne({ slug: "room-b" });
  tokenHeader = await authHeader();

  const seed = await request(getApp()).post("/api/bookings").set(tokenHeader).send({
    roomId: roomA.id,
    title: "Existing",
    date: DATE,
    startTime: "10:00",
    endTime: "11:00",
  });
  expect(seed.status).toBe(201);
});

function book(roomId, startTime, endTime, title = "New meeting") {
  return request(getApp()).post("/api/bookings").set(tokenHeader).send({
    roomId,
    title,
    date: DATE,
    startTime,
    endTime,
  });
}

describe("mandatory overlap matrix", () => {
  test("Room A, 11:00-12:00 is allowed", async () => {
    const response = await book(roomA.id, "11:00", "12:00");
    expect(response.status).toBe(201);
  });

  test("Room A, 09:00-10:00 is allowed", async () => {
    const response = await book(roomA.id, "09:00", "10:00");
    expect(response.status).toBe(201);
  });

  test("Room A, 10:30-11:30 is rejected", async () => {
    const response = await book(roomA.id, "10:30", "11:30");
    expect(response.status).toBe(409);
    expect(response.body.code).toBe("BOOKING_CONFLICT");
    expect(response.body.error).toMatch(/Room A is already booked from 10:00 to 11:00/);
  });

  test("Room A, 09:30-10:15 is rejected", async () => {
    const response = await book(roomA.id, "09:30", "10:15");
    expect(response.status).toBe(409);
  });

  test("Room A, 10:15-10:45 is rejected", async () => {
    const response = await book(roomA.id, "10:15", "10:45");
    expect(response.status).toBe(409);
  });

  test("Room A, 09:00-12:00 is rejected", async () => {
    const response = await book(roomA.id, "09:00", "12:00");
    expect(response.status).toBe(409);
  });

  test("Room B, 10:30-11:30 is allowed", async () => {
    const response = await book(roomB.id, "10:30", "11:30");
    expect(response.status).toBe(201);
  });

  test("Room B schedule loads when a booking user no longer exists", async () => {
    await Booking.create({
      roomId: roomB._id,
      userId: new mongoose.Types.ObjectId(),
      title: "Orphan booking",
      bookingDate: DATE,
      startTime: "14:00",
      endTime: "15:00",
      status: "active",
    });

    const response = await request(getApp())
      .get(`/api/rooms/${roomB.id}/bookings`)
      .query({ date: DATE })
      .set(tokenHeader);

    expect(response.status).toBe(200);
    expect(response.body.room.name).toBe("Room B");
    expect(response.body.bookings.some((item) => item.title === "Orphan booking")).toBe(true);
    expect(response.body.bookings.find((item) => item.title === "Orphan booking").bookedBy.name).toBe(
      "Unknown user"
    );
  });

  test("Room A, 10:30-11:30 is allowed after cancellation", async () => {
    const existing = await request(getApp())
      .get(`/api/rooms/${roomA.id}/bookings`)
      .query({ date: DATE })
      .set(tokenHeader);
    const bookingId = existing.body.bookings[0].id;
    await request(getApp()).delete(`/api/bookings/${bookingId}`).set(tokenHeader);

    const response = await book(roomA.id, "10:30", "11:30");
    expect(response.status).toBe(201);
  });

  test("concurrent overlapping requests do not both succeed", async () => {
    const existing = await request(getApp())
      .get(`/api/rooms/${roomA.id}/bookings`)
      .query({ date: DATE })
      .set(tokenHeader);
    await request(getApp()).delete(`/api/bookings/${existing.body.bookings[0].id}`).set(tokenHeader);

    const [first, second] = await Promise.all([
      book(roomA.id, "10:00", "11:00", "Concurrent A"),
      book(roomA.id, "10:00", "11:00", "Concurrent B"),
    ]);
    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 409]);
  });
});
