const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

/**
 * Ensures that the user is logged in
 */
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  if (req.method === 'GET') {
    req.session.returnTo = req.originalUrl;
  }
  req.flash('error_msg', 'Please sign in to access this page.');
  res.redirect('/login');
};

/**
 * Sets global template variables for user session, cart, wishlist, and flash messages
 */
const setLocals = async (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.currentPath = req.path;

  // Initialize session cart if missing
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      totalQty: 0,
      subtotal: 0
    };
  }

  // Calculate cart count
  let cartCount = 0;
  if (req.session.cart && req.session.cart.items) {
    cartCount = req.session.cart.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }
  res.locals.cartCount = cartCount;

  // Wishlist count
  let wishlistCount = 0;
  if (req.session.user) {
    try {
      const wishlist = await Wishlist.findOne({ user: req.session.user._id });
      if (wishlist && wishlist.products) {
        wishlistCount = wishlist.products.length;
      }
    } catch (err) {
      console.error('Error fetching wishlist count:', err);
    }
  }
  res.locals.wishlistCount = wishlistCount;

  next();
};

module.exports = {
  ensureAuthenticated,
  setLocals
};
