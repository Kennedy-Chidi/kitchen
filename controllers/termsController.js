const Terms = require("../models/termsModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");

exports.createTerms = catchAsync(async (req, res, next) => {
  let data = req.body;

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (key != "content") {
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

  await Terms.create(data);
  next();
});

exports.getTerms = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Terms.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const length = await result.query;
  const features = result.paginate();
  const terms = await features.query.clone();

  res.status(200).json({
    status: "success",
    data: terms,
    resultLength: length.length,
  });
});

exports.updateTerms = catchAsync(async (req, res, next) => {
  await Terms.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  next();
});

exports.deleteTerms = catchAsync(async (req, res, next) => {
  await Terms.findByIdAndDelete(req.params.id);

  next();
});
