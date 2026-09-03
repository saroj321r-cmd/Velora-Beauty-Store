/**
 * VELORA Luxury Beauty - Main Frontend Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    if (mobileDrawer && drawerOverlay) {
      mobileDrawer.classList.add('active');
      drawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer && drawerOverlay) {
      mobileDrawer.classList.remove('active');
      drawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // 2. Flash Alert Dismissals
  const alertCloses = document.querySelectorAll('.alert-close');
  alertCloses.forEach(btn => {
    btn.addEventListener('click', () => {
      const alertBox = btn.closest('.alert');
      if (alertBox) {
        alertBox.style.opacity = '0';
        setTimeout(() => alertBox.remove(), 250);
      }
    });
  });

  // Auto-dismiss alerts after 5 seconds
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    });
  }, 5000);

  // 3. Header Scrolled Shadow Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 40) {
        header.style.boxShadow = '0 4px 20px rgba(26, 22, 21, 0.06)';
      } else {
        header.style.boxShadow = 'none';
      }
    }
  });

  // 4. Product Details Tab Switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(targetId);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });

  // 5. Product Details Interactive Shade Selector
  const shadeSwatches = document.querySelectorAll('.swatch-btn');
  const activeShadeName = document.getElementById('activeShadeName');
  const shadeInput = document.getElementById('selectedShadeInput');

  shadeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      shadeSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      const shadeName = swatch.getAttribute('data-shade-name');
      if (activeShadeName) {
        activeShadeName.textContent = shadeName;
      }
      if (shadeInput) {
        shadeInput.value = shadeName;
      }
    });
  });

  // 6. Product Gallery Thumbnails
  const thumbItems = document.querySelectorAll('.thumb-item');
  const mainImage = document.getElementById('mainGalleryImg');

  thumbItems.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbItems.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.getAttribute('data-src');
      if (mainImage && newSrc) {
        mainImage.src = newSrc;
      }
    });
  });

  // 7. Details Quantity Stepper
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyInput = document.getElementById('productQtyInput');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
      }
    });

    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      const max = parseInt(qtyInput.getAttribute('max'), 10) || 99;
      if (val < max) {
        qtyInput.value = val + 1;
      }
    });
  }
});
