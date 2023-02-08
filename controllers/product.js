const Product = require("../models/product");
const { validationResult } = require("express-validator");
const { fileHelper } = require("../utilities/delete-file");
const ITEMS_PER_PAGE = 5;

exports.getAllProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then((products) => res.send(products))
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductById = (req, res, next) => {
  Product.findById(req.params.id)
    .then((product) => res.send(product))
    .catch((err) => {
      res.send("Product not found!");
    });
};

//validation is falsy, infinite redirect when validation fails
exports.postAddProduct = async (req, res, next) => {
  const { title, description, price } = req.body;
  const image = req.file; // return an object {fieldName, originalName, encoding, mimetype, buffer}

  const errors = validationResult(req);
  if (!errors.isEmpty() || !image) {
    return res.status(400).json({ msg: "Bad request" });
  }

  try {
    const product = await Product.create({
      title,
      description,
      imageUrl: image.path,
      price,
      userId: req.user._id,
      //or: req.user (mongoose automatically picks id)
    });
    await product.save();
    return res.status(201).json({ msg: "Product created!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Fail to create product." });
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { title, description, price } = req.body;
  const image = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: "Invalid input" });
  }

  const product = await Product.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  product.title = title;
  product.description = description;
  product.price = price;
  if (image) {
    product.imageUrl = image.path;
  }
  await product.save();
  return res.status(200).json({ msg: "Edited." });
};

exports.postDeleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ msg: "Product not found." });
  }
  if (product.userId.toString() !== req.user._id.toString()) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  await product.remove();
  fileHelper(product.imageUrl);
  res.status(200).json({ msg: "Product deleted." });
};
