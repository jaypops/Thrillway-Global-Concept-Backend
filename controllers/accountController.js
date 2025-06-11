const Account = require("../models/account.model");
exports.createAccount = async (req, res) => {
  try {
    const {
      name,
      username,
      telephone,
      emergencyContact,
      email,
      address,
      startDate,
      images = [],
    } = req.body;
    if (!name || !username || !telephone || !emergencyContact || !email || !address || !startDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const newAccount = new Account({
      name,
      username,
      telephone,
      emergencyContact,
      email,
      address,
      startDate,
      images: Array.isArray(images) ? images : [images],
    });
    const savedAccount = await newAccount.save();

    res.status(201).json({
      success: true,
      message: "account created successfully",
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
}

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};