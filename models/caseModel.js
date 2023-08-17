const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  username: String,
  profilePicture: String,
  body: String,
  subject: String,
  time: Number,
});

const Case = mongoose.model("Case", caseSchema);

module.exports = Case;
