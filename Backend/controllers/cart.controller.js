const { CartModel } = require("../models/Cart.model");
const { ProductModel } = require("../models/Product.model");

async function getCart(req, res) {
  try {
    const cart = await CartModel.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    res.json(cart || { user: req.user._id, items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching cart" });
  }
}

async function addToCart(req, res) {
  const { productId, quantity = 1 } = req.body;

  try {
    const product = await ProductModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    let cart = await CartModel.findOne({ user: req.user._id });

    if (!cart) {
      cart = new CartModel({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    res.json({ msg: "Item added to cart", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error adding to cart" });
  }
}

async function removeFromCart(req, res) {
  const { productId } = req.params;

  try {
    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.json({ msg: "Item removed from cart", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error removing from cart" });
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};
