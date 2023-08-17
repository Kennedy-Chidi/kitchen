const FAQ = require("../models/faqModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");

exports.createFAQ = catchAsync(async (req, res, next) => {
  let data = req.body;

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (key != "answer") {
        if (typeof obj[key] === "string") {
          obj[key] = await Validator.removeTags(obj[key]);
        }
      }
    }

    return obj;
  };

  data = await removeTags(data);

  Object.entries(data).forEach(([key, value]) => {
    if (Validator.isEmpty(value)) {
      return next(new AppError(`Please fill in the field ${key}`, 500));
    }
  });

  await FAQ.create(req.body);

  next();
});

exports.getFAQ = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(FAQ.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const length = await result.query;
  const features = result.paginate();
  const faq = await features.query.clone();

  res.status(200).json({
    status: "success",
    data: faq,
    resultLength: length.length,
  });
});

exports.updateFAQ = catchAsync(async (req, res, next) => {
  await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  next();
});

exports.deleteFAQ = catchAsync(async (req, res, next) => {
  await FAQ.findByIdAndDelete(req.params.id);

  next();
});
