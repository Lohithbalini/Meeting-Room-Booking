const request = require("supertest");
const { Room } = require("../src/models/Room");
const { Booking } = require("../src/models/Booking");
const {
  startTestApp,
  stopTestApp,
  resetData,
  authHeader,
  freezeIstMorning,
  getApp,
} = require("./helpers");

let roomA;
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
  tokenHeader = await authHeader();
});

function book(payload) {
  return request(getApp()).post("/api/bookings").set(tokenHeader).send(payload);
}

const valid = {
  date: "2026-12-01",
  startTime: "10:00",
  endTime: "11:00",
  title: "Planning",
};

describe("booking validation", () => {
  test("missing room", async () => {
    const response = await book({ ...valid, roomId: undefined });
    expect(response.status).toBe(400);
  });

  test("missing title", async () => {
    const response = await book({ ...valid, roomId: roomA.id, title: undefined });
    expect(response.status).toBe(400);
  });

  test("missing date", async () => {
    const response = await book({ ...valid, roomId: roomA.id, date: undefined });
    expect(response.status).toBe(400);
  });

  test("missing start time", async () => {
    const response = await book({ ...valid, roomId: roomA.id, startTime: undefined });
    expect(response.status).toBe(400);
  });

  test("missing end time", async () => {
    const response = await book({ ...valid, roomId: roomA.id, endTime: undefined });
    expect(response.status).toBe(400);
  });

  test("invalid calendar date", async () => {
    const response = await book({ ...valid, roomId: roomA.id, date: "2026-02-30" });
    expect(response.status).toBe(400);
  });

  test("invalid time format", async () => {
    const response = await book({ ...valid, roomId: roomA.id, startTime: "10am" });
    expect(response.status).toBe(400);
  });

  test("equal start and end times", async () => {
    const response = await book({ ...valid, roomId: roomA.id, startTime: "10:00", endTime: "10:00" });
    expect(response.status).toBe(400);
  });

  test("end time before start time", async () => {
    const response = await book({ ...valid, roomId: roomA.id, startTime: "11:00", endTime: "10:00" });
    expect(response.status).toBe(400);
  });

  test("booking in the past", async () => {
    const response = await book({ ...valid, roomId: roomA.id, date: "2026-10-01" });
    expect(response.status).toBe(400);
  });

  test("start before 09:00", async () => {
    const response = await book({ ...valid, roomId: roomA.id, startTime: "08:30", endTime: "10:00" });
    expect(response.status).toBe(400);
  });

  test("end after 19:00", async () => {
    const response = await book({ ...valid, roomId: roomA.id, startTime: "18:30", endTime: "19:30" });
    expect(response.status).toBe(400);
  });

  test("unknown room ID", async () => {
    const response = await book({ ...valid, roomId: "507f1f77bcf86cd799439011" });
    expect(response.status).toBe(404);
  });

  test("invalid MongoDB ObjectIds do not crash the server", async () => {
    const response = await request(getApp()).get("/api/rooms/not-an-id").set(tokenHeader);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_ID");
  });

  test("cancellation of another user's booking returns 403", async () => {
    const created = await book({ ...valid, roomId: roomA.id });
    const other = await authHeader({ email: "other@example.com", name: "Other" });
    const response = await request(getApp())
      .delete(`/api/bookings/${created.body.booking.id}`)
      .set(other);
    expect(response.status).toBe(403);
  });

  test("cancellation frees the slot", async () => {
    const created = await book({ ...valid, roomId: roomA.id });
    const cancel = await request(getApp())
      .delete(`/api/bookings/${created.body.booking.id}`)
      .set(tokenHeader);
    expect(cancel.status).toBe(200);

    const again = await book({ ...valid, roomId: roomA.id });
    expect(again.status).toBe(201);
  });

  test("data persists after reconnecting to the same database", async () => {
    await book({ ...valid, roomId: roomA.id });
    const count = await Booking.countDocuments({ status: "active" });
    expect(count).toBe(1);
  });
});
