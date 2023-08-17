const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  country: String,
  state: String,
  lga: String,
  unit: String,
  companyName: String,
  systemEmail: String,
  bankAccountName: String,
  bankName: String,
  bankAccountNumber: String,
  invoiceNumber: Number,
  contact: Array,
  coloredContact: Array,
  media: Array,
  coloredMedia: Array,
  companyDomain: String,
  announcements: Array,
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
