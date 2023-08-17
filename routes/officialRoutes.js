const express = require("express");
const officialController = require("../controllers/officialController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    officialController.createOfficial,
    officialController.getAllUsers
  )
  .get(authController.protect, officialController.getOfficials);

router.route("/:id").patch(
  authController.protect,

  officialController.updateOfficial,
  officialController.getOfficials
);

module.exports = router;
