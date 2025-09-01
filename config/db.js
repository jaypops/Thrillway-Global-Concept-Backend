const Account = require("../models/account.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 30000, 
      authSource: "admin", 
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("Connected to the database successfully");
    
    await createDefaultAdmin();
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    if (!process.env.USERNAME || !process.env.PASSWORD) {
      console.warn("Admin credentials not found in environment variables");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 13);

    const defaultAdminData = {
      name: "Default Admin",
      username: process.env.USERNAME,
      telephone: "0000000000",
      emergencyContact: "0000000000",
      email: "admin@thrillway.com",
      address: "Head Office",
      password: hashedPassword, 
      startDate: new Date(),
      images: [],
      role: "admin",
    };

    const existingAdmin = await Account.findOne({
      $or: [
        { username: defaultAdminData.username },
        { email: defaultAdminData.email }
      ]
    });

    if (!existingAdmin) {
      await Account.create(defaultAdminData);
      console.log("Default admin account created successfully");
    } else {
      console.log("Default admin account already exists");
    }
  } catch (error) {
    console.error("Error creating default admin:", error.message);
  }
};

module.exports = connectDB;

