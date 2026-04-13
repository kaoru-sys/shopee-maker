// Draw Japan map icon (red circle with white Japan silhouette)
export function drawJapanIcon(ctx, x, y, size) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  // Red circle background
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#dc3232';
  ctx.fill();

  // White Japan silhouette (simplified path)
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.fillStyle = '#ffffff';

  // Hokkaido
  ctx.beginPath();
  ctx.moveTo(65, 18);
  ctx.bezierCurveTo(70, 15, 78, 16, 80, 20);
  ctx.bezierCurveTo(82, 24, 80, 28, 76, 30);
  ctx.bezierCurveTo(72, 32, 68, 30, 65, 27);
  ctx.bezierCurveTo(62, 24, 62, 20, 65, 18);
  ctx.fill();

  // Honshu (main island)
  ctx.beginPath();
  ctx.moveTo(58, 32);
  ctx.bezierCurveTo(62, 30, 68, 32, 72, 35);
  ctx.bezierCurveTo(75, 38, 73, 42, 70, 45);
  ctx.bezierCurveTo(67, 48, 63, 50, 60, 53);
  ctx.bezierCurveTo(57, 56, 54, 60, 50, 62);
  ctx.bezierCurveTo(46, 64, 42, 63, 40, 60);
  ctx.bezierCurveTo(38, 57, 36, 54, 35, 50);
  ctx.bezierCurveTo(34, 46, 36, 42, 40, 40);
  ctx.bezierCurveTo(44, 38, 48, 36, 52, 34);
  ctx.bezierCurveTo(55, 33, 56, 32, 58, 32);
  ctx.fill();

  // Shikoku
  ctx.beginPath();
  ctx.moveTo(38, 62);
  ctx.bezierCurveTo(42, 60, 46, 62, 46, 65);
  ctx.bezierCurveTo(46, 68, 42, 70, 38, 68);
  ctx.bezierCurveTo(34, 66, 34, 63, 38, 62);
  ctx.fill();

  // Kyushu
  ctx.beginPath();
  ctx.moveTo(30, 62);
  ctx.bezierCurveTo(34, 60, 37, 63, 36, 67);
  ctx.bezierCurveTo(35, 71, 32, 75, 28, 76);
  ctx.bezierCurveTo(24, 77, 22, 74, 23, 70);
  ctx.bezierCurveTo(24, 66, 27, 63, 30, 62);
  ctx.fill();

  // Okinawa (small dots)
  ctx.beginPath();
  ctx.arc(22, 82, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 86, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Generate Japan icon as data URL for preview
export function getJapanIconDataURL(size = 140) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawJapanIcon(ctx, 0, 0, size);
  return canvas.toDataURL('image/png');
}
