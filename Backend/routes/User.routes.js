const express = require("express");
const {
    registerUser,
    loginUser,
    updateProfile,
    refreshAccessToken,
    logoutUser
} = require("../controllers/user.controller"); 

const userRouter = express.Router();

// Route to register a new user
userRouter.post("/register", registerUser);

// Route to login
userRouter.post("/login", loginUser);

// Route to update user profile
userRouter.patch("/updateprofile", updateProfile);

// Route to refresh access token
userRouter.post("/refresh-token", refreshAccessToken);

// Route to logout
userRouter.post("/logout", logoutUser);

module.exports = {
    userRouter
};
