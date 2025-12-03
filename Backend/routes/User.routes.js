const express = require("express");
const {
  registerUser,
  loginUser,
  updateProfile,
  refreshAccessToken,
  logoutUser,
  getAllUsers,
} = require("../controllers/user.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validation/user.validation");

const userRouter = express.Router();

userRouter.post("/register", validate(registerSchema), registerUser);
userRouter.post("/login", validate(loginSchema), loginUser);

userRouter.patch(
  "/updateprofile",
  authenticate,
  validate(updateProfileSchema),
  updateProfile
);

userRouter.post("/refresh-token", refreshAccessToken);

userRouter.post("/logout", authenticate, logoutUser);

// Admin-only: get all users
userRouter.get("/all", authenticate, authorize(["admin"]), getAllUsers);

module.exports = { userRouter };
