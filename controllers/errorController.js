const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicatedFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const key = Object.keys(err.keyValue);
  const message = `Sorry, a user with ${value} already exist, please use another ${key}`;
  return new AppError(message, 500);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  new AppError("Invalid token. Please login again!", 401);
};

const handleJWTExpiredError = () => {
  new AppError("Your token has expired! Please login again", 401);
};

const sendErrorDev = (err, res) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    err.isOperational = true;
    let error = { ...err };
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicatedFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError();
    sendErrorProd(err, res);
  }
};
