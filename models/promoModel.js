const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
  promoTarget: Number,

  promoName: String,

  promoStart: Number,

  promoEnd: Number,

  promoGifts: Array,

  promoDescription: String,

  promoBanner: String,

  promoBannerUrl: String,

  promoStatus: {
    type: Boolean,
    default: false,
  },

  time: {
    type: Number,
    default: new Date().getTime(),
  },
});

const Promo = mongoose.model("Promo", promoSchema);

module.exports = Promo;
