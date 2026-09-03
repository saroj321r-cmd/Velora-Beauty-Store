const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');

const TEST_PORT = 3005;

function request(options, postData = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    if (postData) {
      if (typeof postData === 'object' && !(postData instanceof URLSearchParams)) {
        headers['Content-Type'] = 'application/json';
        postData = JSON.stringify(postData);
      }
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const reqOptions = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: options.path,
      method: options.method || 'GET',
      headers
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        let newCookie = cookie;
        if (setCookie) {
          newCookie = setCookie.map(c => c.split(';')[0]).join('; ');
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          cookie: newCookie
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log(' 🧪 STARTING VELORA COMPREHENSIVE VERIFICATION SUITE');
  console.log('====================================================');

  const server = app.listen(TEST_PORT, async () => {
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
      try {
        await fn();
        console.log(` ✅ PASS: ${name}`);
        passed++;
      } catch (err) {
        console.error(` ❌ FAIL: ${name} ->`, err.message);
        failed++;
      }
    }

    try {
      // 1. Public Pages
      await test('GET / (Home Page)', async () => {
        const res = await request({ path: '/' });
        if (res.statusCode !== 200 || !res.body.includes('YOUR BEAUTY')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /products (Shop All Catalog)', async () => {
        const res = await request({ path: '/products' });
        if (res.statusCode !== 200 || !res.body.includes('Shop All Products')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /products?category=Makeup (Filter Makeup)', async () => {
        const res = await request({ path: '/products?category=Makeup' });
        if (res.statusCode !== 200 || !res.body.includes('Makeup')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /category/makeup (Category Shortcut)', async () => {
        const res = await request({ path: '/category/makeup' });
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /category/skincare (Category Shortcut)', async () => {
        const res = await request({ path: '/category/skincare' });
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /category/lips (Category Shortcut)', async () => {
        const res = await request({ path: '/category/lips' });
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /product/velora-nude-muse-lipstick (Product Details)', async () => {
        const res = await request({ path: '/product/velora-nude-muse-lipstick' });
        if (res.statusCode !== 200 || !res.body.includes('Velora Nude Muse Lipstick')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /search?search=serum (Server-side Search)', async () => {
        const res = await request({ path: '/search?search=serum' });
        if (res.statusCode !== 200 || !res.body.includes('Search results for')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /cart (Shopping Bag)', async () => {
        const res = await request({ path: '/cart' });
        if (res.statusCode !== 200 || !res.body.includes('Shopping Bag')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /login (Client Login Page)', async () => {
        const res = await request({ path: '/login' });
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /signup (Client Registration Page)', async () => {
        const res = await request({ path: '/signup' });
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /admin/login (Admin Portal Login)', async () => {
        const res = await request({ path: '/admin/login' });
        if (res.statusCode !== 200 || !res.body.includes('Executive Console')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /admin/dashboard (Unauthorized Redirect to Login)', async () => {
        const res = await request({ path: '/admin/dashboard' });
        if (res.statusCode !== 302 || !res.headers.location.includes('/admin/login')) throw new Error(`Expected 302 to login, got ${res.statusCode}`);
      });

      await test('GET /non-existent-url-test (404 Page)', async () => {
        const res = await request({ path: '/non-existent-url-test' });
        if (res.statusCode !== 404 || !res.body.includes('404')) throw new Error(`Status ${res.statusCode}`);
      });

      // 2. Customer Authentication & Protected Routes
      let customerCookie = '';
      await test('POST /login (Customer Sign In)', async () => {
        const params = new URLSearchParams({
          email: 'customer@velora.com',
          password: 'Customer@123password'
        }).toString();

        const res = await request({
          path: '/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, params);

        if (res.statusCode !== 302) throw new Error(`Expected redirect, got ${res.statusCode}`);
        customerCookie = res.cookie;
      });

      await test('GET /profile (Authenticated Profile Page)', async () => {
        const res = await request({ path: '/profile' }, null, customerCookie);
        if (res.statusCode !== 200 || !res.body.includes('Sophia Laurent')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /wishlist (Authenticated Wishlist Page)', async () => {
        const res = await request({ path: '/wishlist' }, null, customerCookie);
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /orders (Authenticated Orders Page)', async () => {
        const res = await request({ path: '/orders' }, null, customerCookie);
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      });

      // 3. Cart & Checkout Flow
      const Product = require('./models/Product');
      const testProd = await Product.findOne({ slug: 'velora-nude-muse-lipstick' });

      await test('POST /cart/add (Add to Cart)', async () => {
        const addParams = new URLSearchParams({
          productId: testProd._id.toString(),
          quantity: '2',
          shade: '01 Bare Elegance'
        }).toString();

        const res = await request({
          path: '/cart/add',
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, addParams, customerCookie);

        if (res.statusCode !== 302 && res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
        customerCookie = res.cookie || customerCookie;
      });

      await test('GET /checkout (Checkout Page)', async () => {
        const res = await request({ path: '/checkout' }, null, customerCookie);
        if (res.statusCode !== 200 || !res.body.includes('Checkout & Dispatch')) throw new Error(`Status ${res.statusCode}`);
      });

      let orderId = '';
      await test('POST /checkout (Place Order with COD)', async () => {
        const checkoutParams = new URLSearchParams({
          fullName: 'Sophia Laurent',
          email: 'customer@velora.com',
          phone: '+1 (555) 349-8812',
          address: '142 Mercer Street, Apt 4B',
          city: 'New York',
          state: 'NY',
          pincode: '10012',
          paymentMethod: 'COD'
        }).toString();

        const res = await request({
          path: '/checkout',
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, checkoutParams, customerCookie);

        if (res.statusCode !== 302 || !res.headers.location.includes('/order-success/')) {
          throw new Error(`Expected redirect to /order-success, got ${res.statusCode} -> ${res.headers.location}`);
        }
        orderId = res.headers.location.split('/').pop();
      });

      await test('GET /order-success/:id (Order Success Confirmation)', async () => {
        const res = await request({ path: `/order-success/${orderId}` }, null, customerCookie);
        if (res.statusCode !== 200 || !res.body.includes('Thank You For Your Order')) throw new Error(`Status ${res.statusCode}`);
      });

      // 4. Admin Authentication & Dashboard
      let adminCookie = '';
      await test('POST /admin/login (Admin Sign In)', async () => {
        const adminParams = new URLSearchParams({
          email: 'admin@velora.com',
          password: 'Admin@123password'
        }).toString();

        const res = await request({
          path: '/admin/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, adminParams);

        if (res.statusCode !== 302 || !res.headers.location.includes('/admin/dashboard')) {
          throw new Error(`Expected redirect to dashboard, got ${res.statusCode}`);
        }
        adminCookie = res.cookie;
      });

      await test('GET /admin/dashboard (Admin Dashboard Stats)', async () => {
        const res = await request({ path: '/admin/dashboard' }, null, adminCookie);
        if (res.statusCode !== 200 || !res.body.includes('Console Overview')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /admin/products (Admin Inventory Catalog)', async () => {
        const res = await request({ path: '/admin/products' }, null, adminCookie);
        if (res.statusCode !== 200 || !res.body.includes('Product Catalog & Inventory')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /admin/products/add (Admin Add Product Form)', async () => {
        const res = await request({ path: '/admin/products/add' }, null, adminCookie);
        if (res.statusCode !== 200 || !res.body.includes('Create Product Listing')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('GET /admin/orders (Admin Orders Fulfillment)', async () => {
        const res = await request({ path: '/admin/orders' }, null, adminCookie);
        if (res.statusCode !== 200 || !res.body.includes('Order Processing & Fulfillment')) throw new Error(`Status ${res.statusCode}`);
      });

      await test('POST /admin/orders/status/:id (Update Order Status to Shipped)', async () => {
        const statusParams = new URLSearchParams({
          status: 'Shipped',
          note: 'Bespoke courier dispatched.'
        }).toString();

        const res = await request({
          path: `/admin/orders/status/${orderId}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, statusParams, adminCookie);

        if (res.statusCode !== 302) throw new Error(`Expected redirect, got ${res.statusCode}`);
      });

      await test('GET /admin/users (Admin Client Directory)', async () => {
        const res = await request({ path: '/admin/users' }, null, adminCookie);
        if (res.statusCode !== 200 || !res.body.includes('Client Directory & Accounts')) throw new Error(`Status ${res.statusCode}`);
      });

      console.log('====================================================');
      console.log(` 🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
      console.log('====================================================');

      server.close();
      await mongoose.disconnect();
      process.exit(failed > 0 ? 1 : 0);

    } catch (suiteError) {
      console.error('Fatal test suite error:', suiteError);
      server.close();
      await mongoose.disconnect();
      process.exit(1);
    }
  });
}

runVerification();
