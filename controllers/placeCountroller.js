const States = require("../models/statesModel");
const Country = require("../models/countryModel");
const LGA = require("../models/lgaModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const Validator = require("../utils/validateData");

exports.getStates = catchAsync(async (req, res, next) => {
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
    data: states,
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
