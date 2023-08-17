const express = require("express");
const staffController = require("../controllers/staffController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(staffController.createStaff, staffController.getStaff)
  .get(staffController.getStaff);

router
  .route("/:id")
  .patch(
    // authController.protect,
    staffController.updateStaff,
    staffController.getStaff
  )
  .delete(
    authController.protect,
    // authController.restrictTo("room"),
    staffController.deleteStaff,
    staffController.getStaff
  );

module.exports = router;
