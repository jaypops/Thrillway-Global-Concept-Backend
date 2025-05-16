const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");

router.post("/propertys", propertyController.createProperty);
router.get("/s3Url", propertyController.getURL);
router.get("/propertys", propertyController.getPropertys);
router.get("/propertys/:id", propertyController.getProperty);
router.patch("/propertys/:id", propertyController.updateProperty);
router.delete("/propertys/:id", propertyController.deleteProperty);
router.delete("/propertys", propertyController.deleteAllPropertys)

module.exports = router;
