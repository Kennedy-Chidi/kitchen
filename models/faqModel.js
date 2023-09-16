const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  category: String,
  question: String,
  answer: String,
  time: Number,
  dateCreated: {
    type: Number,
    default: new Date().getTime(),
  },
});

const Faq = mongoose.model("Faq", faqSchema);

module.exports = Faq;
