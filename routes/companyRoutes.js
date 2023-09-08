const express = require("express");
const companyController = require("../controllers/companyController");
const authController = require("../controllers/authController");
const { deleteFile, upload } = require("../config/multer");

const router = express.Router();

router
  .route("/")
  .post(companyController.createCompany, companyController.getCompany)
  .get(companyController.getCompany);

router
  .route("/:id")
  .patch(
    authController.protect,
    companyController.updateCompany,
    companyController.getCompany
  );

router.route("/reset").post(companyController.resetCompany);
router.route("/all/settings").get(companyController.getSettings);
router.route("/all/pages").get(companyController.getPages);

module.exports = router;
