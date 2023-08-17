const express = require("express");
const bannerController = require("../controllers/bannerController");
const authController = require("../controllers/authController");
const { upload, deleteFile } = require("../config/multer");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    upload.single("bannerImage"),
    bannerController.createBanner,
    bannerController.getAllBanner
  )
  .get(bannerController.getAllBanner);

router
  .route("/:id")
  .patch(
    authController.protect,
    upload.single("image"),
    bannerController.updateBanner,
    deleteFile,
    bannerController.getAllBanner
  )
  .delete(
    authController.protect,
    // authController.restrictTo("room"),
    bannerController.deleteBanner,
    deleteFile,
    bannerController.getAllBanner
  );

module.exports = router;
