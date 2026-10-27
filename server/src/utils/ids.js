const mongoose = require("mongoose");
const { AppError } = require("./appError");

function isValidObjectId(id) {
  return (
    typeof id === "string" &&
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id
  );
}

function requireObjectId(id, label = "id") {
  if (!isValidObjectId(id)) {
    throw new AppError(`Invalid ${label}.`, 400, "INVALID_ID");
  }
  return id;
}

module.exports = { isValidObjectId, requireObjectId };
