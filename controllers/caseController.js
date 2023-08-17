const { token } = require("morgan");
const User = require("../models/userModel");
const Case = require("../models/caseModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");
const Validator = require("../utils/validateData");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // 1A) FILTERING

  // 2) SORTING

  // 3) FIELDS

  // 4) PAGINATION

  const result = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const users = await features.query.clone();

  res.status(200).json({
    status: "success",
    resultLength: resultLen.length,
    data: users,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getReviews = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(
    User.find({
      "review.subject": { $exists: true, $ne: "" },
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const users = await features.query.clone();

  res.status(200).json({
    status: "success",
    results: resultLen.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  if (user.profilePicture) {
    user.profilePictureUrl = await getAFileUrl(user.profilePicture);
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.editUser = catchAsync(async (req, res, next) => {
  let token;
  const data = req.body;
  const filesToDelete = [];

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  const oldUser = await User.findById(req.params.id);

  if (req.file) {
    const randomName = await sendFile(req.file);
    data.profilePicture = `${randomName}_${req.file.originalname}`;
    if (oldUser.profilePicture) {
      filesToDelete.push(oldUser.profilePicture);
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  req.user = user;

  req.fileNames = filesToDelete;

  next();
});

exports.deleteUsers = catchAsync(async (req, res, next) => {
  const idsToDelete = req.body.ids;

  await User.deleteMany({ _id: { $in: idsToDelete } });

  next();
});

exports.createCase = catchAsync(async (req, res, next) => {
  const data = req.body;

  data.subject = Validator.trimAData(data.subject);
  data.body = Validator.trimAData(data.body);

  // CHECK IF CONTENT IS EMPTY
  if (Validator.isEmpty(data.subject) || Validator.isEmpty(data.body)) {
    return next(new AppError(`Necessary fields cannot be empty`, 500));
  }
  await Case.create(req.body);
  res.status(200).json({
    status: "success",
    message:
      "We have received your report and will get back to you via your email, sorry for the inconveniences.",
  });
});
