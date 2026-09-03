const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/update', cartController.updateQuantity);
router.post('/cart/remove', cartController.removeFromCart);
router.get('/cart/clear', cartController.clearCart);

module.exports = router;
