const { token } = require("morgan");
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const hbs = require("handlebars");
const path = require("path");
const Sales = require("../models/salesModel");
const Email = require("../models/emailModel");
const SendEmail = require("../utils/email");
const SoldCategory = require("../models/soldCategoryModel");
const User = require("../models/userModel");
const Company = require("../models/companyModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

const compile = async (templateName, data) => {
  const filePath = path.join(process.cwd(), "views", `${templateName}.hbs`);
  const html = await fs.readFile(filePath, "utf-8");
  return hbs.compile(html)(data);
};

exports.createSale = catchAsync(async (req, res, next) => {
  const data = req.body;
  let company = await Company.find();
  company = company[0];
  const names = new Set(data.cartItems.map((item) => item.name));
  const namesArray = Array.from(names);

  const description = [];

  names.forEach((el) => {
    const form = {
      name: el,
      price: 0,
      unitPrice: 0,
      quantity: 0,
    };
    data.cartItems.forEach((i) => {
      if (el == i.name) {
        form.quantity++;
        form.price = i.price;
        form.unitPrice = i.price;
      }
    });

    form.price = form.price * form.quantity;
    description.push(form);
  });

  const query = { name: { $in: namesArray } };
  const filteredItems = await Item.find(query);

  filteredItems.forEach((el) => {
    description.forEach((item) => {
      if (el.name == item.name) {
        if (data.isPurchase) {
          el.remaining[0] = item.quantity * 1 + el.remaining[0] * 1;
          el.status = "Good";
        } else {
          const totalRemainingUnits =
            el.remaining[1] + el.outputsPerInput * el.remaining[0];
          if (item.quantity > totalRemainingUnits) {
            return next(
              new AppError(
                `Sorry, you have insufficient ${el.name} remaining to sell`,
                500
              )
            );
          } else {
            const newRemainingUnits = totalRemainingUnits - item.quantity;
            el.remaining.splice(
              0,
              1,
              Math.floor(newRemainingUnits / el.outputsPerInput)
            );
            el.remaining.splice(1, 1, newRemainingUnits % el.outputsPerInput);
            if (el.remaining[0] > 0) {
              el.status = "Good";
            } else if (
              el.remaining[0] == 0 &&
              el.remaining[1] > Math.floor(el.outputsPerInput / 2)
            ) {
              el.status = "Warning";
            } else if (
              el.remaining[0] == 0 &&
              el.remaining[1] < Math.floor(el.outputsPerInput / 2)
            ) {
              el.status = "Danger";
            } else if (el.remaining[0] == 0 && el.remaining[1] == 0) {
              el.status = "Exhausted";
            }
          }
        }
      }
    });
  });

  data.description = description;

  filteredItems.forEach(async (el) => {
    await Item.updateOne(
      { _id: el.id },
      { $set: { remaining: el.remaining, status: el.status } }
    );
  });

  await Sales.create(data);

  let categories = [];

  data.cartItems.forEach((el) => {
    const form = {
      category: el.category,
      time: data.time,
    };
    categories.push(form);
  });

  await SoldCategory.insertMany(categories);

  const existingUser = await User.findOne({ email: data.customerEmail });
  const userDetails = {};

  if (existingUser) {
    userDetails.totalAmount =
      data.totalAmount * 1 + existingUser.totalAmount * 1;
    userDetails.purchases =
      data.cartItems.length * 1 + existingUser.purchases * 1;
    await User.findByIdAndUpdate(existingUser._id, userDetails);
  } else {
    const randomNum = Math.floor(Math.random() * 90) + 10;
    userDetails.username = `${data.customerName.split(" ")[0]}${randomNum}`;
    userDetails.fullName = data.customerName;
    userDetails.phoneNumber = data.customerPhone;
    userDetails.email = data.customerEmail;
    userDetails.suspension = false;
    userDetails.regDate = data.time;
    userDetails.totalAmount = data.totalAmount;
    userDetails.purchases = data.cartItems.length;
    userDetails.password = `password${randomNum}`;
    userDetails.cPassword = `password${randomNum}`;
    const user = await User.create(userDetails);

    const email = await Email.find({ template: "auto-registration" });
    const domainName = company.companyURL;
    const from = company.systemEmail;
    const content = email[0]?.content
      .replace("((company-name))", `${company.companyName}`)
      .replace("((username))", userDetails.username)
      .replace("((password))", userDetails.password);

    try {
      const resetURL = `${domainName}`;
      const banner = `${domainName}/uploads/${email[0]?.banner}`;
      new SendEmail(
        from,
        user,
        email[0]?.template,
        email[0]?.title,
        banner,
        content,
        email[0]?.headerColor,
        email[0]?.footerColor,
        email[0]?.mainColor,
        email[0]?.greeting,
        email[0]?.warning,
        resetURL,
        domainName,
        company.companyName
      ).sendEmail();
    } catch (err) {
      return next(
        new AppError(
          `There was an error sending the email. Try again later!, ${err}`,
          500
        )
      );
    }
  }

  next();
});

exports.getAllSales = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Sales.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  const salesStats = await Sales.aggregate([
    {
      $match: {
        time: { $gte: Number(req.query.from), $lte: Number(req.query.to) },
      },
    },
    {
      $group: {
        _id: "$transactionType",
        totalAmount: { $sum: "$totalAmount" },
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);

  const features = result.paginate();
  const sales = await features.query.clone();

  // Assuming RESULT contains the array of filtered documents
  res.status(200).json({
    status: "success",
    resultLength: resultLen.length,
    data: sales,
    purchased:
      salesStats.length != 0 && salesStats[1] != undefined
        ? salesStats[1].totalAmount
        : 0.0,
    sold:
      salesStats.length != 0 && salesStats[0] != undefined
        ? salesStats[0].totalAmount
        : 0.0,
  });
});

exports.getSalesCategory = catchAsync(async (req, res, next) => {
  const from = Number(req.query.from);
  const to = Number(req.query.to);
  const result = await SoldCategory.aggregate([
    { $match: { time: { $gte: from, $lte: to } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 4 },
  ]);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.updateSales = (io, socket) => {
  socket.on("updateSales", async (body) => {
    const user = await User.findById(body.userId);
    const form = {
      status: body.status,
    };

    if (user.activeRoom) {
      form.customer = user.activeRoom;
    }
    const updatedSales = await Sales.findByIdAndUpdate(body.foodId, form, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    io.emit("updatedSales", updatedSales);
  });
};

exports.deleteSales = catchAsync(async (req, res, next) => {
  const sales = await Sales.findByIdAndDelete(req.params.id);

  if (!sales) {
    return next(new AppError("No sales found with that ID", 404));
  }

  next();
});

exports.deleteAllSales = catchAsync(async (req, res, next) => {
  await Sales.deleteMany(req.params.id);

  res.status(200).json({
    status: "success",
  });
});

exports.createInvoice = catchAsync(async (req, res, next) => {
  const data = req.body;
  let company = await Company.find();
  company = company[0];
  const names = new Set(data.cartItems.map((item) => item.name));
  const namesArray = Array.from(names);

  const description = [];

  names.forEach((el) => {
    const form = {
      name: el,
      price: 0,
      unitPrice: 0,
      quantity: 0,
    };
    data.cartItems.forEach((i) => {
      if (el == i.name) {
        form.quantity++;
        form.price = i.price;
        form.unitPrice = i.price;
      }
    });

    form.price = form.price * form.quantity;
    description.push(form);
  });

  data.description = description;
  data.companyName = company.companyName;
  data.companyAccountNumber = company.companyAccountNumber;
  data.companyAccountName = company.companyAccountName;
  data.companyBankName = company.companyBankName;
  data.companyAddress = company.media[0]?.text;
  data.companyPhone = company.media[2]?.text;
  data.companyEmail = company.systemEmail;

  company.invoiceNumber = company.invoiceNumber - 1;

  if (company.invoiceNumber < 0) {
    return next(
      new AppError(
        "No invoice number for this purchase please set invoice.",
        500
      )
    );
  }

  let number = company.invoiceNumber;

  let formattedNumber = number.toString();
  if (formattedNumber.length < 5) {
    formattedNumber = "0".repeat(5 - formattedNumber.length) + formattedNumber;
  }

  data.invoiceNumber = formattedNumber;
  let invoiceName = `${data.customerName}-${data.invoiceNumber}`;
  data.invoice = `${invoiceName}.pdf`;

  await Company.findByIdAndUpdate(
    company._id,
    { invoiceNumber: number },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    const content = await compile("invoice", data);

    await page.emulateMediaFeatures("screen");
    await page.setContent(content);
    await page.pdf({
      path: `uploads/${invoiceName}.pdf`,
      format: "A4",
      printBackground: true,
    });
    console.log("done");
    browser.close();
  } catch (err) {
    return next(new AppError(err, 501));
  }

  res.status(200).json({
    status: "success",
    // data: sale,
  });
});
