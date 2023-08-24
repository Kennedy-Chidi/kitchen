const express = require("express");
const companyController = require("../controllers/companyController");
const authController = require("../controllers/authController");
const { deleteFile, upload } = require("../config/multer");

const router = express.Router();

router
  .route("/")
  .post(
    upload.fields([
      { name: "mediaIcon", maxCount: 10 },
      { name: "coloredMediaIcon", maxCount: 10 },
      { name: "contactIcon", maxCount: 10 },
      { name: "coloredContactIcon", maxCount: 10 },
    ]),
    companyController.createCompany,
    companyController.getCompany
  )
  .get(companyController.getCompany);

router.route("/:id").patch(
  // authController.protect,
  upload.fields([
    { name: "mediaIcon", maxCount: 10 },
    { name: "coloredMediaIcon", maxCount: 10 },
    { name: "contactIcon", maxCount: 10 },
    { name: "coloredContactIcon", maxCount: 10 },
  ]),
  companyController.updateCompany,
  deleteFile,
  companyController.getCompany
);

router.route("/reset").post(companyController.resetCompany);
router.route("/all/settings").get(companyController.getSettings);

module.exports = router;
