const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const propertyController = require("../controllers/propertyController");
const {
  createAccount,
  getAccounts,
  deleteAccount,
  loginAccount,
  logoutAccount,
  verifyToken,
  generateInviteLink,
  validateInvitation,
  getCurrentUser,
  refreshToken,
} = require("../controllers/accountController");
const { authMiddleware, restrictToAdmin } = require("../middleware/auth");

// Rate limiters for sensitive endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 refresh token requests per window
  message: {
    success: false,
    message: "Too many refresh token requests from this IP, please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration requests per window
  message: {
    success: false,
    message: "Too many registration attempts from this IP, please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

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
router.post("/account/register", registerLimiter, createAccount);
router.get("/account/all", authMiddleware, restrictToAdmin, getAccounts);
router.delete("/account/:id", authMiddleware, restrictToAdmin, deleteAccount);
router.post("/account/login", loginLimiter, loginAccount);
router.post("/account/logout", logoutAccount);
router.get("/auth/account/verify", authMiddleware, verifyToken);
router.post("/account/invite", authMiddleware, restrictToAdmin, generateInviteLink);
router.get("/account/invite/validate", validateInvitation);
router.get("/account/current", authMiddleware, getCurrentUser);
router.post("/account/refresh-token", refreshTokenLimiter, refreshToken);

module.exports = router;