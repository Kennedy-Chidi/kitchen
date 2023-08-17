const mongoose = require("mongoose");

const smsSchema = new mongoose.Schema({
  title: String,
  template: String,
  content: String,
  dateCreated: {
    type: Number,
    default: new Date().getTime(),
  },
});

const SMS = mongoose.model("SMS", smsSchema);

module.exports = SMS;
