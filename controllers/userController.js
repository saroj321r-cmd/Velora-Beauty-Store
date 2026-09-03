const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Render Login Page
 */
const getLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', {
    title: 'Sign In | VELORA Beauty',
    email: req.flash('email')[0] || ''
  });
};

/**
 * Handle Login Submission
 */
const postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Please enter both email and password.');
      req.flash('email', email);
      return res.redirect('/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      req.flash('email', email);
      return res.redirect('/login');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      req.flash('email', email);
      return res.redirect('/login');
    }

    // Set session user
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    };

    req.flash('success_msg', `Welcome back, ${user.name}!`);

    // Redirect to stored destination or default
    const returnTo = req.session.returnTo || (user.role === 'admin' ? '/admin/dashboard' : '/');
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (error) {
    next(error);
  }
};

/**
 * Render Signup Page
 */
const getSignup = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('signup', {
    title: 'Create Account | VELORA Beauty',
    formData: req.flash('formData')[0] || {}
  });
};

/**
 * Handle Signup Submission
 */
const postSignup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      req.flash('error_msg', 'All fields are required.');
      req.flash('formData', { name, email });
      return res.redirect('/signup');
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters.');
      req.flash('formData', { name, email });
      return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      req.flash('formData', { name, email });
      return res.redirect('/signup');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error_msg', 'An account with that email already exists.');
      req.flash('formData', { name, email });
      return res.redirect('/signup');
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'customer'
    });

    await newUser.save();

    // Auto-login after successful registration
    req.session.user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address
    };

    req.flash('success_msg', 'Your VELORA beauty account has been created!');
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};

/**
 * Log Out
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/');
  });
};

/**
 * Render Profile Page
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    const recentOrders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);

    res.render('profile', {
      title: 'My Profile | VELORA',
      user,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile Information
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, street, city, state, pincode, country } = req.body;
    const user = await User.findById(req.session.user._id);

    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/profile');
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = {
      street: street || user.address.street,
      city: city || user.address.city,
      state: state || user.address.state,
      pincode: pincode || user.address.pincode,
      country: country || user.address.country || 'United States'
    };

    await user.save();

    // Update session
    req.session.user.name = user.name;
    req.session.user.phone = user.phone;
    req.session.user.address = user.address;

    req.flash('success_msg', 'Your profile details were updated successfully.');
    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  logout,
  getProfile,
  updateProfile
};
