const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  productCategories: Array,
  highestSellingProduct: Object,
  highestSellingState: Object,
  highestSellingCategories: Object,
  time: Number,
});

const Stats = mongoose.model("Stats", statsSchema);

module.exports = Stats;
