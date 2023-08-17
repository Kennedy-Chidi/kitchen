const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Company = require("../models/companyModel");
const Email = require("../models/emailModel");
const AppError = require("../utils/appError");
const SendEmail = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const { sendFile, getFileUrl, getAFileUrl } = require("../config/multer");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //CHECK FOR UNIQUE USERNAME
  const userName = await User.findOne({ email: req.body.username });
  if (userName) {
    return next(
      new AppError(`Someone with the username ${userName} already exist!`, 500)
    );
  }

  //CHECK FOR UNIQUE EMAIL
  const userEmail = await User.findOne({ email: req.body.email });
  if (userEmail) {
    return next(
      new AppError(`Someone with the email ${userEmail} already exist!`, 500)
    );
  }

  //CHECK FOR UNIQUE PHONE NUMBER
  const userPhone = await User.findOne({ email: req.body.phone });
  if (userPhone) {
    return next(
      new AppError(
        `Someone with the phone number ${userPhone} already exist!`,
        500
      )
    );
  }

  const user = await User.create(req.body);

  const email = await Email.findOne({ template: "signup" });
  const company = await Company.findOne({ state: req.body.state });
  const banner = await getAFileUrl(email.banner);
  const from = company.systemEmail;
  const content = email.content.replace(
    "[company-name]",
    `${company.companyName}`
  );

  if (company) {
    const companyInfo = {
      email: from,
      username: user.username,
    };

    const users = [companyInfo, user];

    users.forEach((user) => {
      try {
        new SendEmail(company, user, email, banner, content, "").sendEmail();
      } catch (err) {
        return next(
          new AppError(
            `There was an error sending the email. Try again later!, ${err}`,
            500
          )
        );
      }
    });
  }

  res.status(200).json({
    status: "success",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  //1) check if email and password exist
  if (!username || !password) {
    return next(new AppError("Please provide username and password!", 400));
  }

  //2) check if user exists && password is correct
  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (req.body.cartItems) {
    const products = await Product.find({
      productName: { $in: req.body.cartItems },
      state: user.state,
    });

    for (let i = 0; i < products.length; i++) {
      for (let x = 0; x < products[i].productStatePrice.length; x++) {
        if (products[i].productStatePrice[x].state == user.state) {
          products[i].productSellingPrice =
            products[i].productStatePrice[x].price;
        }
      }
    }

    res.products = products;
  }

  //3) if everything is ok, send token to client
  createSendToken(user, 200, res);
});

exports.getAUser = catchAsync(async (req, res, next) => {
  let token;
  // let io = req.io;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next();

  if (currentUser.profilePicture != "") {
    currentUser.profilePictureUrl = await getAFileUrl(
      currentUser.profilePicture
    );
  }

  createSendToken(currentUser, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on Posted email
  const oldUser = await User.findOne({ email: req.body.email });
  if (!oldUser) {
    return next(new AppError("There is no user with that email address", 404));
  }
  //2) Generate the random reset token
  const resetToken = oldUser.createPasswordResetToken();
  const user = await oldUser.save({ validateBeforeSave: false });

  const email = await Email.find({ template: "forgotten-password" });
  const companyData = await Company.find();
  const company = companyData[0];
  // const domainName = company.companyURL;
  const domainName = "http://localhost:3000";
  const from = company.systemEmail;
  const content = email[0]?.content.replace(
    "((company-name))",
    `${company.companyName}`
  );

  try {
    const resetURL = `${domainName}/reset-password?token=${resetToken}`;
    const banner = `${domainName}/uploads/${email[0]?.banner}`;
    new SendEmail(
      from,
      user,
      email[0]?.template,
      email[0]?.title,
      banner,
      content,
      email[0]?.headerColor,
      email[0]?.footerColor,
      email[0]?.mainColor,
      email[0]?.greeting,
      email[0]?.warning,
      resetURL,
      domainName,
      company.companyName
    ).sendEmail();
  } catch (err) {
    return next(
      new AppError(
        `There was an error sending the email. Try again later!, ${err}`,
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.cPassword = req.body.cPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3) Update changedPasswordAt property for the user

  //4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //2) If token has not expired, and there is a user, set the new password
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  if (req.body.password != req.body.cPassword) {
    return next(new AppError("Your passwords do not match"));
  }
  user.password = req.body.password;
  user.cPassword = req.body.cPassword;

  await user.save();

  //4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updateMe = catchAsync(async (req, res, next) => {
  let filesToDelete = [];
  let data = req.body;
  if (req.file) {
    const randomName = await sendFile(req.file);
    data.profilePicture = `${randomName}_${req.file.originalname}`;
    const oldUser = await User.findById(req.user._id);
    filesToDelete.push(oldUser.profilePicture);
  }

  await User.findByIdAndUpdate(req.user._id, data);
  req.fileNames = filesToDelete;
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it exist
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "Sorry, you are not logged in! Please login to get access",
        401
      )
    );
  }

  //2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("Sorry you no longer exist in the database", 401));

  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(`User recently changed password! Please login again`, 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  req.token = token;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.staffType)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.activateAUser = catchAsync(async (req, res, next) => {
  let token = req.params.id;

  const oldUser = await User.findById(token);

  //2) If token has not expired, and there is a user, set the new password
  if (!oldUser) {
    return next(
      new AppError("User does not exist, please signup to continue.", 400)
    );
  }

  const user = await User.findByIdAndUpdate(oldUser._id, { suspension: false });
  const email = await Email.find({ template: "registration-successful" });
  const companyData = await Company.find();
  const company = companyData[0];
  // const domainName = company.companyURL;
  const domainName = "http://localhost:3000";
  const from = company.systemEmail;
  const content = email[0]?.content.replace(
    "((company-name))",
    `${company.companyName}`
  );

  try {
    const resetURL = `${domainName}/confirm-registration?token=${user._id}`;
    const banner = `${domainName}/uploads/${email[0]?.banner}`;
    new SendEmail(
      from,
      user,
      email[0]?.template,
      email[0]?.title,
      banner,
      content,
      email[0]?.headerColor,
      email[0]?.footerColor,
      email[0]?.mainColor,
      email[0]?.greeting,
      email[0]?.warning,
      resetURL,
      domainName,
      company.companyName
    ).sendEmail();
  } catch (err) {
    return next(
      new AppError(
        `There was an error sending the email. Try again later!, ${err}`,
        500
      )
    );
  }

  createSendToken(user, 200, res);
});
