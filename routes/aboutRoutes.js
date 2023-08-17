const express = require("express");
const aboutController = require("../controllers/aboutController");
const authController = require("../controllers/authController");
const { upload, deleteFile } = require("../config/multer");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    upload.fields([
      { name: "certificate", maxCount: 1 },
      { name: "video", maxCount: 1 },
    ]),
    aboutController.createAbout,
    aboutController.getAbout
  )
  .get(aboutController.getAbout);

router.route("/:id").patch(
  authController.protect,
  upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  aboutController.updateAbout,
  deleteFile,
  aboutController.getAbout
);

module.exports = router;
