const express = require("express");
const smsController = require("../controllers/smsController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/send-sms", smsController.sendSMS);

router
  .route("/")
  .post(authController.protect, smsController.createSMS, smsController.getSMS)
  .get(smsController.getSMS);

router
  .route("/:id")
  .patch(authController.protect, smsController.updateSMS, smsController.getSMS)
  .delete(smsController.deleteSMS, smsController.getSMS);

module.exports = router;
