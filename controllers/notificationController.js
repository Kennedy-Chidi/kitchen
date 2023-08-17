const Notification = require("../models/notificationModel");
const Notice = require("../models/noticeModel");
const FetchQuery = require("../utils/fetchAPIQuery");
const Company = require("../models/companyModel");
const SendNotification = require("../utils/notification");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");

exports.createNotification = catchAsync(async (req, res, next) => {
  let data = req.body;

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (obj[key] === "title" || obj[key] === "name") {
        obj[key] = await Validator.removeTags(obj[key]);
      }
    }

    return obj;
  };

  Object.entries(data).forEach(([key, value]) => {
    if (Validator.isEmpty(value)) {
      return next(new AppError(`Please fill in the field ${key}`, 500));
    }
  });

  const name = await Notification.findOne({ name: data.name });
  if (name) {
    return next(
      new AppError(
        `An Notification with the name ${name.name} already exist!`,
        500
      )
    );
  }

  await Notification.create(data);

  next();
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await new FetchQuery(
    req.query,
    Notification
  ).fetchData();

  res.status(200).json({
    status: "success",
    data: notifications,
  });
});

exports.getNotices = catchAsync(async (req, res, next) => {
  const messages = await new FetchQuery(req.query, Notice).fetchData();

  res.status(200).json({
    status: "success",
    messages,
  });
});

exports.updateNotification = catchAsync(async (req, res, next) => {
  let data = req.body;

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (obj[key] === "title" || obj[key] === "name") {
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

  await Notification.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  next();
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError(`Sorry this Notification does not exist!`, 500));
  }

  await Notification.findByIdAndDelete(req.params.id);

  next();
});

exports.sendNotifications = catchAsync(async (req, res, next) => {
  const users = req.body.users;

  const notification = await Notification.find({
    template: req.body.Notification,
  });
  const companyData = await Company.find();
  const company = companyData[0];

  const domainName = company.companyURL;
  const from = company.systemNotification;
  const content = Notification[0]?.content.replace(
    "((company-name))",
    `${company.companyName}`
  );

  users.forEach((el) => {
    try {
      const resetURL = `${domainName}`;
      const banner = `${domainName}/uploads/${Notification[0]?.banner}`;
      new SendNotification(
        from,
        el,
        Notification[0]?.template,
        Notification[0]?.title,
        banner,
        content,
        Notification[0]?.headerColor,
        Notification[0]?.footerColor,
        Notification[0]?.mainColor,
        Notification[0]?.greeting,
        Notification[0]?.warning,
        resetURL,
        domainName,
        company.companyName
      ).sendNotification();
    } catch (err) {
      return next(
        new AppError(
          `There was an error sending the Notification. Try again later!, ${err}`,
          500
        )
      );
    }
  });

  res.status(200).json({
    status: "success",
    // data: Notification,
  });
});
