const express = require("express");
const transactionController = require("../controllers/transactionController");
const authController = require("../controllers/authController");
const { deleteFile, upload } = require("../config/multer");

const router = express.Router();

// router.post("/send-transaction", transactionController.sendtransaction);
router.post("/order", transactionController.createOrder);

router
  .route("/")
  .post(
    authController.protect,
    transactionController.createTransaction,
    transactionController.getTransactions
  )
  .get(transactionController.getTransactions);

// router
//   .route("/:id")
//   .patch(
//     authController.protect,
//     upload.single("banner"),
//     transactionController.updatetransaction,
//     deleteFile,
//     transactionController.gettransactions
//   )
//   .delete(transactionController.deletetransaction, deleteFile, transactionController.gettransactions);

module.exports = router;
