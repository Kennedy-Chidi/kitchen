const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  content: String,
  certificate: String,
  video: String,
  certificateUrl: String,
  videoUrl: String,
});

const About = mongoose.model("About", aboutSchema);

module.exports = About;
