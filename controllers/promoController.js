const Promo = require("../models/promoModel");
const Company = require("../models/companyModel");
const FetchQuery = require("../utils/fetchAPIQuery");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");
const Validator = require("../utils/validateData");

exports.getPromotions = catchAsync(async (req, res, next) => {
  const promotions = await new FetchQuery(req.query, Promo).fetchData();

  for (let i = 0; i < promotions.results.length; i++) {
    if (promotions.results[i].promoBanner != undefined) {
      promotions.results[i].promoBannerUrl = await getAFileUrl(
        promotions.results[i].promoBanner
      );
    }
  }

  res.status(200).json({
    status: "success",
    data: promotions,
  });
});

exports.createPromotion = catchAsync(async (req, res, next) => {
  let data = req.body;
  let promoBanner = req.file;

  const existing = await Promo.findOne({ promoName: data.promoName });

  if (existing) {
    return next(
      new AppError(
        `A product with the name ${existing.promoName} already exist!`,
        500
      )
    );
  }

  if (promoBanner) {
    const randomName = await sendFile(promoBanner);
    data.promoBanner = `${randomName}_${promoBanner.originalname}`;
  }

  await Promo.create(data);
  next();
});

exports.updatePromo = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;
  let promoBanner = req.file;

  const oldPromo = await Promo.findById(req.params.id);

  if (promoBanner) {
    const randomName = await sendFile(promoBanner);
    data.promoBanner = `${randomName}_${promoBanner.originalname}`;
    if (oldPromo.promoBanner) {
      filesToDelete.push(oldPromo.promoBanner);
    }
  } else {
    data.promoBanner = undefined;
  }

  await Promo.findByIdAndUpdate(req.params.id, data);

  req.files = filesToDelete;

  next();
});

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

exports.deletePromos = catchAsync(async (req, res, next) => {
  const data = req.body.products;
  let filesToDelete = [];

  for (let i = 0; i < data.length; i++) {
    filesToDelete.push(data[i].promoBanner);
    data[i].isPromo = false;
    data[i].promoName = "";
    data[i].promoGifts = [];
    data[i].promoTarget = "";
    data[i].promoDiscount = 0;
    data[i].promoDescription = "";
    data[i].promoPrice = 0;
    data[i].promoStart = 0;
    data[i].promoEnd = 0;
    data[i].promoBanner = "";
    data[i].promoBannerUrl = "";
  }

  const ids = () => {
    const idArray = [];
    for (let i = 0; i < data.length; i++) {
      idArray.push(data[i]._id);
    }
    return idArray;
  };

  const objectIdArray = ids().map((id) => ObjectId(id));

  const filter = { _id: { $in: objectIdArray } };

  const update = { $set: data[0] };

  await Product.updateMany(filter, update);

  req.files = filesToDelete;

  next();
});
