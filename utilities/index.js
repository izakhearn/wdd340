const invModel = require("../models/inventory-model")
const Util = {}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}



Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt=" '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildVehicleDetail = async function(data){
  let detail
  if(data.length > 0){
    detail = '<div id="detail-display">'
    data.forEach(vehicle => {
     
      detail += '<img src="../..' + vehicle.inv_image + '" alt=" ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />'
       detail += '<div class="detail-content">'
      detail += '<h2>Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</h2>'
      detail += '<h3>Year: ' + vehicle.inv_year + '</h3>'
      detail += '<h3>Mileage: ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</h3>'
      detail += '<h3>Color: ' + vehicle.inv_color + '</h3>'
      detail += '<h3>Classification: ' + vehicle.classification_name + '</h3>'
      detail += '<p>' + vehicle.inv_description + '</p>'
      detail += '</div>'
      detail += '</div>'
    }
    )
  } else {
    detail += '<p class="notice">Sorry, that vehicle could not be found.</p>'
  }
  return detail
}

Util.buildManagementGrid = async function(data){
  let grid
  grid = '<ul id=management-cards>'
  data.forEach(databaseTables => {
    grid += '<li>'
    grid += '<div class="management-card">'
    grid += '<h2>' + capitalizeFirstLetter(databaseTables.table_name) + '</h2>'
    grid += '<img src="/images/site/edit-icon.svg">'
    grid += '<a href="/inv/add-' + databaseTables.table_name + '" title="Add a ' + capitalizeFirstLetter(databaseTables.table_name) + ' table"> Add record to '+capitalizeFirstLetter(databaseTables.table_name)+'</a>'
    grid += '</div>'
    grid += '</li>'
  })
  grid += '</ul>'
  return grid
}

Util.buildClassificationDropdown = async function(data){
  let dropdown
  dropdown = '<select name="classification_id" id="classification_id">'
  data.rows.forEach(row => {
    dropdown += '<option value="' + row.classification_id + '">' + row.classification_name + '</option>'
  })
  dropdown += '</select>'
  return dropdown
}

module.exports = Util
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)