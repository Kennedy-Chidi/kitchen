const States = require("../models/statesModel");
const Country = require("../models/countryModel");
const User = require("../models/userModel");
const Banner = require("../models/bannerModel");
const Blog = require("../models/blogModel");
const LGA = require("../models/lgaModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");
const { sendFile, getAFileUrl } = require("../config/multer");
const FetchQuery = require("../utils/fetchAPIQuery");

exports.getStates = catchAsync(async (req, res, next) => {
  //////////////GET ALL HOME BANNERS/////////////
  let banners = await new FetchQuery(
    { limit: 10, page: 1, sort: "-time", bannerPage: "Home" },
    Banner
  ).fetchData();

  for (let i = 0; i < banners.results.length; i++) {
    if (banners.results[i].bannerImage != "") {
      banners.results[i].bannerImageUrl = await getAFileUrl(
        banners.results[i].bannerImage
      );
    }
  }

  //////////////GET ALL HOME BLOGS/////////////
  let blogTutorials = await new FetchQuery(
    { limit: 10, page: 1, sort: "-time", blogType: "HomeTutorial" },
    Blog
  ).fetchData();

  for (let i = 0; i < blogTutorials.results.length; i++) {
    if (blogTutorials.results[i].banner != "") {
      blogTutorials.results[i].bannerUrl = await getAFileUrl(
        blogTutorials.results[i].banner
      );
    }
  }

  //////////////GET ALL HOME BLOGS/////////////
  let homeBlogs = await new FetchQuery(
    { limit: 8, page: 1, sort: "-time", blogType: "HomeBlog" },
    Blog
  ).fetchData();

  for (let i = 0; i < homeBlogs.results.length; i++) {
    if (homeBlogs.results[i].banner != "") {
      homeBlogs.results[i].bannerUrl = await getAFileUrl(
        homeBlogs.results[i].banner
      );
    }
  }

  //////////////GET ALL HOME BANNERS/////////////
  let reviews = await new FetchQuery(
    {
      limit: 10,
      page: 1,
      sort: "-time",
      commentStatus: true,
      hasCommented: true,
    },
    User
  ).fetchData();

  for (let i = 0; i < reviews.results.length; i++) {
    if (reviews.results[i].profilePicture != "") {
      reviews.results[i].profilePictureUrl = await getAFileUrl(
        reviews.results[i].profilePicture
      );
    }
  }

  const result = new APIFeatures(States.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const states = await features.query.clone();

  res.status(200).json({
    status: "success",
    resultLength: resultLen.length,
    states,
    banners,
    blogTutorials,
    reviews,
    homeBlogs,
  });
});

exports.getState = catchAsync(async (req, res, next) => {
  const states = await States.findById(req.params.id);

  res.status(200).json({
    status: "success",
    data: states,
  });
});

exports.editState = catchAsync(async (req, res, next) => {
  await States.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
  });
});

exports.createStates = catchAsync(async (req, res, next) => {
  let lgaArray = [];
  const states = await States.find().limit(40);

  for (let i = 0; i < states.length; i++) {
    const lga = states[i].lga;

    for (let x = 0; x < lga.length; x++) {
      let form = {
        country: "Nigeria",
        state: states[i].name,
        name: lga[x],
        units: ["Prefab"],
      };
      lgaArray.push(form);
      form = {
        country: "",
        state: "",
        name: "",
        units: "",
      };
    }

    await LGA.insertMany(lgaArray);
  }

  res.status(200).json({
    status: "success",
    message:
      "We have received your report and will get back to you via your email, sorry for the inconveniences.",
  });
});

exports.createCountry = catchAsync(async (req, res, next) => {
  const statesArray = [];
  const states = await States.find();

  for (let i = 0; i < states.length; i++) {
    let form = {
      stateId: states[i]._id,
      stateName: states[i].name,
    };
    statesArray.push(form);
    form = {
      stateId: "",
      stateName: "",
    };
  }

  const form = {
    name: "Nigeria",
    states: statesArray,
  };

  await Country.create(form);

  res.status(200).json({
    status: "success",
  });
});

exports.getCountries = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(Country.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const countries = await features.query.clone();

  res.status(200).json({
    status: "success",
    resultLength: resultLen.length,
    data: countries,
  });
});

exports.getLGAs = catchAsync(async (req, res, next) => {
  const result = new APIFeatures(LGA.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const resultLen = await result.query;

  const features = result.paginate();

  const lgas = await features.query.clone();

  res.status(200).json({
    status: "success",
    resultLength: resultLen.length,
    data: lgas,
  });
});

exports.deleteLGAs = catchAsync(async (req, res, next) => {
  for (let i = 0; i < 15; i++) {
    await LGA.findOneAndDelete({ name: req.body.lgaName });
  }

  res.status(200).json({
    status: "success",
    // resultLength: resultLen.length,
    // data: lgas,
  });
});
