const express = require("express");
const notificationController = require("../controllers/notificationController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/send-notifications", notificationController.sendNotifications);
router.get("/user-messages", notificationController.getNotices);
// router.get("/messages", notificationController.getMessages);

router
  .route("/")
  .post(
    authController.protect,
    notificationController.createNotification,
    notificationController.getNotifications
  )
  .get(notificationController.getNotifications);

router
  .route("/:id")
  .patch(
    authController.protect,
    notificationController.updateNotification,
    notificationController.getNotifications
  )
  .delete(
    notificationController.deleteNotification,
    notificationController.getNotifications
  );

module.exports = router;
