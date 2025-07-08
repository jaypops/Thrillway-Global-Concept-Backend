const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/account.model");
require("dotenv").config();

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

    if (role === "admin" && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create admin accounts",
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
      role: role || "admin",
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
    const user = await Account.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, account: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
