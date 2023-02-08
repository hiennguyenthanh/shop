const router = require("express").Router();
const productController = require("../controllers/product");
const { body } = require("express-validator");

router.get("/", productController.getAllProducts);
// router.get("/:id", productController.getProductById);

router.post(
  "/add",
  [
    body("title").isString().isLength({ min: 3 }),
    body("price").isDecimal(),
    body("description").isLength({ min: 5, max: 400 }),
  ],
  productController.postAddProduct
);

router.post(
  "/edit/:id",
  [
    body("title").isString().isLength({ min: 3 }),
    body("price").isDecimal(),
    body("description").isLength({ min: 5, max: 400 }),
  ],
  productController.postEditProduct
);
router.post("/delete/:id", productController.postDeleteProduct);
router.get("/:id", productController.getProductById);

module.exports = router;
