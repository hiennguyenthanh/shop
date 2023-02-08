const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const { dirname } = require("path");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      res.send(user.cart.items);
    })
    .catch((error) => res.send(error));
};

exports.postCart = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ msg: "Product not found." });
  }

  await req.user.addToCart(product);
  return res.status(200).json({ msg: "Product added." });
};

exports.deleteCartItem = (req, res, next) => {
  Product.findById(req.params.id)
    .then((prod) => {
      return req.user.deleteCartItem(prod);
    })
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => res.send(orders))
    .catch((error) => res.send(error));
};

exports.postOrder = async (req, res, next) => {
  const user = await req.user.populate("cart.items.productId");
  console.log(user.cart.items);
  const products = user.cart.items.map((item) => {
    return { quantity: item.quantity, product: { ...item.productId } };
  });

  const order = new Order({
    products,
    user: {
      userId: user.id,
      email: user.email,
    },
  });
  user.clearCart();
  await order.save();
  return res.status(201).json({ msg: "Order created" });
};

exports.viewOrder = async (req, res, next) => {
  const orderId = req.params.id;
  let order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ msg: "Order not found." });
  }
  if (order.user.userId.toString() !== req.user._id.toString()) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const invoiceName = "invoice-" + orderId + ".pdf";
  const p = path.join(dirname(__dirname), "data", "invoices", invoiceName);
  // order = order.populate("products.product._id");
  // console.log(order);
  const pdfDoc = new PDFDocument();

  pdfDoc.pipe(fs.createWriteStream(p));
  pdfDoc.pipe(res);

  pdfDoc.fontSize(16).text(`Invoice no.${orderId}`, {
    underline: true,
  });
  let totalPrice = 0;
  order.products.forEach((item) => {
    console.log(item);
    totalPrice += item.product.price * item.quantity;
    pdfDoc.text(
      `${item.product.title}: ${item.quantity} x ${item.product.price}$ `
    );
  });
  pdfDoc.text(`Total: ${totalPrice}$`);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename = '${invoiceName}'`);
  return pdfDoc.end();
  //use stream for bigger file: read data chunk  by chunk
  // const file = fs.createReadStream(p);
  // file.pipe(res);
};
