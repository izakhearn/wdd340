const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */

invCont.buildByVehicleId = async function (req, res, next) {
  const vehicle_id = req.params.vehicleId
  const data = await invModel.getVehicleById(vehicle_id)
  const detail = await utilities.buildVehicleDetail(data)
  let nav = await utilities.getNav()
  res.render("./inventory/detail", {
    title: data[0].inv_make + " " + data[0].inv_model,
    nav,
    detail,
  })
}

/* ***************************
*  Build inventory management view
* ************************** */
invCont.buildManagement = async function (req, res, next) {
  const data = await invModel.getInventoryDatabaseTables()
  const grid = await utilities.buildManagementGrid(data)
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    grid,
    errors: null,
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  if (result) {
    req.flash("notice", "Classification added successfully")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, there was an error adding the classification")
    res.redirect("/inv/add-classification")
  }
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const data = await invModel.getClassifications()
  const classifications = await utilities.buildClassificationDropdown(data)
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classifications,
    errors: null,
  })
}

invCont.addInventory = async function (req, res, next) {
  const { inv_make, inv_model, inv_color, inv_price, classification_id, inv_year, inv_description,inv_miles } = req.body
  const result = await invModel.addInventory(inv_make, inv_model, inv_color, inv_price, classification_id,inv_miles,inv_description,inv_year)
  if (result) {
    req.flash("notice", "Inventory added successfully")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, there was an error adding the inventory")
    res.redirect("/inv/add-inventory")
  }
}

module.exports = invCont