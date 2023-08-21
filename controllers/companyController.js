const Company = require("../models/companyModel");
const Country = require("../models/countryModel");
const Promotion = require("../models/promoModel");
const Products = require("../models/productModel");
const User = require("../models/userModel");
const Officials = require("../models/officialModel");
const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");
const AppError = require("../utils/appError");
const FetchQuery = require("../utils/fetchAPIQuery");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");
const { sendFile, getAFileUrl } = require("../config/multer");

exports.createCompany = catchAsync(async (req, res, next) => {
  let savedFields = {};
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

  //  ----------------SETTING SOCIAL ICONS--------------
  const contactArray = [];
  let contactTextArray = [];
  if (!Array.isArray(data.contactText)) {
    contactTextArray.push(data.contactText);
  } else {
    contactTextArray = data.contactText;
  }

  if (req.files.contactIcon) {
    for (let i = 0; i < req.files.contactIcon.length; i++) {
      const contactObj = {
        icon: "",
        text: "",
      };

      const randomName = await sendFile(req.files.contactIcon[i]);
      contactObj.icon = `${randomName}_${req.files.contactIcon[i].originalname}`;
      contactObj.text = contactTextArray[i];

      contactArray.push(contactObj);
    }
  }
  savedFields.contact = contactArray;

  //  --------------------------------------------------

  //  -----------SETTING SOCIAL COLORED ICONS-----------
  const coloredContactArray = [];
  let coloredContactTextArray = [];
  if (!Array.isArray(data.coloredContactText)) {
    coloredContactTextArray.push(data.coloredContactText);
  } else {
    coloredContactTextArray = data.coloredContactText;
  }
  if (req.files.coloredContactIcon) {
    for (let i = 0; i < req.files.coloredContactIcon.length; i++) {
      const contactObj = {
        icon: "",
        text: "",
      };

      const randomName = await sendFile(req.files.coloredContactIcon[i]);
      contactObj.icon = `${randomName}_${req.files.coloredContactIcon[i].originalname}`;
      contactObj.text = coloredContactTextArray[i];

      coloredContactArray.push(contactObj);
    }
  }
  savedFields.coloredContact = coloredContactArray;
  //  --------------------------------------------------

  //  ----------------SETTING MEDIA ICONS--------------
  const mediaArray = [];
  let mediaTextArray = [];
  if (!Array.isArray(data.mediaText)) {
    mediaTextArray.push(data.mediaText);
  } else {
    mediaTextArray = data.mediaText;
  }
  if (req.files.mediaIcon) {
    for (let i = 0; i < req.files.mediaIcon.length; i++) {
      const mediaObj = {
        icon: "",
        text: "",
      };

      const randomName = await sendFile(req.files.mediaIcon[i]);
      mediaObj.icon = `${randomName}_${req.files.mediaIcon[i].originalname}`;
      mediaObj.text = mediaTextArray[i];

      mediaArray.push(mediaObj);
    }
  }
  savedFields.media = mediaArray;
  //  --------------------------------------------------

  //  ------------SETTING MEDIA COLORED ICONS-----------
  const coloredMediaArray = [];
  let coloredMediaTextArray = [];
  if (!Array.isArray(data.coloredMediaText)) {
    coloredMediaTextArray.push(data.coloredMediaText);
  } else {
    coloredMediaTextArray = data.coloredMediaText;
  }
  if (req.files.coloredMediaIcon) {
    for (let i = 0; i < req.files.coloredMediaIcon.length; i++) {
      const mediaObj = {
        icon: "",
        text: "",
      };

      const randomName = await sendFile(req.files.coloredMediaIcon[i]);
      mediaObj.icon = `${randomName}_${req.files.coloredMediaIcon[i].originalname}`;
      mediaObj.text = coloredMediaTextArray[i];

      coloredMediaArray.push(mediaObj);
    }
  }
  savedFields.coloredMedia = coloredMediaArray;
  //  --------------------------------------------------

  savedFields.bankName = data.bankName;
  savedFields.country = data.country;
  savedFields.state = data.state;
  savedFields.lga = data.lga;
  savedFields.unit = data.unit;
  savedFields.companyName = data.companyName;
  savedFields.companyDomain = data.companyDomain;
  savedFields.bankAccountName = data.bankAccountName;
  savedFields.bankAccountNumber = data.bankAccountNumber;
  savedFields.invoiceNumber = data.invoiceNumber;
  savedFields.announcements = data.announcements;

  const newCompany = await Company.create(savedFields);

  next();
});

exports.getCompany = catchAsync(async (req, res, next) => {
  let company = await Company.find();

  for (let x = 0; x < company.length; x++) {
    if (company[x].media) {
      for (let i = 0; i < company[x].media.length; i++) {
        if (company[x].media[i].icon != "") {
          let form = {
            icon: company[x].media[i].icon,
            text: company[x].media[i].text,
            url: await getAFileUrl(company[x].media[i].icon),
          };
          company[x].media[i] = form;
        }
      }
    }

    if (company[x].contact) {
      for (let i = 0; i < company[x].contact.length; i++) {
        if (company[x].contact[i].icon != "") {
          let form = {
            icon: company[x].contact[i].icon,
            text: company[x].contact[i].text,
            url: await getAFileUrl(company[x].contact[i].icon),
          };
          company[x].contact[i] = form;
        }
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: company,
    result: true,
  });
});

exports.updateCompany = catchAsync(async (req, res, next) => {
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

  const makeArrays = (iconText, title) => {
    let IconTextArray = [];
    let TitleArray = [];

    if (!Array.isArray(iconText)) {
      IconTextArray.push(iconText);
    } else {
      IconTextArray = iconText;
    }

    if (!Array.isArray(title)) {
      TitleArray.push(title);
    } else {
      TitleArray = title;
    }

    return [IconTextArray, TitleArray];
  };

  let filesToDelete = [];
  let contactArray = [];

  let contactIconArray =
    req.body.contactIcon != undefined
      ? makeArrays(req.body.contactIcon, req.body.contactText)[0]
      : [];
  let contactTextArray = makeArrays(
    req.body.contactIcon,
    req.body.contactText
  )[1];

  let coloredContactArray = [];
  let coloredContactIconArray =
    req.body.coloredContactIcon != undefined
      ? makeArrays(req.body.coloredContactIcon, req.body.coloredContactText)[0]
      : [];
  let coloredContactTextArray = makeArrays(
    req.body.coloredContactIcon,
    req.body.coloredContactText
  )[1];

  let mediaArray = [];
  let mediaIconArray =
    req.body.mediaIcon != undefined
      ? makeArrays(req.body.mediaIcon, req.body.mediaText)[0]
      : [];
  let mediaTextArray = makeArrays(req.body.mediaIcon, req.body.mediaText)[1];

  let coloredMediaArray = [];
  let coloredMediaIconArray =
    req.body.coloredMediaIcon != undefined
      ? makeArrays(req.body.coloredMediaIcon, req.body.coloredMediaText)[0]
      : [];
  let coloredMediaTextArray = makeArrays(
    req.body.coloredMediaIcon,
    req.body.coloredMediaText
  )[1];

  let oldCompany = await Company.findById(req.params.id);

  let allowedFields = {
    contact: "",
  };

  const addFileName = async (contactFiles, contactIconArray) => {
    if (contactFiles) {
      for (let i = 0; i < contactFiles.length; i++) {
        const randomName = await sendFile(contactFiles[i]);
        contactIconArray.push(`${randomName}_${contactFiles[i].originalname}`);
      }
    }
    return contactIconArray;
  };

  const addBodyName = (bodyArray, iconTextArray, titleArray) => {
    for (let i = 0; i < iconTextArray.length; i++) {
      const contactObj = {
        icon: "",
        text: "",
      };

      contactObj.icon = iconTextArray[i];
      contactObj.text = titleArray[i];

      bodyArray.push(contactObj);
    }
  };

  //1A) FIRST COLLECT THE MODIFIED SOCIAL OBJECTS IN THE FILES
  contactIconArray = await addFileName(req.files.contactIcon, contactIconArray);
  //1B) COLLECT THE UNMODIFIED SOCIAL OBJECTS IN THE BODY
  addBodyName(contactArray, contactIconArray, contactTextArray);
  allowedFields.contact = contactArray;
  /////////////////////////////////////////////////////////////

  //2A) COLLECT THE MODIFIED SOCIAL COLORED OBJECTS IN THE FILES
  coloredContactIconArray = await addFileName(
    req.files.coloredContactIcon,
    coloredContactIconArray
  );
  //2B) COLLECT THE UNMODIFIED SOCIAL COLORED OBJECTS IN THE BODY
  addBodyName(
    coloredContactArray,
    coloredContactIconArray,
    coloredContactTextArray
  );
  allowedFields.coloredContacts = coloredContactArray;
  ////////////////////////////////////////////////////////////

  //3A) COLLECT THE MODIFIED MEDIA OBJECTS IN THE FILES
  mediaIconArray = await addFileName(req.files.mediaIcon, mediaIconArray);
  //3B) COLLECT THE UNMODIFIED MEDIA OBJECTS IN THE BODY
  addBodyName(mediaArray, mediaIconArray, mediaTextArray);
  allowedFields.media = mediaArray;
  //////////////////////////////////////////////////////////////

  //4A) COLLECT THE MODIFIED MEDIA COLORED OBJECTS IN THE FILES
  coloredMediaIconArray = await addFileName(
    req.files.coloredMediaIcon,
    coloredMediaIconArray
  );
  //4B) COLLECT THE UNMODIFIED MEDIA COLORED OBJECTS IN THE BODY
  addBodyName(coloredMediaArray, coloredMediaIconArray, coloredMediaTextArray);
  allowedFields.coloredMedia = coloredMediaArray;

  allowedFields.companyName = req.body.companyName;
  allowedFields.bankAccountName = req.body.bankAccountName;
  allowedFields.bankAccountNumber = req.body.bankAccountNumber;
  allowedFields.bankName = req.body.bankName;
  allowedFields.companyDomain = req.body.companyDomain;
  allowedFields.invoiceNumber = req.body.invoiceNumber;
  allowedFields.announcements = req.body.announcements;

  const newCompany = await Company.findByIdAndUpdate(
    req.params.id,
    allowedFields,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  const oldIcons = () => {
    const array = [];
    oldCompany.contact.forEach((el) => {
      array.push(el.icon);
    });

    oldCompany.coloredContact.forEach((el) => {
      array.push(el.icon);
    });
    oldCompany.media.forEach((el) => {
      array.push(el.icon);
    });
    oldCompany.coloredMedia.forEach((el) => {
      array.push(el.icon);
    });
    return array;
  };

  const newIcons = () => {
    const array = [];
    newCompany.contact.forEach((el) => {
      array.push(el.icon);
    });
    newCompany.coloredContact.forEach((el) => {
      array.push(el.icon);
    });
    newCompany.media.forEach((el) => {
      array.push(el.icon);
    });
    newCompany.coloredMedia.forEach((el) => {
      array.push(el.icon);
    });
    return array;
  };

  oldIcons().forEach((el) => {
    if (!newIcons().includes(el)) {
      filesToDelete.push(el);
    }
  });

  req.files = filesToDelete;
  next();
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
  let orders;

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

  //////////////GET  COMPANY /////////////////
  const company = await Company.findOne();

  res.status(200).json({
    status: "success",
    countries,
    notifications,
    company,
    promotions,
    products,
    transactions,
    users,
    staffs,
    orders,
  });
});
