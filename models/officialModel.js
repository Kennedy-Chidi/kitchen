const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const officalSchema = new mongoose.Schema({
  username: String,
  email: String,
  phoneNumber: String,
  status: String,
  callLine: Number,
  salary: Number,
  ranking: Number,
  position: String,
  country: String,
  state: String,
  lga: String,
  unit: String,
  profilePicture: String,
  profilePictureUrl: String,
});

const Official = mongoose.model("Official", officalSchema);

module.exports = Official;
