const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/account.model");
const Token = require("../models/token.model");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction, 
  sameSite: isProduction ? "none" : "lax",
  maxAge: 3600000,
  path: "/",
};

const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

exports.generateInviteLink = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can generate invite links" });
    }

    const invitationToken = jwt.sign(
      { role, type: "invitation" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const invitationLink = `${frontendUrl}/account-management?role=${role}&token=${invitationToken}`;

    res.status(200).json({
      success: true,
      message: "Invitation link generated successfully",
      invitationLink,
      expiresIn: "24 hours",
    });
  } catch (error) {
    console.error("Error generating invite link:", error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
    });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const {
      name,
      username,
      telephone,
      emergencyContact,
      email,
      address,
      password,
      startDate,
      images = [],
      role,
      invitationToken,
    } = req.body;

    if (!name || !username || !telephone || !emergencyContact || !email || !address || !startDate || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (role === "admin" && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can create admin accounts" });
    }

    if (!invitationToken) {
      return res.status(400).json({ success: false, message: "Invitation token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(invitationToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired invitation token" });
    }

    const hashedPassword = await bcrypt.hash(password, 13);

    const newAccount = new Account({
      name,
      username,
      telephone,
      emergencyContact,
      email,
      address,
      password: hashedPassword,
      startDate,
      images: Array.isArray(images) ? images : [images],
      role: decoded.role || "fieldAgent",
    });

    const savedAccount = await newAccount.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      account: savedAccount,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating account",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().select("-password");
    res.status(200).json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.loginAccount = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: "Username and password are required" });

    const user = await Account.findOne({ username });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid username or password" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const existingTokens = await Token.find({ userId: user._id }).sort({ createdAt: -1 });
    if (existingTokens.length >= 5) {
      const oldTokens = existingTokens.slice(5);
      await Token.deleteMany({ _id: { $in: oldTokens.map((t) => t._id) } });
    }

    await new Token({ userId: user._id, token }).save();

    console.log("🔐 Cookie options in use:", cookieOptions);

    res.cookie("auth_token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      account: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: "Server error while logging in",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.logoutAccount = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (token) await Token.findOneAndDelete({ token });

    res.clearCookie("auth_token", clearCookieOptions);

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({
      success: false,
      message: "Server error while logging out",
    });
  }
};

exports.verifyToken = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }
  res.status(200).json({ success: true, user: req.user });
};


exports.validateInvitation = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "invitation") {
      return res.status(401).json({ success: false, message: "Token is not an invitation token" });
    }

    res.set("Cache-Control", "no-store");
    res.status(200).json({
      success: true,
      role: decoded.role || "fieldAgent",
      message: "Invitation token is valid",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invitation token has expired" });
    }
    res.status(401).json({ success: false, message: "Invalid or expired invitation token" });
  }
};
