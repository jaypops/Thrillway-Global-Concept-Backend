// middleware/auth.js
const jwt = require("jsonwebtoken");
const Account = require("../models/account.model");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No authentication token found" 
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user
    const user = await Account.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const restrictToAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { authMiddleware, restrictToAdmin };
