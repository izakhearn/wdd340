const utilities = require(".");
const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const validate = {};

validate.ClassificationRules = () => {
  return [
    body("classification_name")
      .isLength({ min: 2 })
      .withMessage("Field must be more than 1 character long")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Field must not contain spaces or special characters")
      .custom(async (classification_name) => {
        const classificationExists =
          await inventoryModel.checkClassificationExists(classification_name);
        if (classificationExists) {
          throw new Error(
            "Classification exists. Please use a different classification name"
          );
        }
      }),
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    });
    return;
  }
  next();
};

validate.InventoryRules = () => {
  return [
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be greater than or equal to 0"),
    body("inv_make")
      .isLength({ min: 2 })
      .withMessage("Field must be more than 1 character long")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Field must not contain spaces or special characters"),
    body("inv_model")
      .isLength({ min: 2 })
      .withMessage("Field must be more than 1 character long")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Field must not contain spaces or special characters"),
    body("inv_color")
      .isLength({ min: 2 })
      .withMessage("Field must be more than 1 character long")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Field must not contain spaces or special characters"),
    body("inv_price")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be greater than $0.00"),
    body("classification_id")
      .isInt({ min: 1 })
      .withMessage("Classification ID must be greater than 0"),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model,inv_miles, inv_color, inv_price, classification_id,inv_year, inv_description } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let data = await inventoryModel.getClassifications();
    let classifications = await utilities.buildClassificationDropdown(data);
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors,
      inv_description,
      inv_year,
      inv_miles,
      inv_make,
      inv_model,
      inv_color,
      inv_price,
      classification_id,
      classifications,
    });
    return;
  }
  next();
};

module.exports = validate;
