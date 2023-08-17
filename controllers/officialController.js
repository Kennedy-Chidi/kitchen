const Officials = require("../models/officialModel");
const User = require("../models/userModel");
const Application = require("../models/applicationModel");
const Validator = require("../utils/validateData");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");

exports.getOfficials = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Officials.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const officials = await features.query.clone();

  for (let i = 0; i < officials.length; i++) {
    if (
      officials[i].profilePicture != "" ||
      officials[i].profilePicture != undefined
    ) {
      officials[i].profilePictureUrl = await getAFileUrl(
        officials[i].profilePicture
      );
    }
  }

  res.status(200).json({
    status: "success",
    resultLength: resultLen.length,
    data: officials,
  });
});

exports.createOfficial = catchAsync(async (req, res, next) => {
  const data = req.body;

  await User.findByIdAndUpdate(data.id, { status: "Staff" });

  await Officials.create(req.body);

  next();
});

exports.updateOfficial = catchAsync(async (req, res, next) => {
  const data = req.body;

  await Officials.findByIdAndUpdate(req.params.id, data);

  next();
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const users = await features.query.clone();

  for (let i = 0; i < users.length; i++) {
    if (users[i].profilePicture != "") {
      users[i].profilePictureUrl = await getAFileUrl(users[i].profilePicture);
    }
  }

  res.status(200).json({
    status: "success",
    resultLength: resultLen.length,
    data: users,
  });
});
