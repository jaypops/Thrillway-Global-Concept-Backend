const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const accountController = require("../controllers/accountController");

router.post("/propertys", propertyController.createProperty);
router.get("/s3Url", propertyController.getURL);
router.get("/propertys", propertyController.getPropertys);
router.get("/propertys/:id", propertyController.getProperty);
router.patch("/propertys/:id", propertyController.updateProperty);
router.delete("/propertys/:id", propertyController.deleteProperty);
router.delete("/propertys", propertyController.deleteAllPropertys);

router.post("/account", accountController.createAccount);
router.get("/account", accountController.getAccounts);
router.delete("/account/:id", accountController.deleteAccount);

module.exports = router;
