const fs = require("fs");

exports.fileHelper = (filePath) => {
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
