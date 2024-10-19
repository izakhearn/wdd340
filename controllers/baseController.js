const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  res.render("index", {title: "Home", nav,tools})
}

module.exports = baseController