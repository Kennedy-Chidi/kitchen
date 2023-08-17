const About = require("../models/aboutModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getAFileUrl } = require("../config/multer");

exports.createAbout = catchAsync(async (req, res, next) => {
  let data = req.body;
  const files = req.files;

  if (files) {
    if (files.certificate) {
      const randomName = await sendFile(files.certificate[0]);
      data.certificate = `${randomName}_${files.certificate[0].originalname}`;
    }

    if (files.video) {
      const randomName = await sendFile(files.video[0]);
      data.video = `${randomName}_${files.video[0].originalname}`;
    }
  }

  await About.create(data);
  next();
});

exports.getAbout = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(About.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const features = result.paginate();

  const aboutResult = await features.query.clone();

  const about = aboutResult[0];

  if (about) {
    if (about.certificate != "") {
      about.certificateUrl = await getAFileUrl(about.certificate);
    }

    if (about.video != "") {
      about.videoUrl = await getAFileUrl(about.video);
    }
  }

  res.status(200).json({
    status: "success",
    data: about,
  });
});

exports.updateAbout = catchAsync(async (req, res, next) => {
  let filesToDelete = [];
  let data = req.body;

  const files = req.files;

  if (files) {
    if (files.passport) {
      const randomName = await sendFile(files.passport[0]);
      data.passport = `${randomName}_${files.passport[0].originalname}`;
      filesToDelete.push(oldAppliaction.passport);
    } else {
      data.passport = undefined;
    }

    if (files.document) {
      const randomName = await sendFile(files.document[0]);
      data.document = `${randomName}_${files.document[0].originalname}`;
      filesToDelete.push(oldAppliaction.document);
    } else {
      data.document = undefined;
    }
  }

  const oldAbout = await About.findById(req.params.id);

  if (files) {
    if (files.certificate) {
      const randomName = await sendFile(files.certificate[0]);
      data.certificate = `${randomName}_${files.certificate[0].originalname}`;

      filesToDelete.push(oldAbout.certificate);
    }

    if (files.video) {
      const randomName = await sendFile(files.video[0]);
      data.video = `${randomName}_${files.video[0].originalname}`;
      filesToDelete.push(oldAbout.video);
    }
  }

  await About.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  req.files = filesToDelete;

  next();
});
