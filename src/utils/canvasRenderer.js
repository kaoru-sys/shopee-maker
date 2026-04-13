const CANVAS_SIZE = 1080;
const MARGIN = 30;
const ICON_SIZE = 140;

export async function renderCanvas(canvas, options) {
  const {
    title = '',
    images = [],
    bgColor = '#ffffff',
    borderColor = '#d23c3c',
    textColor = '#141414',
    borderWidth = 8,
    showBorder = true,
    backgroundImage = null,
    customIcon = null,
    textPositionX = 50,
    textPositionY = 8,
    fontSize: userFontSize = 100,
    textBold = true,
    textStroke = false,
  } = options;

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (backgroundImage) {
    // Draw background image
    const bgImg = await loadImage(backgroundImage);
    ctx.drawImage(bgImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  } else {
    // Draw background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw border
    if (showBorder && borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      const offset = MARGIN + borderWidth / 2;
      ctx.strokeRect(offset, offset, CANVAS_SIZE - offset * 2, CANVAS_SIZE - offset * 2);
    }
  }

  // Draw title
  const borderOffset = showBorder && !backgroundImage ? borderWidth : 0;
  const innerLeft = MARGIN + borderOffset;
  const innerTop = MARGIN + borderOffset;
  const innerWidth = CANVAS_SIZE - (MARGIN + borderOffset) * 2;
  const innerHeight = CANVAS_SIZE - (MARGIN + borderOffset) * 2;

  // Calculate title position for image layout (fallback)
  const titleAreaTop = innerTop + 20;
  let titleBottom = titleAreaTop;

  if (title) {
    const maxWidth = innerWidth - 40;
    let fontSize = userFontSize;
    const minFontSize = 24;
    const fontWeight = textBold ? 'bold' : 'normal';

    while (fontSize >= minFontSize) {
      ctx.font = `${fontWeight} ${fontSize}px "Segoe UI", Tahoma, sans-serif`;
      const metrics = ctx.measureText(title);
      if (metrics.width <= maxWidth) break;
      fontSize -= 2;
    }

    ctx.font = `${fontWeight} ${fontSize}px "Segoe UI", Tahoma, sans-serif`;
    ctx.textBaseline = 'top';

    // Determine textAlign from X position
    let textAlign;
    let textX;
    if (textPositionX < 33) {
      textAlign = 'left';
      textX = innerLeft + (innerWidth * textPositionX / 100);
    } else if (textPositionX > 66) {
      textAlign = 'right';
      textX = innerLeft + (innerWidth * textPositionX / 100);
    } else {
      textAlign = 'center';
      textX = innerLeft + (innerWidth * textPositionX / 100);
    }
    ctx.textAlign = textAlign;

    const textY = innerTop + (innerHeight * textPositionY / 100);

    // Stroke (outline)
    if (textStroke) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.strokeText(title, textX, textY, maxWidth);
    }

    // Fill
    ctx.fillStyle = textColor;
    ctx.fillText(title, textX, textY, maxWidth);

    titleBottom = textY + fontSize + 20;
  }

  // Draw product images
  if (images.length > 0) {
    const imageAreaTop = titleBottom + 10;
    const imageAreaBottom = CANVAS_SIZE - MARGIN - (showBorder && !backgroundImage ? borderWidth : 0) - 30;
    const imageAreaLeft = MARGIN + (showBorder && !backgroundImage ? borderWidth : 0) + 20;
    const imageAreaRight = CANVAS_SIZE - MARGIN - (showBorder && !backgroundImage ? borderWidth : 0) - 20;
    const areaWidth = imageAreaRight - imageAreaLeft;
    const areaHeight = imageAreaBottom - imageAreaTop;
    const gap = 15;

    const loadedImages = await Promise.all(images.map(src => loadImage(src)));

    let positions = [];

    if (images.length === 1) {
      const imgSize = Math.min(areaWidth, areaHeight) * 0.85;
      positions = [{
        x: imageAreaLeft + (areaWidth - imgSize) / 2,
        y: imageAreaTop + (areaHeight - imgSize) / 2,
        w: imgSize,
        h: imgSize,
      }];
    } else if (images.length === 2) {
      const cellW = (areaWidth - gap) / 2;
      const cellH = areaHeight * 0.8;
      const imgSize = Math.min(cellW, cellH);
      const startY = imageAreaTop + (areaHeight - imgSize) / 2;
      positions = [
        { x: imageAreaLeft + (cellW - imgSize) / 2, y: startY, w: imgSize, h: imgSize },
        { x: imageAreaLeft + cellW + gap + (cellW - imgSize) / 2, y: startY, w: imgSize, h: imgSize },
      ];
    } else if (images.length <= 4) {
      const cols = 2;
      const rows = Math.ceil(images.length / cols);
      const cellW = (areaWidth - gap * (cols - 1)) / cols;
      const cellH = (areaHeight - gap * (rows - 1)) / rows;
      const imgSize = Math.min(cellW, cellH);
      for (let i = 0; i < images.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const totalRowWidth = (images.length <= 2 || row < Math.floor(images.length / cols) ? cols : images.length % cols) * imgSize + ((images.length <= 2 || row < Math.floor(images.length / cols) ? cols : images.length % cols) - 1) * gap;
        const itemsInRow = row < rows - 1 ? cols : (images.length % cols || cols);
        const rowWidth = itemsInRow * imgSize + (itemsInRow - 1) * gap;
        const rowX = imageAreaLeft + (areaWidth - rowWidth) / 2;
        positions.push({
          x: rowX + (col % itemsInRow) * (imgSize + gap),
          y: imageAreaTop + row * (imgSize + gap) + (areaHeight - rows * imgSize - (rows - 1) * gap) / 2,
          w: imgSize,
          h: imgSize,
        });
      }
    } else {
      const cols = 3;
      const rows = Math.ceil(images.length / cols);
      const cellW = (areaWidth - gap * (cols - 1)) / cols;
      const cellH = (areaHeight - gap * (rows - 1)) / rows;
      const imgSize = Math.min(cellW, cellH);
      for (let i = 0; i < images.length; i++) {
        const row = Math.floor(i / cols);
        const itemsInRow = row < rows - 1 ? cols : (images.length % cols || cols);
        const rowWidth = itemsInRow * imgSize + (itemsInRow - 1) * gap;
        const rowX = imageAreaLeft + (areaWidth - rowWidth) / 2;
        const colInRow = i % cols;
        positions.push({
          x: rowX + colInRow * (imgSize + gap),
          y: imageAreaTop + row * (imgSize + gap) + (areaHeight - rows * imgSize - (rows - 1) * gap) / 2,
          w: imgSize,
          h: imgSize,
        });
      }
    }

    for (let i = 0; i < loadedImages.length; i++) {
      const img = loadedImages[i];
      const pos = positions[i];
      if (!pos) continue;
      drawImageContain(ctx, img, pos.x, pos.y, pos.w, pos.h);
    }
  }

  // Draw icon (bottom-right)
  const iconX = CANVAS_SIZE - MARGIN - (showBorder && !backgroundImage ? borderWidth : 0) - ICON_SIZE - 15;
  const iconY = CANVAS_SIZE - MARGIN - (showBorder && !backgroundImage ? borderWidth : 0) - ICON_SIZE - 15;

  if (customIcon) {
    const iconImg = await loadImage(customIcon);
    ctx.drawImage(iconImg, iconX, iconY, ICON_SIZE, ICON_SIZE);
  }

  return canvas;
}

function drawImageContain(ctx, img, x, y, maxW, maxH) {
  const ratio = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  const dx = x + (maxW - w) / 2;
  const dy = y + (maxH - h) / 2;
  ctx.drawImage(img, dx, dy, w, h);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
