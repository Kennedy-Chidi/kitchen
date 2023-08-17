const express = require("express");
const faqController = require("../controllers/faqController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(authController.protect, faqController.createFAQ, faqController.getFAQ)
  .get(faqController.getFAQ);

router
  .route("/:id")
  .patch(authController.protect, faqController.updateFAQ, faqController.getFAQ)
  .delete(
    authController.protect,
    // authController.restrictTo("room"),
    faqController.deleteFAQ,
    faqController.getFAQ
  );

module.exports = router;
