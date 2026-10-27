const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { AppError } = require("../utils/appError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function signToken(userId, secret, expiresIn) {
  return jwt.sign({}, secret, { subject: String(userId), expiresIn });
}

function validateCredentials({ name, email, password }, { requireName = false } = {}) {
  if (requireName && (!name || !String(name).trim())) {
    throw new AppError("Name is required.", 400, "VALIDATION_ERROR");
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) {
    throw new AppError("A valid email is required.", 400, "VALIDATION_ERROR");
  }

  if (!password || String(password).length < 6) {
    throw new AppError("Password must contain at least six characters.", 400, "VALIDATION_ERROR");
  }

  return {
    name: name ? String(name).trim() : undefined,
    email: normalizedEmail,
    password: String(password),
  };
}

async function registerUser({ name, email, password }, jwtSecret, jwtExpiresIn) {
  const input = validateCredentials({ name, email, password }, { requireName: true });
  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });
    const token = signToken(user._id, jwtSecret, jwtExpiresIn);
    return { user: user.toSafeJSON(), token };
  } catch (error) {
    if (error && error.code === 11000) {
      throw new AppError("An account with this email already exists.", 409, "EMAIL_EXISTS");
    }
    throw error;
  }
}

async function loginUser({ email, password }, jwtSecret, jwtExpiresIn) {
  const input = validateCredentials({ email, password });
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  if (!user) {
    throw new AppError("Please register to login.", 401, "USER_NOT_FOUND");
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new AppError("Incorrect email or password.", 401, "INVALID_CREDENTIALS");
  }

  return { user: user.toSafeJSON(), token: signToken(user._id, jwtSecret, jwtExpiresIn) };
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found.", 401, "UNAUTHENTICATED");
  }
  return user.toSafeJSON();
}

module.exports = { registerUser, loginUser, getUserById, signToken, normalizeEmail };
