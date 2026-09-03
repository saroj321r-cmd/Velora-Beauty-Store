const mongoose = require('mongoose');

const shadeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    default: 'VELORA'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: null
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  images: [{
    type: String,
    default: ['/images/products/placeholder.svg']
  }],
  colors: [shadeSchema],
  shades: [shadeSchema],
  ingredients: {
    type: String,
    default: 'Cruelty-Free, Paraben-Free, Vegan, Infused with Hyaluronic Acid, Vitamin E & Botanical Extracts.'
  },
  howToUse: {
    type: String,
    default: 'Apply gently to clean skin or lips. Layer as desired for richer intensity and a radiant finish.'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 25
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 12
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestseller: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate discountPercentage automatically if discountPrice is provided
productSchema.pre('save', function(next) {
  if (this.discountPrice && this.discountPrice < this.price) {
    this.discountPercentage = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  } else {
    this.discountPercentage = 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
