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
      images = [],
      documents = [],
    } = req.body;

    // Validate required fields
    const requiredFields = { title, price, propertyType, address };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields,
      });
    }

    // Validate features as an object
    const validFeatures = {};
    const featureKeys = [
      "swimmingPool",
      "garage",
      "balcony",
      "security",
      "garden",
      "airConditioning",
      "furnished",
      "parking",
    ];
    featureKeys.forEach((key) => {
      validFeatures[key] = features && typeof features === "object" && features[key] ? true : false;
    });

    const newProperty = new Property({
      title,
      description,
      price: Number(price),
      priceType,
      propertyType,
      status,
      address,
      rooms,
      bathrooms,
      propertySize: propertySize ? Number(propertySize) : undefined,
      features: validFeatures,
      images: Array.isArray(images) ? images : [],
      documents: Array.isArray(documents) ? documents : [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const savedProperty = await newProperty.save();

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


exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate required fields
    const requiredFields = { title: updates.title, price: updates.price, propertyType: updates.propertyType, address: updates.address };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields,
      });
    }

    // Validate features as an object
    const validFeatures = {};
    const featureKeys = [
      "swimmingPool",
      "garage",
      "balcony",
      "security",
      "garden",
      "airConditioning",
      "furnished",
      "parking",
    ];
    featureKeys.forEach((key) => {
      validFeatures[key] = updates.features && typeof updates.features === "object" && updates.features[key] ? true : false;
    });

    const updateData = {
      title: updates.title,
      description: updates.description,
      price: Number(updates.price),
      priceType: updates.priceType,
      propertyType: updates.propertyType,
      status: updates.status,
      address: updates.address,
      rooms: updates.rooms,
      bathrooms: updates.bathrooms,
      propertySize: updates.propertySize ? Number(updates.propertySize) : undefined,
      features: validFeatures,
      isAvailable: updates.isAvailable ?? true,
      images: Array.isArray(updates.images) ? updates.images : [],
      documents: Array.isArray(updates.documents) ? updates.documents : [],
      updatedAt: new Date(),
    };

    const updatedProperty = await Property.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property updated successfully", property: updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Error updating property", error: error.message });
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
