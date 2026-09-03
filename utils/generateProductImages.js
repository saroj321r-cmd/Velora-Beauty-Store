const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '../public/images/products');
const BANNERS_DIR = path.join(__dirname, '../public/images/banners');
const CATEGORIES_DIR = path.join(__dirname, '../public/images/categories');

// Ensure output directories exist
[PRODUCTS_DIR, BANNERS_DIR, CATEGORIES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Generate a luxury cosmetic SVG for a given product
 */
function generateProductSVG(product) {
  const { name, category, subcategory, primaryColor = '#C47C85', secondaryColor = '#E8C5C8', type = 'lipstick' } = product;
  const cleanName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const subcatLower = (subcategory || '').toLowerCase();
  const catLower = (category || '').toLowerCase();

  let visualType = 'general';
  if (subcatLower.includes('lipstick') || subcatLower.includes('lip') || name.toLowerCase().includes('lipstick')) {
    visualType = 'lipstick';
  } else if (subcatLower.includes('blush') || subcatLower.includes('powder') || subcatLower.includes('highlighter')) {
    visualType = 'compact';
  } else if (subcatLower.includes('serum') || subcatLower.includes('oil') || subcatLower.includes('toner')) {
    visualType = 'serum';
  } else if (subcatLower.includes('foundation') || subcatLower.includes('concealer') || subcatLower.includes('cleanser') || subcatLower.includes('moisturizer') || subcatLower.includes('sunscreen')) {
    visualType = 'bottle';
  } else if (subcatLower.includes('mascara') || subcatLower.includes('eyeliner') || subcatLower.includes('gloss')) {
    visualType = 'wand';
  } else if (subcatLower.includes('eyeshadow') || subcatLower.includes('palette') || subcatLower.includes('mask')) {
    visualType = 'palette';
  }

  let illustrationSvg = '';

  if (visualType === 'lipstick') {
    illustrationSvg = `
      <!-- Lipstick Base Stand / Shadow -->
      <ellipse cx="250" cy="460" rx="90" ry="18" fill="rgba(60, 30, 35, 0.08)" filter="blur(8px)" />
      
      <!-- Lipstick Bottom Outer Case (Rose Gold / Deep Plum) -->
      <defs>
        <linearGradient id="casingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2D2826" />
          <stop offset="35%" stop-color="#4A3B3A" />
          <stop offset="60%" stop-color="#2D2826" />
          <stop offset="90%" stop-color="#1F1A19" />
          <stop offset="100%" stop-color="#141110" />
        </linearGradient>
        <linearGradient id="roseGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#B87B75" />
          <stop offset="30%" stop-color="#F2D3CF" />
          <stop offset="60%" stop-color="#DDA8A2" />
          <stop offset="90%" stop-color="#9C5A55" />
        </linearGradient>
        <linearGradient id="bulletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${secondaryColor}" />
          <stop offset="40%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="#4A1521" />
        </linearGradient>
      </defs>

      <!-- Lower Body Case -->
      <rect x="205" y="270" width="90" height="180" rx="6" fill="url(#casingGrad)" />
      <!-- Gold band trim -->
      <rect x="205" y="260" width="90" height="14" fill="url(#roseGoldGrad)" />
      <rect x="205" y="271" width="90" height="1.5" fill="#5B1E31" opacity="0.4" />

      <!-- Inner Inner Sleeve (Rose Gold exposed) -->
      <rect x="218" y="195" width="64" height="68" rx="2" fill="url(#roseGoldGrad)" />
      <rect x="220" y="200" width="60" height="6" fill="rgba(0,0,0,0.1)" />

      <!-- Angled Lipstick Bullet -->
      <path d="M 224 200 
               C 224 180, 225 155, 236 120 
               C 245 90, 260 75, 276 95 
               C 278 120, 276 175, 276 200 Z" 
            fill="url(#bulletGrad)" />
      <!-- Bullet Bevel Highlight -->
      <path d="M 236 120 C 248 105, 266 85, 276 95 C 268 118, 252 140, 240 148 Z" fill="${secondaryColor}" opacity="0.6" />
      <ellipse cx="254" cy="115" rx="8" ry="16" transform="rotate(-25 254 115)" fill="#ffffff" opacity="0.3" filter="blur(3px)" />

      <!-- Embossed Brand Logo on Casing -->
      <text x="250" y="360" font-family="'Playfair Display', serif" font-size="12" letter-spacing="4" fill="#F2D3CF" text-anchor="middle" opacity="0.85">VELORA</text>
      <text x="250" y="380" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" letter-spacing="2" fill="#E8C5C8" text-anchor="middle" opacity="0.6">LUXE MATTE</text>
    `;
  } else if (visualType === 'compact') {
    illustrationSvg = `
      <!-- Compact Shadow -->
      <ellipse cx="250" cy="410" rx="140" ry="24" fill="rgba(60, 30, 35, 0.1)" filter="blur(10px)" />
      
      <defs>
        <linearGradient id="compactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FAF5F0" />
          <stop offset="50%" stop-color="#EEDFD5" />
          <stop offset="100%" stop-color="#D8C3B4" />
        </linearGradient>
        <linearGradient id="roseGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F7DFDA" />
          <stop offset="50%" stop-color="#C5857E" />
          <stop offset="100%" stop-color="#9C5952" />
        </linearGradient>
        <radialGradient id="powderGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stop-color="${secondaryColor}" />
          <stop offset="65%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="#6E2836" />
        </radialGradient>
      </defs>

      <!-- Mirror Lid propped up (Upper Lid) -->
      <ellipse cx="250" cy="160" rx="120" ry="60" fill="url(#compactGrad)" stroke="url(#roseGoldRing)" stroke-width="4" />
      <ellipse cx="250" cy="160" rx="102" ry="46" fill="#F0F4F8" opacity="0.8" stroke="rgba(255,255,255,0.7)" stroke-width="2" />
      <path d="M 180 145 L 320 175" stroke="#FFFFFF" stroke-width="8" opacity="0.4" filter="blur(3px)" />

      <!-- Lower Powder Base -->
      <ellipse cx="250" cy="310" rx="135" ry="85" fill="url(#compactGrad)" stroke="url(#roseGoldRing)" stroke-width="5" />
      <!-- Rose Gold Inner Rim -->
      <ellipse cx="250" cy="310" rx="112" ry="68" fill="none" stroke="url(#roseGoldRing)" stroke-width="3" />
      <!-- Powder Pan -->
      <ellipse cx="250" cy="310" rx="100" ry="60" fill="url(#powderGrad)" />
      
      <!-- Embossed Brand Pattern in Powder -->
      <path d="M 250 280 C 230 300, 230 320, 250 340 C 270 320, 270 300, 250 280 Z" fill="none" stroke="${secondaryColor}" stroke-width="2" opacity="0.5" />
      <text x="250" y="315" font-family="'Playfair Display', serif" font-size="14" letter-spacing="5" fill="#FFFFFF" text-anchor="middle" opacity="0.85">VELORA</text>
    `;
  } else if (visualType === 'serum') {
    illustrationSvg = `
      <!-- Dropper Bottle Shadow -->
      <ellipse cx="250" cy="450" rx="85" ry="16" fill="rgba(60, 30, 35, 0.09)" filter="blur(8px)" />

      <defs>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
          <stop offset="25%" stop-color="rgba(255,255,255,0.3)" />
          <stop offset="70%" stop-color="rgba(255,255,255,0.1)" />
          <stop offset="100%" stop-color="rgba(230,220,215,0.6)" />
        </linearGradient>
        <linearGradient id="serumLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${secondaryColor}" stop-opacity="0.8" />
          <stop offset="60%" stop-color="${primaryColor}" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#8C3B4E" stop-opacity="0.85" />
        </linearGradient>
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#D8A49D" />
          <stop offset="40%" stop-color="#FCECE9" />
          <stop offset="80%" stop-color="#C7847C" />
          <stop offset="100%" stop-color="#9C5B54" />
        </linearGradient>
      </defs>

      <!-- Glass Bottle Body -->
      <rect x="195" y="210" width="110" height="220" rx="20" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.8)" stroke-width="2" />
      <!-- Liquid Content Fill -->
      <rect x="202" y="240" width="96" height="182" rx="14" fill="url(#serumLiquid)" />
      
      <!-- Internal Pipette Glass -->
      <rect x="246" y="160" width="8" height="230" fill="rgba(255,255,255,0.5)" />
      
      <!-- Minimalist Luxury Label -->
      <rect x="208" y="275" width="84" height="110" rx="3" fill="#FFFFFF" opacity="0.94" />
      <text x="250" y="305" font-family="'Playfair Display', serif" font-size="10" letter-spacing="3" fill="#2D2826" text-anchor="middle" font-weight="600">VELORA</text>
      <line x1="225" y1="315" x2="275" y2="315" stroke="#C47C85" stroke-width="1" />
      <text x="250" y="332" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" letter-spacing="1.5" fill="#666" text-anchor="middle">RADIANCE</text>
      <text x="250" y="348" font-family="'Plus Jakarta Sans', sans-serif" font-size="6" letter-spacing="1" fill="#888" text-anchor="middle">30 ML / 1.0 FL OZ</text>
      <circle cx="250" cy="365" r="3" fill="${primaryColor}" />

      <!-- Bottle Neck -->
      <rect x="232" y="185" width="36" height="25" fill="url(#capGrad)" />
      <!-- Metallic Collar -->
      <rect x="225" y="170" width="50" height="16" rx="2" fill="url(#capGrad)" />
      <!-- Pipette Rubber Bulb -->
      <path d="M 235 170 C 235 135, 265 135, 265 170 Z" fill="#FDFBF7" stroke="#E5DDD5" stroke-width="2" />
    `;
  } else if (visualType === 'bottle') {
    illustrationSvg = `
      <!-- Foundation / Cream Pump Bottle -->
      <ellipse cx="250" cy="460" rx="80" ry="16" fill="rgba(60, 30, 35, 0.08)" filter="blur(8px)" />

      <defs>
        <linearGradient id="pumpCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#302927" />
          <stop offset="40%" stop-color="#554946" />
          <stop offset="100%" stop-color="#241E1C" />
        </linearGradient>
        <linearGradient id="metalRing" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#C5877F" />
          <stop offset="50%" stop-color="#FCEBE8" />
          <stop offset="100%" stop-color="#A5625B" />
        </linearGradient>
        <linearGradient id="formulaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${secondaryColor}" />
          <stop offset="50%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${secondaryColor}" />
        </linearGradient>
      </defs>

      <!-- Glass Bottle Base -->
      <rect x="200" y="210" width="100" height="230" rx="12" fill="#FAF6F2" stroke="#EAE0D7" stroke-width="2" />
      <!-- Foundation shade window -->
      <rect x="206" y="220" width="88" height="210" rx="8" fill="url(#formulaGrad)" />
      <!-- Frosted Overlay -->
      <rect x="200" y="210" width="100" height="230" rx="12" fill="rgba(255,255,255,0.2)" />

      <!-- Minimal Label Typography -->
      <text x="250" y="320" font-family="'Playfair Display', serif" font-size="13" letter-spacing="4" fill="#201A18" text-anchor="middle" font-weight="700">VELORA</text>
      <text x="250" y="340" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" letter-spacing="2" fill="#3D3330" text-anchor="middle">PURE PERFECTION</text>
      <text x="250" y="355" font-family="'Plus Jakarta Sans', sans-serif" font-size="6.5" letter-spacing="1" fill="#5E514D" text-anchor="middle">LUMINOUS FINISH</text>

      <!-- Pump Collar (Rose Gold) -->
      <rect x="226" y="185" width="48" height="26" fill="url(#metalRing)" />
      <!-- Pump Head -->
      <path d="M 230 185 L 230 150 C 230 142, 270 142, 270 150 L 270 185 Z" fill="url(#pumpCapGrad)" />
      <path d="M 220 155 L 235 155 L 235 165 L 220 162 Z" fill="url(#pumpCapGrad)" />
      <!-- Transparent Outer Overcap -->
      <rect x="215" y="130" width="70" height="80" rx="8" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" />
    `;
  } else if (visualType === 'wand') {
    illustrationSvg = `
      <!-- Mascara / Wand Shadow -->
      <ellipse cx="250" cy="460" rx="70" ry="14" fill="rgba(60, 30, 35, 0.09)" filter="blur(8px)" />

      <defs>
        <linearGradient id="wandBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1B1716" />
          <stop offset="35%" stop-color="#3B3230" />
          <stop offset="70%" stop-color="#231E1D" />
          <stop offset="100%" stop-color="#100D0D" />
        </linearGradient>
        <linearGradient id="wandCap" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#C5857E" />
          <stop offset="45%" stop-color="#FBE6E3" />
          <stop offset="85%" stop-color="#AD6962" />
        </linearGradient>
      </defs>

      <!-- Tube Body -->
      <rect x="228" y="220" width="44" height="230" rx="10" fill="url(#wandBody)" />
      <!-- Rose Gold Ring -->
      <rect x="227" y="212" width="46" height="9" fill="url(#wandCap)" />

      <!-- Vertical Label -->
      <text x="250" y="340" font-family="'Playfair Display', serif" font-size="10" letter-spacing="4" fill="#FBE6E3" text-anchor="middle" transform="rotate(-90 250 340)">VELORA COUTURE</text>

      <!-- Wand Cap Section -->
      <rect x="230" y="70" width="40" height="142" rx="8" fill="url(#wandCap)" />
      <line x1="250" y1="70" x2="250" y2="212" stroke="#FFFFFF" stroke-width="1.5" opacity="0.4" />
    `;
  } else {
    // Palette / Skincare Jar
    illustrationSvg = `
      <!-- Jar / Compact Luxury Item -->
      <ellipse cx="250" cy="440" rx="110" ry="20" fill="rgba(60, 30, 35, 0.08)" filter="blur(8px)" />

      <defs>
        <linearGradient id="jarGlass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF4EE" />
          <stop offset="50%" stop-color="#F0E3D6" />
          <stop offset="100%" stop-color="#E2D0C1" />
        </linearGradient>
        <linearGradient id="lidRose" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#B87770" />
          <stop offset="40%" stop-color="#F7D8D3" />
          <stop offset="80%" stop-color="#A8615A" />
        </linearGradient>
      </defs>

      <!-- Glass Cream Pot -->
      <path d="M 175 270 C 175 270, 165 410, 200 425 C 225 435, 275 435, 300 425 C 335 410, 325 270, 325 270 Z" fill="url(#jarGlass)" stroke="#DFC9B8" stroke-width="2" />
      
      <!-- Cream content shine -->
      <ellipse cx="250" cy="275" rx="72" ry="12" fill="${secondaryColor}" opacity="0.4" />

      <!-- Minimal Brand Label -->
      <rect x="205" y="325" width="90" height="50" rx="3" fill="#FFFFFF" opacity="0.9" />
      <text x="250" y="348" font-family="'Playfair Display', serif" font-size="10" letter-spacing="3" fill="#201A18" text-anchor="middle" font-weight="600">VELORA</text>
      <text x="250" y="362" font-family="'Plus Jakarta Sans', sans-serif" font-size="6.5" letter-spacing="1.5" fill="#7C6B67" text-anchor="middle">HYDRA SOOTH</text>

      <!-- Rose Gold Lid -->
      <ellipse cx="250" cy="245" rx="82" ry="20" fill="url(#lidRose)" />
      <rect x="168" y="225" width="164" height="20" fill="url(#lidRose)" />
      <ellipse cx="250" cy="225" rx="82" ry="20" fill="#E6ABA3" stroke="#FCECE9" stroke-width="1.5" />
    `;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF7" />
      <stop offset="40%" stop-color="#F7EFE9" />
      <stop offset="100%" stop-color="#EFE3DB" />
    </linearGradient>
    <radialGradient id="softGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
      <stop offset="60%" stop-color="#FCEEEA" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#EFE2DA" stop-opacity="0" />
    </radialGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#3A1C22" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Background Canvas with luxury glow -->
  <rect width="500" height="500" fill="url(#bgGrad)" />
  <circle cx="250" cy="250" r="210" fill="url(#softGlow)" />

  <!-- Subtle Studio Halo Pedestal -->
  <ellipse cx="250" cy="445" rx="170" ry="26" fill="rgba(240, 225, 218, 0.7)" />

  <!-- Main Cosmetic Illustration -->
  <g filter="url(#softShadow)">
    ${illustrationSvg}
  </g>

  <!-- Watermark / Category Pill Tag -->
  <g transform="translate(24, 28)">
    <rect x="0" y="0" width="84" height="22" rx="11" fill="#FFFFFF" opacity="0.85" />
    <text x="42" y="14" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="600" letter-spacing="1.2" fill="#5B1E31" text-anchor="middle">${(category || 'BEAUTY').toUpperCase()}</text>
  </g>

  <!-- Top Right Brand Stamp -->
  <text x="475" y="42" font-family="'Playfair Display', serif" font-size="11" letter-spacing="3" fill="#A87F79" text-anchor="end" opacity="0.7">VELORA</text>
</svg>`;

  return svg;
}

/**
 * Generate marketing banners for homepage & categories
 */
function generateBannerSVG(title, subtitle, accentColor = '#842D48') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 650" width="100%" height="100%">
  <defs>
    <linearGradient id="bannerBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF5F0" />
      <stop offset="35%" stop-color="#F4E6DC" />
      <stop offset="70%" stop-color="#EAD5CB" />
      <stop offset="100%" stop-color="#D9BFB2" />
    </linearGradient>
    <radialGradient id="sunGlow" cx="80%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#EEDFD5" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1600" height="650" fill="url(#bannerBg)" />
  <circle cx="1200" cy="250" r="450" fill="url(#sunGlow)" />

  <!-- Abstract Aesthetic Shapes -->
  <path d="M 950 0 C 1100 150, 1300 200, 1600 120 L 1600 650 L 850 650 C 950 500, 900 250, 950 0 Z" fill="#E8D1C4" opacity="0.3" />
  <circle cx="1350" cy="350" r="180" fill="none" stroke="#DDA8A2" stroke-width="2" opacity="0.5" />
  <circle cx="1350" cy="350" r="230" fill="none" stroke="#B87770" stroke-width="1" stroke-dasharray="8 8" opacity="0.4" />

  <!-- Botanical / Organic leaf lines -->
  <path d="M 1250 550 Q 1320 400 1420 320 Q 1380 430 1450 550 Z" fill="#C5857E" opacity="0.15" />
  <path d="M 1150 580 Q 1200 480 1300 420 Q 1250 520 1310 600 Z" fill="#9C5A55" opacity="0.1" />

  <!-- Editorial Typography -->
  <text x="120" y="160" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" letter-spacing="6" fill="${accentColor}">THE NEW LUXE BEAUTY ARCHIVE</text>
  <text x="120" y="260" font-family="'Playfair Display', serif" font-size="64" font-weight="700" letter-spacing="2" fill="#1A1615">${title.toUpperCase()}</text>
  <text x="120" y="320" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="300" letter-spacing="1" fill="#4A3F3D">${subtitle}</text>

  <rect x="120" y="380" width="180" height="52" rx="26" fill="#1A1615" />
  <text x="210" y="412" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" letter-spacing="2.5" fill="#FFFFFF" text-anchor="middle">EXPLORE NOW</text>
</svg>`;
}

module.exports = {
  generateProductSVG,
  generateBannerSVG,
  PRODUCTS_DIR,
  BANNERS_DIR,
  CATEGORIES_DIR
};
