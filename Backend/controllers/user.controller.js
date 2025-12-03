const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/User.model");
const { BlacklistTokenModel } = require("../models/BlacklistToken.model");

async function registerUser(req, res) {
  const { name, email, password, address } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      address,
    });

    await newUser.save();

    res.status(201).json({ msg: "New user registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Email not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    const token = jwt.sign(
      { userID: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userID: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}

async function updateProfile(req, res) {
  const userId = req.user._id;
  const { name, email, password, address } = req.body;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;

    await user.save();

    res.json({ msg: "User profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}

async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ msg: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const newToken = jwt.sign(
      { userID: decoded.userID },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: newToken });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: "Invalid refresh token" });
  }
}

async function logoutUser(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(400).json({ msg: "Token required for logout" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const isTokenBlacklisted = await BlacklistTokenModel.findOne({ token });

    if (isTokenBlacklisted) {
      return res.status(401).json({ msg: "Token is already blacklisted" });
    }

    await new BlacklistTokenModel({ token }).save();

    res.json({ msg: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  refreshAccessToken,
  logoutUser,
  getAllUsers,
};
