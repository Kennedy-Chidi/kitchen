const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  salesPoints: Array,
  usersType: Array,
  social: Array,
  socialColored: Array,
  media: Array,
  mediaColored: Array,
});

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;
