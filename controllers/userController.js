const User = require("../models/userModel");
const Officials = require("../models/officialModel");
const Product = require("../models/productModel");
const Transaction = require("../models/transactionModel");
const Notice = require("../models/noticeModel");
const FetchQuery = require("../utils/fetchAPIQuery");
const Application = require("../models/applicationModel");
const Validator = require("../utils/validateData");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await new FetchQuery(req.query, User).fetchData();

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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
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

  console.log(data);

  const user = await User.findByIdAndUpdate(req.params.id, data);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  req.user = user;

  req.files = filesToDelete;

  next();
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  next();
});

exports.deleteUsers = catchAsync(async (req, res, next) => {
  const idsToDelete = req.body.ids;

  await User.deleteMany({ _id: { $in: idsToDelete } });

  next();
});

exports.createApplication = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;
  let files = req.files;

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
    if (
      Validator.isEmpty(value) ||
      value.includes("State") ||
      value.includes("LGA")
    ) {
      return next(new AppError(`Please fill in the field ${key}`, 500));
    }
  });

  if (files) {
    if (files.passport[0]) {
      const randomName = await sendFile(files.passport[0]);
      data.passport = `${randomName}_${files.passport[0].originalname}`;
    }

    if (files.document) {
      const randomName = await sendFile(files.document[0]);
      data.document = `${randomName}_${files.document[0].originalname}`;
    }
  }

  await User.findByIdAndUpdate(data.userId, { isPartner: true });

  const user = await User.findOne({ _id: data.userId, isPartner: true });

  if (user) {
    const oldAppliaction = await Application.findOne({ userId: data.userId });
    await Application.findOneAndUpdate({ userId: data.userId }, data);
    if (files) {
      if (files.passport[0]) {
        filesToDelete.push(oldAppliaction.passport);
      }
      if (files.document) {
        filesToDelete.push(oldAppliaction.document);
      }
    }
  } else {
    await Application.create(data);
  }

  req.files = filesToDelete;

  next();
});

exports.getApplications = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Application.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const applications = await features.query.clone();

  if (!applications) {
    res.status(200).json({
      status: "success",
      data: null,
    });
  } else {
    for (let i = 0; i < applications.length; i++) {
      if (applications[i].passport != "") {
        applications[i].passportUrl = await getAFileUrl(
          applications[i].passport
        );
      }
    }

    res.status(200).json({
      status: "success",
      data: applications,
    });
  }
});

exports.updateApplication = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;
  let files = req.files;

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
    if (
      Validator.isEmpty(value) ||
      value.includes("State") ||
      value.includes("LGA")
    ) {
      return next(new AppError(`Please fill in the field ${key}`, 500));
    }
  });

  const oldAppliaction = await Application.findById(req.params.id);

  if (files) {
    if (files.passport) {
      const randomName = await sendFile(files.passport[0]);
      data.passport = `${randomName}_${files.passport[0].originalname}`;
      filesToDelete.push(oldAppliaction.passport);
    } else {
      data.passport = undefined;
    }

    if (files.document) {
      const randomName = await sendFile(files.document[0]);
      data.document = `${randomName}_${files.document[0].originalname}`;
      filesToDelete.push(oldAppliaction.document);
    } else {
      data.document = undefined;
    }
  }

  await User.findByIdAndUpdate(data.userId, { isPartner: true });

  await Application.findOneAndUpdate({ userId: data.userId }, data);
  req.files = filesToDelete;

  next();
});

exports.getApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new AppError("No application form found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: application,
  });
});

exports.resetCompany = catchAsync(async (req, res, next) => {
  await User.updateMany({ totalPurchases: 0, totalPurchasedAmount: 0 });
  await Notice.deleteMany();
  await Transaction.deleteMany();
  await Product.updateMany({
    totalPurchasedAmount: 0,
    totalPurchasedUnits: 0,
    totalSoldAmount: 0,
    totalSoldUnits: 0,
  });

  res.status(200).json({
    status: "success",
  });
});

exports.fetchUsers = (io, socket) => {
  socket.on("fetchUsers", async (item) => {
    const limit = item.limit;
    const users = await User.find({
      username: { $regex: item.keyWord, $options: "i" },
    }).limit(limit);

    for (let i = 0; i < users.length; i++) {
      if (users[i].profilePicture != "") {
        users[i].profilePictureUrl = await getAFileUrl(users[i].profilePicture);
      }
    }

    io.emit("fetchedUsers", users);
  });
};

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

exports.getNotice = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Notice.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;
  console.log("Hello");
  const features = result.paginate();

  const notices = await features.query.clone();

  res.status(200).json({
    status: "success",
    results: resultLen.length,
    data: notices,
  });
});

exports.getAllInitials = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  const user = req.body;
  const status = req.body.status;
  let users;
  let staffs;
  let orders;

  //////////////GET USER NOTIFICATION MESSAGES//////////////
  const messages = await new FetchQuery(
    { limit: 5, page: 1, username: username, sort: "-time" },
    Notice
  ).fetchData();

  //////////////GET USER TRANSACTIONS MESSAGES//////////////
  const transactions = await new FetchQuery(
    { limit: 5, page: 1, username: username, sort: "-time" },
    Transaction
  ).fetchData();

  if (status == "Staff") {
    //////////////GET ALL USERS FOR STAFF//////////////
    users = await new FetchQuery(
      { limit: 5, page: 1, status: "User", sort: "-dateCreated" },
      User
    ).fetchData();

    //////////////GET ALL OFFICIALS FOR STAFF/////////////
    staffs = await new FetchQuery(
      { limit: 5, page: 1, sort: "-time" },
      Officials
    ).fetchData();

    //////////////GET ONLINE ORDERS/////////////
    orders = await new FetchQuery(
      {
        limit: 5,
        page: 1,
        sort: "-time",
        status: false,
        unit: user.unit,
        transactionType: "Order",
      },
      Transaction
    ).fetchData();
  }

  res.status(200).json({
    status: "success",
    messages,
    transactions,
    users,
    staffs,
    orders,
  });
});