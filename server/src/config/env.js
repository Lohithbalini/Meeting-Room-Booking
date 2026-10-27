const required = ["MONGODB_URI", "JWT_SECRET"];

function loadEnv() {
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    port: Number(process.env.PORT) || 5000,
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV || "development",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  };
}

module.exports = { loadEnv };
