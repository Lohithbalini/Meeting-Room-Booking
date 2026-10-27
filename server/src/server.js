require("dotenv").config();

const { loadEnv } = require("./config/env");
const { connectDatabase } = require("./config/database");
const { createApp } = require("./app");
const { seedRooms } = require("./seed/seedRooms");

async function start() {
  let env;
  try {
    env = loadEnv();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  try {
    await connectDatabase(env.mongodbUri);
    await seedRooms();
  } catch (error) {
    console.error("MongoDB connection failed. Check MONGODB_URI and ensure MongoDB is running.");
    console.error(error.message);
    process.exit(1);
  }

  const app = createApp(env);
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

start();
