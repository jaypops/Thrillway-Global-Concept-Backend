const Property = require("../models/property.model");

// Create a new Property
exports.createProperty = async (req, res) => {
  try {
    const Property = await Property.create(req.body);
    res.status(200).json(Property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Propertys
exports.getPropertys = async (req, res) => {
  try {
    const Propertys = await Property.find({});
    res.status(200).json(Propertys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single Property
exports.getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const Property = await Property.findById(id);
    if (!Property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(Property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const Property = await Property.findByIdAndUpdate(id, req.body, { new: true });
    if (!Property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(Property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const Property = await Property.findByIdAndDelete(id);
    if (!Property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



