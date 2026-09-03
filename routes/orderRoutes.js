const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/checkout', ensureAuthenticated, orderController.getCheckout);
router.post('/checkout', ensureAuthenticated, orderController.postCheckout);
router.get('/order-success/:orderId', ensureAuthenticated, orderController.getOrderSuccess);
router.get('/orders', ensureAuthenticated, orderController.getMyOrders);

module.exports = router;
