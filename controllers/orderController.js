const Order = require('../models/Order');
const Product = require('../models/Product');
const { getEnrichedCart } = require('./cartController');

/**
 * Render Checkout Page
 */
const getCheckout = async (req, res, next) => {
  try {
    const cart = await getEnrichedCart(req.session.cart);

    if (!cart.items || cart.items.length === 0) {
      req.flash('error_msg', 'Your shopping bag is empty.');
      return res.redirect('/cart');
    }

    res.render('checkout', {
      title: 'Checkout | VELORA Beauty',
      cart,
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Order Submission
 */
const postCheckout = async (req, res, next) => {
  try {
    const cart = await getEnrichedCart(req.session.cart);

    if (!cart.items || cart.items.length === 0) {
      req.flash('error_msg', 'Your bag is empty.');
      return res.redirect('/cart');
    }

    const {
      fullName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      paymentMethod = 'COD'
    } = req.body;

    if (!fullName || !email || !phone || !address || !city || !state || !pincode) {
      req.flash('error_msg', 'Please fill in all required shipping address fields.');
      return res.redirect('/checkout');
    }

    // Verify stock availability for each item
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        req.flash('error_msg', `Sorry, ${item.product.name} only has ${product ? product.stock : 0} items left.`);
        return res.redirect('/cart');
      }
    }

    // Format order items
    const orderItems = cart.items.map(item => ({
      product: item.productId,
      name: item.product.name,
      image: item.product.images[0] || '/images/products/placeholder.svg',
      price: item.price,
      quantity: item.quantity,
      selectedShade: item.selectedShade || '',
      subtotal: item.itemSubtotal
    }));

    const newOrder = new Order({
      user: req.session.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: 'United States'
      },
      paymentMethod: paymentMethod === 'DEMO_CARD' ? 'DEMO_CARD' : 'COD',
      paymentStatus: paymentMethod === 'DEMO_CARD' ? 'Paid' : 'Pending',
      itemsPrice: cart.subtotal,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
      orderStatus: 'Confirmed',
      statusHistory: [
        {
          status: 'Confirmed',
          timestamp: new Date(),
          note: 'Your order was successfully placed and verified.'
        }
      ]
    });

    await newOrder.save();

    // Deduct stock from products
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear session cart
    req.session.cart = { items: [] };

    req.flash('success_msg', 'Thank you! Your order has been placed successfully.');
    res.redirect(`/order-success/${newOrder._id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Render Order Confirmation / Success Page
 */
const getOrderSuccess = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      req.flash('error_msg', 'Order not found.');
      return res.redirect('/');
    }

    // Ensure only the buyer or admin can view
    if (order.user._id.toString() !== req.session.user._id.toString() && req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Unauthorized access.');
      return res.redirect('/');
    }

    res.render('order-success', {
      title: 'Order Confirmed | VELORA',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render User Order History
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.session.user._id }).sort({ createdAt: -1 });

    res.render('orders', {
      title: 'My Orders | VELORA',
      orders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCheckout,
  postCheckout,
  getOrderSuccess,
  getMyOrders
};
