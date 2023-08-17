const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  username: String,
  title: String,
  content: String,
  time: Number,
  isRead: {
    type: Boolean,
    default: false,
  },
});

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
