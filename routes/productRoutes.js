const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const { deleteFile, upload } = require("../config/multer");

const router = express.Router();

router
  .route("/delete-promo")
  .patch(
    authController.protect,
    productController.deletePromos,
    deleteFile,
    productController.getProducts
  );

router
  .route("/")
  .post(
    // authController.protect,
    upload.fields([
      { name: "productImages", maxCount: 10 },
      { name: "productImage", maxCount: 1 },
    ]),
    authController.protect,
    productController.createProduct,
    productController.getProducts
  )
  .patch(
    authController.protect,
    productController.deleteProducts,
    deleteFile,
    productController.getProducts
  )

  .get(productController.getProducts);

router
  .route("/:id")
  .patch(
    // authController.protect,
    upload.fields([
      { name: "productImages", maxCount: 10 },
      { name: "productImage", maxCount: 1 },
      { name: "promoBanner", maxCount: 1 },
    ]),
    productController.updateProduct,
    deleteFile,
    productController.getProducts
  )
  .get(productController.getAProduct)
  .delete(
    authController.protect,
    // authController.restrictTo("room"),
    productController.deleteProduct,
    deleteFile,
    productController.getProducts
  );

//   .get(productController.getAnItem);

module.exports = router;
