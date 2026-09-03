const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');

/**
 * Admin Login Page
 */
const getAdminLogin = (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', {
    title: 'Admin Portal | VELORA',
    email: req.flash('email')[0] || ''
  });
};

/**
 * Handle Admin Login
 */
const postAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || user.role !== 'admin') {
      req.flash('error_msg', 'Unauthorized or invalid administrative credentials.');
      return res.redirect('/admin/login');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid administrative password.');
      return res.redirect('/admin/login');
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', `Welcome to the Velora Console, ${user.name}`);
    res.redirect('/admin/dashboard');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Analytics Dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed'] } });

    // Aggregate total revenue from completed/confirmed orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Recent 6 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Low stock alerts (stock <= 10)
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } }).limit(5);

    res.render('admin/dashboard', {
      title: 'Console Dashboard | VELORA Admin',
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        pendingOrders,
        totalRevenue: Number(totalRevenue.toFixed(2))
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Products Catalog View
 */
const getProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1 } = req.query;
    const limit = 15;
    const skip = (Number(page) - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const categories = await Category.find({});

    res.render('admin/products', {
      title: 'Inventory Catalog | VELORA Admin',
      products,
      categories,
      searchQuery: search || '',
      selectedCategory: category || 'all',
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit) || 1,
      totalProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render Add Product Form
 */
const getAddProduct = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.render('admin/add-product', {
      title: 'New Product Listing | VELORA Admin',
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create New Product
 */
const postAddProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      discountPrice,
      stock,
      ingredients,
      howToUse,
      featured,
      bestseller,
      newArrival,
      shadesData
    } = req.body;

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    let imagePath = '/images/products/placeholder.svg';
    if (req.file) {
      imagePath = `/images/products/${req.file.filename}`;
    }

    // Parse shades if provided (format: "Name:#hex, Name2:#hex")
    let shadesList = [];
    if (shadesData && shadesData.trim()) {
      shadesList = shadesData.split(',').map(s => {
        const parts = s.split(':');
        return {
          name: parts[0]?.trim() || 'Classic',
          hex: parts[1]?.trim() || '#C47C85'
        };
      });
    }

    const newProduct = new Product({
      name: name.trim(),
      slug,
      description: description.trim(),
      category: category.trim(),
      subcategory: subcategory ? subcategory.trim() : 'Beauty',
      brand: 'VELORA',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock) || 0,
      images: [imagePath],
      shades: shadesList,
      colors: shadesList,
      ingredients: ingredients || 'Cruelty-free, vegan botanical formula.',
      howToUse: howToUse || 'Apply as desired for effortless radiant beauty.',
      featured: featured === 'on' || featured === 'true',
      bestseller: bestseller === 'on' || bestseller === 'true',
      newArrival: newArrival === 'on' || newArrival === 'true'
    });

    await newProduct.save();

    req.flash('success_msg', `Product "${newProduct.name}" added to catalog.`);
    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
};

/**
 * Render Edit Product Form
 */
const getEditProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error_msg', 'Product not found.');
      return res.redirect('/admin/products');
    }

    const categories = await Category.find({});
    res.render('admin/edit-product', {
      title: `Edit ${product.name} | VELORA Admin`,
      product,
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Product
 */
const postEditProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error_msg', 'Product not found.');
      return res.redirect('/admin/products');
    }

    const {
      name,
      description,
      category,
      subcategory,
      price,
      discountPrice,
      stock,
      ingredients,
      howToUse,
      featured,
      bestseller,
      newArrival,
      shadesData
    } = req.body;

    product.name = name.trim();
    product.description = description.trim();
    product.category = category.trim();
    product.subcategory = subcategory ? subcategory.trim() : product.subcategory;
    product.price = Number(price);
    product.discountPrice = discountPrice ? Number(discountPrice) : null;
    product.stock = Number(stock);
    product.ingredients = ingredients || product.ingredients;
    product.howToUse = howToUse || product.howToUse;
    product.featured = featured === 'on' || featured === 'true';
    product.bestseller = bestseller === 'on' || bestseller === 'true';
    product.newArrival = newArrival === 'on' || newArrival === 'true';

    if (req.file) {
      product.images = [`/images/products/${req.file.filename}`];
    }

    if (shadesData !== undefined && shadesData.trim()) {
      product.shades = shadesData.split(',').map(s => {
        const parts = s.split(':');
        return {
          name: parts[0]?.trim() || 'Classic',
          hex: parts[1]?.trim() || '#C47C85'
        };
      });
      product.colors = product.shades;
    }

    await product.save();

    req.flash('success_msg', `Product "${product.name}" updated successfully.`);
    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Product
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      req.flash('success_msg', `Product "${product.name}" was removed.`);
    }
    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Orders
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1 } = req.query;
    const limit = 15;
    const skip = (Number(page) - 1) * limit;

    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render('admin/orders', {
      title: 'Order Fulfillment | VELORA Admin',
      orders,
      selectedStatus: status || 'all',
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / limit) || 1,
      totalOrders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Order Status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      req.flash('error_msg', 'Order not found.');
      return res.redirect('/admin/orders');
    }

    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      req.flash('error_msg', 'Invalid order status transition.');
      return res.redirect('/admin/orders');
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by admin.`
    });

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    await order.save();

    req.flash('success_msg', `Order #${order.orderNumber} updated to "${status}".`);
    res.redirect('/admin/orders');
  } catch (error) {
    next(error);
  }
};

/**
 * View Customer Accounts
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });

    // Attach order count to each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          orderCount
        };
      })
    );

    res.render('admin/users', {
      title: 'Customer Directory | VELORA Admin',
      users: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminLogin,
  postAdminLogin,
  getDashboard,
  getProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getUsers
};
