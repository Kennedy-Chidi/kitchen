const express = require("express");
const promoController = require("../controllers/promoController");
const authController = require("../controllers/authController");
const { deleteFile, upload } = require("../config/multer");

const router = express.Router();

// router
//   .route("/delete-promo")
//   .patch(
//     authController.protect,
//     productController.deletePromos,
//     deleteFile,
//     productController.getProducts
//   );

router
  .route("/")
  .post(
    upload.single("promoBanner"),
    authController.protect,
    promoController.createPromotion,
    promoController.getPromotions
  )
  .get(promoController.getPromotions);

//   .patch(
//     authController.protect,
//     productController.deleteProducts,
//     deleteFile,
//     productController.getProducts
//   )

router
  .route("/:id")
  .patch(
    authController.protect,
    upload.single("promoBanner"),
    promoController.updatePromo,
    deleteFile,
    promoController.getPromotions
  );
//   .get(productController.getAProduct)
//   .delete(
//     authController.protect,
//     // authController.restrictTo("room"),
//     productController.deleteProduct,
//     deleteFile,
//     productController.getProducts
//   );

module.exports = router;
