const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");

router.get("/", (req, res) => {
  res.send("Hello from Node API");
});

// property routes
router.post("/propertys", propertyController.createProperty);
router.get("/propertys", propertyController.getPropertys);
router.get("/propertys/:id", propertyController.getProperty);
router.put("/propertys/:id", propertyController.updateProperty);
router.delete("/propertys/:id", propertyController.deleteProperty);

module.exports = router;