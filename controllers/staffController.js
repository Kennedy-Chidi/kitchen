const Staff = require("../models/staffModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.createStaff = catchAsync(async (req, res, next) => {
  await Staff.create(req.body);
  next();
});

exports.getStaff = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Staff.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const staff = await features.query.clone();

  res.status(200).json({
    status: "success",
    data: staff,
    resultLength: resultLen.length,
  });
});

exports.updateStaff = catchAsync(async (req, res, next) => {
  await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  next();
});

exports.deleteStaff = catchAsync(async (req, res, next) => {
  await Staff.findByIdAndDelete(req.params.id);
  next();
});
