const express = require("express");
const termsController = require("../controllers/termsController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    termsController.createTerms,
    termsController.getTerms
  )
  .get(termsController.getTerms);

router
  .route("/:id")
  .patch(
    authController.protect,
    termsController.updateTerms,
    termsController.getTerms
  )
  .delete(
    authController.protect,
    // authController.restrictTo("room"),
    termsController.deleteTerms,
    termsController.getTerms
  );

module.exports = router;
