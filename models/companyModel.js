const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  country: String,
  state: String,
  companyName: String,
  systemEmail: String,
  bankAccountName: String,
  bankName: String,
  bankAccountNumber: String,
  invoiceNumber: Number,
  contact: Array,
  media: Array,
  companyDomain: String,
  announcements: Array,
  referralPercentage: Number,
  productCategories: Array,
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
