const Blog = require("../models/blogModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");
const { sendFile, getAFileUrl } = require("../config/multer");

exports.createBlog = catchAsync(async (req, res, next) => {
  let data = req.body;
  file = req.file;

  data = await Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (
        typeof obj[key] === "string" &&
        obj[key] != "content" &&
        obj[key] != "banner"
      ) {
        obj[key] = await Validator.removeTags(obj[key]);
      }
    }

    return obj;
  };

  data = await removeTags(data);

  if (file) {
    const randomName = await sendFile(file);
    data.banner = `${randomName}_${file.originalname}`;
  }

  await Blog.create(data);

  next();
});

exports.getBlogs = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Blog.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const blog = await features.query.clone();

  if (blog) {
    for (let i = 0; i < blog.length; i++) {
      if (blog[i].banner) {
        blog[i].bannerUrl = await getAFileUrl(blog[i].banner);
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: blog,
    resultLength: resultLen.length,
  });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;

  data = Validator.trimData(data);

  const removeTags = async (obj) => {
    for (let key in obj) {
      if (
        typeof obj[key] === "string" &&
        obj[key] != "content" &&
        obj[key] != "banner"
      ) {
        obj[key] = await Validator.removeTags(obj[key]);
      }
    }

    return obj;
  };

  data = await removeTags(data);

  if (req.file) {
    const oldBlog = await Blog.findById(req.params.id);
    if (oldBlog.banner) {
      filesToDelete.push(oldBlog.banner);
    }

    const randomName = await sendFile(req.file);
    data.banner = `${randomName}_${req.file.originalname}`;
  }
  await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  req.files = filesToDelete;
  next();
});

exports.getABlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  res.status(200).json({
    status: "success",
    data: blog,
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  const oldBlog = await Blog.findById(req.params.id);

  await Blog.findByIdAndDelete(req.params.id);

  if (oldBlog.banner) {
    filesToDelete.push(oldBlog.banner);
  }
  req.files = filesToDelete;

  next();
});
