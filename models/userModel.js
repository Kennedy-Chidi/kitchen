const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: [true, "Please fill in your username"],
    minlength: [3, "Username must be greater than 3 characters"],
    unique: [true, "A user with this username already exist"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Please fill in your email"],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },

  phoneNumber: {
    type: String,
    trim: true,
  },

  status: {
    type: String,
    enum: ["Staff", "User"],
    default: "User",
  },

  statusType: {
    type: String,
    default: "User",
  },

  reviewStatus: {
    type: Boolean,
    default: false,
  },

  password: {
    type: String,
    required: [true, "Please fill in your password"],
    minlenght: [4, "Password must be at least 4 characters long"],
    select: false,
  },

  cPassword: {
    type: String,
    required: [true, "Please confirm the password"],
    validate: {
      //This only works on save
      validator: function (el) {
        return el == this.password;
      },
      message: "Sorry the passwords do not match",
    },
  },

  suspension: {
    type: Boolean,
    default: false,
  },

  referrals: [],

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  totalPurchases: {
    type: Number,
    default: 0,
  },

  totalPurchasedAmount: {
    type: Number,
    default: 0,
  },

  rating: {
    type: Number,
    default: 3,
  },

  hasCommented: {
    type: Boolean,
    default: false,
  },

  creditBonus: {
    type: Number,
    default: 0,
  },

  unreadMessages: {
    type: Number,
    default: 0,
  },

  autoRegister: {
    type: Boolean,
    default: false,
  },
  hasPurchased: {
    type: Boolean,
    default: false,
  },
  isPartner: Boolean,
  comment: String,
  country: String,
  state: String,
  lga: String,
  unit: String,
  address: String,
  regDate: Number,
  profilePicture: String,
  profilePictureUrl: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.cPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
