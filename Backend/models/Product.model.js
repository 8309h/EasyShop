const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
// ADD THIS FOR SEARCH TO WORK
productSchema.index({
  title: "text",
  description: "text",
  category: "text"
});


productSchema.index({ title: "text", description: "text" });

const ProductModel = mongoose.model("Product", productSchema);
module.exports = { ProductModel };

