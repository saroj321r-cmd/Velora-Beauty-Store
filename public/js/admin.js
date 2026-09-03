/**
 * VELORA Admin Console Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Category -> Subcategory mapping
  const subcategoryMap = {
    'Makeup': [
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
    'Skincare': [
      'Face Wash',
      'Cleanser',
      'Serum',
      'Moisturizer',
      'Sunscreen',
      'Face Mask',
      'Toner'
    ]
  };

  const categorySelect = document.getElementById('adminCategorySelect');
  const subcategorySelect = document.getElementById('adminSubcategorySelect');

  if (categorySelect && subcategorySelect) {
    categorySelect.addEventListener('change', () => {
      const selectedCat = categorySelect.value;
      const subcats = subcategoryMap[selectedCat] || [];

      subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
      subcats.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        subcategorySelect.appendChild(opt);
      });
    });
  }

  // Image Upload Preview
  const imageInput = document.getElementById('adminImageInput');
  const imagePreview = document.getElementById('adminImagePreview');

  if (imageInput && imagePreview) {
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
