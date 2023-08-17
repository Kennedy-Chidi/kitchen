const express = require("express");
const salesController = require("../controllers/salesController");
const itemController = require("../controllers/productController");
const authController = require("../controllers/authController");

const router = express.Router();

// router
//   .route("/sales-categories")
//   .get(authController.protect, salesController.getSalesCategory);

// router
//   .route("/")
//   .post(salesController.createSale, itemController.getAllItem)
//   .get(
//     // authController.protect,
//     salesController.getAllSales
//   );
// //   .delete(authController.protect, salesController.deleteAllSales);

// router.route("/:id").delete(
//   // authController.protect,
//   // authController.restrictTo("room"),
//   salesController.deleteSales,
//   salesController.getAllSales
// );
//   .patch(authController.protect, salesController.updateSales);
module.exports = router;
