const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  name: String,
  image: String,
  url: String,
  imageUrl: String,
});

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
