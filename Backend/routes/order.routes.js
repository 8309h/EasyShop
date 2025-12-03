const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  createOrder,
  getUserOrders,
} = require("../controllers/order.controller");

const orderRouter = express.Router();

orderRouter.use(authenticate);

orderRouter.post("/create", createOrder);
orderRouter.get("/history", getUserOrders);

module.exports = { orderRouter };
