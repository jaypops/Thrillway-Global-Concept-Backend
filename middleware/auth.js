// middleware/auth.js
const jwt = require("jsonwebtoken");
const Account = require("../models/account.model");
const Token = require("../models/token.model");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token exists in database
    const storedToken = await Token.findOne({ 
      userId: decoded._id, 
      token: token 
    });
    
    if (!storedToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }
    
    const user = await Account.findById(decoded._id).select("-password");
    
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    
    req.user = user; 
    req.userId = decoded._id;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

const restrictToAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { authMiddleware, restrictToAdmin };