const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://teniolatimothy:ZkT5qtj6b9orQsaT@pops.gvyubaq.mongodb.net/?retryWrites=true&w=majority&appName=pops"
    );
    console.log("Connected to the database");
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;