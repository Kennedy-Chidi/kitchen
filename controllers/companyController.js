const Company = require("../models/companyModel");
const Country = require("../models/countryModel");
const Notice = require("../models/noticeModel");
const Notification = require("../models/notificationModel");
const Officials = require("../models/officialModel");
const Banners = require("../models/bannerModel");
const Products = require("../models/productModel");
const Promotion = require("../models/promoModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const UserPromo = require("../models/userPromoModel");
const Email = require("../models/emailModel");

const AppError = require("../utils/appError");
const FetchQuery = require("../utils/fetchAPIQuery");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");
const { sendFile, getAFileUrl } = require("../config/multer");

exports.createCompany = catchAsync(async (req, res, next) => {
  const data = req.body;

  Object.entries(data).forEach(([key, value]) => {
    if (
      key == "bankName" ||
      key == "companyDomain" ||
      key == "companyName" ||
      key == "bankAccountName" ||
      key == "bankAccountNumber" ||
      key == "invoiceNumber"
    ) {
      data[key] = value != undefined ? Validator.trimAData(value) : undefined;
      if (data[key]) {
        const length = Validator.max250(value);
        if (!length) {
          return next(
            new AppError(
              `The field ${key} contains more than 250 characters, please reduce it`,
              500
            )
          );
        }
      }
    }
  });

  if (data.announcements) {
    data.announcements.forEach((el) => {
      const result = Validator.max500(el);
      if (!result) {
        return next(
          new AppError(
            `An announcement contains more than 500 characters, please reduce it.`,
            500
          )
        );
      }
    });
  }
  await Company.create(data);

  next();
});

exports.getCompany = catchAsync(async (req, res, next) => {
  const companies = await new FetchQuery(
    { limit: 10, page: 1, sort: "state" },
    Company
  ).fetchData();

  res.status(200).json({
    status: "success",
    data: companies,
  });
});

exports.updateCompany = catchAsync(async (req, res, next) => {
  const data = req.body;
  // Object.entries(data).forEach(([key, value]) => {
  //   if (
  //     key == "bankName" ||
  //     key == "companyDomain" ||
  //     key == "companyName" ||
  //     key == "bankAccountName" ||
  //     key == "bankAccountNumber" ||
  //     key == "invoiceNumber"
  //   ) {
  //     data[key] = value != undefined ? Validator.trimAData(value) : undefined;
  //     if (data[key]) {
  //       const length = Validator.max250(value);
  //       if (!length) {
  //         return next(
  //           new AppError(
  //             `The field ${key} contains more than 250 characters, please reduce it`,
  //             500
  //           )
  //         );
  //       }
  //     }
  //   }
  // });

  if (data.announcements.length > 0) {
    data.announcements.forEach((el) => {
      const result = Validator.max500(el);
      if (!result) {
        return next(
          new AppError(
            `An announcement contains more than 500 characters, please reduce it.`,
            500
          )
        );
      }
    });
  }

  await Company.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  next();
});

exports.resetCompany = catchAsync(async (req, res, next) => {
  await UserPromo.updateMany({
    promoAmount: 0,
    promoStart: 0,
    promoStatus: false,
    promoEnd: 0,
  });
  await User.updateMany({
    totalPurchases: 0,
    totalPurchasedAmount: 0,
    hasPurchased: false,
    creditBonus: 0,
    hasCommented: false,
    unreadMessages: 0,
    rating: 3,
  });
  await Transaction.deleteMany();
  await Notice.deleteMany();

  const products = await Products.find();

  for (let i = 0; i < products.length; i++) {
    const el = products[i];
    await Products.findByIdAndUpdate(el._id, { remaining: [3, 0] });
  }

  res.status(200).json({
    status: "success",
  });
});

exports.getSettings = catchAsync(async (req, res, next) => {
  const username = req.query.username;
  const status = req.query.status;
  const state = req.query.state;

  let promotions;
  let notifications;
  let products;
  let users;
  let staffs;
  let transactions;
  let companies;
  let orders;
  let emails;
  let banners;

  //////////////GET ALL COUNTRIES /////////////////
  const countries = await new FetchQuery(
    { limit: 300, page: 1 },
    Country
  ).fetchData();

  if (status == "Staff") {
    const user = await Officials.findOne({ username: username });
    //////////////GET  PRODUCTS /////////////////
    products = await new FetchQuery(
      {
        limit: 10,
        page: 1,
        sort: "productName",
        productState: state,
      },
      Products
    ).fetchData();
    for (let i = 0; i < products.results.length; i++) {
      if (products.results[i].productImage != "") {
        products.results[i].productImageUrl = await getAFileUrl(
          products.results[i].productImage
        );
      }

      if (products.results[i].promoBanner) {
        products.results[i].promoBannerUrl = await getAFileUrl(
          products.results[i].promoBanner
        );
      }

      if (products.results[i].productImages.length > 0) {
        for (let x = 0; x < products.results[i].productImages.length; x++) {
          products.results[i].productImagesUrl[x] = await getAFileUrl(
            products.results[i].productImages[x]
          );
        }
      }
    }

    //////////////GET  EMAILS /////////////////
    emails = await new FetchQuery(
      {
        limit: 10,
        page: 1,
        sort: "title",
      },
      Email
    ).fetchData();
    for (let i = 0; i < emails.results.length; i++) {
      if (emails.results[i].Banner) {
        emails.results[i].BannerUrl = await getAFileUrl(
          emails.results[i].Banner
        );
      }
    }

    //////////////GET  COMPANIES /////////////////
    companies = await new FetchQuery(
      {
        limit: 10,
        page: 1,
        sort: "state",
      },
      Company
    ).fetchData();

    //////////////GET  APPROVED TRANSACTIONS /////////////////
    transactions = await new FetchQuery(
      {
        limit: 10,
        page: 1,
        sort: "-time",
        status: true,
        state: user.state,
      },
      Transaction
    ).fetchData();

    //////////////GET  NOTIFICATIONS /////////////////
    notifications = await new FetchQuery(
      { limit: 10, page: 1, sort: "-time" },
      Notification
    ).fetchData();

    //////////////GET  PROMOTIONS /////////////////
    promotions = await new FetchQuery(
      { limit: 10, page: 1, sort: "-time" },
      Promotion
    ).fetchData();
    for (let i = 0; i < promotions.results.length; i++) {
      if (promotions.results[i].promoBanner != undefined) {
        promotions.results[i].promoBannerUrl = await getAFileUrl(
          promotions.results[i].promoBanner
        );
      }
    }

    //////////////GET ALL USERS FOR STAFF//////////////
    users = await new FetchQuery(
      { limit: 10, page: 1, status: "User", sort: "-dateCreated" },
      User
    ).fetchData();

    //////////////GET ALL OFFICIALS FOR STAFF/////////////
    staffs = await new FetchQuery(
      { limit: 10, page: 1, sort: "-time", status: "Staff" },
      Officials
    ).fetchData();

    //////////////GET ALL BANNERS/////////////
    banners = await new FetchQuery(
      { limit: 10, page: 1, sort: "-time", status: "Staff" },
      Banners
    ).fetchData();

    //////////////GET ONLINE ORDERS/////////////
    const official = await Officials.findOne({
      username: username,
    });

    if (official) {
      orders = await new FetchQuery(
        {
          limit: 10,
          page: 1,
          sort: "-time",
          status: false,
          unit: official.unit,
          transactionType: "Order",
        },
        Transaction
      ).fetchData();
    }
  }

  res.status(200).json({
    status: "success",
    countries,
    notifications,
    promotions,
    products,
    transactions,
    users,
    staffs,
    orders,
    companies,
    emails,
    banners,
  });
});
