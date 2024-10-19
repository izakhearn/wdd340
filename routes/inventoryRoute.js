const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);
router.get(
  "/detail/:vehicleId",
  utilities.handleErrors(invController.buildByVehicleId)
);
router.get(
  "/",
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildManagement)
);
router.get(
  "/add-classification",
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildAddClassification)
);
router.get(
  "/add-inventory",
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildAddInventory)
);

router.post(
  "/add-classification",
  invValidate.ClassificationRules(),
  invValidate.checkClassificationData,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.addClassification)
);

router.post(
  "/add-inventory",
  invValidate.InventoryRules(),
  invValidate.checkInventoryData,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.addInventory)
);

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);
router.get(
  "/edit/:inv_id",
  utilities.checkAuthorization,
  utilities.handleErrors(invController.editInventoryView)
);
router.post(
  "/update/",
  invValidate.InventoryRules(),
  invValidate.checkUpdateData,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.updateInventory)
);

router.get(
  "/delete/:inv_id",
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildDeleteInventory)
);
router.post(
  "/delete/",
  utilities.checkAuthorization,
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;
