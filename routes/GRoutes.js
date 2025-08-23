const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const {
  createAccount,
  getAccounts,
  deleteAccount,
  loginAccount,
  verifyToken,
  generateInviteLink,
  validateInvitation,
} = require("../controllers/accountController");
const { authMiddleware, restrictToAdmin } = require("../middleware/auth");

// Property routes
router.post("/propertys", propertyController.createProperty);
router.get("/s3Url", propertyController.getURL);
router.get("/propertys", propertyController.getPropertys);
router.get("/propertys/:id", propertyController.getProperty);
router.patch("/propertys/:id", propertyController.updateProperty);
router.delete("/propertys/:id", propertyController.deleteProperty);
router.delete("/propertys", propertyController.deleteAllPropertys);

// Account routes
router.post("/account", authMiddleware, restrictToAdmin, createAccount);
router.post("/account/register", createAccount);
router.get("/account", authMiddleware, restrictToAdmin, getAccounts);
router.delete("/account/:id", authMiddleware, restrictToAdmin, deleteAccount);
router.post("/account/login", loginAccount); 
router.get("/auth/account/verify", authMiddleware, verifyToken);
router.post(
  "/account/invite",
  authMiddleware,
  restrictToAdmin,
  generateInviteLink
);
router.get("/account/invite/validate", validateInvitation);
module.exports = router;
