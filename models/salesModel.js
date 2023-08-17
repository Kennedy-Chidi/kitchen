const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  description: Array,

  totalAmount: Number,

  customerName: String,

  customerAddress: String,

  customerPhone: String,

  customerEmail: String,

  narration: String,

  discount: Number,

  invoice: String,

  transactionType: String,

  isPurchased: Boolean,

  madeBy: String,

  status: {
    type: Boolean,
    default: false,
  },

  day: String,

  time: Number,
});

const Sales = mongoose.model("Sales", salesSchema);

module.exports = Sales;
