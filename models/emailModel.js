const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  url: String,
  title: String,
  template: String,
  content: String,
  banner: String,
  bannerUrl: String,
  warning: String,
  greeting: String,
  headerBgColor: String,
  bodyBgColor: String,
  bodyTxtColor: String,
  footerBgColor: String,
  footerTxtColor: String,
  dateCreated: {
    type: Number,
    default: new Date().getTime(),
  },
});

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
