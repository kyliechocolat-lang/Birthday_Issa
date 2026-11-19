import React, { useEffect, useRef } from 'react';

interface PixelCanvasProps {
  width: number;
  height: number;
  onRender: (ctx: CanvasRenderingContext2D, tick: number) => void;
  className?: string;
  onPointerMove?: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerDown?: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  style?: React.CSSProperties;
}

export function PixelCanvas({
  width,
  height,
  onRender,
  className = '',
  onPointerMove,
  onPointerDown,
  style,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderRef = useRef(onRender);
  renderRef.current = onRender;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let tick = 0;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const frame = () => {
      tick += 1;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderRef.current(ctx, reducedMotion ? Math.floor(tick / 4) : tick);
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      className={className}
      style={{
        width: `${width}px`,
        maxWidth: '100%',
        aspectRatio: `${width} / ${height}`,
        height: 'auto',
        ...style,
      }}
    />
  );
}

export function RibbonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-pixel inline-block rounded-full border-[3px] border-[var(--pink-dark)] bg-gradient-to-b from-white to-[#ffd6eb] px-5 py-2.5 text-[13px] leading-[1.5] text-[var(--pink-dark)] shadow-[0_4px_0_var(--shadow)] mb-3.5">
      {children}
    </h1>
  );
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-vt text-[24px] leading-[1.2] text-[#7d365a] mt-1 mb-3.5">
      {children}
    </p>
  );
}

export function CanvasFrame({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`inline-block max-w-full rounded-[18px] border-[3px] border-[var(--pink-border)] bg-gradient-to-b from-[#fff9fc] to-[#ffe6f3] p-2.5 shadow-[inset_0_0_12px_rgba(255,105,180,0.18)] ${className}`}
    >
      {children}
    </div>
  );
}

export function MsgBox({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-vt mx-auto mt-3.5 flex min-h-[54px] max-w-[500px] items-center justify-center rounded-[14px] border-[3px] border-[var(--pink-border)] bg-white px-3.5 py-3 text-[24px] leading-snug text-[var(--text-dark)] shadow-[0_4px_0_#f5b5d5] ${className}`}
    >
      {children}
    </div>
  );
}

interface PxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function PxButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: PxButtonProps) {
  const base =
    'font-pixel inline-flex cursor-pointer items-center justify-center gap-2 rounded-[14px] border-[3px] px-[18px] py-3 text-[11px] whitespace-nowrap transition-transform duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)] disabled:cursor-not-allowed disabled:opacity-55';
  const styles =
    variant === 'primary'
      ? 'border-[#b51f6b] bg-gradient-to-b from-[#ff85c2] to-[#ff4da6] text-white shadow-[0_5px_0_#b51f6b] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#b51f6b]'
      : 'border-[var(--pink-dark)] bg-gradient-to-b from-white to-[#ffe0f0] text-[var(--pink-dark)] shadow-[0_5px_0_var(--shadow)] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_var(--shadow)]';

  return (
    <button type="button" className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
