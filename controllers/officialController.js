const Officials = require("../models/officialModel");
const User = require("../models/userModel");
const Application = require("../models/applicationModel");
const Validator = require("../utils/validateData");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const FetchQuery = require("../utils/fetchAPIQuery");
const { sendFile, getAFileUrl } = require("../config/multer");

exports.getOfficials = catchAsync(async (req, res, next) => {
  const officials = await new FetchQuery(req.query, Officials).fetchData();

  for (let i = 0; i < officials.length; i++) {
    if (
      officials.results[i].profilePicture != "" ||
      officials.results[i].profilePicture != undefined
    ) {
      officials.results[i].profilePictureUrl = await getAFileUrl(
        officials.results[i].profilePicture
      );
    }
  }

  res.status(200).json({
    status: "success",
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

  const result = await Officials.findByIdAndUpdate(req.params.id, data);

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
