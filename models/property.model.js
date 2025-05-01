const mongoose = require("mongoose");

const PropertySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title must be at least 5 characters"],
      minlength: 5
    },
    description: {
      type: String,
      required: [true, "Description must be at least 20 characters"],
      minlength: 20
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    priceType: {
      type: String,
      required: [true, "Price type is required"],
    },
    status: {
      type: String,
      required: [true, "Status type is required"],
    },
    address: {
      type: String,
      required: [true, "Location is required"],
      minlength: 3
    },
    rooms: {
      type: Number,
      required: false
    },
    bathrooms: {
      type: Number,
      required: false
    },
    propertyType: {
      type: String,
      required: [true, "Property type is required"],
    },
    propertySize: {
      type: Number,
      required: [true, "Property size is required"],
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    features: {
      swimmingPool: { type: Boolean, default: false },
      garage: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
      garden: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      furnished: { type: Boolean, default: false },
      parking: { type: Boolean, default: false }
    },
    images: {
      type: [String], 
      required: false
    },
    documents: {
      type: [String], 
      required: false
    }
  },
  {
    timestamps: true, 
  }
);

const Property = mongoose.model("Property", PropertySchema);
module.exports = Property;