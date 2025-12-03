const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    address: { type: String },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = { UserModel };
