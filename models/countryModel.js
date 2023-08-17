const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  name: String,
  states: Array,
  time: Number,
});

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
