const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  username: String,

  salesRep: Object,

  description: Array,

  totalAmount: Number,

  transactionType: String,

  email: String,

  phoneNumber: String,

  country: String,

  state: String,

  lga: String,

  unit: String,

  address: String,

  creditBonus: Number,

  status: {
    type: Boolean,
    default: false,
  },

  time: Number,

  receiptUrl: String,

  note: String,

  transactionFile: {
    type: String,
    default: "Sell",
  },

  transactionFileUrl: String,

  invoiceNumber: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
