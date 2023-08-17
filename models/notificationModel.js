const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  name: String,
  title: String,
  content: String,
  time: Number,
  dateCreated: {
    type: Number,
    default: new Date().getTime(),
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
