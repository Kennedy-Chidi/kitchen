const mongoose = require("mongoose");

const termsSchema = new mongoose.Schema({
  category: String,
  title: String,
  content: String,
  dateCreated: {
    type: Number,
    default: new Date().getTime(),
  },
});

const Terms = mongoose.model("Terms", termsSchema);

module.exports = Terms;
