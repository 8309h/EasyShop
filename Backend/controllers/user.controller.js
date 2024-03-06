const { UserModel } = require("../models/User.models");
const { BlacklistTokenModel } = require("../models/Blacklist.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function registerUser(req, res) {
    const { name, email, password, address } = req.body;
    try {
        const findEmail = await UserModel.findOne({ email });
        if (findEmail) {
            return res.status(400).json({ "msg": "User already exists. Please login" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, email, password: hashedPassword, address });
        await newUser.save();
        res.status(201).json({ "msg": "New user registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "msg": "Something went wrong" });
    }
}

async function loginUser(req, res) {
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
        const refreshToken = jwt.sign({ userID: user._id }, 'refreshmasai', { expiresIn: '7h' });
        res.json({ "msg": "Login successful", "token": token, "refreshToken": refreshToken, "user": user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "msg": "Something went wrong" });
    }
}

async function updateProfile(req, res) {
    const { userID, name, email, password, address } = req.body;
    try {
        const updatedUser = await UserModel.findById(userID);

        if (!updatedUser) {
            return res.status(404).json({ "msg": "User not found" });
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedUser.password = hashedPassword;
        }

        updatedUser.name = name || updatedUser.name;
        updatedUser.email = email || updatedUser.email;
        updatedUser.address = address || updatedUser.address;

        await updatedUser.save();

        res.json({ "msg": "User profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "msg": "Something went wrong" });
    }
}

async function refreshAccessToken(req, res) {
    const { refreshToken } = req.body;
    const newToken = jwt.sign({ userID: "someUserID" }, 'masai', { expiresIn: '1h' });
    res.json({ "token": newToken });
}

async function logoutUser(req, res) {
    const { token } = req.body;
    try {
        const isTokenBlacklisted = await BlacklistTokenModel.findOne({ token });
        if (isTokenBlacklisted) {
            return res.status(401).json({ "msg": "Token is already blacklisted" });
        }
        await new BlacklistTokenModel({ token }).save();
        res.json({ "msg": "Logout successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "msg": "Something went wrong" });
    }
}

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    refreshAccessToken,
    logoutUser
};
