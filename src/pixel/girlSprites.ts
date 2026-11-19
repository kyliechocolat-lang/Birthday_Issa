export type GirlPose =
  | 'idle'
  | 'idle2'
  | 'walk1'
  | 'walk2'
  | 'walk3'
  | 'run1'
  | 'run2'
  | 'jump'
  | 'shoot'
  | 'hurt'
  | 'shock'
  | 'win'
  | 'cheer';

interface CropDef {
  sheet: 1 | 2;
  x: number;
  y: number;
  w: number;
  h: number;
}

const SHEET_1_SRC = '/assets/aistudio/1531f00a-d082-41ca-87a9-edf8f1276d5d_9bf0d76f.png';
const SHEET_2_SRC = '/assets/aistudio/b42689a4-5293-4bf0-a094-76c9bf676204_4813228b.png';

const POSE_CROPS: Record<GirlPose, CropDef> = {
  idle: { sheet: 2, x: 8, y: 3, w: 277, h: 416 },
  idle2: { sheet: 1, x: 6, y: 4, w: 345, h: 437 },
  walk1: { sheet: 2, x: 296, y: 6, w: 300, h: 422 },
  walk2: { sheet: 1, x: 395, y: 5, w: 338, h: 434 },
  walk3: { sheet: 2, x: 610, y: 11, w: 295, h: 412 },
  run1: { sheet: 1, x: 802, y: 13, w: 382, h: 436 },
  run2: { sheet: 2, x: 661, y: 449, w: 317, h: 375 },
  jump: { sheet: 1, x: 9, y: 454, w: 370, h: 365 },
  shoot: { sheet: 1, x: 492, y: 456, w: 390, h: 393 },
  hurt: { sheet: 2, x: 292, y: 848, w: 305, h: 381 },
  shock: { sheet: 2, x: 2, y: 826, w: 276, h: 413 },
  win: { sheet: 2, x: 975, y: 465, w: 275, h: 363 },
  cheer: { sheet: 1, x: 663, y: 853, w: 260, h: 399 },
};

const spriteCache = new Map<GirlPose, HTMLCanvasElement>();
let loadStarted = false;
let ready = false;

/**
 * Slices a sprite region onto an offscreen canvas and removes the outer
 * white background using a border flood-fill so internal whites (socks,
 * shoes, collar, eyes) stay crisp and opaque.
 */
function extractTransparentSprite(img: HTMLImageElement, crop: CropDef): HTMLCanvasElement {
  const pad = 2;
  const cw = crop.w + pad * 2;
  const ch = crop.h + pad * 2;
  const off = document.createElement('canvas');
  off.width = cw;
  off.height = ch;
  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return off;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, pad, pad, crop.w, crop.h);

  const imgData = ctx.getImageData(0, 0, cw, ch);
  const data = imgData.data;
  const total = cw * ch;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const isBgWhite = (idx: number) => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    return r >= 238 && g >= 238 && b >= 238;
  };

  const enqueue = (x: number, y: number) => {
    const idx = y * cw + x;
    if (visited[idx] || !isBgWhite(idx)) return;
    visited[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < cw; x++) {
    enqueue(x, 0);
    enqueue(x, ch - 1);
  }
  for (let y = 0; y < ch; y++) {
    enqueue(0, y);
    enqueue(cw - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    data[idx * 4 + 3] = 0;
    const x = idx % cw;
    const y = (idx - x) / cw;
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < cw) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < ch) enqueue(x, y + 1);
  }

  // Softly clean 1px white fringe touching transparent pixels
  for (let y = 1; y < ch - 1; y++) {
    for (let x = 1; x < cw - 1; x++) {
      const idx = y * cw + x;
      const p = idx * 4;
      if (data[p + 3] === 0) continue;
      if (data[p] >= 242 && data[p + 1] >= 242 && data[p + 2] >= 242) {
        const adjTransparent =
          data[(idx - 1) * 4 + 3] === 0 ||
          data[(idx + 1) * 4 + 3] === 0 ||
          data[(idx - cw) * 4 + 3] === 0 ||
          data[(idx + cw) * 4 + 3] === 0;
        if (adjTransparent) {
          data[p + 3] = 0;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return off;
}

export function ensureGirlSpritesLoaded(onReady?: () => void): void {
  if (ready) {
    onReady?.();
    return;
  }
  if (loadStarted) return;
  loadStarted = true;

  const img1 = new Image();
  const img2 = new Image();
  let loadedCount = 0;

  const handleLoad = () => {
    loadedCount += 1;
    if (loadedCount < 2) return;

    (Object.keys(POSE_CROPS) as GirlPose[]).forEach((pose) => {
      const crop = POSE_CROPS[pose];
      const srcImg = crop.sheet === 1 ? img1 : img2;
      spriteCache.set(pose, extractTransparentSprite(srcImg, crop));
    });
    ready = true;
    onReady?.();
  };

  img1.onload = handleLoad;
  img2.onload = handleLoad;
  img1.src = SHEET_1_SRC;
  img2.src = SHEET_2_SRC;
}

export function areGirlSpritesReady(): boolean {
  return ready;
}

/**
 * Draws the 2D chibi girl bottom-centered at (centerX, bottomY) with the
 * requested height, preserving aspect ratio and optional horizontal flip.
 */
export function drawGirlPose(
  ctx: CanvasRenderingContext2D,
  pose: GirlPose,
  centerX: number,
  bottomY: number,
  targetHeight: number,
  flipLeft = false
): void {
  const sprite = spriteCache.get(pose);
  if (!sprite) return;

  const scale = targetHeight / sprite.height;
  const drawW = sprite.width * scale;
  const drawH = targetHeight;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(Math.round(centerX), Math.round(bottomY));
  if (flipLeft) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(sprite, -drawW / 2, -drawH, drawW, drawH);
  ctx.restore();
}
