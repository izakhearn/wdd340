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
  const tools = await utilities.getHeaderTools(req, res)
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    tools,
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
  const tools = await utilities.getHeaderTools(req, res)
  res.render("./inventory/detail", {
    title: data[0].inv_make + " " + data[0].inv_model,
    nav,
    tools,
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
  let classificationList = await invModel.getClassifications()
  const classificationSelect = await utilities.buildClassificationDropdown(classificationList)
  const tools = await utilities.getHeaderTools(req, res)
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    tools,
    classificationSelect,
    grid,
    errors: null,
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    tools,
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
  const tools = await utilities.getHeaderTools(req, res)
  const classifications = await utilities.buildClassificationDropdown(data)
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    tools,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  let itemData = await invModel.getVehicleById(inv_id)
  itemData = itemData[0]
  const classificationList = await invModel.getClassifications()
  const classificationSelect = await utilities.buildClassificationDropdown(classificationList, itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    tools,
    classifications: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const ClassificationList = await invModel.getClassifications()
    const classificationSelect = await utilities.buildClassificationList(ClassificationList, classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    tools,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  let itemData = await invModel.getVehicleById(inv_id)
  itemData = itemData[0]
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirmation", {
    title: "Delete " + itemName,
    nav,
    tools,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const result = await invModel.deleteInventory(inv_id)
  if (result) {
    req.flash("notice", "Inventory deleted successfully")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, there was an error deleting the inventory")
    let nav = await utilities.getNav()
    const tools = await utilities.getHeaderTools(req, res)
    let itemData = await invModel.getVehicleById(inv_id)
    itemData = itemData[0]
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirmation", {
      title: "Delete " + itemName,
      nav,
      tools,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  }
}
module.exports = invCont