const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");

// Property creation now expects file URLs in JSON, not actual files
router.post("/propertys", propertyController.createProperty);
router.get("/s3Url", propertyController.getURL)
router.get("/propertys", propertyController.getPropertys);
router.get("/propertys/:id", propertyController.getProperty);
router.put("/propertys/:id", propertyController.updateProperty);
router.delete("/propertys/:id", propertyController.deleteProperty);

module.exports = router;
