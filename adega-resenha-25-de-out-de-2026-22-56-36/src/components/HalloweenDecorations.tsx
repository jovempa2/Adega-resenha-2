import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext.tsx';

export const HalloweenDecorations: React.FC = () => {
  const { isHalloween } = useTheme();
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isHalloween) return;

    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 160;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw 3 layers of rolling mist at bottom
      const w = canvas.width;
      const h = canvas.height;

      // Layer 1 - Deep violet mist
      const grad1 = ctx.createLinearGradient(0, 0, 0, h);
      grad1.addColorStop(0, 'rgba(88, 28, 135, 0)');
      grad1.addColorStop(0.6, 'rgba(59, 7, 100, 0.22)');
      grad1.addColorStop(1, 'rgba(10, 4, 18, 0.85)');

      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 40) {
        const y = h - 50 + Math.sin(t * 0.8 + x * 0.005) * 20 + Math.cos(t * 0.5 + x * 0.008) * 12;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Layer 2 - Dark amber/orange pumpkin smoke glow
      const grad2 = ctx.createLinearGradient(0, 0, 0, h);
      grad2.addColorStop(0, 'rgba(234, 88, 12, 0)');
      grad2.addColorStop(0.7, 'rgba(194, 65, 12, 0.12)');
      grad2.addColorStop(1, 'rgba(67, 20, 7, 0.45)');

      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 35) {
        const y = h - 35 + Math.sin(t * 1.1 + x * 0.007) * 16 + Math.cos(t * 0.9 + x * 0.004) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isHalloween]);

  if (!isHalloween) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none">
      
      {/* 1. Spider Web Top Left with Hanging Spider */}
      <div className="absolute top-0 left-0 w-44 h-44 sm:w-56 sm:h-56 opacity-85">
        <svg viewBox="0 0 200 200" className="w-full h-full fill-none stroke-zinc-400/40 stroke-[1.2]">
          {/* Radial strands */}
          <line x1="0" y1="0" x2="200" y2="0" />
          <line x1="0" y1="0" x2="190" y2="60" />
          <line x1="0" y1="0" x2="160" y2="120" />
          <line x1="0" y1="0" x2="120" y2="160" />
          <line x1="0" y1="0" x2="60" y2="190" />
          <line x1="0" y1="0" x2="0" y2="200" />

          {/* Web concentric spirals */}
          <path d="M 30 0 Q 28 12 25 25 Q 12 28 0 30" />
          <path d="M 60 0 Q 56 24 50 50 Q 24 56 0 60" />
          <path d="M 95 0 Q 88 38 80 80 Q 38 88 0 95" />
          <path d="M 135 0 Q 124 54 114 114 Q 54 124 0 135" />
          <path d="M 180 0 Q 165 72 152 152 Q 72 165 0 180" />
        </svg>

        {/* Hanging Spider on Silk Thread */}
        <div className="absolute top-16 left-28 flex flex-col items-center animate-bounce duration-[3000ms]">
          <div className="w-[1px] h-14 bg-zinc-300/60" />
          <svg className="w-6 h-6 -mt-1 text-zinc-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            {/* Spider Body */}
            <ellipse cx="12" cy="12" rx="3.5" ry="5" />
            <circle cx="12" cy="7" r="2.5" />
            {/* Spider Legs */}
            <path d="M 9 9 Q 4 6 2 10 M 15 9 Q 20 6 22 10" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 9 12 Q 3 11 1 15 M 15 12 Q 21 11 23 15" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 9 14 Q 4 17 3 21 M 15 14 Q 20 17 21 21" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
      </div>

      {/* 2. Spider Web Top Right */}
      <div className="absolute top-0 right-0 w-40 h-40 sm:w-52 sm:h-52 opacity-80 scale-x-[-1]">
        <svg viewBox="0 0 200 200" className="w-full h-full fill-none stroke-zinc-400/40 stroke-[1.2]">
          <line x1="0" y1="0" x2="200" y2="0" />
          <line x1="0" y1="0" x2="190" y2="60" />
          <line x1="0" y1="0" x2="160" y2="120" />
          <line x1="0" y1="0" x2="120" y2="160" />
          <line x1="0" y1="0" x2="60" y2="190" />
          <line x1="0" y1="0" x2="0" y2="200" />
          <path d="M 35 0 Q 30 15 28 28 Q 15 30 0 35" />
          <path d="M 70 0 Q 64 30 58 58 Q 30 64 0 70" />
          <path d="M 110 0 Q 100 48 90 90 Q 48 100 0 110" />
          <path d="M 155 0 Q 140 68 126 126 Q 68 140 0 155" />
        </svg>
      </div>

      {/* 3. Flying Bats Silhouettes in Upper Space */}
      <div className="absolute top-24 right-1/4 opacity-40 animate-pulse">
        <svg className="w-8 h-4 fill-zinc-200" viewBox="0 0 64 32">
          <path d="M32 16 C24 8, 12 4, 0 10 C6 20, 18 22, 26 18 C28 22, 36 22, 38 18 C46 22, 58 20, 64 10 C52 4, 40 8, 32 16 Z" />
        </svg>
      </div>
      <div className="absolute top-36 left-1/3 opacity-30 animate-pulse delay-700">
        <svg className="w-6 h-3 fill-zinc-300" viewBox="0 0 64 32">
          <path d="M32 16 C24 8, 12 4, 0 10 C6 20, 18 22, 26 18 C28 22, 36 22, 38 18 C46 22, 58 20, 64 10 C52 4, 40 8, 32 16 Z" />
        </svg>
      </div>

      {/* 4. Bottom Creeping Fog / Mist Canvas */}
      <canvas
        ref={fogCanvasRef}
        className="absolute bottom-0 inset-x-0 w-full pointer-events-none"
        style={{ height: '160px' }}
      />
    </div>
  );
};
