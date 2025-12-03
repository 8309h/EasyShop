const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  getCart,
  addToCart,
  removeFromCart,
} = require("../controllers/cart.controller");

const cartRouter = express.Router();

cartRouter.use(authenticate);

cartRouter.get("/", getCart);
cartRouter.post("/add", addToCart);
cartRouter.delete("/remove/:productId", removeFromCart);

module.exports = { cartRouter };
