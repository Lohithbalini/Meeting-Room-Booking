const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const { seedRooms } = require("../src/seed/seedRooms");
const { User } = require("../src/models/User");
const { Booking } = require("../src/models/Booking");
const { RoomDateLock } = require("../src/models/RoomDateLock");
const { setNowProvider, resetNowProvider } = require("../src/utils/dateTime");

const TEST_ENV = {
  port: 5000,
  mongodbUri: "memory",
  jwtSecret: "test-jwt-secret-value",
  clientUrl: "http://localhost:5173",
  nodeEnv: "test",
  jwtExpiresIn: "1h",
};

let mongod;
let app;

async function startTestApp() {
  mongod = await MongoMemoryServer.create();
  await connectDatabase(mongod.getUri());
  await seedRooms();
  app = createApp(TEST_ENV);
  return { app, env: TEST_ENV };
}

async function resetData() {
  await Booking.deleteMany({});
  await User.deleteMany({});
  await RoomDateLock.deleteMany({});
  await seedRooms();
  resetNowProvider();
}

async function stopTestApp() {
  resetNowProvider();
  await disconnectDatabase();
  if (mongod) {
    await mongod.stop();
  }
}

function freezeIstMorning() {
  // 2026-11-01 08:00 IST = 2026-11-01 02:30 UTC
  setNowProvider(() => new Date("2026-11-01T02:30:00.000Z"));
}

async function register(overrides = {}) {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: overrides.name || "Test User",
      email: overrides.email || "user@example.com",
      password: overrides.password || "secret123",
    });
  return response;
}

async function authHeader(overrides = {}) {
  const response = await register(overrides);
  return { Authorization: `Bearer ${response.body.token}`, user: response.body.user, token: response.body.token };
}

module.exports = {
  TEST_ENV,
  startTestApp,
  stopTestApp,
  resetData,
  freezeIstMorning,
  register,
  authHeader,
  getApp: () => app,
};
