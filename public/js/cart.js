/**
 * VELORA Luxury Beauty - Cart & Wishlist Interactions
 */

// Show floating notification toast
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('veloraToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'veloraToastContainer';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '2rem';
    toastContainer.style.right = '2rem';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '0.75rem';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `velora-toast velora-toast-${type}`;
  toast.style.background = type === 'success' ? '#1A1615' : '#7A2424';
  toast.style.color = '#FFFFFF';
  toast.style.padding = '0.85rem 1.4rem';
  toast.style.borderRadius = '30px';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
  toast.style.fontSize = '0.85rem';
  toast.style.fontWeight = '500';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.75rem';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(15px)';
  toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠'}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Update badges in navbar
function updateNavBadges(cartCount, wishlistCount) {
  if (cartCount !== undefined) {
    const cartBadges = document.querySelectorAll('.cart-badge-count');
    cartBadges.forEach(badge => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? 'flex' : 'none';
    });
  }

  if (wishlistCount !== undefined) {
    const wishBadges = document.querySelectorAll('.wishlist-badge-count');
    wishBadges.forEach(badge => {
      badge.textContent = wishlistCount;
      badge.style.display = wishlistCount > 0 ? 'flex' : 'none';
    });
  }
}

// Global quick add to cart
document.addEventListener('click', async (e) => {
  const addBtn = e.target.closest('.ajax-add-to-cart');
  if (addBtn) {
    e.preventDefault();
    const productId = addBtn.getAttribute('data-product-id');
    const shade = addBtn.getAttribute('data-shade') || '';
    const quantity = addBtn.getAttribute('data-qty') || 1;

    try {
      addBtn.disabled = true;
      const originalText = addBtn.innerHTML;
      addBtn.innerHTML = 'Adding...';

      const response = await fetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ productId, shade, quantity })
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message, 'success');
        updateNavBadges(data.cartCount);
      } else {
        showToast(data.message || 'Could not add to bag', 'error');
      }

      addBtn.innerHTML = originalText;
      addBtn.disabled = false;
    } catch (err) {
      console.error('Cart add error:', err);
      showToast('Error connecting to server', 'error');
      addBtn.disabled = false;
    }
  }

  // Wishlist toggle
  const wishBtn = e.target.closest('.ajax-wishlist-toggle');
  if (wishBtn) {
    e.preventDefault();
    const productId = wishBtn.getAttribute('data-product-id');

    try {
      const response = await fetch('/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ productId })
      });

      const data = await response.json();

      if (data.requireLogin) {
        window.location.href = '/login';
        return;
      }

      if (data.success) {
        wishBtn.classList.toggle('active', data.isAdded);
        wishBtn.classList.add('heart-animated');
        setTimeout(() => wishBtn.classList.remove('heart-animated'), 400);

        showToast(data.message, 'success');
        updateNavBadges(undefined, data.wishlistCount);
      } else {
        showToast(data.message || 'Error updating wishlist', 'error');
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  }
});
