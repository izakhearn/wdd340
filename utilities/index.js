const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

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

/* ************************
  * Constructs the header and checks for authentication or not
  ************************** */

Util.getHeaderTools = async function (req, res, next) {
  let header
  if (res.locals.loggedin) {
    header = '<ul id="header-tools">'
    header += '<li><a href="/account/logout" title="Logout of your account">Logout</a></li>'
    header += '<li><a href="/account/" title="View your profile">Welcome '+ res.locals.accountData.account_firstname+'</a></li>'
    header += '</ul>'
  } else {
    header = '<a href="/account/login" title="My Account">My Account</a>'
  }
  return header
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

Util.buildClassificationDropdown = async function(data, selected){
  let dropdown
  dropdown = '<select name="classification_id" id="classification_id">'
  if (selected == null){
    dropdown += '<option value="" selected disabled hidden>Select a Classification</option>'
  }
  data.rows.forEach(row => {
    if(row.classification_id == selected){
      dropdown += '<option value="' + row.classification_id + '" selected>' + row.classification_name + '</option>'
    }
    dropdown += '<option value="' + row.classification_id + '">' + row.classification_name + '</option>'
  })
  dropdown += '</select>'
  return dropdown
}

Util.buildAccountManagementGrid = async function(res){
  let grid
      grid = '<ul id="management-cards">'
  grid += '<li>'
  grid += '<div class="management-card">'
  grid += '<h2>Update Account Information</h2>'
  grid += '<img src="/images/site/edit-icon.svg">'
  grid += '<a href="/account/update/'+res.locals.accountData.account_id+'" title="Update Account Information">Update Account Information</a>'
  grid += '</div>'
  grid += '</li>'

  if (res.locals.management){
    grid += '<li>'
    grid += '<div class="management-card">'
    grid += '<h2>Manage Inventory</h2>'
    grid += '<img src="/images/site/edit-icon.svg">'
    grid += '<a href="/inv/" title="Manage Inventory">Manage Inventory</a>'
    grid += '</div>'
    grid += '</li>'
    if (res.locals.admin){
      grid += '<li>'
      grid += '<div class="management-card">'
      grid += '<h2>Manage Users</h2>'
      grid += '<img src="/images/site/edit-icon.svg">'
      grid += '<a href="/account/manage-users" title="Manage Users">Manage Users</a>'
      grid += '</div>'
      grid += '</li>'
  }
  }
    grid += '</ul>'
  return grid
}

Util.buildUserManagementGrid = async function(data){
  let table 
  table = '<table>'
  table += '<thead>'
  table += '<tr>'
  table += '<th>First Name</th>'
  table += '<th>Last Name</th>'
  table += '<th>Email</th>'
  table += '<th>Account Type</th>'
  table += '<th>Actions</th>'
  table += '</tr>'
  table += '</thead>'
  table += '<tbody>'
  data.forEach(row => {
    table += '<tr>'
    table += '<td>' + row.account_firstname + '</td>'
    table += '<td>' + row.account_lastname + '</td>'
    table += '<td>' + row.account_email + '</td>'
    table += '<td>' + row.account_type + '</td>'
    table += '<td>'
    table += '<a href="/account/update/' + row.account_id + '" title="Update ' + row.account_firstname + ' ' + row.account_lastname + ' account information">Update</a>'
    table += '<a href="/account/delete/' + row.account_id + '" title="Delete ' + row.account_firstname + ' ' + row.account_lastname + ' account">Delete</a>'
    table += '</td>'
    table += '</tr>'
  })
  table += '</tbody>'
  table += '</table>'
  return table
}

Util.buildUserManagementGridMobile = async function(data){
  let table 
  table = '<ul id="management-cards">'
  data.forEach(row => {
    table += '<li>'
    table += '<div class="management-card">'
    table +='<table>'
    table += '<tr>'
    table += '<th>First Name:</th>'
    table += '<td>' + row.account_firstname + '</td>'
    table += '</tr>'
    table += '<tr>'
    table += '<th>Last Name:</th>'
    table += '<td>' + row.account_lastname + '</td>'
    table += '</tr>'
    table += '<tr>'
    table += '<th>Email:</th>'
    table += '<td>' + row.account_email + '</td>'
    table += '</tr>'
    table += '<tr>'
    table += '<th>Account Type:</th>'
    table += '<td>' + row.account_type + '</td>'
    table += '</tr>'
    table += '</table>'
    table += '<a href="/account/update/' + row.account_id + '" title="Update ' + row.account_firstname + ' ' + row.account_lastname + ' account information">Update</a>'
    table += '<a href="/account/delete/' + row.account_id + '" title="Delete ' + row.account_firstname + ' ' + row.account_lastname + ' account">Delete</a>'
    table += '</div>'
    table += '</li>'
  }
  )
  table += '</ul>'
  return table
}

Util.buildAccountTypeForm = async function(account_id,selected){
  let form
  form = '<div class="form">'
  form += '<h2>Update Account Type</h2>'
  form += '<form action="/account/update-type/' + account_id + '" method="post">'
  form += '<div class="form-group">'
  form += '<label for="account_type">Account Type:</label>'
  form += '<select name="account_type" id="account_type">'
  if(selected == "Admin"){
    form += '<option value="Admin" selected>Admin</option>'
  } else {
    form += '<option value="Admin">Admin</option>'
  }
  if(selected == "Employee"){
    form += '<option value="Employee" selected>Employee</option>'
  } else {
    form += '<option value="Employee">Employee</option>'
  }
  if(selected == "Client"){
    form += '<option value="Client" selected>Client</option>'
  } else {
    form += '<option value="Client">Client</option>'
  }
  form += '</select>'
  form += '</div>'
  form +='<button type="submit">Update Account Type</button>'
  form += '</form>'
  form += '</div>'
  return form
}



  
/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     if (res.locals.accountData.account_type =="Admin" || res.locals.accountData.account_type =="Employee")  {
      res.locals.management = 1
      if (res.locals.accountData.account_type =="Admin")  {
        res.locals.admin = 1
      }
    }
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 Util.checkAuthorization = (req, res, next) => {
  if (res.locals.accountData.account_type =="Admin" || res.locals.accountData.account_type =="Employee")  {
    next()
  } else {
    req.flash("notice", "You are not authorized to view this page.")
    return res.redirect("/")
  }
 }
module.exports = Util
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)