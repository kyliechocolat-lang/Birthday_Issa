import { useCallback, useEffect, useState } from 'react';
import { drawSparkles, drawSprite, ICO_HEART } from '../../pixel/sprites';
import {
  CanvasFrame,
  MsgBox,
  PixelCanvas,
  PxButton,
  RibbonTitle,
  Subtitle,
} from '../PixelUi';

export type PageId = 'welcome' | 'gift' | 'memory' | 'claw' | 'pet' | 'catch' | 'quiz';

const WELCOME_SHEET_SRC = '/assets/aistudio/199734a7-7adf-43c1-a068-06c9ef7c6ec1_75860fad.png';

const FRAME_LEFT = { x: 0, y: 25, w: 763, h: 999 };
const FRAME_RIGHT = { x: 789, y: 28, w: 747, h: 996 };

let cachedFrames: [HTMLCanvasElement, HTMLCanvasElement] | null = null;
let loadStarted = false;

function extractFrame(
  img: HTMLImageElement,
  crop: { x: number; y: number; w: number; h: number }
): HTMLCanvasElement {
  const pad = 4;
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
    return data[p] >= 240 && data[p + 1] >= 240 && data[p + 2] >= 240;
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

  ctx.putImageData(imgData, 0, 0);
  return off;
}

export function WelcomePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [, setFramesReady] = useState(() => cachedFrames !== null);

  useEffect(() => {
    if (cachedFrames) {
      setFramesReady(true);
      return;
    }
    if (loadStarted) return;
    loadStarted = true;

    const img = new Image();
    img.onload = () => {
      cachedFrames = [extractFrame(img, FRAME_LEFT), extractFrame(img, FRAME_RIGHT)];
      setFramesReady(true);
    };
    img.src = WELCOME_SHEET_SRC;
  }, []);

  const renderWelcome = useCallback((ctx: CanvasRenderingContext2D, tick: number) => {
    const canvasW = 300;
    const canvasH = 260;

    // Gentle floating vertical motion & subtle tilt
    const floatY = Math.sin(tick * 0.055) * 6;
    const shadowScale = 1 - floatY * 0.015;

    // Soft pastel shadow beneath floating character
    ctx.save();
    ctx.fillStyle = 'rgba(224, 108, 167, 0.22)';
    ctx.beginPath();
    ctx.ellipse(canvasW / 2, canvasH - 14, 78 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Floating pixel hearts on the sides
    const hFloat1 = Math.sin(tick * 0.065) * 7;
    const hFloat2 = Math.cos(tick * 0.055) * 7;
    drawSprite(ctx, ICO_HEART, 14, 48 + hFloat1, 1.5);
    drawSprite(ctx, ICO_HEART, canvasW - 36, 56 + hFloat2, 1.5);

    // Animated 2-frame Happy Birthday girl + kitty illustration
    if (cachedFrames) {
      const cycle = tick % 96;
      const isBlinkingLaugh = cycle > 60 && cycle < 90;
      const frame = cachedFrames[isBlinkingLaugh ? 1 : 0];

      const targetH = 224;
      const drawW = (frame.width / frame.height) * targetH;
      const drawX = (canvasW - drawW) / 2;
      const drawY = 14 + floatY;

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(frame, drawX, drawY, drawW, targetH);
      ctx.restore();
    }

    // Twinkling pixel sparkles around the floating scene
    drawSparkles(ctx, tick, [
      [26, 30, 0, '#ffe066'],
      [272, 32, 2, '#ff77b7'],
      [22, 195, 4, '#ff77b7'],
      [276, 198, 1, '#ffe066'],
    ]);
  }, []);

  return (
    <section className="animate-pop-in text-center">
      <RibbonTitle>♡ Welcome Bestie! ♡</RibbonTitle>
      <Subtitle>I made a cute pixel surprise world just for you!</Subtitle>
      <CanvasFrame>
        <PixelCanvas width={300} height={260} onRender={renderWelcome} />
      </CanvasFrame>
      <MsgBox>Ready for cuteness, games &amp; surprises? ✨</MsgBox>
      <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">
        <PxButton onClick={() => onNavigate('gift')}>Open Your Gift 🎁 →</PxButton>
      </div>
    </section>
  );
}
