// const Hotel = require("../models/hotelModel");
// const AppError = require("../utils/appError");
// const APIFeatures = require("../utils/apiFeatures");
// const catchAsync = require("../utils/catchAsync");

// exports.createHotel = catchAsync(async (req, res, next) => {
//   const hotelNumber = await Hotel.find();

//   if (hotelNumber.length > 0) {
//     return next(new AppError("Sorry you can only create one hotel", 500));
//   }
//   let savedFields = {
//     salesPoints: req.body.salesPoints,
//     usersType: req.body.usersType,
//   };

//   //  ----------------SETTING SOCIAL ICONS--------------
//   const socialArray = [];
//   let socialTitleArray = [];
//   if (!Array.isArray(req.body.socialTitle)) {
//     socialTitleArray.push(req.body.socialTitle);
//   } else {
//     socialTitleArray = req.body.socialTitle;
//   }
//   for (let i = 0; i < req.files.socialIcon.length; i++) {
//     const socialObj = {
//       icon: "",
//       title: "",
//     };

//     socialObj.icon = req.files.socialIcon[i].filename;
//     socialObj.title = socialTitleArray[i];

//     socialArray.push(socialObj);
//   }
//   savedFields.social = socialArray;

//   //  --------------------------------------------------

//   //  -----------SETTING SOCIAL COLORED ICONS-----------
//   const socialColoredArray = [];
//   let socialColoredTitleArray = [];
//   if (!Array.isArray(req.body.socialColoredTitle)) {
//     socialColoredTitleArray.push(req.body.socialColoredTitle);
//   } else {
//     socialColoredTitleArray = req.body.socialColoredTitle;
//   }
//   for (let i = 0; i < req.files.socialColoredIcon.length; i++) {
//     const socialObj = {
//       icon: "",
//       title: "",
//     };

//     socialObj.icon = req.files.socialColoredIcon[i].filename;
//     socialObj.title = socialColoredTitleArray[i];

//     socialColoredArray.push(socialObj);
//   }
//   savedFields.socialColored = socialColoredArray;
//   //  --------------------------------------------------

//   //  ----------------SETTING MEDIA ICONS--------------
//   const mediaArray = [];
//   let mediaTitleArray = [];
//   if (!Array.isArray(req.body.mediaTitle)) {
//     mediaTitleArray.push(req.body.mediaTitle);
//   } else {
//     mediaTitleArray = req.body.mediaTitle;
//   }
//   for (let i = 0; i < req.files.mediaIcon.length; i++) {
//     const mediaObj = {
//       icon: "",
//       title: "",
//     };

//     mediaObj.icon = req.files.mediaIcon[i].filename;
//     mediaObj.title = mediaTitleArray[i];

//     mediaArray.push(mediaObj);
//   }
//   savedFields.media = mediaArray;
//   //  --------------------------------------------------

//   //  ------------SETTING MEDIA COLORED ICONS-----------
//   const mediaColoredArray = [];
//   let mediaColoredTitleArray = [];
//   if (!Array.isArray(req.body.mediaColoredTitle)) {
//     mediaColoredTitleArray.push(req.body.mediaColoredTitle);
//   } else {
//     mediaColoredTitleArray = req.body.mediaColoredTitle;
//   }
//   for (let i = 0; i < req.files.mediaColoredIcon.length; i++) {
//     const mediaObj = {
//       icon: "",
//       title: "",
//     };

//     mediaObj.icon = req.files.mediaColoredIcon[i].filename;
//     mediaObj.title = mediaColoredTitleArray[i];

//     mediaColoredArray.push(mediaObj);
//   }
//   savedFields.mediaColored = mediaColoredArray;
//   //  --------------------------------------------------

//   const hotel = await Hotel.create(savedFields);

//   res.status(200).json({
//     status: "success",
//     data: hotel,
//   });
// });

// exports.getHotel = catchAsync(async (req, res, next) => {
//   const result = new APIFeatures(Hotel.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields();

//   const features = result.paginate();

//   const hotel = await features.query.clone();

//   res.status(200).json({
//     status: "success",
//     data: hotel,
//   });
// });

// exports.updateHotel = catchAsync(async (req, res, next) => {
//   const makeArrays = (iconText, title) => {
//     let IconTextArray = [];
//     let TitleArray = [];

//     if (!Array.isArray(iconText)) {
//       IconTextArray.push(iconText);
//     } else {
//       IconTextArray = iconText;
//     }

//     if (!Array.isArray(title)) {
//       TitleArray.push(title);
//     } else {
//       TitleArray = title;
//     }

//     return [IconTextArray, TitleArray];
//   };

//   let filesToDelete = [];
//   let socialArray = [];

//   let socialIconTextArray =
//     req.body.socialIconText != undefined
//       ? makeArrays(req.body.socialIconText, req.body.socialTitle)[0]
//       : [];
//   let socialTitleArray = makeArrays(
//     req.body.socialIconText,
//     req.body.socialTitle
//   )[1];

//   let socialColoredArray = [];
//   let socialColoredIconTextArray =
//     req.body.socialColoredIconText != undefined
//       ? makeArrays(
//           req.body.socialColoredIconText,
//           req.body.socialColoredTitle
//         )[0]
//       : [];
//   let socialColoredTitleArray = makeArrays(
//     req.body.socialColoredIconText,
//     req.body.socialColoredTitle
//   )[1];

//   let mediaArray = [];
//   let mediaIconTextArray =
//     req.body.mediaIconText != undefined
//       ? makeArrays(req.body.mediaIconText, req.body.mediaTitle)[0]
//       : [];
//   let mediaTitleArray = makeArrays(
//     req.body.mediaIconText,
//     req.body.mediaTitle
//   )[1];

//   let mediaColoredArray = [];
//   let mediaColoredIconTextArray =
//     req.body.mediaColoredIconText != undefined
//       ? makeArrays(req.body.mediaColoredIconText, req.body.mediaColoredTitle)[0]
//       : [];
//   let mediaColoredTitleArray = makeArrays(
//     req.body.mediaColoredIconText,
//     req.body.mediaColoredTitle
//   )[1];

//   let oldHotel = await Hotel.findById(req.params.id);

//   let allowedFields = {
//     salesPoints: req.body.salesPoints,
//     usersType: req.body.usersType,
//   };

//   const addFileName = (socialFiles, socialIconTextArray) => {
//     if (socialFiles) {
//       for (let i = 0; i < socialFiles.length; i++) {
//         socialIconTextArray.push(socialFiles[i].filename);
//       }
//     }
//   };

//   const addBodyName = (bodyArray, iconTextArray, titleArray) => {
//     for (let i = 0; i < iconTextArray.length; i++) {
//       const socialObj = {
//         icon: "",
//         title: "",
//       };

//       socialObj.icon = iconTextArray[i];
//       socialObj.title = titleArray[i];

//       bodyArray.push(socialObj);
//     }
//   };

//   //1A) FIRST COLLECT THE MODIFIED SOCIAL OBJECTS IN THE FILES
//   addFileName(req.files.socialIcon, socialIconTextArray);

//   //1B) COLLECT THE UNMODIFIED SOCIAL OBJECTS IN THE BODY
//   addBodyName(socialArray, socialIconTextArray, socialTitleArray);

//   allowedFields.social = socialArray;
//   /////////////////////////////////////////////////////////////

//   //2A) COLLECT THE MODIFIED SOCIAL COLORED OBJECTS IN THE FILES
//   addFileName(req.files.socialColoredIcon, socialColoredIconTextArray);

//   //2B) COLLECT THE UNMODIFIED SOCIAL COLORED OBJECTS IN THE BODY
//   addBodyName(
//     socialColoredArray,
//     socialColoredIconTextArray,
//     socialColoredTitleArray
//   );

//   allowedFields.socialColored = socialColoredArray;
//   ////////////////////////////////////////////////////////////

//   //3A) COLLECT THE MODIFIED MEDIA OBJECTS IN THE FILES
//   addFileName(req.files.mediaIcon, mediaIconTextArray);

//   //3B) COLLECT THE UNMODIFIED MEDIA OBJECTS IN THE BODY
//   addBodyName(mediaArray, mediaIconTextArray, mediaTitleArray);

//   allowedFields.media = mediaArray;
//   //////////////////////////////////////////////////////////////

//   //4A) COLLECT THE MODIFIED MEDIA COLORED OBJECTS IN THE FILES
//   addFileName(req.files.mediaColoredIcon, mediaColoredIconTextArray);

//   //4B) COLLECT THE UNMODIFIED MEDIA COLORED OBJECTS IN THE BODY
//   addBodyName(
//     mediaColoredArray,
//     mediaColoredIconTextArray,
//     mediaColoredTitleArray
//   );

//   allowedFields.mediaColored = mediaColoredArray;

//   const newHotel = await Hotel.findByIdAndUpdate(req.params.id, allowedFields, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   });

//   const oldIcons = () => {
//     const array = [];
//     oldHotel.social.forEach((el) => {
//       array.push(el.icon);
//     });
//     oldHotel.socialColored.forEach((el) => {
//       array.push(el.icon);
//     });
//     oldHotel.media.forEach((el) => {
//       array.push(el.icon);
//     });
//     oldHotel.mediaColored.forEach((el) => {
//       array.push(el.icon);
//     });
//     return array;
//   };

//   const newIcons = () => {
//     const array = [];
//     newHotel.social.forEach((el) => {
//       array.push(el.icon);
//     });
//     newHotel.socialColored.forEach((el) => {
//       array.push(el.icon);
//     });
//     newHotel.media.forEach((el) => {
//       array.push(el.icon);
//     });
//     newHotel.mediaColored.forEach((el) => {
//       array.push(el.icon);
//     });
//     return array;
//   };

//   oldIcons().forEach((el) => {
//     if (!newIcons().includes(el)) {
//       filesToDelete.push(el);
//     }
//   });

//   req.fileNames = filesToDelete;

//   next();
// });

// exports.deleteHotel = catchAsync(async (req, res, next) => {
//   const filesToDelete = [];

//   const oldHotel = await Hotel.findById(req.params.id);
//   const hotel = await Hotel.findByIdAndDelete(req.params.id);

//   if (!hotel) {
//     return next(new AppError("No hotel found with that ID", 404));
//   }

//   oldHotel.social.forEach((el) => {
//     filesToDelete.push(el.icon);
//   });
//   oldHotel.socialColored.forEach((el) => {
//     filesToDelete.push(el.icon);
//   });
//   oldHotel.media.forEach((el) => {
//     filesToDelete.push(el.icon);
//   });
//   oldHotel.mediaColored.forEach((el) => {
//     filesToDelete.push(el.icon);
//   });

//   req.fileNames = filesToDelete;

//   next();
// });
