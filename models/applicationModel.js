const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId: String,
  passport: String,
  passportUrl: String,
  documentType: String,
  document: String,

  firstName: String,
  middleName: String,
  lastName: String,
  phoneNumber: String,
  title: String,
  dob: Number,
  gender: String,
  maritalStatus: String,

  referralTitle: String,
  referralName: String,
  referralOccupation: String,
  referralPhoneNumber: String,

  stateOrigin: String,
  lgaOrigin: String,
  village: String,
  permanentAddress: String,

  state: String,
  lga: String,
  landmark: String,
  address: String,
  applicationTitle: String,
  content: String,

  time: Number,
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
