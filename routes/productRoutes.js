const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { ensureAuthenticated } = require('../middleware/auth');

// Home page
router.get('/', productController.getHome);

// Catalog / Shop All
router.get('/products', productController.getProducts);

// Search Results
router.get('/search', productController.getSearch);

// Curated Category Shortcuts
router.get('/category/:categorySlug', productController.getCategoryPage);

// Product Details
router.get('/product/:slug', productController.getProductDetails);

// Submit Review
router.post('/product/review', ensureAuthenticated, productController.postReview);

module.exports = router;
