const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/auth');

// Property routes
router.post('/propertys', propertyController.createProperty);
router.get('/s3Url', propertyController.getURL);
router.get('/propertys', propertyController.getPropertys);
router.get('/propertys/:id', propertyController.getProperty);
router.patch('/propertys/:id', propertyController.updateProperty);
router.delete('/propertys/:id', propertyController.deleteProperty);
router.delete('/propertys', propertyController.deleteAllPropertys);

// Account routes
router.post('/account', accountController.createAccount);
router.get('/account', authMiddleware, accountController.getAccounts);
router.delete('/account/:id', authMiddleware, accountController.deleteAccount);
router.post('/account/login', accountController.loginAccount);
router.get('/auth/account/verify', authMiddleware, accountController.verifyToken);

module.exports = router;