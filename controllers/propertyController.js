const Property = require("../models/property.model");
const { generateUploadURL } = require("../s3");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

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
        message: `Missing required fields: ${missingFields.join(", ")}`,
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
      validFeatures[key] =
        features && typeof features === "object" && features[key]
          ? true
          : false;
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
    const { folder = "uploads", mimeType = "application/octet-stream" } = req.query;
    const url = await generateUploadURL(folder, mimeType);
    res.send({ url });
  } catch (error) {
    console.error("Error generating S3 URL:", error); // 🔥 log error
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

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteFilesFromS3 = async (urls) => {
  for (const url of urls) {
    try {
      const key = url.split(".com/")[1];
      console.log(`Attempting to delete S3 file: ${url} (Key: ${key})`);
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
      };
      await s3Client.send(new DeleteObjectCommand(params));
      console.log(`Successfully deleted S3 file: ${url}`);
    } catch (error) {
      console.error(`Failed to delete S3 file ${url}:`, error);
    }
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const requiredFields = {
      title: updates.title,
      price: updates.price,
      propertyType: updates.propertyType,
      address: updates.address,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

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
      validFeatures[key] = updates.features?.[key] || false;
    });

    const removedImages = Array.isArray(updates.removedImages)
      ? updates.removedImages
      : [];
    const removedDocuments = Array.isArray(updates.removedDocuments)
      ? updates.removedDocuments
      : [];

    if (removedImages.length > 0) {
      await deleteFilesFromS3(removedImages);
    }
    if (removedDocuments.length > 0) {
      await deleteFilesFromS3(removedDocuments);
    }

    const updateData = {
      title: updates.title,
      description: updates.description,
      price: Number(updates.price),
      priceType: updates.priceType,
      propertyType: updates.propertyType,
      status: updates.status,
      address: updates.address,
      rooms: updates.rooms ? Number(updates.rooms) : undefined,
      bathrooms: updates.bathrooms ? Number(updates.bathrooms) : undefined,
      propertySize: updates.propertySize
        ? Number(updates.propertySize)
        : undefined,
      features: validFeatures,
      isAvailable: updates.isAvailable ?? true,
      images: Array.isArray(updates.images) ? updates.images : [],
      documents: Array.isArray(updates.documents) ? updates.documents : [],
      updatedAt: new Date(),
    };

    const updatedProperty = await Property.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({
      message: "Error updating property",
      error: error.message,
    });
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

//Delete all Property
exports.deleteAllPropertys = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No property IDs provided or invalid input",
      });
    }
    const result = await Property.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No properties found with the provided IDs",
      });
    } // or customize based on file type
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} properties successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete properties",
    });
  }
};
