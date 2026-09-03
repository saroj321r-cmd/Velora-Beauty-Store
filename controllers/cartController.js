const Product = require('../models/Product');
const Cart = require('../models/Cart');

/**
 * Helper to calculate cart totals and enrich items with product models
 */
const getEnrichedCart = async (sessionCart) => {
  if (!sessionCart || !sessionCart.items || sessionCart.items.length === 0) {
    return {
      items: [],
      totalQty: 0,
      subtotal: 0,
      shippingPrice: 0,
      totalPrice: 0,
      freeShippingThreshold: 50,
      freeShippingDiff: 50
    };
  }

  const enrichedItems = [];
  let subtotal = 0;
  let totalQty = 0;

  for (const item of sessionCart.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const activePrice = product.discountPrice || product.price;
      const itemSubtotal = activePrice * item.quantity;
      subtotal += itemSubtotal;
      totalQty += item.quantity;

      enrichedItems.push({
        productId: product._id.toString(),
        product,
        quantity: item.quantity,
        selectedShade: item.selectedShade || '',
        price: activePrice,
        itemSubtotal
      });
    }
  }

  const freeShippingThreshold = 50;
  const shippingPrice = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 5.99;
  const totalPrice = subtotal + shippingPrice;
  const freeShippingDiff = Math.max(0, freeShippingThreshold - subtotal);

  return {
    items: enrichedItems,
    totalQty,
    subtotal: Number(subtotal.toFixed(2)),
    shippingPrice: Number(shippingPrice.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
    freeShippingThreshold,
    freeShippingDiff: Number(freeShippingDiff.toFixed(2))
  };
};

/**
 * Render Cart Page
 */
const getCart = async (req, res, next) => {
  try {
    const cart = await getEnrichedCart(req.session.cart);

    res.render('cart', {
      title: 'Shopping Bag | VELORA',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Product to Cart
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, shade } = req.body;
    const qty = Math.max(1, parseInt(quantity, 10));

    const product = await Product.findById(productId);
    if (!product) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      req.flash('error_msg', 'Product not found.');
      return res.redirect('/products');
    }

    // Stock check
    if (product.stock <= 0) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
      }
      req.flash('error_msg', 'Sorry, this product is currently out of stock.');
      return res.redirect(`/product/${product.slug}`);
    }

    if (!req.session.cart) {
      req.session.cart = { items: [] };
    }

    const selectedShade = shade || (product.shades && product.shades.length > 0 ? product.shades[0].name : '');

    // Check if item with same ID and shade already exists
    const existingIndex = req.session.cart.items.findIndex(
      item => item.productId === product._id.toString() && item.selectedShade === selectedShade
    );

    if (existingIndex > -1) {
      const currentQty = req.session.cart.items[existingIndex].quantity;
      if (currentQty + qty > product.stock) {
        const errorMsg = `Only ${product.stock} items available in stock.`;
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
          return res.status(400).json({ success: false, message: errorMsg });
        }
        req.flash('error_msg', errorMsg);
        return res.redirect('/cart');
      }
      req.session.cart.items[existingIndex].quantity += qty;
    } else {
      if (qty > product.stock) {
        const errorMsg = `Only ${product.stock} items available in stock.`;
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
          return res.status(400).json({ success: false, message: errorMsg });
        }
        req.flash('error_msg', errorMsg);
        return res.redirect('/cart');
      }
      req.session.cart.items.push({
        productId: product._id.toString(),
        quantity: qty,
        selectedShade
      });
    }

    // Recalculate total items
    const totalCount = req.session.cart.items.reduce((acc, item) => acc + item.quantity, 0);

    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: `${product.name} added to your bag!`,
        cartCount: totalCount
      });
    }

    req.flash('success_msg', `${product.name} added to your shopping bag.`);
    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Cart Item Quantity
 */
const updateQuantity = async (req, res, next) => {
  try {
    const { productId, shade, action, quantity } = req.body;

    if (!req.session.cart || !req.session.cart.items) {
      return res.redirect('/cart');
    }

    const itemIndex = req.session.cart.items.findIndex(
      item => item.productId === productId && item.selectedShade === (shade || '')
    );

    if (itemIndex > -1) {
      const product = await Product.findById(productId);
      let newQty = req.session.cart.items[itemIndex].quantity;

      if (action === 'increase') {
        newQty += 1;
      } else if (action === 'decrease') {
        newQty -= 1;
      } else if (quantity !== undefined) {
        newQty = parseInt(quantity, 10);
      }

      if (product && newQty > product.stock) {
        const errorMsg = `Only ${product.stock} units available.`;
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
          return res.status(400).json({ success: false, message: errorMsg });
        }
        req.flash('error_msg', errorMsg);
        return res.redirect('/cart');
      }

      if (newQty <= 0) {
        req.session.cart.items.splice(itemIndex, 1);
      } else {
        req.session.cart.items[itemIndex].quantity = newQty;
      }
    }

    const cart = await getEnrichedCart(req.session.cart);

    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.json({
        success: true,
        cart,
        cartCount: cart.totalQty
      });
    }

    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Item from Cart
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId, shade } = req.body;

    if (req.session.cart && req.session.cart.items) {
      req.session.cart.items = req.session.cart.items.filter(
        item => !(item.productId === productId && item.selectedShade === (shade || ''))
      );
    }

    const cart = await getEnrichedCart(req.session.cart);

    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'Item removed from bag.',
        cart,
        cartCount: cart.totalQty
      });
    }

    req.flash('success_msg', 'Item removed from bag.');
    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
};

/**
 * Clear All Items in Cart
 */
const clearCart = (req, res) => {
  req.session.cart = { items: [] };
  req.flash('success_msg', 'Your shopping bag is now empty.');
  res.redirect('/cart');
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  getEnrichedCart
};
