const mongoose = require("mongoose");

const staffModel = new mongoose.Schema({
  position: String,
  salary: Number,
  ranking: Number,
});

const Staff = mongoose.model("Staff", staffModel);

module.exports = Staff;
