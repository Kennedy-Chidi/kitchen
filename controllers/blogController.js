const Blog = require("../models/blogModel");

const FetchQuery = require("../utils/fetchAPIQuery");
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
  let blog = await new FetchQuery(req.query, Blog).fetchData();

  if (blog) {
    for (let i = 0; i < blog.results.length; i++) {
      if (blog.results[i].banner) {
        blog.results[i].bannerUrl = await getAFileUrl(blog.results[i].banner);
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: blog,
  });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  const filesToDelete = [];
  let data = req.body;

  // data = Validator.trimData(data);

  // const removeTags = async (obj) => {
  //   for (let key in obj) {
  //     if (
  //       typeof obj[key] === "string" &&
  //       obj[key] != "content" &&
  //       obj[key] != "banner"
  //     ) {
  //       obj[key] = await Validator.removeTags(obj[key]);
  //     }
  //   }

  //   return obj;
  // };

  // data = await removeTags(data);

  if (req.file) {
    const oldBlog = await Blog.findById(req.params.id);
    if (oldBlog.banner) {
      filesToDelete.push(oldBlog.banner);
    }

    const randomName = await sendFile(req.file);
    data.banner = `${randomName}_${req.file.originalname}`;
  } else {
    data.banner = undefined;
  }
  await Blog.findByIdAndUpdate(req.params.id, data, {
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
