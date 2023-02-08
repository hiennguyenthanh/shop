const router = require("express").Router();
const authController = require("../controllers/auth");
const { body } = require("express-validator");
const User = require("../models/user");

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password", "Invalid Password")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);
router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value) => {
        User.findOne({ email: value })
          .then((user) => {
            if (user) return Promise.reject("This email is used");
          })
          .catch((err) => console.log(err));
      })
      .trim(),
    body(
      "password",
      "Password must have more than 5 characters and only contains number and no special character"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Incorrect confirm password");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);
router.post(
  "/reset",
  body("email", "Please enter a valid email").isEmail(),
  authController.postReset
);

router.get("/reset/:token", authController.getNewPassword);
router.post(
  "/reset/:token",
  body(
    "newPassword",
    "Password must have more than 5 characters and only contains number and no special character"
  )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
  authController.postNewPassword
);

module.exports = router;
