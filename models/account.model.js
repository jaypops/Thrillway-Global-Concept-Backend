const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name must be at least 3 characters"],
      minlength: 3,
    },
    username: {
      type: String,
      required: [true, "Username must be at least 3 characters"],
      minlength: 3,
      unique: true, 
    },
    telephone: {
      type: String,
      required: [true, "Telephone number required"],
    },
    emergencyContact: {
      type: String,
      required: [true, "Emergency contact number required"],
    },
    email: {
      type: String,
      required: [true, "Email required"],
      unique: true, 
    },
    address: {
      type: String,
      required: [true, "Address required"],
    },
    images: {
      type: [String], 
      default: [], 
    },
    startDate: {
      type: String,
      required: [true, "Start date required"],
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account