const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");


router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
router.get("/",utilities.checkLogin,utilities.handleErrors(accountController.buildManagement))
//Post Requests
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get("/logout", accountController.logout);

router.get("/update/:id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount));
router.post("/update/:id",regValidate.accountUpdateRules(),regValidate.checkAccountData, utilities.checkLogin, utilities.handleErrors(accountController.updateAccount));
router.post("/change-password/:id",regValidate.accountPasswordRules(),regValidate.checkAccountPasswordData, utilities.checkLogin, utilities.handleErrors(accountController.updateAccountPassword));
router.post("/delete/:id",utilities.checkAuthorization, utilities.handleErrors(accountController.deleteAccount));
router.get("/delete/:id",utilities.checkAuthorization, utilities.handleErrors(accountController.buildDeleteAccount));
router.post("/update-type/:id",regValidate.accountTypeRules(),regValidate.checkAccountTypeData,utilities.checkAuthorization, utilities.handleErrors(accountController.updateType));

router.get("/manage-users",utilities.checkAuthorization, utilities.handleErrors(accountController.buildManageUsers));

module.exports = router;
