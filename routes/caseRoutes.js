const express = require("express");
const caseController = require("../controllers/caseController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(caseController.createCase)
  .get(caseController.getAllUsers);
//   .patch(authController.protect, caseController.resetUsers);

// router
//   .route("/:id")
//   .get(caseController.getUser)
//   .patch(
//     upload.single("profilePicture"),
//     caseController.editUser,
//     deleteFile,
//     authController.getAUser
//   );
//   .delete(
//     authController.protect,
//     authController.restrictTo("Manager"),
//     caseController.deleteUser,
//     caseController.getAllUsers
//   );

module.exports = router;
