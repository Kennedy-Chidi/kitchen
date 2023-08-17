const Partner = require("../models/partnerModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");
const Validator = require("../utils/validateData");

exports.getPartners = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Partner.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const partners = await features.query.clone();

  if (partners) {
    for (let i = 0; i < partners.length; i++) {
      if (partners[i].image) {
        partners[i].imageUrl = await getAFileUrl(partners[i].image);
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: partners,
    resultLength: resultLen.length,
  });
});

exports.createPartner = catchAsync(async (req, res, next) => {
  let data = req.body;
  let file = req.file;

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

  if (file) {
    const randomName = await sendFile(file);
    data.image = `${randomName}_${file.originalname}`;
  }

  await Partner.create(data);

  next();
});

exports.updatePartner = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;
  let file = req.file;

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

  const partner = await Partner.findById(req.params.id);

  if (file) {
    if (file.image) {
      const randomName = await sendFile(file.image);
      data.image = `${randomName}_${file.image.originalname}`;
      if (partner.image) {
        filesToDelete.push(partner.image);
      }
    } else {
      data.image = undefined;
    }
  }

  await partner.findByIdAndUpdate(req.params.id, data);

  req.files = filesToDelete;

  next();
});

exports.deletePartner = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  const partner = await Partner.findById(req.params.id);

  if (!partner) {
    return next(new AppError("No partner found with that ID", 404));
  }

  if (partner.image) {
    filesToDelete.push(partner.image);
  }

  await Partner.findByIdAndDelete(req.params.id);

  req.files = filesToDelete;
  next();
});
