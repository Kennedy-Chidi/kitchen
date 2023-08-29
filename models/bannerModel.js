const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  bannerPage: String,
  bannerIntro: String,
  bannerTitle: String,
  bannerSubtitle: String,
  bannerImage: String,
  bannerImageUrl: String,
  bannerCategory: String,
  status: {
    type: Boolean,
    default: false,
  },
  time: {
    type: Number,
    default: new Date().getTime(),
  },
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
