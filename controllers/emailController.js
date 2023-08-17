const Email = require("../models/emailModel");
const Company = require("../models/companyModel");
const SendEmail = require("../utils/email");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");
const { sendFile, getFileUrl, getAFileUrl } = require("../config/multer");

exports.createEmail = catchAsync(async (req, res, next) => {
  let data = req.body;

  data = await Validator.trimData(data);

  // CHECK IF CONTENT IS EMPTY
  if (
    Validator.isEmpty(data.template) ||
    Validator.isEmpty(data.title) ||
    Validator.isEmpty(Validator.removeTags(data.content))
  ) {
    return next(new AppError(`Necessary fields cannot be empty`, 500));
  }

  //CHECK IF TEMPLATE ALREADY EXIST
  const template = await Email.findOne({ template: data.template });
  if (template) {
    return next(
      new AppError(
        `An email with the template ${template.template} already exist!`,
        500
      )
    );
  }

  if (req.file) {
    const randomName = await sendFile(req.file);
    data.banner = `${randomName}_${req.file.originalname}`;
  }

  await Email.create(data);

  next();
});

exports.getEmails = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Email.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const emails = await features.query.clone();

  for (let i = 0; i < emails.length; i++) {
    if (emails[i].banner) {
      emails[i].bannerUrl = await getAFileUrl(emails[i].banner);
    }
  }
  res.status(200).json({
    status: "success",
    data: emails,
    resultLength: resultLen.length,
  });
});

exports.updateEmail = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;

  data = Validator.trimData(data);

  //CHECK IF CONTENT IS EMPTY
  if (
    Validator.isEmpty(data.template) ||
    Validator.isEmpty(data.title) ||
    Validator.isEmpty(data.content)
  ) {
    return next(new AppError(`Necessary fields cannot be empty`, 500));
  }

  //CHECK IF TEMPLATE ALREADY EXIST
  const template = await Email.findOne({
    template: data.template,
    _id: { $ne: req.params.id },
  });
  if (template) {
    return next(
      new AppError(
        `An email with the template ${template.template} already exist!`,
        500
      )
    );
  }

  if (req.file) {
    const oldEmail = await Email.findById(req.params.id);
    filesToDelete.push(oldEmail.banner);

    const randomName = await sendFile(req.file);
    data.banner = `${randomName}_${req.file.originalname}`;
  }

  await Email.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  req.files = filesToDelete;

  next();
});

exports.deleteEmail = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  const email = await Email.findById(req.params.id);

  if (!email) {
    return next(new AppError(`Sorry this email does not exist!`, 500));
  }

  await Email.findByIdAndDelete(req.params.id);
  if (email.banner) {
    req.files = email.banner;
  }
  next();
});

exports.sendEmail = catchAsync(async (req, res, next) => {
  const users = req.body.users;
  let email = req.body.email;
  email.template = "email";
  let time = req.body.time;

  const company = await Company.findOne();
  company.systemEmail = await company.media[0]?.text;
  const hour = new Date(time).getHours();
  let timeOfDay;

  if (hour >= 0 && hour < 12) {
    timeOfDay = "morning";
  } else if (hour >= 12 && hour < 16) {
    timeOfDay = "afternoon";
  } else {
    timeOfDay = "evening";
  }

  const formatNumber = (number) => {
    if (!number) {
      return "0.00";
    }
    const options = { style: "decimal", maximumFractionDigits: 0 };
    return number.toLocaleString("en-US", options);
  };

  const formartTime = (data) => {
    const date = new Date(data);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (data) => {
    function getOrdinalSuffix(day) {
      const suffixes = ["th", "st", "nd", "rd"];
      const mod = day % 100;
      return day + (suffixes[(mod - 20) % 10] || suffixes[mod] || suffixes[0]);
    }

    if (!data) {
      return "";
    }
    const date = new Date(data);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    return `${getOrdinalSuffix(day)} ${month}. ${year}`;
  };

  users.forEach((user) => {
    const content = email.content
      ?.split("[full-name]")
      .join(user.username)
      .split("[moment]")
      .join(timeOfDay)
      .split("[customer-care]")
      .join("Kennedy Chidi")
      .split("[company-name]")
      .join(company.companyName)
      .split("[customer-phone]")
      .join(user.phoneNumber)
      .split("[customer-address]")
      .join(user.address);

    try {
      new SendEmail(
        company,
        user,
        email,
        email.bannerUrl,
        content,
        ""
      ).sendEmail();
      res.status(200).json({
        status: "success",
        // data: email,
      });
    } catch (err) {
      return next(
        new AppError(
          `There was an error sending the email. Try again later!, ${err}`,
          500
        )
      );
    }
  });
});
