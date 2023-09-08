const Partner = require("../models/partnerModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");
const Validator = require("../utils/validateData");
const FetchQuery = require("../utils/fetchAPIQuery");

exports.getPartners = catchAsync(async (req, res, next) => {
  const partners = await new FetchQuery(req.query, Partner).fetchData();

  if (partners) {
    for (let i = 0; i < partners.results.length; i++) {
      if (partners.results[i].image) {
        partners.results[i].imageUrl = await getAFileUrl(
          partners.results[i].image
        );
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: partners,
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

  if (file) {
    const partner = await Partner.findById(req.params.id);
    const randomName = await sendFile(file);
    data.image = `${randomName}_${file.originalname}`;
    if (partner.image) {
      filesToDelete.push(partner.image);
    }
  } else {
    data.image = undefined;
  }

  await Partner.findByIdAndUpdate(req.params.id, data);

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
