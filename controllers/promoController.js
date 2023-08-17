const Promo = require("../models/promoModel");
const Company = require("../models/companyModel");
const FetchQuery = require("../utils/fetchAPIQuery");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");
const Validator = require("../utils/validateData");

exports.getPromotions = catchAsync(async (req, res, next) => {
  const promotions = await new FetchQuery(req.query, Promo).fetchData();

  for (let i = 0; i < promotions.length; i++) {
    if (promotions[i].promoBanner) {
      promotions[i].promoBannerUrl = await getAFileUrl(
        promotions[i].promoBanner
      );
    }
  }

  res.status(200).json({
    status: "success",
    data: promotions,
  });
});

exports.createPromo = catchAsync(async (req, res, next) => {
  let data = req.body;
  let files = req.files;

  const existing = await Promo.findOne({ promoName: data.promoName });

  if (existing) {
    return next(
      new AppError(
        `A product with the name ${existing.promoName} already exist!`,
        500
      )
    );
  }

  if (files) {
    if (files.promoBanner) {
      const randomName = await sendFile(files.promoBanner[0]);
      data.promoBanner = `${randomName}_${files.promoBanner[0].originalname}`;
    }
  }

  await Promo.create(data);
  next();
});

// exports.updateProduct = catchAsync(async (req, res, next) => {
//   const filesToDelete = [];
//   let data = req.body;
//   data.productStatePrice = JSON.parse(req.body.productStatePrice);
//   let files = req.files;

//   data = await Validator.trimData(data);

//   const removeTags = async (obj) => {
//     for (let key in obj) {
//       if (key != "productColorCode" && key != "promoDescription") {
//         if (typeof obj[key] === "string") {
//           obj[key] = await Validator.removeTags(obj[key]);
//         }
//       }
//     }

//     return obj;
//   };

//   data = await removeTags(data);

//   const product = await Product.findById(req.params.id);

//   if (files) {
//     if (files.productImage) {
//       const randomName = await sendFile(files.productImage[0]);
//       data.productImage = `${randomName}_${files.productImage[0].originalname}`;
//       if (product.productImage) {
//         filesToDelete.push(product.productImage);
//       }
//     } else {
//       data.productImage = undefined;
//     }

//     if (files.promoBanner) {
//       const randomName = await sendFile(files.promoBanner[0]);
//       data.promoBanner = `${randomName}_${files.promoBanner[0].originalname}`;
//       if (product.promoBanner) {
//         filesToDelete.push(product.promoBanner);
//       }
//     } else {
//       data.promoBanner = undefined;
//     }

//     if (files.productImages) {
//       data.productImages = [];
//       data.productImagesUrl = [];
//       for (let i = 0; i < files.productImages.length; i++) {
//         const randomName = await sendFile(files.productImages[i]);
//         data.productImagesUrl.push("");
//         data.productImages.push(
//           `${randomName}_${files.productImages[i].originalname}`
//         );
//       }
//       for (let i = 0; i < product.productImages.length; i++) {
//         filesToDelete.push(product.productImages[i]);
//       }
//     } else {
//       data.productImages = undefined;
//     }
//   }

//   if (!Array.isArray(data.productCategories)) {
//     data.productCategories = [data.productCategories];
//   }

//   await Product.findByIdAndUpdate(req.params.id, data);

//   const form = await setProductProperties(data);

//   await Company.findOneAndUpdate(form);

//   req.files = filesToDelete;

//   next();
// });

// exports.getAProduct = catchAsync(async (req, res, next) => {
//   const product = await Product.findById(req.params.id);

//   if (product.productImage != "") {
//     product.productImageUrl = await getAFileUrl(product.productImage);
//   }

//   if (product.promoBanner) {
//     product.promoBannerUrl = await getAFileUrl(product.promoBanner);
//   }

//   if (product.productImages) {
//     if (product.productImages.length > 0) {
//       for (let x = 0; x < product.productImages.length; x++) {
//         product.productImagesUrl[x] = await getAFileUrl(
//           product.productImages[x]
//         );
//       }
//     }
//   }

//   res.status(200).json({
//     status: "success",
//     data: product,
//   });
// });

// exports.deleteProduct = catchAsync(async (req, res, next) => {
//   const filesToDelete = [];
//   const product = await Product.findById(req.params.id);

//   if (!product) {
//     return next(new AppError("No product found with that ID", 404));
//   }

//   if (product.productImage) {
//     filesToDelete.push(product.productImage);
//   }
//   if (product.productImages) {
//     for (let i = 0; i < product.productImages.length; i++) {
//       filesToDelete.push(product.productImages[i]);
//     }
//   }
//   await Product.findByIdAndDelete(req.params.id);
//   req.files = filesToDelete;
//   next();
// });

// exports.deleteProducts = catchAsync(async (req, res, next) => {
//   const data = req.body.products;
//   let filesToDelete = [];

//   for (let i = 0; i < data.length; i++) {
//     filesToDelete.push(data[i].productImage);

//     for (let x = 0; x < data[i].productImages.length; x++) {
//       filesToDelete.push(data[i].productImages[x]);
//     }
//   }

//   const ids = () => {
//     const idArray = [];
//     for (let i = 0; i < data.length; i++) {
//       idArray.push(data[i]._id);
//     }

//     return idArray;
//   };

//   await Product.deleteMany({ _id: { $in: ids() } });

//   req.files = filesToDelete;

//   next();
// });

// exports.fetchItems = (io, socket) => {
//   socket.on("fetchItems", async (item) => {
//     const limit = item.limit;
//     const products = await Product.find({
//       productName: { $regex: item.keyWord, $options: "i" },
//     }).limit(limit);

//     for (let i = 0; i < products.length; i++) {
//       if (products[i].productImage != "") {
//         products[i].productImageUrl = await getAFileUrl(
//           products[i].productImage
//         );
//       }

//       if (products[i].productImages.length > 0) {
//         for (let x = 0; x < products[i].productImages.length; x++) {
//           products[i].productImagesUrl[x] = await getAFileUrl(
//             products[i].productImage[x]
//           );
//         }
//       }
//     }

//     io.emit("fetchedItems", products);
//   });
// };

// exports.deletePromos = catchAsync(async (req, res, next) => {
//   const data = req.body.products;
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

//   await Product.updateMany(filter, update);

//   req.files = filesToDelete;

//   next();
// });

// const setProductProperties = async (product) => {
//   const stats = await Stats.findOne();
//   if (stats) {
//     let maxPrice = stats.productMaxPrice;
//     let minPrice = stats.productMinPrice;
//     const categories = stats.productCategories;
//     product.productCategories.forEach((el) => {
//       if (!categories.includes(el)) {
//         categories.push(el);
//       }
//     });

//     const saveProductStats = async (
//       newCategories,
//       newMaxPrice,
//       newMinPrice
//     ) => {
//       const form = {
//         productCategories: newCategories,
//         productMaxPrice: newMaxPrice,
//         productMinPrice: newMinPrice,
//       };

//       await Stats.updateMany(form);
//     };

//     if (stats.length > 0) {
//       if (product.productSellingPrice > maxPrice) {
//         maxPrice = Number(product.productSellingPrice);
//       } else if (product.productSellingPrice < minPrice) {
//         minPrice = Number(product.productSellingPrice);
//       }
//       saveProductStats(categories, maxPrice, minPrice);
//     } else {
//       saveProductStats(categories, maxPrice, minPrice);
//     }
//   }
// };
