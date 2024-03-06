const express = require("express");
const {
  createProduct,
  getAllMenProducts,
  getAllWomenProducts,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller"); 

const {authonticate} = require("../middlewares/authonticate.middlewares")

const productRouter = express.Router();

// Route to create a product
productRouter.post("/create",authonticate,createProduct);

// Route to get all men's products
productRouter.get("/allmenproducts", getAllMenProducts);

// Route to get all women's products
productRouter.get("/allwomenproducts", getAllWomenProducts);

// Route to update a product
productRouter.patch("/update/:id", updateProduct);

// Route to delete a product
productRouter.delete("/delete/:id", deleteProduct);

module.exports = {
  productRouter
};
