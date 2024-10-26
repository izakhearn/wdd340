const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const tools = await utilities.getHeaderTools(req, res)
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      tools,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

validate.accountUpdateRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        // Get account_id from req.body or wherever it's stored
        const account_id = req.body.account_id;

        // Check if email exists, but allow the current user to keep their own email
        const emailExists = await accountModel.checkExistingEmailIfChanged(
          account_email,
          account_id
        );

        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),
  ];
};

validate.accountPasswordRules = () => {
  return [
    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};


validate.checkAccountData = async (req, res, next) => {
  const {account_id, account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const tools = await utilities.getHeaderTools(req, res)
    res.render("account/edit-account", {
      errors,
      title: "Update Account Information ",
      nav,
      tools,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
    return;
  }
  next();
};

validate.checkAccountPasswordData = async (req, res, next) => {
  let errors = [];
  const { account_id,account_password } = req.body;
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);
    const tools = await utilities.getHeaderTools(req, res)
    res.render("account/edit-account", {
      errors,
      title: "Update Account Information ",
      nav,
      tools,
      account_email : accountData.account_email,
      account_firstname : accountData.account_firstname,
      account_lastname : accountData.account_lastname,
      account_id,
    });
    return;
  }
  next();
}

validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist in the DB
      body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required."),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ];
  };

  validate.checkLoginData = async (req, res, next) => {
    const { account_email, } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      const tools = await utilities.getHeaderTools(req, res)
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        tools,
        account_email,
      });
      return;
    }
    next();
  };

  validate.accountTypeRules = () => {
    return [
      // account_type is required and must be string
      body("account_type")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide an account type."), // on error this message is sent.
    ];
  };

  validate.checkAccountTypeData = async (req, res, next) => {
    const { account_type } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      const tools = await utilities.getHeaderTools(req, res)
      res.render("account/edit-account", {
        errors,
        title: "Update Account Information ",
        nav,
        tools,
        account_type,
      });
      return;
    }
    next();
  };
  
module.exports = validate;
