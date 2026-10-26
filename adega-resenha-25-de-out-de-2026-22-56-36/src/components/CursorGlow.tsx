import React, { useEffect, useState, useRef } from 'react';

interface CursorGlowProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export const CursorGlow: React.FC<CursorGlowProps> = ({ containerRef }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      // Static gentle glow for mobile/touch
      setPos({ x: window.innerWidth / 2, y: 300 });
      setOpacity(0.4);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setOpacity(0.65);
    };

    const handleMouseLeave = () => {
      setOpacity(0.2);
    };

    const handleMouseEnter = () => {
      setOpacity(0.65);
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseenter', handleMouseEnter);

    // Smooth lerp loop for the glow
    const updateGlow = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.12;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.12;
      setPos({ x: currentPos.current.x, y: currentPos.current.y });
      animFrameId.current = requestAnimationFrame(updateGlow);
    };

    animFrameId.current = requestAnimationFrame(updateGlow);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [containerRef]);

  return (
    <div
      className="pointer-events-none absolute -inset-px z-0 overflow-hidden transition-opacity duration-700"
      style={{ opacity }}
    >
      <div
        className="absolute rounded-full blur-[100px] will-change-transform"
        style={{
          width: '540px',
          height: '540px',
          transform: `translate3d(${pos.x - 270}px, ${pos.y - 270}px, 0)`,
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.28) 0%, rgba(225, 29, 72, 0.16) 45%, rgba(0, 0, 0, 0) 70%)',
        }}
      />
    </div>
  );
};
