const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

/**
 * Render Home Page
 */
const getHome = async (req, res, next) => {
  try {
    const featuredProducts = await Product.find({ featured: true }).limit(8);
    const bestsellers = await Product.find({ bestseller: true }).limit(8);
    const newArrivals = await Product.find({ newArrival: true }).limit(8);
    const lipProducts = await Product.find({ subcategory: { $in: ['Lipsticks', 'Lip Gloss', 'Lip Liner'] } }).limit(6);
    const faceProducts = await Product.find({ subcategory: { $in: ['Blush', 'Highlighter', 'Foundation', 'Concealer', 'Setting Powder'] } }).limit(6);
    const skincareProducts = await Product.find({ category: 'Skincare' }).limit(6);
    const categories = await Category.find({});
    const customerReviews = await Review.find({}).populate('product').limit(6);

    res.render('home', {
      title: 'VELORA | Modern Luxury Makeup & Skincare',
      featuredProducts,
      bestsellers,
      newArrivals,
      lipProducts,
      faceProducts,
      skincareProducts,
      categories,
      customerReviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render Shop / Products Catalog with MongoDB Filtering and Sorting
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      sort = 'featured',
      rating,
      page = 1
    } = req.query;

    const limit = 12;
    const skip = (Number(page) - 1) * limit;

    // Build MongoDB query
    const query = {};

    if (category && category !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (subcategory && subcategory !== 'all') {
      query.subcategory = new RegExp(`^${subcategory}$`, 'i');
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Determine sorting logic
    let sortCriteria = { featured: -1, createdAt: -1 };
    if (sort === 'newest') {
      sortCriteria = { createdAt: -1 };
    } else if (sort === 'price-asc') {
      sortCriteria = { price: 1 };
    } else if (sort === 'price-desc') {
      sortCriteria = { price: -1 };
    } else if (sort === 'rating') {
      sortCriteria = { rating: -1 };
    } else if (sort === 'bestseller') {
      sortCriteria = { bestseller: -1, reviews: -1 };
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const categories = await Category.find({});
    const totalPages = Math.ceil(totalProducts / limit) || 1;

    res.render('products', {
      title: 'Shop All | VELORA Beauty',
      products,
      categories,
      currentCategory: category || 'all',
      currentSubcategory: subcategory || 'all',
      searchQuery: search || '',
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
      selectedSort: sort,
      selectedRating: rating || '',
      currentPage: Number(page),
      totalPages,
      totalProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Shortcut Category / Curated views (e.g., /category/makeup, /category/lips)
 */
const getCategoryPage = async (req, res, next) => {
  const { categorySlug } = req.params;
  const catParam = categorySlug.toLowerCase();

  // Map shortcuts
  if (catParam === 'lips') {
    req.query.category = 'Makeup';
    req.query.subcategory = 'Lipsticks';
  } else if (catParam === 'eyes') {
    req.query.category = 'Makeup';
    req.query.subcategory = 'Mascara';
  } else if (catParam === 'face') {
    req.query.category = 'Makeup';
    req.query.subcategory = 'Blush';
  } else if (catParam === 'makeup') {
    req.query.category = 'Makeup';
  } else if (catParam === 'skincare') {
    req.query.category = 'Skincare';
  } else if (catParam === 'bestsellers') {
    req.query.sort = 'bestseller';
  } else if (catParam === 'new-arrivals') {
    req.query.sort = 'newest';
  }

  return getProducts(req, res, next);
};

/**
 * Server-Side Product Search Results Page
 */
const getSearch = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ featured: -1, rating: -1 });

    res.render('search', {
      title: `Search results for "${search}" | VELORA`,
      searchQuery: search,
      products,
      totalResults: products.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Product Details Page
 */
const getProductDetails = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).render('404', {
        title: 'Product Not Found - VELORA',
        url: req.originalUrl
      });
    }

    // Fetch related products in the same category/subcategory
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    // Fetch reviews for this product
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });

    res.render('product-details', {
      title: `${product.name} | VELORA`,
      product,
      relatedProducts,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Product Review
 */
const postReview = async (req, res, next) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Please sign in to leave a review.');
      return res.redirect('/login');
    }

    const { productId, rating, title, comment, shade } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      req.flash('error_msg', 'Product not found.');
      return res.redirect('/products');
    }

    const newReview = new Review({
      product: product._id,
      user: req.session.user._id,
      userName: req.session.user.name,
      rating: Number(rating) || 5,
      title: title || 'Verified Buyer Review',
      comment,
      shade: shade || ''
    });

    await newReview.save();

    // Recalculate product rating and reviews count
    const allReviews = await Review.find({ product: product._id });
    const avgRating = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;

    product.rating = Number(avgRating.toFixed(1));
    product.reviews = allReviews.length;
    await product.save();

    req.flash('success_msg', 'Thank you! Your review has been submitted.');
    res.redirect(`/product/${product.slug}#reviews-section`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHome,
  getProducts,
  getCategoryPage,
  getSearch,
  getProductDetails,
  postReview
};
