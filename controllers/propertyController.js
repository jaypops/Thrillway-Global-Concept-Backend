const Property = require("../models/property.model");
const { generateUploadURL } = require("../s3");


exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      priceType,
      propertyType,
      status,
      address,
      rooms,
      bathrooms,
      propertySize,
      features,
      isAvailable,
      images,
      documents,
    } = req.body;

    // Required fields validation
    if (!title || !price || !propertyType || !address) {
      return res.status(400).json({
        message: "Title, price, property type, and address are required",
      });
    }

    // ===== 2. Create Property Document =====
    const newProperty = new Property({
      title,
      description,
      price: Number(price),
      priceType,
      propertyType,
      status,
      address,
      rooms: rooms ? Number(rooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      propertySize: propertySize ? Number(propertySize) : undefined,
      features: Array.isArray(features) ? features : [],
      images: Array.isArray(images) ? images : [],
      documents: Array.isArray(documents) ? documents : [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    // ===== 3. Save to Database =====
    const savedProperty = await newProperty.save();

    // ===== 4. Send Response =====
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: savedProperty,
    });
  } catch (error) {
    console.error("Error creating property:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Server error while creating property",
      error: error.message,
    });
  }
};

//Get URL
exports.getURL = async (req, res) => {
  try {
    const { type } = req.query; 
    const url = await generateUploadURL(type);
    res.send({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Properties
exports.getPropertys = async (req, res) => {
  try {
    const properties = await Property.find({});
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single Property
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Property
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
