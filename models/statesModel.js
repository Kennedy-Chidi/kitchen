const mongoose = require("mongoose");

const statesSchema = new mongoose.Schema({
  country: String,
  name: String,
  lga: Array,
  time: Number,
});

const State = mongoose.model("State", statesSchema);

module.exports = State;
