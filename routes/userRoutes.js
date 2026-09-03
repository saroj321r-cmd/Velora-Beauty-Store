const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middleware/auth');

// Auth routes
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

router.get('/signup', userController.getSignup);
router.post('/signup', userController.postSignup);

router.get('/logout', userController.logout);

// Profile routes
router.get('/profile', ensureAuthenticated, userController.getProfile);
router.post('/profile', ensureAuthenticated, userController.updateProfile);

module.exports = router;
