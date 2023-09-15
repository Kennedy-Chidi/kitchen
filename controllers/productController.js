const Product = require("../models/productModel");
const Stats = require("../models/statsModel");
const Company = require("../models/companyModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");
const Validator = require("../utils/validateData");
const FetchQuery = require("../utils/fetchAPIQuery");
const { ObjectId } = require("mongodb");

const setPromo = async (product) => {
  product.productDiscount = product.productDiscount * 1;
  product.productNewPrice = product.productNewPrice * 1;
  if (product.productNewPrice != "" && product.productNewPrice != 0) {
    product.productDiscount =
      ((product.productSellingPrice - product.productNewPrice) /
        product.productSellingPrice) *
      100;
    product.isPromo = true;
  } else if (product.productDiscount != "" && product.productDiscount != 0) {
    product.productNewPrice =
      product.productSellingPrice -
      (product.productDiscount * product.productSellingPrice) / 100;
    product.isPromo = true;
  }

  return product;
};

exports.getProducts = catchAsync(async (req, res, next) => {
  const products = await new FetchQuery(req.query, Product).fetchData();

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

  res.status(200).json({
    status: "success",
    data: products,
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;
  data.productStatePrice = JSON.parse(req.body.productStatePrice);
  let files = req.files;

  data = await setPromo(data);

  const existing = await Product.findOne({ productName: data.productName });

  if (existing) {
    return next(
      new AppError(
        `A product with the name ${existing.productName} already exist!`,
        500
      )
    );
  }

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (key != "productDescription" && key != "productColorCode") {
        if (typeof obj[key] === "string") {
          obj[key] = await Validator.removeTags(obj[key]);
        }
      }

      if (key == "productName" || key == "productSellingUnit") {
        obj[key] = Validator.capitalizeFirstLetter(obj[key]);
      }
    }
    return obj;
  };

  data = await removeTags(data);

  if (!Array.isArray(data.productCategories)) {
    data.productCategories = [data.productCategories];
  }

  let items = data.productCategories;

  const categories = (items) => {
    const array = [];
    items.forEach((el) => {
      array.push(Validator.capitalizeFirstLetter(el));
    });
    return array;
  };

  data.productCategories = categories(items);

  if (files) {
    if (files.productImage) {
      const randomName = await sendFile(files.productImage[0]);
      data.productImage = `${randomName}_${files.productImage[0].originalname}`;
    }

    if (files.promoBanner) {
      const randomName = await sendFile(files.promoBanner[0]);
      data.promoBanner = `${randomName}_${files.promoBanner[0].originalname}`;
    }

    if (files.productImages) {
      data.productImages = [];
      data.productImagesUrl = [];
      for (let i = 0; i < files.productImages.length; i++) {
        const randomName = await sendFile(files.productImages[i]);
        data.productImagesUrl.push("");
        data.productImages.push(
          `${randomName}_${files.productImages[i].originalname}`
        );
      }
    }
  }

  const product = await Product.create(data);
  await setProductProperties(product);
  next();
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  const image = req.body.productImage;
  let data = req.body;
  let files = req.files;

  data = await setPromo(data);

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (key != "productColorCode" && key != "promoDescription") {
        if (typeof obj[key] === "string") {
          obj[key] = await Validator.removeTags(obj[key]);
        }
      }
    }

    return obj;
  };

  data = await removeTags(data);

  const product = await Product.findById(req.params.id);

  if (files) {
    if (files.productImage) {
      const randomName = await sendFile(files.productImage[0]);
      data.productImage = `${randomName}_${files.productImage[0].originalname}`;
      if (product.productImage) {
        filesToDelete.push(product.productImage);
      }
    } else {
      data.productImage = undefined;
    }

    if (files.promoBanner) {
      const randomName = await sendFile(files.promoBanner[0]);
      data.promoBanner = `${randomName}_${files.promoBanner[0].originalname}`;
      if (product.promoBanner) {
        filesToDelete.push(product.promoBanner);
      }
    } else {
      data.promoBanner = undefined;
    }

    if (files.productImages) {
      data.productImages = [];
      data.productImagesUrl = [];
      for (let i = 0; i < files.productImages.length; i++) {
        const randomName = await sendFile(files.productImages[i]);
        data.productImagesUrl.push("");
        data.productImages.push(
          `${randomName}_${files.productImages[i].originalname}`
        );
      }
      for (let i = 0; i < product.productImages.length; i++) {
        filesToDelete.push(product.productImages[i]);
      }
    } else {
      data.productImages = undefined;
    }
  }

  if (!Array.isArray(data.productCategories)) {
    data.productCategories = [data.productCategories];
  }

  const newProduct = await Product.findByIdAndUpdate(req.params.id, data);
  data.productImage = newProduct.productImage;
  await setProductProperties(data);

  // await Company.findOneAndUpdate(form);

  req.files = filesToDelete;

  next();
});

exports.getAProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (product.productImage != "") {
    product.productImageUrl = await getAFileUrl(product.productImage);
  }

  if (product.promoBanner) {
    product.promoBannerUrl = await getAFileUrl(product.promoBanner);
  }

  if (product.productImages) {
    if (product.productImages.length > 0) {
      for (let x = 0; x < product.productImages.length; x++) {
        product.productImagesUrl[x] = await getAFileUrl(
          product.productImages[x]
        );
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});

exports.getProductCategories = catchAsync(async (req, res, next) => {
  const company = await Company.findOne({ state: req.query.state });

  const products = [];
  for (let i = 0; i < company.productCategories.length; i++) {
    const el = company.productCategories[i];
    let foundCategory = products.some((obj) => obj.name === el.name);

    if (!foundCategory) {
      products.push(el);
    }
  }

  for (let i = 0; i < products.length; i++) {
    if (products[i].image != "") {
      products[i].imageUrl = await getAFileUrl(products[i].image);
    }
  }

  res.status(200).json({
    status: "success",
    data: products,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  if (product.productImage) {
    filesToDelete.push(product.productImage);
  }
  if (product.productImages) {
    for (let i = 0; i < product.productImages.length; i++) {
      filesToDelete.push(product.productImages[i]);
    }
  }
  await Product.findByIdAndDelete(req.params.id);
  req.files = filesToDelete;
  next();
});

exports.deleteProducts = catchAsync(async (req, res, next) => {
  const data = req.body.products;
  let filesToDelete = [];

  for (let i = 0; i < data.length; i++) {
    filesToDelete.push(data[i].productImage);

    for (let x = 0; x < data[i].productImages.length; x++) {
      filesToDelete.push(data[i].productImages[x]);
    }
  }

  const ids = () => {
    const idArray = [];
    for (let i = 0; i < data.length; i++) {
      idArray.push(data[i]._id);
    }

    return idArray;
  };

  await Product.deleteMany({ _id: { $in: ids() } });

  req.files = filesToDelete;

  next();
});

exports.fetchItems = (io, socket) => {
  socket.on("fetchItems", async (item) => {
    const limit = item.limit;
    const query = {
      $or: [
        { productName: { $regex: item.keyWord, $options: "i" } },
        { productCategories: { $regex: item.keyWord, $options: "i" } },
      ],
      sort: "productName",
      limit: limit,
    };

    const products = await new FetchQuery(query, Product).fetchData();

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

    const data = {
      username: item.username,
      products: products,
    };

    io.emit("fetchedItems", data);
  });
};

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

const setProductProperties = async (product) => {
  const company = await Company.findOne({ state: product.productState });
  const oldCategories = company.productCategories;
  const newCategories = product.productCategories;

  for (let i = 0; i < newCategories.length; i++) {
    const el = newCategories[i];

    let foundCategory = oldCategories.some((obj) => obj.category === el);

    if (!foundCategory) {
      const form = {
        image: product.productImage,
        category: el,
        name: product.productName,
      };
      oldCategories.push(form);
    }
  }

  await Company.findByIdAndUpdate(company._id, {
    productCategories: oldCategories,
  });

  const stats = await Stats.findOne();
  if (stats) {
    let maxPrice = stats.productMaxPrice;
    let minPrice = stats.productMinPrice;
    const categories = stats.productCategories;
    product.productCategories.forEach((el) => {
      if (!categories.includes(el)) {
        categories.push(el);
      }
    });

    const saveProductStats = async (
      newCategories,
      newMaxPrice,
      newMinPrice
    ) => {
      const form = {
        productCategories: newCategories,
        productMaxPrice: newMaxPrice,
        productMinPrice: newMinPrice,
      };

      await Stats.updateMany(form);
    };

    if (stats.length > 0) {
      if (product.productSellingPrice > maxPrice) {
        maxPrice = Number(product.productSellingPrice);
      } else if (product.productSellingPrice < minPrice) {
        minPrice = Number(product.productSellingPrice);
      }
      saveProductStats(categories, maxPrice, minPrice);
    } else {
      saveProductStats(categories, maxPrice, minPrice);
    }
  }
};

// exports.resetAllItem = catchAsync(async (req, res, next) => {
//   let allowedFields = {
//     status: "Exhausted",
//     availability: false,
//     remaining: [0, 0],
//     available: [],
//   };

//   const item = await Product.updateMany(
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
//   const item = await Product.findById(req.params.id);

//   if (!item) {
//     return next(new AppError("No item found with that ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: item,
//   });
// });
