const express = require("express");
const placeController = require("../controllers/placeCountroller");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/country")
  .post(placeController.createCountry)
  .get(placeController.getCountries);

router
  .route("/state")
  .post(placeController.createStates)
  .get(placeController.getStates);

router.route("/lga").get(placeController.getLGAs);

router.route("/:id").patch(placeController.editState);

//   .delete(
//     authController.protect,
//     authController.restrictTo("Manager"),
//     caseController.deleteUser,
//     caseController.getAllUsers
//   );

module.exports = router;
