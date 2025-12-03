const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validation/product.validation");

const productRouter = express.Router();

// Public
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);

// Admin: create/update/delete
productRouter.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validate(createProductSchema),
  createProduct
);

productRouter.patch(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validate(updateProductSchema),
  updateProduct
);

productRouter.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  deleteProduct
);

module.exports = { productRouter };
