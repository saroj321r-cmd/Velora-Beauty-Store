const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * Render Wishlist Page
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.session.user._id }).populate('products');

    if (!wishlist) {
      wishlist = { products: [] };
    }

    res.render('wishlist', {
      title: 'My Wishlist | VELORA',
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Product in Wishlist (Add / Remove)
 */
const toggleWishlist = async (req, res, next) => {
  try {
    if (!req.session.user) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(401).json({
          success: false,
          requireLogin: true,
          message: 'Please sign in to save products to your wishlist.'
        });
      }
      req.flash('error_msg', 'Please sign in to save items to your wishlist.');
      return res.redirect('/login');
    }

    const { productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.redirect('back');
    }

    let wishlist = await Wishlist.findOne({ user: req.session.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.session.user._id,
        products: []
      });
    }

    const prodIndex = wishlist.products.findIndex(id => id.toString() === productId);
    let isAdded = false;

    if (prodIndex > -1) {
      // Remove
      wishlist.products.splice(prodIndex, 1);
      isAdded = false;
    } else {
      // Add
      wishlist.products.push(productId);
      isAdded = true;
    }

    await wishlist.save();

    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.json({
        success: true,
        isAdded,
        wishlistCount: wishlist.products.length,
        message: isAdded ? `${product.name} saved to wishlist.` : `${product.name} removed from wishlist.`
      });
    }

    req.flash('success_msg', isAdded ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
    res.redirect('back');
  } catch (error) {
    next(error);
  }
};

/**
 * Move Wishlist Item to Cart
 */
const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      req.flash('error_msg', 'Product not found.');
      return res.redirect('/wishlist');
    }

    if (product.stock <= 0) {
      req.flash('error_msg', 'Sorry, this product is out of stock.');
      return res.redirect('/wishlist');
    }

    // Add to session cart
    if (!req.session.cart) {
      req.session.cart = { items: [] };
    }

    const defaultShade = product.shades && product.shades.length > 0 ? product.shades[0].name : '';
    const existingIndex = req.session.cart.items.findIndex(
      item => item.productId === product._id.toString() && item.selectedShade === defaultShade
    );

    if (existingIndex > -1) {
      req.session.cart.items[existingIndex].quantity += 1;
    } else {
      req.session.cart.items.push({
        productId: product._id.toString(),
        quantity: 1,
        selectedShade: defaultShade
      });
    }

    // Remove from wishlist
    await Wishlist.updateOne(
      { user: req.session.user._id },
      { $pull: { products: productId } }
    );

    req.flash('success_msg', `${product.name} moved to your shopping bag!`);
    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  moveToCart
};
