const express = require("express");
const emailController = require("../controllers/emailController");
const authController = require("../controllers/authController");
const { deleteFile, upload } = require("../config/multer");

const router = express.Router();

router.post("/send-email", emailController.sendEmail);

router
  .route("/")
  .post(
    // authController.protect,
    upload.single("banner"),
    emailController.createEmail,
    emailController.getEmails
  )
  .get(emailController.getEmails);

router
  .route("/:id")
  .patch(
    // authController.protect,
    upload.single("banner"),
    emailController.updateEmail,
    deleteFile,
    emailController.getEmails
  )
  .delete(emailController.deleteEmail, deleteFile, emailController.getEmails);

module.exports = router;
