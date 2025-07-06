// script.js

// Utility: parse preset value like "1920x1080" into {width, height}
function getDimensions(value) {
  const [w, h] = value.split('x').map(Number);
  return { width: w, height: h };
}

document.addEventListener('DOMContentLoaded', () => {
  const previewBox = document.getElementById('preview-box');
  const fullscreenIcon = previewBox.querySelector('.fullscreen-icon');
  const hexCodeInput = document.getElementById('hexCode');
  const colorPicker = document.getElementById('colorPicker');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const presetSelect = document.getElementById('preset');
  const downloadBtn = document.getElementById('downloadBtn');

  let currentColor = '#000000';
  let currentWidth = parseInt(widthInput.value);
  let currentHeight = parseInt(heightInput.value);

  // Apply color to preview
  function applyColor(color) {
    currentColor = color;
    previewBox.style.backgroundColor = color;
    hexCodeInput.value = color.toUpperCase();
    colorPicker.value = color;
  }

  // Apply resolution to preview dimensions (scaled down for preview)
  function applyResolution(w, h) {
    currentWidth = w;
    currentHeight = h;
    // Maintain 16:9 ratio preview width: 540px
    const previewW = 540;
    const previewH = (h / w) * previewW;
    previewBox.style.width = previewW + 'px';
    previewBox.style.height = previewH + 'px';
  }

  // Fullscreen logic
  function openFullscreen() {
    if (previewBox.requestFullscreen) {
      previewBox.requestFullscreen();
    } else if (previewBox.webkitRequestFullscreen) {
      previewBox.webkitRequestFullscreen();
    } else if (previewBox.msRequestFullscreen) {
      previewBox.msRequestFullscreen();
    }
  }

  // Click anywhere inside preview box (not just icon)
  previewBox.addEventListener('click', function (e) {
    // Only open fullscreen if not already in fullscreen and not right click
    // Also, don't trigger when user is selecting text inside preview (edge-case)
    if (!document.fullscreenElement && e.button === 0) {
      openFullscreen();
    }
  });

  // Hide icon in fullscreen, show in normal mode
  function setFullscreenIconVisibility() {
    // Use fullscreenElement to check
    if (
      document.fullscreenElement === previewBox ||
      document.webkitFullscreenElement === previewBox ||
      document.msFullscreenElement === previewBox
    ) {
      fullscreenIcon.style.display = 'none';
    } else {
      fullscreenIcon.style.display = '';
    }
  }

  // Listen for fullscreen change
  ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(evt => {
    document.addEventListener(evt, setFullscreenIconVisibility);
  });

  // Also, prevent icon click from triggering twice (optional, but cleaner UX)
  fullscreenIcon.addEventListener('click', function (e) {
    e.stopPropagation();
    openFullscreen();
  });

  // Initialize
  applyColor(currentColor);
  applyResolution(currentWidth, currentHeight);
  setFullscreenIconVisibility();

  // Preset change
  presetSelect.addEventListener('change', (e) => {
    const { width, height } = getDimensions(e.target.value);
    widthInput.value = width;
    heightInput.value = height;
    applyResolution(width, height);
  });

  // Custom resolution change
  function customChange() {
    const w = parseInt(widthInput.value) || currentWidth;
    const h = parseInt(heightInput.value) || currentHeight;
    applyResolution(w, h);
  }

  widthInput.addEventListener('input', customChange);
  heightInput.addEventListener('input', customChange);

  // Hex input change
  hexCodeInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      applyColor(val);
    }
  });

  // Color picker change
  colorPicker.addEventListener('input', (e) => applyColor(e.target.value));

  // Vertical color blocks click
  document.querySelectorAll('.color-block-vert').forEach(div => {
    div.addEventListener('click', () => {
      const col = div.getAttribute('data-color');
      applyColor(col);
    });
  });

  // Horizontal color blocks click
  document.querySelectorAll('.color-block').forEach(div => {
    div.addEventListener('click', () => {
      document.querySelectorAll('.color-block').forEach(d => d.classList.remove('selected'));
      div.classList.add('selected');
      const col = div.getAttribute('data-color');
      applyColor(col);
    });
  });

  // Download PNG
  downloadBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = currentColor;
    ctx.fillRect(0, 0, currentWidth, currentHeight);
    const link = document.createElement('a');
    link.download = 'color.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});
