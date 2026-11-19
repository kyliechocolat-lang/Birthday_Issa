import { useCallback, useRef, useState } from 'react';
import { sfxPop, sfxSparkle } from '../../pixel/sfx';
import {
  drawSparkles,
  drawSprite,
  GIRL_WINK,
  ICO_GIFT,
  ICO_HEART,
  ICO_STAR,
  KITTY,
} from '../../pixel/sprites';
import {
  CanvasFrame,
  MsgBox,
  PixelCanvas,
  PxButton,
  RibbonTitle,
  Subtitle,
} from '../PixelUi';
import type { PageId } from './WelcomePage';

const GIFT_MESSAGES = [
  "Surprise!! You're officially the bestest bestie in the galaxy! 💖✨",
  'Unlocking unlimited hugs, snacks & chaotic bestie memories! 🎀🍓',
  'Plot twist: The real treasure was our friendship all along! (And cute games!) 🧸💕',
];

type GiftState = 'closed' | 'opening' | 'opened';

export function GiftPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [giftState, setGiftState] = useState<GiftState>('closed');
  const [message, setMessage] = useState("It's shaking... click to unwrap! 🎀");
  const stateRef = useRef<GiftState>('closed');
  const timerRef = useRef(0);

  const triggerGift = () => {
    if (stateRef.current !== 'closed') return;
    stateRef.current = 'opening';
    timerRef.current = 0;
    setGiftState('opening');
    setMessage('Opening... ✨');
    sfxSparkle();
  };

  const resetGift = () => {
    stateRef.current = 'closed';
    timerRef.current = 0;
    setGiftState('closed');
    setMessage("It's shaking... click to unwrap! 🎀");
    sfxPop();
  };

  const renderGift = useCallback((ctx: CanvasRenderingContext2D, tick: number) => {
    const current = stateRef.current;

    if (current === 'closed') {
      const shakeX = Math.sin(tick * 0.35) * 3;
      const bounceY = Math.abs(Math.sin(tick * 0.12)) * -8;
      ctx.fillStyle = '#f5bdd9';
      ctx.fillRect(92, 178, 96, 10);
      drawSprite(ctx, ICO_GIFT, 84 + shakeX, 68 + bounceY, 8);
      drawSparkles(ctx, tick, [
        [55, 70, 0],
        [220, 75, 2],
        [140, 32, 4, '#ff77b7'],
      ]);
    } else if (current === 'opening') {
      timerRef.current += 1;
      const gt = timerRef.current;

      // Golden glow rays
      ctx.fillStyle = 'rgba(255, 224, 102, 0.45)';
      ctx.fillRect(95, 20, 90, 150);
      // Box base
      ctx.fillStyle = '#ff69b4';
      ctx.fillRect(92, 118, 96, 60);
      ctx.fillStyle = '#ffc2e0';
      ctx.fillRect(132, 118, 16, 60);
      // Lid flying up
      const lidY = Math.max(10, 96 - gt * 3);
      ctx.fillStyle = '#ff4da6';
      ctx.fillRect(86, lidY, 108, 22);
      // Confetti hearts
      for (let i = 0; i < 6; i++) {
        const cx = 140 + Math.cos(i * 1.1 + gt * 0.05) * (gt * 2.2);
        const cy = 110 - gt * 1.8 + (i % 2) * 14;
        drawSprite(ctx, i % 2 ? ICO_HEART : ICO_STAR, cx, cy, 2);
      }

      if (gt > 36) {
        stateRef.current = 'opened';
        setGiftState('opened');
        setMessage(GIFT_MESSAGES[Math.floor(Math.random() * GIFT_MESSAGES.length)]);
      }
    } else {
      // Opened: chibi girl pops out cheering with kitty & hearts
      const bob = Math.sin(tick * 0.14) * 4;
      ctx.fillStyle = 'rgba(255, 224, 102, 0.35)';
      ctx.fillRect(60, 14, 160, 170);
      drawSprite(ctx, GIRL_WINK, 82, 24 + bob, 5);
      drawSprite(ctx, KITTY, 195, 96 - bob, 3);

      // Open box front
      ctx.fillStyle = '#e03e8c';
      ctx.fillRect(82, 138, 116, 56);
      ctx.fillStyle = '#ff77b7';
      ctx.fillRect(86, 142, 108, 48);
      ctx.fillStyle = '#ffc2e0';
      ctx.fillRect(132, 142, 16, 48);

      drawSparkles(ctx, tick, [
        [40, 40, 0],
        [240, 45, 2],
        [45, 140, 3, '#ff77b7'],
        [235, 145, 1],
      ]);
    }
  }, []);

  return (
    <section className="animate-pop-in text-center">
      <RibbonTitle>🎁 Open Your Gift! 🎁</RibbonTitle>
      <Subtitle>Tap the magical pink box to reveal your surprise!</Subtitle>
      <CanvasFrame onClick={triggerGift} className="cursor-pointer">
        <PixelCanvas width={280} height={220} onRender={renderGift} />
      </CanvasFrame>
      <MsgBox>{message}</MsgBox>
      <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">
        <PxButton onClick={triggerGift} disabled={giftState !== 'closed'}>
          Unwrap Gift! ✨
        </PxButton>
        <PxButton variant="secondary" onClick={resetGift}>
          Replay ↺
        </PxButton>
        <PxButton variant="secondary" onClick={() => onNavigate('memory')}>
          Play Games →
        </PxButton>
      </div>
    </section>
  );
}
