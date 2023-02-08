const nodemailer = require("nodemailer");

module.exports = {
  transporter: nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nguyenthanhhienbmt@gmail.com",
      pass: "hljxfsjicntvotgl",
    },
  }),
};
