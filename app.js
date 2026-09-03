const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

// Load environment variables
dotenv.config();

// Database Connection
const connectDB = require('./config/db');
connectDB();

const app = express();

// View Engine Setup (EJS + SSR)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body Parsers & Method Override
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'velora_luxury_secret_session_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

// Flash Messaging
app.use(flash());

// Authentication locals & Cart counts
const { setLocals } = require('./middleware/auth');
app.use(setLocals);

// Route Handlers
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use(productRoutes);
app.use(userRoutes);
app.use(cartRoutes);
app.use(wishlistRoutes);
app.use(orderRoutes);
app.use(adminRoutes);

// 404 & Error Handlers
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Server Initiation
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` ✨ VELORA Luxury Beauty Store is running!`);
    console.log(` 🌐 URL: http://localhost:${PORT}`);
    console.log(` ⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
