const { CartModel } = require("../models/Cart.model");
const { OrderModel } = require("../models/Order.model");

// Create new order from cart
async function createOrder(req, res) {
  try {
    const userId = req.user._id;

    const cart = await CartModel.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Your cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0
    );

    const order = new OrderModel({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "pending",
    });

    await order.save();

    cart.items = [];
    await cart.save();

    res.status(201).json({
      msg: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ msg: "Error placing order" });
  }
}

// Order History for logged-in user
async function getUserOrders(req, res) {
  try {
    const userId = req.user._id;

    const orders = await OrderModel.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      msg: "Order history fetched",
      orders,
    });
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ msg: "Error fetching order history" });
  }
}

module.exports = {
  createOrder,
  getUserOrders,
};
