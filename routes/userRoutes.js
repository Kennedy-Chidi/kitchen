const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { deleteFile, upload } = require("../config/multer");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.route("/get-user").get(authController.getAUser);
router
  .route("/update-me")
  .patch(
    upload.single("profilePicture"),
    authController.protect,
    authController.updateMe,
    authController.getAUser
  );
router.post("/forgotten-password", authController.forgotPassword);
router.post("/subscribe", userController.subscribe);
router.post("/message", userController.message);
router.post("/reset-password/:token", authController.resetPassword);
router.patch(
  "/update-user/:id",
  userController.editUser,
  userController.getAllUsers
);
router.patch(
  "/update-password",
  authController.protect,
  authController.updatePassword
);

router
  .route("/application")
  .post(
    upload.fields([
      { name: "passport", limit: 2 },
      { name: "document", limit: 2 },
    ]),
    userController.createApplication
  )
  .get(userController.getApplications);

router
  .route("/application/:id")
  .patch(
    upload.fields([
      { name: "passport", limit: 2 },
      { name: "document", limit: 2 },
    ]),
    userController.updateApplication,
    deleteFile,
    userController.getApplication
  )
  .get(userController.getApplication);

router.post(
  "/delete-users",
  userController.deleteUsers,
  userController.getAllUsers
);
router.route("/").get(userController.getAllUsers);
//   .patch(authController.protect, userController.resetUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(
    authController.protect,
    upload.single("profilePicture"),
    userController.editUser,
    deleteFile,
    authController.getAUser
  );
//   .delete(
//     authController.protect,
//     authController.restrictTo("Manager"),
//     userController.deleteUser,
//     userController.getAllUsers
//   );

router.route("/all/store").post(userController.getAllInitials);

router.route("/get-notice/notices").get(userController.getNotice);

module.exports = router;
