require("dotenv").config();

const { loadEnv } = require("../config/env");
const { connectDatabase, disconnectDatabase } = require("../config/database");
const { seedRooms } = require("./seedRooms");

async function run() {
  const env = loadEnv();
  await connectDatabase(env.mongodbUri);
  const rooms = await seedRooms();
  console.log(`Seeded ${rooms.length} meeting rooms.`);
  await disconnectDatabase();
}

run().catch(async (error) => {
  console.error("Room seeding failed:", error.message);
  process.exitCode = 1;
  await disconnectDatabase().catch(() => {});
});
