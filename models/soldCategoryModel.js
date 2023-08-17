const mongoose = require("mongoose");

const soldCategorySchema = new mongoose.Schema({
  category: String,
  day: String,
  time: Number,
});

const SoldCategory = mongoose.model("SoldCategory", soldCategorySchema);

module.exports = SoldCategory;
