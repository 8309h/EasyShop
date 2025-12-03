const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/User.model");
const { BlacklistTokenModel } = require("../models/BlacklistToken.model");

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const blacklisted = await BlacklistTokenModel.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ msg: "Token expired or blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await UserModel.findById(decoded.userID);

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
}

module.exports = { authenticate };
