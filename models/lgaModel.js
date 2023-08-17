const mongoose = require("mongoose");

const lgaSchema = new mongoose.Schema({
  country: String,
  state: String,
  name: String,
  units: Array,
  time: Number,
});

const LGA = mongoose.model("LGA", lgaSchema);

module.exports = LGA;
