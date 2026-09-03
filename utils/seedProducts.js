const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment configuration
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Review = require('../models/Review');
const { generateProductSVG, generateBannerSVG, PRODUCTS_DIR, BANNERS_DIR, CATEGORIES_DIR } = require('./generateProductImages');

// Category Data
const categoriesData = [
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Elevate your everyday allure with weightless, pigment-rich formulations tailored for effortless radiance.',
    image: '/images/categories/makeup.svg',
    subcategories: [
      'Lipsticks',
      'Lip Gloss',
      'Lip Liner',
      'Blush',
      'Highlighter',
      'Foundation',
      'Concealer',
      'Setting Powder',
      'Mascara',
      'Eyeliner',
      'Eyeshadow'
    ],
    featured: true
  },
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Clinical botanical essentials delivering deep hydration, glass-skin barrier protection, and timeless youth.',
    image: '/images/categories/skincare.svg',
    subcategories: [
      'Face Wash',
      'Cleanser',
      'Serum',
      'Moisturizer',
      'Sunscreen',
      'Face Mask',
      'Toner'
    ],
    featured: true
  }
];

// Product Data - 32 Luxury Beauty Products
const rawProducts = [
  // 1. LIPS
  {
    name: 'Velora Nude Muse Lipstick',
    slug: 'velora-nude-muse-lipstick',
    category: 'Makeup',
    subcategory: 'Lipsticks',
    price: 32,
    discountPrice: 26,
    stock: 45,
    rating: 4.9,
    reviews: 84,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'A cult-classic cushion-matte lipstick that coats lips in creamy, velvety nude decadence with up to 10 hours of transfer-resistant wear.',
    ingredients: 'Dimethicone, Synthetic Wax, Isononyl Isononanoate, Camellia Seed Oil, Rosa Canina Fruit Extract, Tocopherol (Vitamin E), Hyaluronic Acid.',
    howToUse: 'Glide directly across lips starting from the cupid’s bow outward. Blot lightly with tissue for a diffused cloud-like effect.',
    primaryColor: '#B2625D',
    secondaryColor: '#E29A95',
    shades: [
      { name: '01 Bare Elegance', hex: '#C48A85' },
      { name: '02 Warm Cashmere', hex: '#B87268' },
      { name: '03 Velvet Rose', hex: '#A35359' },
      { name: '04 Deep Truffle', hex: '#7D413D' }
    ]
  },
  {
    name: 'Velora Rose Bloom Blush',
    slug: 'velora-rose-bloom-blush',
    category: 'Makeup',
    subcategory: 'Blush',
    price: 36,
    discountPrice: 29,
    stock: 38,
    rating: 4.8,
    reviews: 62,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'An ultra-refined baked powder blush infused with micro-pearl pigments to give cheeks a lit-from-within petal flush.',
    ingredients: 'Mica, Talc, Silica, Squalane, Jojoba Seed Oil, Caprylic/Capric Triglyceride, Rose Damascena Flower Wax.',
    howToUse: 'Sweep over apples of the cheeks blending upward toward temples with an angled blush brush.',
    primaryColor: '#D97582',
    secondaryColor: '#F7B7BE',
    shades: [
      { name: 'Peony Silk', hex: '#E88B97' },
      { name: 'Spiced Peach', hex: '#E28E73' },
      { name: 'Berry Noir', hex: '#9C435A' }
    ]
  },
  {
    name: 'Velora Glass Skin Serum',
    slug: 'velora-glass-skin-serum',
    category: 'Skincare',
    subcategory: 'Serum',
    price: 58,
    discountPrice: 48,
    stock: 50,
    rating: 5.0,
    reviews: 142,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'Transformative multi-weight hyaluronic acid serum paired with niacinamide and peptides for poreless, dewy transparency.',
    ingredients: 'Centella Asiatica Extract, Niacinamide (5%), Multi-Molecular Sodium Hyaluronate, Copper Tripeptide-1, Adenosine, Panthenol (Pro-Vitamin B5).',
    howToUse: 'Dispense 3-4 drops onto damp cleansed skin. Gently press into face, neck, and decollete morning and evening before moisturizer.',
    primaryColor: '#D89FA4',
    secondaryColor: '#F6E4E2',
    shades: [
      { name: 'Luminous Clear', hex: '#F0E5DE' }
    ]
  },
  {
    name: 'Velora Lash Lift Mascara',
    slug: 'velora-lash-lift-mascara',
    category: 'Makeup',
    subcategory: 'Mascara',
    price: 28,
    discountPrice: null,
    stock: 65,
    rating: 4.7,
    reviews: 95,
    featured: false,
    bestseller: true,
    newArrival: false,
    description: 'Extreme gravity-defying lift and fan-out volume powered by an hourglass molded brush and conditioning bamboo fibers.',
    ingredients: 'Aqua, Copernicia Cerifera (Carnauba) Wax, Stearic Acid, Bambusa Vulgaris Leaf/Stem Extract, Biotinoyl Tripeptide-1, Iron Oxides (CI 77499).',
    howToUse: 'Wiggle wand at lash roots and pull through to tips. Apply second coat within 60 seconds for show-stopping panoramic volume.',
    primaryColor: '#1E1A19',
    secondaryColor: '#4A3E3C',
    shades: [
      { name: 'Ultra Carbon Black', hex: '#110F0E' },
      { name: 'Rich Espresso', hex: '#3B2824' }
    ]
  },
  {
    name: 'Velora Cloud Matte Foundation',
    slug: 'velora-cloud-matte-foundation',
    category: 'Makeup',
    subcategory: 'Foundation',
    price: 48,
    discountPrice: 42,
    stock: 40,
    rating: 4.8,
    reviews: 110,
    featured: true,
    bestseller: true,
    newArrival: true,
    description: 'A breathable, weightless skin-smoothing foundation that balances oil, blurs pores, and maintains a natural velvet finish for 16 hours.',
    ingredients: 'Water, Cyclopentasiloxane, Dimethicone, Niacinamide, Glycerin, Silica Silylate, Portulaca Oleracea Extract, Titanium Dioxide.',
    howToUse: 'Pump one drop onto back of hand. Dot onto forehead, cheeks, and chin, then buff seamlessly with a dense foundation brush or damp sponge.',
    primaryColor: '#DDB196',
    secondaryColor: '#F3D9C9',
    shades: [
      { name: '100 Fair Alabaster', hex: '#F6E3D4' },
      { name: '120 Warm Vanilla', hex: '#EED0BB' },
      { name: '210 Neutral Bisque', hex: '#DFB599' },
      { name: '310 Golden Honey', hex: '#C59573' },
      { name: '420 Deep Chestnut', hex: '#87563B' }
    ]
  },
  {
    name: 'Velora Glow Beam Highlighter',
    slug: 'velora-glow-beam-highlighter',
    category: 'Makeup',
    subcategory: 'Highlighter',
    price: 34,
    discountPrice: null,
    stock: 30,
    rating: 4.9,
    reviews: 53,
    featured: true,
    bestseller: false,
    newArrival: true,
    description: 'Liquid champagne luminizer suspended in nourishing botanical squalane that melts into skin for an otherworldly beam of light.',
    ingredients: 'Isododecane, Mica, Hydrogenated Polyisobutene, Squalane, Helianthus Annuus Seed Oil, Chamomilla Recutita Flower Extract.',
    howToUse: 'Tap onto high points of cheekbones, bridge of the nose, and collarbones. Can also be mixed into foundation for an all-over halo glow.',
    primaryColor: '#ECCBA0',
    secondaryColor: '#FFF4E5',
    shades: [
      { name: 'Champagne Frost', hex: '#FBEED6' },
      { name: 'Rose Gold Nectar', hex: '#E8B6A5' },
      { name: 'Bronze Mirage', hex: '#C5966B' }
    ]
  },
  {
    name: 'Velora Velvet Lip Liner',
    slug: 'velora-velvet-lip-liner',
    category: 'Makeup',
    subcategory: 'Lip Liner',
    price: 22,
    discountPrice: 18,
    stock: 55,
    rating: 4.7,
    reviews: 44,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'A creamy gel lip liner pencil designed to contour, plump, and prevent feathering with precise waterproof micro-definition.',
    ingredients: 'Cyclopentasiloxane, Polyethylene, Synthetic Candelilla Wax, C30-50 Alcohols, Macadamia Seed Oil, Jojoba Esters.',
    howToUse: 'Outline just outside the natural lip border to subtly overline and create illusion of fuller pout. Fill in corners for depth.',
    primaryColor: '#9C4F51',
    secondaryColor: '#D18182',
    shades: [
      { name: 'Nude Contour', hex: '#A8665E' },
      { name: 'Mauve Whisper', hex: '#9E5B6E' },
      { name: 'Rose Petal', hex: '#B85564' }
    ]
  },
  {
    name: 'Velora Dew Drop Moisturizer',
    slug: 'velora-dew-drop-moisturizer',
    category: 'Skincare',
    subcategory: 'Moisturizer',
    price: 52,
    discountPrice: null,
    stock: 42,
    rating: 4.9,
    reviews: 79,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'A cloud-light water-gel cream bursting with 73% green tea hydrosol and ceramide complex to lock in 72 hours of uninterrupted barrier hydration.',
    ingredients: 'Camellia Sinensis (Green Tea) Leaf Water, Ceramide NP, Ceramide AP, Sodium Hyaluronate, Centella Asiatica, Allantoin, Trehalose.',
    howToUse: 'Massage a dime-sized amount gently into face and neck after serum. Excellent as a smoothing makeup primer.',
    primaryColor: '#CCD9C7',
    secondaryColor: '#EBF3E8',
    shades: [
      { name: 'Universal Dew', hex: '#E9F0EA' }
    ]
  },
  {
    name: 'Velora Petal Glaze Lip Gloss',
    slug: 'velora-petal-glaze-lip-gloss',
    category: 'Makeup',
    subcategory: 'Lip Gloss',
    price: 26,
    discountPrice: 21,
    stock: 60,
    rating: 4.8,
    reviews: 58,
    featured: false,
    bestseller: true,
    newArrival: true,
    description: 'High-octane mirror shine without a trace of stickiness. Nourished with wild avocado butter and volumizing peptide spheres.',
    ingredients: 'Polybutene, Diisostearyl Malate, Persea Gratissima (Avocado) Butter, Palmitoyl Tripeptide-1, Menthoxypropanediol, Tocopherol.',
    howToUse: 'Swipe oversized plush doe-foot applicator across bare lips or layer atop Velora Nude Muse Lipstick for high-shine drama.',
    primaryColor: '#D47185',
    secondaryColor: '#F9BCC6',
    shades: [
      { name: 'Sugar Crystal', hex: '#FCE7EB' },
      { name: 'Honey Glaze', hex: '#E79F78' },
      { name: 'Berry Syrup', hex: '#AC405E' }
    ]
  },
  {
    name: 'Velora Golden Hour Eyeshadow Palette',
    slug: 'velora-golden-hour-eyeshadow-palette',
    category: 'Makeup',
    subcategory: 'Eyeshadow',
    price: 54,
    discountPrice: 45,
    stock: 32,
    rating: 4.9,
    reviews: 88,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'Twelve buttery shades of molten metallics, velvety soft-focus mattes, and iridescent toppers inspired by the Mediterranean sunset.',
    ingredients: 'Synthetic Fluorphlogopite, Mica, Lauroyl Lysine, Dimethicone, Zinc Stearate, Caprylyl Glycol, Ethylhexylglycerin.',
    howToUse: 'Dust neutral transition shades into crease, press shimmer or metallic pigments onto center lid with fingertip, deepen outer V with matte espresso.',
    primaryColor: '#B06B42',
    secondaryColor: '#F3CDAA',
    shades: [
      { name: '12-Pan Sunset Symphony', hex: '#B86F45' }
    ]
  },
  {
    name: 'Velora Precision Felt Eyeliner',
    slug: 'velora-precision-felt-eyeliner',
    category: 'Makeup',
    subcategory: 'Eyeliner',
    price: 24,
    discountPrice: null,
    stock: 70,
    rating: 4.6,
    reviews: 51,
    featured: false,
    bestseller: false,
    newArrival: false,
    description: 'Ultra-fine 0.1mm Japanese calligraphy brush tip that delivers jet-black carbon lines with 24-hour waterproof, smudge-proof staying power.',
    ingredients: 'Aqua, Acrylates Copolymer, Carbon Black (CI 77266), Laureth-21, PEG-40 Hydrogenated Castor Oil, Phenoxyethanol.',
    howToUse: 'Shake well. Glide tip along upper lash line. Flick upward toward outer end of eyebrow for a razor-sharp cat-eye.',
    primaryColor: '#171413',
    secondaryColor: '#362E2C',
    shades: [
      { name: 'Midnight Onyx', hex: '#111111' },
      { name: 'Chocolate Smoke', hex: '#3B2824' }
    ]
  },
  {
    name: 'Velora Silk Veil Setting Powder',
    slug: 'velora-silk-veil-setting-powder',
    category: 'Makeup',
    subcategory: 'Setting Powder',
    price: 38,
    discountPrice: 32,
    stock: 44,
    rating: 4.9,
    reviews: 73,
    featured: false,
    bestseller: true,
    newArrival: false,
    description: 'Micro-milled featherweight translucent powder that sets makeup for all-day shine control with zero flashback or white cast.',
    ingredients: 'Silica, Tapioca Starch, Lauroyl Lysine, Boron Nitride, Phenoxyethanol, Potassium Sorbate.',
    howToUse: 'Dip a velvet powder puff into sifter, press and roll across T-zone and under eyes for an instant blur-filter finish.',
    primaryColor: '#EADBCC',
    secondaryColor: '#FAF3EB',
    shades: [
      { name: 'Translucent Fair-Medium', hex: '#F3E5D6' },
      { name: 'Translucent Medium-Deep', hex: '#CBA27E' }
    ]
  },
  {
    name: 'Velora Second-Skin Concealer',
    slug: 'velora-second-skin-concealer',
    category: 'Makeup',
    subcategory: 'Concealer',
    price: 30,
    discountPrice: null,
    stock: 48,
    rating: 4.8,
    reviews: 67,
    featured: true,
    bestseller: false,
    newArrival: true,
    description: 'A crease-resistant medium-to-full buildable concealer packed with caffeine and peptides to brighten dark circles and erase blemishes.',
    ingredients: 'Aqua, Isododecane, Dimethicone, Caffeine, Palmitoyl Tetrapeptide-7, Niacinamide, Glycerin, Titanium Dioxide.',
    howToUse: 'Dot directly beneath inner tear trough and outer eye corner. Tap into skin using ring finger or soft concealer brush.',
    primaryColor: '#E2B89A',
    secondaryColor: '#F7DCBE',
    shades: [
      { name: 'Fair Warm', hex: '#F7E2CE' },
      { name: 'Light Neutral', hex: '#E8CAA7' },
      { name: 'Medium Golden', hex: '#D2A176' },
      { name: 'Deep Caramel', hex: '#935F3A' }
    ]
  },
  {
    name: 'Velora Barrier Reset Cleanser',
    slug: 'velora-barrier-reset-cleanser',
    category: 'Skincare',
    subcategory: 'Cleanser',
    price: 34,
    discountPrice: 28,
    stock: 52,
    rating: 4.9,
    reviews: 64,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'A nourishing jelly-to-milk cleanser that lifts away waterproof cosmetics and pollutants while reinforcing healthy acid mantle balance.',
    ingredients: 'Glycerin, Caprylic/Capric Triglyceride, Aqua, Sucrose Stearate, Colloidal Oatmeal, Ceramide EOP, Chamomilla Recutita Extract.',
    howToUse: 'Apply to dry skin to melt makeup. Add warm water to emulsify into a soothing milky lather, then rinse clean.',
    primaryColor: '#E2CBBF',
    secondaryColor: '#F6ECE5',
    shades: [
      { name: 'Universal', hex: '#F2E8E1' }
    ]
  },
  {
    name: 'Velora Botanical Infusion Toner',
    slug: 'velora-botanical-infusion-toner',
    category: 'Skincare',
    subcategory: 'Toner',
    price: 36,
    discountPrice: null,
    stock: 40,
    rating: 4.7,
    reviews: 38,
    featured: false,
    bestseller: false,
    newArrival: false,
    description: 'A comforting milky toner balancing 80% damask rose water and fermented galactomyces to prep skin for optimal essence absorption.',
    ingredients: 'Rosa Damascena Flower Water, Galactomyces Ferment Filtrate, Butylene Glycol, Panthenol, Dipotassium Glycyrrhizate.',
    howToUse: 'Pour a generous splash into palms and pat gently onto freshly cleansed face until fully absorbed.',
    primaryColor: '#DE9FA3',
    secondaryColor: '#F9E5E6',
    shades: [
      { name: 'Rose Radiance', hex: '#F7DFE1' }
    ]
  },
  {
    name: 'Velora Mineral Radiance Sunscreen SPF 50',
    slug: 'velora-mineral-radiance-sunscreen-spf-50',
    category: 'Skincare',
    subcategory: 'Sunscreen',
    price: 42,
    discountPrice: 35,
    stock: 55,
    rating: 4.9,
    reviews: 104,
    featured: true,
    bestseller: true,
    newArrival: true,
    description: 'Non-nano zinc oxide mineral shield with invisible universal glow tone. Protects against UVA, UVB, blue light, and urban pollution.',
    ingredients: 'Zinc Oxide (18.5%), Titanium Dioxide (2.5%), Ectoin, Bisabolol, Niacinamide, Polyglutamic Acid, Iron Oxides.',
    howToUse: 'Apply two finger lengths evenly across face, ears, and neck 15 minutes prior to sun exposure. Reapply every 2 hours.',
    primaryColor: '#E2BE97',
    secondaryColor: '#F8E9D6',
    shades: [
      { name: 'Invisible Glow', hex: '#F1DCB9' }
    ]
  },
  {
    name: 'Velora Hydrogel Rose Face Mask',
    slug: 'velora-hydrogel-rose-face-mask',
    category: 'Skincare',
    subcategory: 'Face Mask',
    price: 24,
    discountPrice: null,
    stock: 62,
    rating: 4.8,
    reviews: 49,
    featured: false,
    bestseller: false,
    newArrival: false,
    description: 'Cooling pink hydrogel sheet mask soaked in French rose extract and marine collagen to immediately revive fatigued, parched complexions.',
    ingredients: 'Aqua, Glycerin, Chondrus Crispus Powder, Rosa Centifolia Flower Extract, Hydrolyzed Collagen, Betaine, Sodium Hyaluronate.',
    howToUse: 'Smooth mask over cleansed skin. Relax for 20 minutes. Peel off and massage residual essence into skin—do not rinse.',
    primaryColor: '#D97587',
    secondaryColor: '#F8CBD3',
    shades: [
      { name: 'Rose Hydrogel', hex: '#F7B7C2' }
    ]
  },
  {
    name: 'Velora Sculpt & Bronzing Stick',
    slug: 'velora-sculpt-and-bronzing-stick',
    category: 'Makeup',
    subcategory: 'Blush',
    price: 34,
    discountPrice: 28,
    stock: 36,
    rating: 4.8,
    reviews: 55,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'A creamy, foolproof contour stick that melts effortlessly into skin for natural sculpted cheekbones and sun-kissed warmth.',
    ingredients: 'C12-15 Alkyl Benzoate, Phenyl Trimethicone, Synthetic Beeswax, Silica, Butyrospermum Parkii (Shea) Butter, Vitamin E.',
    howToUse: 'Swipe along hollows of cheeks, jawline, and forehead perimeter. Diffuse with warm fingertips or a blending sponge.',
    primaryColor: '#8C5238',
    secondaryColor: '#C98C6C',
    shades: [
      { name: 'Amber Glow', hex: '#B87B5B' },
      { name: 'Cocoa Contour', hex: '#693822' }
    ]
  },
  {
    name: 'Velora Overnight Renewal Cream',
    slug: 'velora-overnight-renewal-cream',
    category: 'Skincare',
    subcategory: 'Moisturizer',
    price: 64,
    discountPrice: 54,
    stock: 35,
    rating: 5.0,
    reviews: 77,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'An indulgent nighttime recovery cream powered by encapsulated retinaldehyde and bakuchiol to stimulate cellular turnover without irritation.',
    ingredients: 'Aqua, Squalane, Butyrospermum Parkii Butter, Retinal (0.05%), Bakuchiol, Palmitoyl Hexapeptide-12, Sodium Hyaluronate.',
    howToUse: 'Warm a pea-sized amount between fingertips and smooth across clean skin every evening before bed.',
    primaryColor: '#CCA899',
    secondaryColor: '#EFE0D7',
    shades: [
      { name: 'Velvet Cloud', hex: '#E8D2C5' }
    ]
  },
  {
    name: 'Velora Peptide Eye Lift Treatment',
    slug: 'velora-peptide-eye-lift-treatment',
    category: 'Skincare',
    subcategory: 'Serum',
    price: 46,
    discountPrice: null,
    stock: 45,
    rating: 4.7,
    reviews: 41,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'Targeted cooling ceramic applicator that dispenses an active peptide cocktail to instantly depuff and visibly firm under-eye contours.',
    ingredients: 'Aqua, Acetyl Hexapeptide-8, Caffeine, Escin, Hesperidin Methyl Chalcone, Hydrolyzed Hyaluronic Acid, Phenoxyethanol.',
    howToUse: 'Gently squeeze tube to release formula onto ceramic tip. Glide in outward circles around orbital bone morning and night.',
    primaryColor: '#C49B91',
    secondaryColor: '#F0D6CF',
    shades: [
      { name: 'Youth Elixir', hex: '#E8CBC5' }
    ]
  },
  {
    name: 'Velora Brow Sculpt Gel',
    slug: 'velora-brow-sculpt-gel',
    category: 'Makeup',
    subcategory: 'Mascara',
    price: 22,
    discountPrice: 18,
    stock: 58,
    rating: 4.6,
    reviews: 39,
    featured: false,
    bestseller: false,
    newArrival: false,
    description: 'Flake-free lamination-effect brow gel that tames, grooms, and sets arches with flexible, featherweight 16-hour all-day hold.',
    ingredients: 'Water, VP/VA Copolymer, Alcohol Denat., Butylene Glycol, Panthenol, Hydrolyzed Keratin, Carbomer.',
    howToUse: 'Comb through brows using upward flicking strokes to coat hairs, then use flat side of brush to press and laminate hairs flat.',
    primaryColor: '#2B2625',
    secondaryColor: '#5C4E4B',
    shades: [
      { name: 'Clear Lamination', hex: '#EBEAE8' },
      { name: 'Soft Brown', hex: '#5E4137' }
    ]
  },
  {
    name: 'Velora Satin Lip Cushion',
    slug: 'velora-satin-lip-cushion',
    category: 'Makeup',
    subcategory: 'Lipsticks',
    price: 30,
    discountPrice: null,
    stock: 40,
    rating: 4.8,
    reviews: 50,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'Whipped cloud lip tint offering comfortable blurred color with a satin-matte pillowy finish that never cracks or dries out.',
    ingredients: 'Dimethicone Crosspolymer, Polyglyceryl-2 Triisostearate, Macadamia Ternifolia Seed Oil, Fragrance, Red 7 Lake.',
    howToUse: 'Dab onto center of lips and diffuse with finger for a soft, just-bitten romantic gradient.',
    primaryColor: '#B54C5B',
    secondaryColor: '#E68A96',
    shades: [
      { name: 'Rosewater', hex: '#D26C78' },
      { name: 'Crimson Velvet', hex: '#8F2636' },
      { name: 'Warm Terracotta', hex: '#B25739' }
    ]
  },
  {
    name: 'Velora Glow Mist Setting Spray',
    slug: 'velora-glow-mist-setting-spray',
    category: 'Makeup',
    subcategory: 'Setting Powder',
    price: 32,
    discountPrice: 26,
    stock: 50,
    rating: 4.9,
    reviews: 68,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'Micro-fine bi-phase mist blending nourishing marula oil and setting polymers to melt powders together into a flawless luminous finish.',
    ingredients: 'Aqua, Sclerocarya Birrea (Marula) Seed Oil, Niacinamide, PVP, Hamamelis Virginiana (Witch Hazel) Extract, Phenoxyethanol.',
    howToUse: 'Shake vigorously before use. Hold bottle 8-10 inches away and mist face in an "X" and "T" motion.',
    primaryColor: '#D3A499',
    secondaryColor: '#F5DDD7',
    shades: [
      { name: 'Luminous Dew', hex: '#EBD0C8' }
    ]
  },
  {
    name: 'Velora Pure Gentle Face Wash',
    slug: 'velora-pure-gentle-face-wash',
    category: 'Skincare',
    subcategory: 'Face Wash',
    price: 28,
    discountPrice: null,
    stock: 60,
    rating: 4.7,
    reviews: 43,
    featured: false,
    bestseller: false,
    newArrival: false,
    description: 'Low-pH foaming gel face wash packed with chamomile and green tea to purify pores without stripping the delicate skin barrier.',
    ingredients: 'Water, Sodium Cocoyl Isethionate, Glycerin, Cocamidopropyl Betaine, Chamomilla Recutita Extract, Camellia Sinensis Leaf Extract.',
    howToUse: 'Lather a small amount with damp hands. Massage over damp face in circular motions, then rinse thoroughly.',
    primaryColor: '#A8BEAA',
    secondaryColor: '#E0EDE1',
    shades: [
      { name: 'Calming Clean', hex: '#D6E6D8' }
    ]
  },
  {
    name: 'Velora Champagne Strobe Liquid',
    slug: 'velora-champagne-strobe-liquid',
    category: 'Makeup',
    subcategory: 'Highlighter',
    price: 36,
    discountPrice: 29,
    stock: 35,
    rating: 4.8,
    reviews: 36,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'Concentrated liquid glow drops that impart a wet-look sheen to skin with zero glitter fallout.',
    ingredients: 'Hydrogenated Didecene, Isododecane, Hydrogenated Polyisobutene, Synthetic Fluorphlogopite, Disteardimonium Hectorite.',
    howToUse: 'Mix 1-2 drops with your daily moisturizer or tap directly onto collarbones and shoulders for an alluring shimmer.',
    primaryColor: '#DFC094',
    secondaryColor: '#FBF1DC',
    shades: [
      { name: 'Gilded Opal', hex: '#F3DEC2' },
      { name: 'Bronze Goddess', hex: '#BF8A5B' }
    ]
  },
  {
    name: 'Velora Overnight Lip Sleeping Mask',
    slug: 'velora-overnight-lip-sleeping-mask',
    category: 'Skincare',
    subcategory: 'Face Mask',
    price: 24,
    discountPrice: null,
    stock: 75,
    rating: 4.9,
    reviews: 112,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'Intense berry-infused buttery lip treatment that deeply repairs chapped lips overnight, revealing soft baby-smooth lips by sunrise.',
    ingredients: 'Diisostearyl Malate, Hydrogenated Polyisobutene, Astrocaryum Murumuru Seed Butter, Rubus Idaeus (Raspberry) Fruit Extract, Vitamin E.',
    howToUse: 'Coat lips generously before retiring for the night. In the morning, gently wipe away dead cells with a warm cloth.',
    primaryColor: '#B73F57',
    secondaryColor: '#F5A9B8',
    shades: [
      { name: 'Wild Raspberry', hex: '#D65C74' }
    ]
  },
  {
    name: 'Velora Full-Coverage Corrector',
    slug: 'velora-full-coverage-corrector',
    category: 'Makeup',
    subcategory: 'Concealer',
    price: 26,
    discountPrice: null,
    stock: 42,
    rating: 4.7,
    reviews: 31,
    featured: false,
    bestseller: false,
    newArrival: false,
    description: 'Color-correcting pot infused with peach and green botanical pigments to neutralize redness and dark purple under-eye shadows.',
    ingredients: 'Octyldodecanol, Cera Microcristallina, Copernicia Cerifera Cera, Dimethicone, Camellia Sinensis Seed Oil, Iron Oxides.',
    howToUse: 'Dab sparingly with ring finger directly onto areas of discoloration prior to applying foundation or concealer.',
    primaryColor: '#DDA88F',
    secondaryColor: '#F9E2D2',
    shades: [
      { name: 'Peach Brightener', hex: '#E8A388' },
      { name: 'Pistachio Redness Eraser', hex: '#B2C7B0' }
    ]
  },
  {
    name: 'Velora Mineral Purifying Clay Mask',
    slug: 'velora-mineral-purifying-clay-mask',
    category: 'Skincare',
    subcategory: 'Face Mask',
    price: 38,
    discountPrice: 32,
    stock: 33,
    rating: 4.8,
    reviews: 47,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'French pink clay infused with lactic acid and elderflower to gently extract impurities, minimize pores, and smooth complexion.',
    ingredients: 'Kaolin (Pink Clay), Montmorillonite, Aqua, Sambucus Nigra (Elderberry) Flower Extract, Lactic Acid, Allantoin.',
    howToUse: 'Smooth an even layer over face, avoiding the eye area. Leave on for 10-12 minutes until touch dry, then rinse with warm water.',
    primaryColor: '#CFA09C',
    secondaryColor: '#F2D7D4',
    shades: [
      { name: 'French Pink Clay', hex: '#E4B5B1' }
    ]
  },
  {
    name: 'Velora Silk Finish Liquid Eyeshadow',
    slug: 'velora-silk-finish-liquid-eyeshadow',
    category: 'Makeup',
    subcategory: 'Eyeshadow',
    price: 26,
    discountPrice: null,
    stock: 48,
    rating: 4.6,
    reviews: 33,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'One-swipe liquid metallic eye color that glides on like liquid silk and dries down into a crease-proof, water-resistant sparkle.',
    ingredients: 'Aqua, Synthetic Fluorphlogopite, Polyurethane-35, Glycerin, Silica, Phenoxyethanol, Tin Oxide.',
    howToUse: 'Dot directly onto eyelids with applicator wand and blend edges immediately with fingertip before product sets.',
    primaryColor: '#B88277',
    secondaryColor: '#EBC3BB',
    shades: [
      { name: 'Rose Diamond', hex: '#D29C91' },
      { name: 'Champagne Shimmer', hex: '#DFC09C' },
      { name: 'Smoky Bronze', hex: '#774C3E' }
    ]
  },
  {
    name: 'Velora Clarifying BHA Exfoliant',
    slug: 'velora-clarifying-bha-exfoliant',
    category: 'Skincare',
    subcategory: 'Toner',
    price: 36,
    discountPrice: 30,
    stock: 44,
    rating: 4.9,
    reviews: 82,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'Gentle 2% encapsulated Salicylic Acid liquid exfoliant that unclogs congestion, diminishes blackheads, and resurfaces skin texture.',
    ingredients: 'Water, Methylpropanediol, Butylene Glycol, Salicylic Acid (2%), Polysorbate 20, Camellia Oleifera Leaf Extract, Sodium Hydroxide.',
    howToUse: 'Apply gently with hands or cotton pad over face and neck after cleansing. Do not rinse off. Follow with serum and SPF in daytime.',
    primaryColor: '#7CA099',
    secondaryColor: '#D8E8E4',
    shades: [
      { name: 'Pure Clarity', hex: '#C2DBD6' }
    ]
  },
  {
    name: 'Velora Luminous Sheer Tint SPF 30',
    slug: 'velora-luminous-sheer-tint-spf-30',
    category: 'Makeup',
    subcategory: 'Foundation',
    price: 44,
    discountPrice: null,
    stock: 39,
    rating: 4.8,
    reviews: 57,
    featured: false,
    bestseller: false,
    newArrival: true,
    description: 'Lightweight skin tint infusing broad-spectrum SPF 30, squalane, and sheer buildable pigments for a fresh morning no-makeup makeup look.',
    ingredients: 'Active Ingredients: Octinoxate, Titanium Dioxide. Inactive: Squalane, Niacinamide, Glycerin, Dimethicone, Tocopheryl Acetate.',
    howToUse: 'Smooth generously over entire face with fingers as the final step of morning routine or as an ultra-natural base.',
    primaryColor: '#D6A68A',
    secondaryColor: '#F5D3BD',
    shades: [
      { name: 'Sheer Porcelain', hex: '#F9E6D8' },
      { name: 'Sheer Beige', hex: '#E5BF9E' },
      { name: 'Sheer Tan', hex: '#BA8964' }
    ]
  },
  {
    name: 'Velora Nourishing Treatment Cleansing Balm',
    slug: 'velora-nourishing-treatment-cleansing-balm',
    category: 'Skincare',
    subcategory: 'Cleanser',
    price: 42,
    discountPrice: 34,
    stock: 46,
    rating: 5.0,
    reviews: 91,
    featured: true,
    bestseller: true,
    newArrival: false,
    description: 'Sorbet-soft buttery balm enriched with meadowfoam seed oil and rosehip to dissolve stubborn waterproof mascara and SPF instantly.',
    ingredients: 'Ethylhexyl Palmitate, Cetyl Ethylhexanoate, PEG-20 Glyceryl Triisostearate, Limnanthes Alba (Meadowfoam) Seed Oil, Rosa Canina Fruit Oil.',
    howToUse: 'Scoop a small dollop onto dry face. Massage gently over eyes and skin in circular motions, then rinse with warm water.',
    primaryColor: '#D19A8A',
    secondaryColor: '#F7DDD5',
    shades: [
      { name: 'Rosehip Elixir', hex: '#EAC3B7' }
    ]
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/velora_beauty';
    console.log(`[Seeder] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB.');

    // 1. Generate local SVG product images
    console.log('[Seeder] Generating high-resolution cosmetic SVG illustrations...');
    for (const prod of rawProducts) {
      const svgContent = generateProductSVG(prod);
      const filename = `${prod.slug}.svg`;
      const filePath = path.join(PRODUCTS_DIR, filename);
      fs.writeFileSync(filePath, svgContent, 'utf-8');
    }

    // Default placeholder SVG
    const placeholderSvg = generateProductSVG({
      name: 'Velora Beauty Classic',
      category: 'Makeup',
      subcategory: 'Lipsticks',
      primaryColor: '#B2625D',
      secondaryColor: '#E29A95'
    });
    fs.writeFileSync(path.join(PRODUCTS_DIR, 'placeholder.svg'), placeholderSvg, 'utf-8');

    // Generate banners
    const heroBannerSvg = generateBannerSVG('YOUR BEAUTY. YOUR RULES.', 'Discover modern makeup and clinical skincare formulated for every version of you.');
    fs.writeFileSync(path.join(BANNERS_DIR, 'hero-banner.svg'), heroBannerSvg, 'utf-8');

    const promoBannerSvg = generateBannerSVG('LUXURY FORMULAS. ETHICAL CRAFT.', 'Vegan, cruelty-free botanicals backed by dermatologist science.');
    fs.writeFileSync(path.join(BANNERS_DIR, 'promo-banner.svg'), promoBannerSvg, 'utf-8');

    // Generate category SVGs
    const makeupCatSvg = generateProductSVG({
      name: 'Velora Makeup Collection',
      category: 'Makeup',
      subcategory: 'Lipsticks',
      primaryColor: '#B2625D',
      secondaryColor: '#E29A95'
    });
    fs.writeFileSync(path.join(CATEGORIES_DIR, 'makeup.svg'), makeupCatSvg, 'utf-8');

    const skincareCatSvg = generateProductSVG({
      name: 'Velora Skincare Rituals',
      category: 'Skincare',
      subcategory: 'Serum',
      primaryColor: '#CCD9C7',
      secondaryColor: '#EBF3E8'
    });
    fs.writeFileSync(path.join(CATEGORIES_DIR, 'skincare.svg'), skincareCatSvg, 'utf-8');

    console.log(`[Seeder] Successfully created ${rawProducts.length + 5} SVG image assets.`);

    // 2. Clear existing demo data
    console.log('[Seeder] Cleaning existing collections...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    // 3. Seed Categories
    console.log('[Seeder] Seeding categories...');
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`[Seeder] Seeded ${insertedCategories.length} categories.`);

    // 4. Seed Admin & Customer accounts
    console.log('[Seeder] Seeding default users...');
    const adminUser = new User({
      name: 'Velora Admin',
      email: 'admin@velora.com',
      password: 'Admin@123password', // Will be hashed via pre-save hook
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: {
        street: '750 5th Avenue, Suite 1200',
        city: 'New York',
        state: 'NY',
        pincode: '10019',
        country: 'United States'
      }
    });
    await adminUser.save();

    const customerUser = new User({
      name: 'Sophia Laurent',
      email: 'customer@velora.com',
      password: 'Customer@123password', // Will be hashed via pre-save hook
      role: 'customer',
      phone: '+1 (555) 349-8812',
      address: {
        street: '142 Mercer Street, Apt 4B',
        city: 'New York',
        state: 'NY',
        pincode: '10012',
        country: 'United States'
      }
    });
    await customerUser.save();
    console.log('[Seeder] Created Admin (admin@velora.com / Admin@123password) and Demo Customer.');

    // 5. Seed Products
    console.log('[Seeder] Seeding products...');
    const productsToInsert = rawProducts.map(p => {
      const discountPercentage = (p.discountPrice && p.discountPrice < p.price)
        ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
        : 0;

      return {
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory,
        brand: 'VELORA',
        price: p.price,
        discountPrice: p.discountPrice,
        discountPercentage: discountPercentage,
        images: [`/images/products/${p.slug}.svg`],
        colors: p.shades,
        shades: p.shades,
        ingredients: p.ingredients,
        howToUse: p.howToUse,
        stock: p.stock,
        rating: p.rating,
        reviews: p.reviews,
        featured: p.featured,
        bestseller: p.bestseller,
        newArrival: p.newArrival
      };
    });

    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`[Seeder] Successfully seeded ${insertedProducts.length} beauty products.`);

    // 6. Seed Sample Reviews
    console.log('[Seeder] Seeding product reviews...');
    const topProducts = insertedProducts.slice(0, 5);
    const sampleReviews = [
      {
        product: topProducts[0]._id,
        user: customerUser._id,
        userName: customerUser.name,
        rating: 5,
        title: 'The most hydrating matte lipstick I own!',
        comment: 'I wore this to a 9-hour event and my lips felt velvety and comfortable the whole time. Bare Elegance is the ultimate universal nude.',
        shade: '01 Bare Elegance'
      },
      {
        product: topProducts[1]._id,
        user: customerUser._id,
        userName: 'Isabella M.',
        rating: 5,
        title: 'Natural blooming flush',
        comment: 'Peony Silk looks so radiant on fair-medium skin. It blends like a dream and doesn’t accentuate any texture or pores.',
        shade: 'Peony Silk'
      },
      {
        product: topProducts[2]._id,
        user: customerUser._id,
        userName: 'Camille Dubois',
        rating: 5,
        title: 'Real glass skin in a bottle',
        comment: 'Within two weeks of using this serum morning and evening, my skin texture cleared up dramatically and looks so luminous even without makeup!',
        shade: 'Luminous Clear'
      }
    ];
    await Review.insertMany(sampleReviews);
    console.log('[Seeder] Seeded sample customer reviews.');

    console.log('====================================================');
    console.log(' [VELORA] DATABASE SEEDING COMPLETED SUCCESSFULLY!  ');
    console.log(' Products: ' + insertedProducts.length);
    console.log(' Categories: ' + insertedCategories.length);
    console.log(' Admin login: admin@velora.com / Admin@123password');
    console.log(' Customer login: customer@velora.com / Customer@123password');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Fatal error during database seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
