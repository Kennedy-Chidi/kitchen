const Banner = require("../models/bannerModel");

const FetchQuery = require("../utils/fetchAPIQuery");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");
const { sendFile, getAFileUrl } = require("../config/multer");

exports.createBanner = catchAsync(async (req, res, next) => {
  let data = req.body;
  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (key != "content") {
        if (typeof obj[key] === "string") {
          obj[key] = await Validator.removeTags(obj[key]);
        }
      }
    }

    return obj;
  };

  data = await removeTags(data);

  if (req.file) {
    const randomName = await sendFile(req.file);
    data.bannerImage = `${randomName}_${req.file.originalname}`;
  }

  await Banner.create(data);

  next();
});

exports.getAllBanner = catchAsync(async (req, res, next) => {
  let banners = await new FetchQuery(req.query, Banner).fetchData();

  for (let i = 0; i < banners.results.length; i++) {
    if (banners.results[i].bannerImage != "") {
      banners.results[i].bannerImageUrl = await getAFileUrl(
        banners.results[i].bannerImage
      );
    }
  }

  res.status(200).json({
    status: "success",
    data: banners,
  });
});

exports.updateBanner = catchAsync(async (req, res, next) => {
  let data = req.body;
  let filesToDelete = [];

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (key != "content") {
        if (typeof obj[key] === "string") {
          obj[key] = await Validator.removeTags(obj[key]);
        }
      }
    }

    return obj;
  };

  data = await removeTags(data);

  const oldBanner = await Banner.findById(req.params.id);
  if (req.file) {
    const randomName = await sendFile(req.file);
    data.bannerImage = `${randomName}_${req.file.originalname}`;
    filesToDelete.push(oldBanner.bannerImage);
  }

  await Banner.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  req.files = filesToDelete;

  next();
});

exports.updateBannerStatus = catchAsync(async (req, res, next) => {
  let allowedFields = {
    status: req.body.status,
  };
  const banner = await Banner.findByIdAndUpdate(req.params.id, allowedFields, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    status: "success",
    data: banner,
  });
});

exports.deleteBanner = catchAsync(async (req, res, next) => {
  const oldBanner = await Banner.findById(req.params.id);
  let fileArr = [];
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    return next(new AppError("No banner found with that ID", 404));
  }

  if (oldBanner.bannerImage) {
    fileArr.push(oldBanner.bannerImage);
  }

  req.files = fileArr;
  next();
});
