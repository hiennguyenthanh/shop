const router = require("express").Router();
const adminController = require("../controllers/admin");

router.get("/products", adminController.getProducts);

module.exports = router;
