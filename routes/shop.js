const router = require("express").Router();
const shopController = require("../controllers/shop");

router.get("/cart", shopController.getCart);
router.post("/add-to-cart/:id", shopController.postCart);
router.post("/delete-from-cart/:id", shopController.deleteCartItem);
router.get("/order", shopController.getOrders);
router.post("/order", shopController.postOrder);
router.get("/order/:id", shopController.viewOrder);

module.exports = router;
