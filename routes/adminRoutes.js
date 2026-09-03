const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin } = require('../middleware/admin');
const upload = require('../middleware/upload');

// Admin Auth
router.get('/admin/login', adminController.getAdminLogin);
router.post('/admin/login', adminController.postAdminLogin);

// Protected Admin Dashboard
router.get('/admin', ensureAdmin, (req, res) => res.redirect('/admin/dashboard'));
router.get('/admin/dashboard', ensureAdmin, adminController.getDashboard);

// Products CRUD
router.get('/admin/products', ensureAdmin, adminController.getProducts);
router.get('/admin/products/add', ensureAdmin, adminController.getAddProduct);
router.post('/admin/products/add', ensureAdmin, upload.single('image'), adminController.postAddProduct);

router.get('/admin/products/edit/:id', ensureAdmin, adminController.getEditProduct);
router.post('/admin/products/edit/:id', ensureAdmin, upload.single('image'), adminController.postEditProduct);

router.post('/admin/products/delete/:id', ensureAdmin, adminController.deleteProduct);

// Orders Management
router.get('/admin/orders', ensureAdmin, adminController.getOrders);
router.post('/admin/orders/status/:orderId', ensureAdmin, adminController.updateOrderStatus);

// Customers Management
router.get('/admin/users', ensureAdmin, adminController.getUsers);

module.exports = router;
