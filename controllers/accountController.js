const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/account.model");
require("dotenv").config();


exports.generateInviteLink = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can generate invite links",
      });
    }

    const invitationToken = jwt.sign(
      { role, type: 'invitation' },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const invitationLink = `${frontendUrl}/account-management?role=${role}&token=${invitationToken}`;

    res.status(200).json({
      success: true,
      message: "Invitation link generated successfully",
      invitationLink,
      invitationToken,
      expiresIn: "24 hours"
    });
  } catch (error) {
    console.error("Error generating invite link:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating invite link",
      error: error.message,
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
      invitationToken
    } = req.body;
    if (
      !name ||
      !username ||
      !telephone ||
      !emergencyContact ||
      !email ||
      !address ||
      !startDate ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isAdmin = req.user?.role === "admin";
    if (role === "admin" && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create admin accounts",
      });
    }

     if (!invitationToken) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(invitationToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired invitation token",
      });
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
    const savedAccount = await newAccount.save()

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
        errors: Object.values(error.errors).map((err) => err.message),
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
      error: error.message,
    });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginAccount = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }
    const user = await Account.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      account: user,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: "Server error while logging in",
      error: error.message,
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      user: req.user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error during token verification" 
    });
  }
};

exports.validateInvitation = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Token verification failed:", error.message);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false, 
          message: "Invitation token has expired" 
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: "Invalid invitation token" 
      });
    }

    if (decoded.type !== 'invitation') {
      return res.status(401).json({ 
        success: false, 
        message: "Token is not an invitation token" 
      });
    }

    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      role: decoded.role || "fieldAgent",
      message: "Invitation token is valid"
    });
  } catch (error) {
    console.error("Error validating invitation token:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error during token validation",
      error: error.message 
    });
  }
};