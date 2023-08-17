const express = require("express");
const partnerController = require("../controllers/partnerController");
const authController = require("../controllers/authController");
const { deleteFile, upload } = require("../config/multer");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    upload.single("image"),
    partnerController.createPartner,
    partnerController.getPartners
  )
  .get(partnerController.getPartners);

router
  .route("/:id")
  .patch(
    authController.protect,
    upload.single("image"),
    partnerController.updatePartner,
    deleteFile,
    partnerController.getPartners
  )
  .delete(
    partnerController.deletePartner,
    deleteFile,
    partnerController.getPartners
  );

module.exports = router;
