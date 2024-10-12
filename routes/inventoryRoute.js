const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildByVehicleId));
router.get("/", utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
 router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

router.post("/add-classification", invValidate.ClassificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));

router.post("/add-inventory", invValidate.InventoryRules(), invValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));



module.exports = router;