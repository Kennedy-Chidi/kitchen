const mongoose = require("mongoose");

const userPromoSchema = new mongoose.Schema({
  username: String,

  promoId: String,

  promoTarget: {
    type: Number,
    default: 0,
  },

  promoAmount: {
    type: Number,
    default: 0,
  },

  promoName: String,

  promoStart: Number,

  promoEnd: Number,

  promoGifts: Array,

  promoDescription: String,

  promoBanner: String,

  promoBannerUrl: String,

  promoState: String,

  promoStatus: {
    type: Boolean,
    default: false,
  },

  time: {
    type: Number,
    default: new Date().getTime(),
  },
});

const UserPromo = mongoose.model("UserPromo", userPromoSchema);

module.exports = UserPromo;
