const mongoose = require("mongoose");

async function connectDatabase(uri, options = {}) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: options.serverSelectionTimeoutMS || 15000,
  });
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, disconnectDatabase, isConnected };
