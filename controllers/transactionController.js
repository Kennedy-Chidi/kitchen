const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const Official = require("../models/officialModel");
const Product = require("../models/productModel");
const Notice = require("../models/noticeModel");
const Notify = require("../utils/notification");
const AppError = require("../utils/appError");
const FetchQuery = require("../utils/fetchAPIQuery");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");
const Validator = require("../utils/validateData");

exports.getTransactions = catchAsync(async (req, res, next) => {
  const transactions = await new FetchQuery(req.query, Transaction).fetchData();

  // for (let i = 0; i < transactions.length; i++) {
  //   if (
  //     transactions[i].transactionFile != "" &&
  //     transactions[i].transactionFile != undefined
  //   ) {
  //     transactions[i].transactionFileUrl = await getAFileUrl(
  //       transactions[i].transactionFile
  //     );
  //   }
  // }

  res.status(200).json({
    status: "success",
    data: transactions,
  });
});

exports.getOrders = catchAsync(async (req, res, next) => {
  const official = await Official.findOne({
    username: username,
  });
  req.query.unit = official.unit;
  const transactions = await new FetchQuery(req.query, Transaction).fetchData();

  res.status(200).json({
    status: "success",
    transactions,
  });
});

exports.createTransaction = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;
  let file = req.file;

  const user = await User.findOne({ username: data.customer });

  if (data.transactionType != "Sell" && !user.phoneNumber && !user.address) {
    return next(
      new AppError(
        "Please set your Phone Number and Address in your profile page",
        500
      )
    );
  }

  if (file) {
    const randomName = await sendFile(file);
    data.transactionFile = `${randomName}_${file.originalname}`;
  }

  await Transaction.create(data);

  await User.findOneAndUpdate(
    { username: data.customer },
    {
      $inc: {
        totalPurchases: data.totalPurchases * 1,
        totalPurchasedAmount: data.totalAmount * 1,
      },
    }
  );

  data.description.forEach(async (el) => {
    await Product.findOneAndUpdate(
      { productName: el.name },
      {
        $inc: {
          totalSoldUnits: el.quantity * 1,
          totalSoldAmount: el.quantity * el.price * 1,
        },
      }
    );
  });

  Notify.sendNotification(
    user,
    data.transactionType,
    data.totalAmount,
    data.time
  );

  next();
});

exports.createOrder = (io, socket) => {
  socket.on("orderGoods", async (body) => {
    const data = {
      username: body.user.username,
    };

    const user = await User.findOne({ username: data.username });
    const salesRep = await Official.findOne({
      unit: user.unit,
      position: "Sales Representative",
    });

    data.email = body.user.email;
    data.state = body.user.state;
    data.lga = body.user.lga;
    data.unit = body.user.unit;
    data.totalAmount = body.totalAmount;
    data.deliveryFee = body.deliveryFee;
    data.time = body.time;
    data.creditBonus = body.creditBonus;
    data.status = false;
    data.description = body.cartProducts;
    data.phoneNumber = body.user.phoneNumber;
    data.address = body.user.address;
    data.salesRep = salesRep;
    data.transactionType = body.transactionType;

    if (salesRep) {
      await Transaction.create(data);

      await new Notify(
        body.user,
        data.transactionType,
        data.totalAmount,
        body.time,
        data.salesRep
      ).sendNotification();

      const transactions = await new FetchQuery(
        { username: body.user.username, limit: 5, sort: "-time" },
        Transaction
      ).fetchData();

      const messages = await new FetchQuery(
        { username: body.user.username, limit: 5, sort: "-time" },
        Notice
      ).fetchData();

      const form = {
        status: 200,
        messages,
        transactions,
        username: body.user.username,
        salesRep,
      };
      io.emit("orderedGoods", form);
    } else {
      const form = {
        status: 400,
      };
      io.emit("orderedGoods", form);
    }
  });
};

exports.approveOrder = (io, socket) => {
  socket.on("approveOrder", async (body) => {
    const transaction = await Transaction.findByIdAndUpdate(body.id, {
      status: true,
    });

    console.log(transaction.description, transaction.username);
    const form = {
      status: "success",
      result: "",
    };
    io.emit("approvedOrder", form);
  });

  // let data = req.body;
  // let products = req.body.cartProducts;
  // let userData = req.body.user;
  // let totalAmount = req.body.totalAmount;
  // let totalQuantity = req.body.totalQuantity;

  // await User.findOneAndUpdate(
  //   { username: data.user.username },
  //   {
  //     $inc: {
  //       totalPurchases: data.totalQuantity * 1,
  //       totalPurchasedAmount: data.totalAmount * 1,
  //     },
  //   }
  // );

  // data.description.forEach(async (el) => {
  //   await Product.findOneAndUpdate(
  //     { productName: el.name },
  //     {
  //       $inc: {
  //         totalSoldUnits: el.quantity * 1,
  //         totalSoldAmount: el.quantity * el.price * 1,
  //       },
  //     }
  //   );
  // });

  // Notify.sendNotification(
  //   user,
  //   data.transactionType,
  //   data.totalAmount,
  //   data.time
  // );

  // res.status(200).json({
  //   status: "success",
  // });
};

exports.cancelOrder = (io, socket) => {
  socket.on("cancelOrder", async (body) => {
    await Transaction.findByIdAndDelete(body.id);
    await User.findOneAndUpdate(
      { username: body.username },
      { $inc: { unreadMessages: 1 } }
    );
    const user = await User.findOne({ username: body.username });

    const orders = await new FetchQuery(body.query, Transaction).fetchData();

    await new Notify(
      user,
      body.transactionType,
      body.totalAmount,
      body.time,
      body.salesRep
    ).sendNotification();

    const messages = await new FetchQuery(
      { username: user.username, limit: 5, sort: "-time" },
      Notice
    ).fetchData();

    const form = {
      status: "success",
      orders,
      messages,
      user,
      salesRep: body.salesRep,
    };

    io.emit("cancelledOrder", form);
  });
};

exports.purchaseGoods = (io, socket) => {
  socket.on("purchaseGoods", async (body) => {
    let data = {
      email: body.user.email,
    };
    const addStock = (products) => {
      for (let i = 0; i < products.length; i++) {
        products[i].remaining[0] += products[i].quantity;
      }

      return products;
    };
    const user = await Official.findOne({ username: body.user.username });

    data.state = user.state;
    data.lga = user.lga;
    data.unit = user.unit;
    data.totalAmount = body.totalAmount;
    data.deliveryFee = 0;
    data.time = body.time;
    data.creditBonus = 0;
    data.status = true;
    data.description = body.cartProducts;
    data.phoneNumber = body.user.phoneNumber;
    data.address = "Not Available";
    data.salesRep = user;
    data.transactionType = body.transactionType;

    await Transaction.create(data);

    const newProducts = await addStock(body.cartProducts);

    for (let i = 0; i < newProducts.length; i++) {
      await Product.findByIdAndUpdate(newProducts[i]._id, {
        remaining: newProducts[i].remaining,
      });
    }
    const products = await new FetchQuery(body.query, Product).fetchData();

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

    const form = {
      status: "success",
      products: products,
      username: user.username,
    };

    io.emit("purchasedGoods", form);
  });
};

// exports.updateTransaction = catchAsync(async (req, res, next) => {
//   const filesToDelete = [];
//   let data = req.body;
//   let files = req.files;

//   data = await Validator.trimData(data);

//   const removeTags = async (obj) => {
//     for (let key in obj) {
//       if (key != "TransactionColorCode" && key != "promoDescription") {
//         if (typeof obj[key] === "string") {
//           obj[key] = await Validator.removeTags(obj[key]);
//         }
//       }
//     }

//     return obj;
//   };

//   data = await removeTags(data);

//   const Transaction = await Transaction.findById(req.params.id);

//   if (files) {
//     if (files.TransactionImage) {
//       const randomName = await sendFile(files.TransactionImage[0]);
//       data.TransactionImage = `${randomName}_${files.TransactionImage[0].originalname}`;
//       if (Transaction.TransactionImage) {
//         filesToDelete.push(Transaction.TransactionImage);
//       }
//     } else {
//       data.TransactionImage = undefined;
//     }

//     if (files.promoBanner) {
//       const randomName = await sendFile(files.promoBanner[0]);
//       data.promoBanner = `${randomName}_${files.promoBanner[0].originalname}`;
//       if (Transaction.promoBanner) {
//         filesToDelete.push(Transaction.promoBanner);
//       }
//     } else {
//       data.promoBanner = undefined;
//     }

//     if (files.TransactionImages) {
//       data.TransactionImages = [];
//       data.TransactionImagesUrl = [];
//       for (let i = 0; i < files.TransactionImages.length; i++) {
//         const randomName = await sendFile(files.TransactionImages[i]);
//         data.TransactionImagesUrl.push("");
//         data.TransactionImages.push(
//           `${randomName}_${files.TransactionImages[i].originalname}`
//         );
//       }
//       for (let i = 0; i < Transaction.TransactionImages.length; i++) {
//         filesToDelete.push(Transaction.TransactionImages[i]);
//       }
//     } else {
//       data.TransactionImages = undefined;
//     }
//   }

//   await Transaction.findByIdAndUpdate(req.params.id, data);

//   req.files = filesToDelete;

//   next();
// });

// exports.deleteTransaction = catchAsync(async (req, res, next) => {
//   const filesToDelete = [];
//   const Transaction = await Transaction.findById(req.params.id);

//   if (!Transaction) {
//     return next(new AppError("No Transaction found with that ID", 404));
//   }

//   if (Transaction.TransactionImage) {
//     filesToDelete.push(Transaction.TransactionImage);
//   }
//   if (Transaction.TransactionImages) {
//     for (let i = 0; i < Transaction.TransactionImages.length; i++) {
//       filesToDelete.push(Transaction.TransactionImages[i]);
//     }
//   }
//   await Transaction.findByIdAndDelete(req.params.id);
//   req.files = filesToDelete;
//   next();
// });

// exports.deleteTransactions = catchAsync(async (req, res, next) => {
//   const data = req.body.Transactions;
//   let filesToDelete = [];

//   for (let i = 0; i < data.length; i++) {
//     filesToDelete.push(data[i].TransactionImage);

//     for (let x = 0; x < data[i].TransactionImages.length; x++) {
//       filesToDelete.push(data[i].TransactionImages[x]);
//     }
//   }

//   const ids = () => {
//     const idArray = [];
//     for (let i = 0; i < data.length; i++) {
//       idArray.push(data[i]._id);
//     }

//     return idArray;
//   };

//   await Transaction.deleteMany({ _id: { $in: ids() } });

//   req.files = filesToDelete;

//   next();
// });

// exports.fetchItems = (io, socket) => {
//   socket.on("fetchItems", async (item) => {
//     const limit = item.limit;
//     const Transactions = await Transaction.find({
//       TransactionName: { $regex: item.keyWord, $options: "i" },
//     }).limit(limit);

//     for (let i = 0; i < Transactions.length; i++) {
//       if (Transactions[i].TransactionImage != "") {
//         Transactions[i].TransactionImageUrl = await getAFileUrl(
//           Transactions[i].TransactionImage
//         );
//       }

//       if (Transactions[i].TransactionImages.length > 0) {
//         for (let x = 0; x < Transactions[i].TransactionImages.length; x++) {
//           Transactions[i].TransactionImagesUrl[x] = await getAFileUrl(
//             Transactions[i].TransactionImage[x]
//           );
//         }
//       }
//     }

//     io.emit("fetchedItems", Transactions);
//   });
// };

// exports.deletePromos = catchAsync(async (req, res, next) => {
//   const data = req.body.Transactions;
//   let filesToDelete = [];

//   for (let i = 0; i < data.length; i++) {
//     filesToDelete.push(data[i].promoBanner);
//     data[i].isPromo = false;
//     data[i].promoName = "";
//     data[i].promoGifts = [];
//     data[i].promoTarget = "";
//     data[i].promoDiscount = 0;
//     data[i].promoDescription = "";
//     data[i].promoPrice = 0;
//     data[i].promoStart = 0;
//     data[i].promoEnd = 0;
//     data[i].promoBanner = "";
//     data[i].promoBannerUrl = "";
//   }

//   const ids = () => {
//     const idArray = [];
//     for (let i = 0; i < data.length; i++) {
//       idArray.push(data[i]._id);
//     }
//     return idArray;
//   };

//   const objectIdArray = ids().map((id) => ObjectId(id));

//   const filter = { _id: { $in: objectIdArray } };

//   const update = { $set: data[0] };

//   await Transaction.updateMany(filter, update);

//   req.files = filesToDelete;

//   next();
// });

// exports.resetAllItem = catchAsync(async (req, res, next) => {
//   let allowedFields = {
//     status: "Exhausted",
//     availability: false,
//     remaining: [0, 0],
//     available: [],
//   };

//   const item = await Transaction.updateMany(
//     {},
//     { $set: allowedFields },
//     {
//       new: true,
//       runValidators: true,
//       useFindAndModify: false,
//     }
//   );

//   res.status(200).json({
//     status: "success",
//   });
// });

// exports.getAnItem = catchAsync(async (req, res, next) => {
//   const item = await Transaction.findById(req.params.id);

//   if (!item) {
//     return next(new AppError("No item found with that ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: item,
//   });
// });
