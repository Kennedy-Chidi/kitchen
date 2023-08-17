const SMS = require("../models/smsModel");
const User = require("../models/userModel");
const Company = require("../models/companyModel");
const SendSMS = require("../utils/sms");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");

exports.createSMS = catchAsync(async (req, res, next) => {
  let data = req.body;

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = await Validator.removeTags(obj[key]);
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

  //CHECK IF TEMPLATE ALREADY EXIST
  const template = await SMS.findOne({ template: data.template });
  if (template) {
    return next(
      new AppError(
        `An sms with the template ${template.template} already exist!`,
        500
      )
    );
  }

  await SMS.create(data);

  next();
});

exports.getSMS = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(SMS.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const sms = await features.query.clone();

  res.status(200).json({
    status: "success",
    data: sms,
    resultLength: resultLen.length,
  });
});

exports.updateSMS = catchAsync(async (req, res, next) => {
  let data = req.body;

  data = Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = await Validator.removeTags(obj[key]);
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

  await SMS.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  next();
});

exports.deleteSMS = catchAsync(async (req, res, next) => {
  const sms = await SMS.findById(req.params.id);

  if (!sms) {
    return next(new AppError(`Sorry this SMS does not exist!`, 500));
  }

  await SMS.findByIdAndDelete(req.params.id);

  next();
});

exports.sendSMS = catchAsync(async (req, res, next) => {
  const users = req.body.users;
  const sms = await SMS.findOne({ template: req.body.template });

  users.forEach((user) => {
    const content = sms.content
      ?.split("[full-name]")
      .join(user.username)
      .split("[customer-care]")
      .join("Kennedy Chidi")
      .split("[customer-phone]")
      .join(user.phoneNumber)
      .split("[customer-address]")
      .join(user.address);

    try {
      new SendSMS().sendSMS(content);
      res.status(200).json({
        status: "success",
        // data: SMS,
      });
    } catch (err) {
      return next(
        new AppError(
          `There was an error sending the SMS. Try again later!, ${err}`,
          500
        )
      );
    }
  });
});
