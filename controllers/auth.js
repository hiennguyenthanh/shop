const User = require("../models/user");
const crypto = require("crypto");
const { transporter } = require("../utilities/email-sender");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res, next) => {
  const logicalError = req.flash("logicalError");
  const validationError = req.flash("validationError");

  if (validationError.length > 0) {
    return res.send(validationError[0]);
  }
  if (logicalError.length > 0) {
    return res.send(logicalError[0]);
  }
  return res.send("Login page");
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("validationError", errors.array()[0].msg);
    return res.status(401).json({ msg: "Validation failed." });
  }
  User.findOne({ email })
    .then((user) => {
      if (user) {
        if (password.toString() === user.password) {
          req.session.user = user;
          req.session.loggedIn = true;
          return req.session.save(() =>
            res.status(200).json({ msg: "Login successfully." })
          );
        }
        req.flash("logicalError", "wrong password");
        return res.status(401).json({ msg: "Wrong password." });
      }
      // req.session.csrfToken = csrf();
      req.flash("logicalError", "Email not exist");
      return res.status(401).json({ msg: "Email not exist." });
    })
    .then((result) => {})
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    return res.status(200).json({ msg: "Logout successfully." });
  });
};

exports.getSignup = (req, res, next) => {
  const error = req.flash("error");
  const validationErrors = req.flash("validationErrors");
  if (validationErrors.length > 0) {
    return res.send(validationErrors[0]);
  }
  if (error.length > 0) {
    return res.send(error[0]);
  }
  return res.send("Sign up page");
};

exports.postSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("validationErrors", errors.array()[0].msg);
    return res.status(401).json({ msg: "Validation failed." });
  }

  const newUser = new User({ name, email, password });
  return newUser
    .save()
    .then((result) => {
      return res.status(201).json({ msg: "User created." });
    })
    .catch((err) => console.log(err));
};

exports.getReset = (req, res, next) => {
  const logicalError = req.flash("logicalError");
  const validationError = req.flash("validationError");
  const resetMessage = req.flash("resetMessage");

  if (validationError.length > 0) {
    return res.send(validationError[0]);
  }
  if (logicalError.length > 0) {
    return res.send(logicalError[0]);
  }
  if (resetMessage.length > 0) {
    return res.send(resetMessage[0]);
  }

  return res.send("reset page");
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      req.flash("validationError", validationError.array()[0].msg);
      return res.redirect("/reset");
    }
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("logicalError", "Unregistered email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 180000;
        req.flash("resetMessage", "Check your email to reset password");
        return user
          .save()
          .then((result) => res.redirect(`/reset`))
          .catch((err) => console.log(err));
      })
      .then((result) => {
        transporter.sendMail({
          from: "nguyenthanhhienbmt@gmail.com",
          to: "boyforsen@gmail.com",
          subject: "Reset email",
          html: `
          <p>You requested a reset password!</p>
          <p>Click this <a href = "http://localhost:3000/reset/${token}">link</a> to reset password.</p>`,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const error = req.flash("error");
  const validationError = req.flash("validationError");
  if (error.length > 0) {
    return res.send(error[0]);
  }
  if (validationError.length > 0) {
    return res.send(validationError[0]);
  }
  return res.send("Get new password page");
};

exports.postNewPassword = (req, res, next) => {
  const { token } = req.params;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    req.flash("validationError", validationError.array()[0].msg);
    return res.redirect(`/reset/${token}`);
  }

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (user) {
        if (currentPassword.toString() !== user.password) {
          req.flash("error", "Wrong password");
          return res.redirect(`/reset/${token}`);
        }
        if (newPassword !== confirmNewPassword) {
          req.flash("error", "Incorrect confirm password");
          return res.redirect(`/reset/${token}`);
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        return user
          .save()
          .then((result) => res.redirect("/login"))
          .catch((err) => {
            console.log(err);
          });
      }
      req.flash("error", "Non-existed token/Expired token");
      return res.redirect(`/reset/${token}`);
    })
    .then((result) => {})
    .catch((err) => console.error(err));
};
