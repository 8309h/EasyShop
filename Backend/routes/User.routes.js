const express = require("express");
const { UserModel } = require("../models/User.models");
const { BlacklistTokenModel } = require("../models/Blacklist.models");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
    const { name, email, password, address } = req.body;
    try {
        const findEmail = await UserModel.findOne({ email });
        if (findEmail) {
            return res.status(400).json({"msg": "User already exists. Please login" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, email, password: hashedPassword, address });
        await newUser.save();
        res.status(201).json({ "msg": "New user registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "msg": "Something went wrong" });
    }
});

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ "msg": "Email not found" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ "msg": "Incorrect password" });
        }
        const token = jwt.sign({ userID: user._id }, 'masai', { expiresIn: '1h' });
        res.json({ "msg": "Login successful", "token": token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "msg": "Something went wrong" });
    }
});

userRouter.put("/updateprofile", async (req, res) => {
    const { userID, name, email, password, address } = req.body;
    try {
        const user = await UserModel.findById(userID);
        if (!user) {
            return res.status(404).json({ "msg": "User not found" });
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.address = address || user.address;
        await user.save();
        res.json({ "msg": "User profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "msg": "Something went wrong" });
    }
});

userRouter.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;
    const newToken = jwt.sign({ userID: "someUserID" }, 'masai', { expiresIn: '1h' });
    res.json({ "token": newToken });
});

userRouter.post("/logout", async (req, res) => {
    const { token } = req.body;
    try {
        const isTokenBlacklisted = await BlacklistTokenModel.exists({ token });
        if (isTokenBlacklisted) {
            return res.status(401).json({ "msg": "Token is already blacklisted" });
        }
        await new BlacklistTokenModel({ token }).save();
        res.json({ "msg": "Logout successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "msg": "Something went wrong" });
    }
});

module.exports = {
    userRouter
};
