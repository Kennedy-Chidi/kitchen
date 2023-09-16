const FAQ = require("../models/faqModel");
const AppError = require("../utils/appError");
const FetchQuery = require("../utils/fetchAPIQuery");
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

  console.log(req.body);

  await FAQ.create(req.body);

  next();
});

exports.getFAQ = catchAsync(async (req, res, next) => {
  let faq = await new FetchQuery(req.query, FAQ).fetchData();

  res.status(200).json({
    status: "success",
    data: faq,
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
