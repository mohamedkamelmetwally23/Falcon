import { useEffect, useState } from 'react';

const COLOR_TOLERANCE = 42;
const BORDER_MATCH_FRACTION = 0.85;
const MIN_CONTENT_RATIO = 0.15;
const CORNER_BLOCK = 10;
const trimCache = new Map();

function pixelAt(data, width, x, y) {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
}

function colorDistance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function averageBlockColor(data, width, height, startX, startY, blockSize) {
  const endX = Math.min(width, startX + blockSize);
  const endY = Math.min(height, startY + blockSize);
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const [pr, pg, pb] = pixelAt(data, width, x, y);
      r += pr;
      g += pg;
      b += pb;
      count++;
    }
  }
  return count ? [r / count, g / count, b / count] : [0, 0, 0];
}

function averageColor(...colors) {
  const sum = colors.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0]);
  return sum.map(value => value / colors.length);
}

function rowMatchesColor(data, width, y, sampleStep, refColor) {
  let matches = 0;
  let count = 0;
  for (let x = 0; x < width; x += sampleStep) {
    if (colorDistance(pixelAt(data, width, x, y), refColor) < COLOR_TOLERANCE) matches++;
    count++;
  }
  return matches / count > BORDER_MATCH_FRACTION;
}

function colMatchesColor(data, width, height, x, sampleStep, refColor) {
  let matches = 0;
  let count = 0;
  for (let y = 0; y < height; y += sampleStep) {
    if (colorDistance(pixelAt(data, width, x, y), refColor) < COLOR_TOLERANCE) matches++;
    count++;
  }
  return matches / count > BORDER_MATCH_FRACTION;
}

function trimImageBackground(imageEl) {
  const { naturalWidth: width, naturalHeight: height } = imageEl;
  if (!width || !height) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageEl, 0, 0);

  let data;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return null;
  }

  const topLeft = averageBlockColor(data, width, height, 0, 0, CORNER_BLOCK);
  const topRight = averageBlockColor(data, width, height, width - CORNER_BLOCK, 0, CORNER_BLOCK);
  const bottomLeft = averageBlockColor(data, width, height, 0, height - CORNER_BLOCK, CORNER_BLOCK);
  const bottomRight = averageBlockColor(data, width, height, width - CORNER_BLOCK, height - CORNER_BLOCK, CORNER_BLOCK);

  const topColor = averageColor(topLeft, topRight);
  const bottomColor = averageColor(bottomLeft, bottomRight);
  const leftColor = averageColor(topLeft, bottomLeft);
  const rightColor = averageColor(topRight, bottomRight);

  const rowStep = Math.max(1, Math.floor(width / 80));
  const colStep = Math.max(1, Math.floor(height / 80));

  let top = 0;
  while (top < height && rowMatchesColor(data, width, top, rowStep, topColor)) top++;
  let bottom = height - 1;
  while (bottom > top && rowMatchesColor(data, width, bottom, rowStep, bottomColor)) bottom--;
  let left = 0;
  while (left < width && colMatchesColor(data, width, height, left, colStep, leftColor)) left++;
  let right = width - 1;
  while (right > left && colMatchesColor(data, width, height, right, colStep, rightColor)) right--;

  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const noBorderFound = top === 0 && left === 0 && bottom === height - 1 && right === width - 1;
  const tooSmall = cropWidth < width * MIN_CONTENT_RATIO || cropHeight < height * MIN_CONTENT_RATIO;
  if (noBorderFound || tooSmall) return null;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropWidth;
  outCanvas.height = cropHeight;
  outCanvas.getContext('2d').drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  try {
    return outCanvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

function loadTrimmedImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(trimImageBackground(img));
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function useTrimmedImage(src) {
  const [trimmed, setTrimmed] = useState(() => (src ? trimCache.get(src) ?? null : null));

  useEffect(() => {
    if (!src) {
      setTrimmed(null);
      return undefined;
    }
    if (trimCache.has(src)) {
      setTrimmed(trimCache.get(src));
      return undefined;
    }
    let cancelled = false;
    loadTrimmedImage(src).then(result => {
      trimCache.set(src, result);
      if (!cancelled) setTrimmed(result);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return trimmed;
}
