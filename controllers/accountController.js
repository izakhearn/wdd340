const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    const tools = await utilities.getHeaderTools(req, res)
    res.render("account/login", {
      title: "Login",
      nav,
      tools,
      errors: null
    })
  }

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    const tools = await utilities.getHeaderTools(req, res)
    res.render("account/register", {
      title: "Register",
      nav,
      tools,
      errors: null
    })
  }

 /* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  let tools = await utilities.getHeaderTools(req, res)
  const { account_firstname, account_lastname, account_email, account_password } = req.body
// Hash the password before storing
let hashedPassword
try {
  // regular password and cost (salt is generated automatically)
  hashedPassword = await bcrypt.hashSync(account_password, 10)
} catch (error) {
  req.flash("notice", 'Sorry, there was an error processing the registration.')
  res.status(500).render("account/register", {
    title: "Registration",
    nav,
    tools,
    errors: null,
  })
}
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      tools,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      tools,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  let tools = await utilities.getHeaderTools(req, res)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    tools,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
   else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        tools,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

 async function buildManagement(req, res){
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(res.locals.accountData.account_id)
    res.locals.accountData.account_firstname = accountData.account_firstname
    const tools = await utilities.getHeaderTools(req, res)
    let grid = await utilities.buildAccountManagementGrid(res)
    res.render("account/management", {
      title: "Account Management",
      nav,
      tools,
      name: accountData.account_firstname,
      grid,
      errors: null
    })
  
 }

 async function logout(req, res){
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

async function buildUpdateAccount(req, res){
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  const accountData = await accountModel.getAccountById(req.params.id)
  let typeForm = await utilities.buildAccountTypeForm(req.params.id,accountData.account_type)
    if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    tools,
    errors: null,
    account_email,
    })
  return
  }
  res.render("account/edit-account", {
    title: "Update Account Information",
    nav,
    tools,
    account_email : accountData.account_email,
    account_firstname : accountData.account_firstname,
    account_lastname : accountData.account_lastname,
    account_id: req.params.id,
    typeForm,
    errors: null
  })
}

async function updateAccount(req, res){
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
  if (result) {
    req.flash("notice", "Account updated successfully")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, there was an error updating the account")
    res.redirect("/account/update/"+account_id)
  }
}

async function updateAccountPassword(req, res){
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  const { account_id, account_password } = req.body
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    const accountData = await accountModel.getAccountById(account_id)
    res.status(500).render("account/edit-account/"+account_id, {
      title: "Update Account Information ",
      nav,
      tools,
      account_firstname : accountData.account_firstname,
      account_lastname : accountData.account_lastname,
      account_email : accountData.account_email,
      account_id,
      errors: null,
    })
  }
  const result = await accountModel.updateAccountPassword(account_id, hashedPassword)
  if (result) {
    req.flash("notice", "Password Changed successfully")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, there was an error updating the account")
    res.redirect("/account/update/"+account_id)
  }
}

async function buildManageUsers(req, res){
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  const data = await accountModel.getAllAccounts()
  let table = await utilities.buildUserManagementGrid(data)
  let tableMobile = await utilities.buildUserManagementGridMobile(data)
  res.render("account/manage-users", {
    title: "Manage Users",
    nav,
    tools,
    table,
    tableMobile,
    errors: null
  })
  
}

// Delete Account View

async function buildDeleteAccount(req, res){
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  const account_id  = req.params.id
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/delete-confirmation", {
    title: "Delete Account",
    nav,
    tools,
    account_id,
    account_firstname : accountData.account_firstname,
    account_lastname : accountData.account_lastname,
    account_email : accountData.account_email,
    errors: null
  })
}

async function deleteAccount(req, res){
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  const { account_id } = req.body
  const result = await accountModel.deleteAccount(account_id)
  if (result) {
    req.flash("notice", "Account deleted successfully")
    res.redirect("/account/manage-users")
  } else {
    req.flash("notice", "Sorry, there was an error deleting the account")
    res.redirect("/account/manage-users")
  }
}

async function updateType(req, res){
  let nav = await utilities.getNav()
  const tools = await utilities.getHeaderTools(req, res)
  const {  account_type } = req.body
  account_id = req.params.id
  const result = await accountModel.updateType(account_id, account_type)
  if (result) {
    req.flash("notice", "Account Type updated successfully")
    res.redirect("/account/manage-users")
  } else {
    req.flash("notice", "Sorry, there was an error updating the account")
    res.redirect("/account/manage-users")
  }
}


  module.exports = { buildLogin, buildRegister, registerAccount,accountLogin, buildManagement, logout, buildUpdateAccount, updateAccount, updateAccountPassword, buildManageUsers, buildDeleteAccount, deleteAccount, updateType };