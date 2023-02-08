const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id, imageUrl: 123 })
    .then((products) => res.send(products))
    .catch((err) => console.log(err));
};
