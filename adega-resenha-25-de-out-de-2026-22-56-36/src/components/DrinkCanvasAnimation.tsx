import React, { useRef, useEffect } from 'react';

export interface DrinkCanvasAnimationProps {
  cupType: 'copao' | 'taca';
  step: number; // 1: Copo Vazio, 2: Gelo, 3: Dose Base, 4: Energético, 5: Adicionais, 6: Pronto
  primaryColor: string;
  secondaryColor: string;
  baseDrinkName: string;
  ices: { name: string; color: string }[];
  garnish?: string;
  className?: string;
}

interface IcePhysics {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  size: number;
  rot: number;
  rotSpeed: number;
  color: string;
  settled: boolean;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  seed: number;
}

export const DrinkCanvasAnimation: React.FC<DrinkCanvasAnimationProps> = ({
  cupType,
  step,
  primaryColor,
  secondaryColor,
  baseDrinkName,
  ices,
  garnish,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Interactive liquid animation state
  const liquidFillRef = useRef<number>(0); // 0 (empty) to 0.82 (full)
  const targetFillRef = useRef<number>(0);
  const wavePhaseRef = useRef<number>(0);
  const strawProgressRef = useRef<number>(0); // 0 to 1
  const garnishProgressRef = useRef<number>(0); // 0 to 1

  // Dynamic streams
  const isPouringBaseRef = useRef<boolean>(false);
  const isPouringEnergyRef = useRef<boolean>(false);

  // Ice physics state
  const icePhysicsRef = useRef<IcePhysics[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);

  // Update target liquid levels and pouring streams based on step
  useEffect(() => {
    if (step === 1) {
      targetFillRef.current = 0;
      isPouringBaseRef.current = false;
      isPouringEnergyRef.current = false;
      strawProgressRef.current = 0;
      garnishProgressRef.current = 0;
    } else if (step === 2) {
      targetFillRef.current = 0;
      isPouringBaseRef.current = false;
      isPouringEnergyRef.current = false;
      strawProgressRef.current = 0;
      garnishProgressRef.current = 0;
    } else if (step === 3) {
      targetFillRef.current = 0.35; // base spirit dose ~35%
      isPouringBaseRef.current = true;
      isPouringEnergyRef.current = false;
      strawProgressRef.current = 0;
      garnishProgressRef.current = 0;
    } else if (step === 4) {
      targetFillRef.current = 0.82; // energy mixer fills to 82%
      isPouringBaseRef.current = false;
      isPouringEnergyRef.current = true;
      strawProgressRef.current = 0;
      garnishProgressRef.current = 0;
    } else {
      // Step 5 & 6: full, straw & garnish in place
      targetFillRef.current = 0.82;
      isPouringBaseRef.current = false;
      isPouringEnergyRef.current = false;
    }
  }, [step]);

  // Initialize ice physics based on selected ices
  useEffect(() => {
    const list: IcePhysics[] = ices.map((ice, i) => {
      const offsetX = ices.length === 1 ? 0 : (i - (ices.length - 1) / 2) * 36;
      return {
        x: offsetX,
        y: step >= 2 ? 0 : -140, // start above rim if step < 2
        targetY: 0, // bottom baseline
        vy: 0,
        size: 32,
        rot: (i === 0 ? -12 : 14) * (Math.PI / 180),
        rotSpeed: (i % 2 === 0 ? 0.3 : -0.3),
        color: ice.color || '#38bdf8',
        settled: step >= 2,
      };
    });
    icePhysicsRef.current = list;
  }, [ices, step]);

  // Bubbles pool
  useEffect(() => {
    const pool: Bubble[] = [];
    for (let i = 0; i < 22; i++) {
      pool.push({
        x: 0.2 + Math.random() * 0.6,
        y: 0.2 + Math.random() * 0.75,
        radius: 1.2 + Math.random() * 2.2,
        speed: 0.08 + Math.random() * 0.14,
        seed: Math.random() * Math.PI * 2,
      });
    }
    bubblesRef.current = pool;
  }, []);

  // Main rendering loop with requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !animFrameIdRef.current) {
            lastTimeRef.current = performance.now();
            animFrameIdRef.current = requestAnimationFrame(render);
          }
        });
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const render = (time: number) => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = null;
        return;
      }

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.08);
      lastTimeRef.current = time;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.floor(rect.width * dpr);
      const targetH = Math.floor(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Glass Geometry
      const isTaca = cupType === 'taca';
      const cx = w * 0.5;
      const cupTop = h * 0.16;
      const cupBottom = isTaca ? h * 0.68 : h * 0.88;
      const cupHeight = cupBottom - cupTop;
      const topWidth = isTaca ? w * 0.68 : w * 0.60;
      const bottomWidth = isTaca ? w * 0.38 : w * 0.44;

      const topLeftX = cx - topWidth * 0.5;
      const topRightX = cx + topWidth * 0.5;
      const bottomLeftX = cx - bottomWidth * 0.5;
      const bottomRightX = cx + bottomWidth * 0.5;

      // Animate Fill Progress smoothly
      const fillSpeed = dt * (isPouringBaseRef.current || isPouringEnergyRef.current ? 0.9 : 2.5);
      liquidFillRef.current += (targetFillRef.current - liquidFillRef.current) * Math.min(fillSpeed, 1);
      wavePhaseRef.current += dt * (isPouringEnergyRef.current ? 5.5 : 3.0);

      // Animate Straw & Garnish entering in Step 5 & 6
      const targetStraw = step >= 5 ? 1 : 0;
      strawProgressRef.current += (targetStraw - strawProgressRef.current) * Math.min(dt * 3.5, 1);
      const targetGarnish = step >= 5 ? 1 : 0;
      garnishProgressRef.current += (targetGarnish - garnishProgressRef.current) * Math.min(dt * 3.5, 1);

      // Liquid Y level
      const currentFill = liquidFillRef.current;
      const liquidY = cupBottom - cupHeight * currentFill;

      // 1. LIQUID LAYER WITH REALISTIC GLASS CLIPPING
      if (currentFill > 0.02) {
        ctx.save();
        ctx.beginPath();
        if (isTaca) {
          ctx.moveTo(topLeftX, cupTop + 6);
          ctx.bezierCurveTo(topLeftX, cupBottom * 0.88, bottomLeftX - 10, cupBottom, cx, cupBottom);
          ctx.bezierCurveTo(bottomRightX + 10, cupBottom, topRightX, cupBottom * 0.88, topRightX, cupTop + 6);
        } else {
          const cornerR = 14;
          ctx.moveTo(topLeftX, cupTop + 4);
          ctx.lineTo(bottomLeftX, cupBottom - cornerR);
          ctx.quadraticCurveTo(bottomLeftX, cupBottom, bottomLeftX + cornerR, cupBottom);
          ctx.lineTo(bottomRightX - cornerR, cupBottom);
          ctx.quadraticCurveTo(bottomRightX, cupBottom, bottomRightX, cupBottom - cornerR);
          ctx.lineTo(topRightX, cupTop + 4);
        }
        ctx.closePath();
        ctx.clip(); // Keep liquid inside glass

        // Multi-stop liquid gradient based on mix
        const liquidGrad = ctx.createLinearGradient(0, cupBottom, 0, liquidY);
        if (step <= 3) {
          // Pure base gin/spirit: crystalline clear with subtle golden/silver tint
          liquidGrad.addColorStop(0, 'rgba(216, 180, 254, 0.55)');
          liquidGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.35)');
          liquidGrad.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
        } else {
          // Base + Energy Drink rich gradient
          liquidGrad.addColorStop(0, primaryColor || '#7c3aed');
          liquidGrad.addColorStop(0.65, secondaryColor || '#db2777');
          liquidGrad.addColorStop(1, '#f43f5e');
        }

        ctx.fillStyle = liquidGrad;

        // Wave surface
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, liquidY);
        const waveSteps = 24;
        const waveAmplitude = (isPouringBaseRef.current || isPouringEnergyRef.current) ? 4.5 : 2.0;

        for (let i = 0; i <= waveSteps; i++) {
          const xPos = (w / waveSteps) * i;
          const yPos =
            liquidY +
            Math.sin(wavePhaseRef.current + i * 0.5) * waveAmplitude +
            Math.cos(wavePhaseRef.current * 0.8 + i * 0.3) * 1.5;
          ctx.lineTo(xPos, yPos);
        }
        ctx.lineTo(w, liquidY);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Top surface meniscus glow line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Micro Carbonation Effervescence Bubbles
        if (step >= 3) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          bubblesRef.current.forEach((b) => {
            b.y -= b.speed * dt * (isPouringEnergyRef.current ? 1.8 : 1.0);
            if (cupTop + b.y * cupHeight < liquidY) {
              b.y = 0.96;
              b.x = 0.22 + Math.random() * 0.56;
            }
            const bx = cx + (b.x - 0.5) * topWidth * 0.72 + Math.sin(time * 0.003 + b.seed) * 3;
            const by = cupTop + b.y * cupHeight;

            if (by >= liquidY && by <= cupBottom) {
              ctx.beginPath();
              ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }

        ctx.restore(); // end liquid clipping
      }

      // 2. ICE CUBES WITH REALISTIC FALLING & SETTLING PHYSICS
      if (step >= 2 && ices.length > 0) {
        ctx.save();
        // Clip to glass interior so ice doesn't overflow outside
        ctx.beginPath();
        if (isTaca) {
          ctx.moveTo(topLeftX, cupTop + 6);
          ctx.bezierCurveTo(topLeftX, cupBottom * 0.88, bottomLeftX - 10, cupBottom, cx, cupBottom);
          ctx.bezierCurveTo(bottomRightX + 10, cupBottom, topRightX, cupBottom * 0.88, topRightX, cupTop + 6);
        } else {
          ctx.moveTo(topLeftX, cupTop + 4);
          ctx.lineTo(bottomLeftX, cupBottom);
          ctx.lineTo(bottomRightX, cupBottom);
          ctx.lineTo(topRightX, cupTop + 4);
        }
        ctx.closePath();
        ctx.clip();

        icePhysicsRef.current.forEach((ice, idx) => {
          const s = ice.size;
          // In empty glass, target floor is cupBottom - s/2 - 4.
          // When liquid is present (step >= 4), ice floats gently with buoyancy!
          const floorY = cupBottom - s * 0.6 - (idx % 2 === 1 ? s * 0.7 : 0);
          const floatY = Math.max(floorY - 24, liquidY + 16);
          const currentTargetY = currentFill > 0.4 ? floatY : floorY;

          // Physics integration: fall down into glass
          if (ice.y < currentTargetY) {
            ice.vy += 380 * dt; // gravity
            ice.y += ice.vy * dt;
            if (ice.y >= currentTargetY) {
              ice.y = currentTargetY;
              ice.vy = -ice.vy * 0.35; // bounce damping
              ice.settled = true;
            }
          } else {
            // Settled or gently floating
            const bob = currentFill > 0.4 ? Math.sin(time * 0.003 + idx * 2) * 3.5 : 0;
            ice.y = currentTargetY + bob;
          }

          const cubeX = cx + ice.x;
          const cubeY = ice.y;

          ctx.save();
          ctx.translate(cubeX, cubeY);
          ctx.rotate(ice.rot + (currentFill > 0.4 ? Math.sin(time * 0.002 + idx) * 0.06 : 0));

          // Translucent Ice Cube with Flavor Hue
          ctx.fillStyle = `${ice.color}cc`;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.lineWidth = 1.4;

          const cr = 6;
          ctx.beginPath();
          ctx.moveTo(-s / 2 + cr, -s / 2);
          ctx.lineTo(s / 2 - cr, -s / 2);
          ctx.quadraticCurveTo(s / 2, -s / 2, s / 2, -s / 2 + cr);
          ctx.lineTo(s / 2, s / 2 - cr);
          ctx.quadraticCurveTo(s / 2, s / 2, s / 2 - cr, s / 2);
          ctx.lineTo(-s / 2 + cr, s / 2);
          ctx.quadraticCurveTo(-s / 2, s / 2, -s / 2, s / 2 - cr);
          ctx.lineTo(-s / 2, -s / 2 + cr);
          ctx.quadraticCurveTo(-s / 2, -s / 2, -s / 2 + cr, -s / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Crystalline specular highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.arc(-s * 0.18, -s * 0.18, s * 0.14, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });

        ctx.restore();
      }

      // 3. POURING STREAMS (Active in Step 3 for Base Spirit, Step 4 for Energy Drink)
      if (isPouringBaseRef.current && currentFill < 0.35) {
        // Clear/golden Gin Eternity stream pouring from top
        const streamX = cx - 8;
        ctx.save();
        const streamGrad = ctx.createLinearGradient(streamX, 0, streamX, liquidY);
        streamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        streamGrad.addColorStop(0.6, 'rgba(216, 180, 254, 0.7)');
        streamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');

        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(streamX, 0);
        ctx.lineTo(streamX, liquidY);
        ctx.stroke();

        // Splash ripples at contact
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(streamX, liquidY, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (isPouringEnergyRef.current && currentFill < 0.82) {
        // Vibrant Energy Drink colored stream pouring from top-right
        const streamX = cx + 14;
        ctx.save();
        const streamGrad = ctx.createLinearGradient(streamX, 0, streamX, liquidY);
        streamGrad.addColorStop(0, primaryColor || '#f43f5e');
        streamGrad.addColorStop(0.7, secondaryColor || '#db2777');
        streamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = 5.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(streamX, 0);
        ctx.lineTo(streamX, liquidY);
        ctx.stroke();

        // Splash bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(streamX, liquidY, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. GLASS OUTER BODY & GLOSSY REFLECTIONS (Rendered on top for realism)
      ctx.save();
      ctx.beginPath();
      if (isTaca) {
        ctx.moveTo(topLeftX, cupTop);
        ctx.bezierCurveTo(topLeftX, cupBottom * 0.88, bottomLeftX - 10, cupBottom, cx, cupBottom);
        ctx.bezierCurveTo(bottomRightX + 10, cupBottom, topRightX, cupBottom * 0.88, topRightX, cupTop);
      } else {
        const cornerR = 14;
        ctx.moveTo(topLeftX, cupTop);
        ctx.lineTo(bottomLeftX, cupBottom - cornerR);
        ctx.quadraticCurveTo(bottomLeftX, cupBottom, bottomLeftX + cornerR, cupBottom);
        ctx.lineTo(bottomRightX - cornerR, cupBottom);
        ctx.quadraticCurveTo(bottomRightX, cupBottom, bottomRightX, cupBottom - cornerR);
        ctx.lineTo(topRightX, cupTop);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Top Glass Rim Oval Ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cupTop, topWidth * 0.5, 6.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Vertical Gloss Glare Line (Left side)
      ctx.beginPath();
      ctx.moveTo(topLeftX + 6, cupTop + 14);
      ctx.lineTo(bottomLeftX + 8, cupBottom - 18);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Goblet Stem & Foot (if Taça)
      if (isTaca) {
        const stemTop = cupBottom;
        const stemBottom = h * 0.88;
        ctx.beginPath();
        ctx.moveTo(cx - 3.5, stemTop);
        ctx.lineTo(cx - 3.5, stemBottom);
        ctx.lineTo(cx + 3.5, stemBottom);
        ctx.lineTo(cx + 3.5, stemTop);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(cx, stemBottom + 3, w * 0.24, 4.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // 5. STRAW INSERTION (Animated slide down in Step 5 & 6)
      if (strawProgressRef.current > 0.05) {
        const prog = strawProgressRef.current;
        const startX = topRightX - 16;
        const startY = cupTop - 36 + (1 - prog) * -60; // slides down
        const endX = bottomLeftX + 16;
        const endY = cupBottom - 10;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (endX - startX) * prog, startY + (endY - startY) * prog);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startX - 1, startY);
        ctx.lineTo(startX - 1 + (endX - startX) * prog, startY + (endY - startY) * prog);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 6. GARNISH (Lime wheel / Fini candy clipping smoothly on rim in Step 5 & 6)
      if (garnish && garnishProgressRef.current > 0.05) {
        const prog = garnishProgressRef.current;
        ctx.save();
        const gx = topLeftX + 12;
        const gy = cupTop - 6 + (1 - prog) * -30;
        ctx.translate(gx, gy);
        ctx.rotate(-0.18);
        ctx.scale(prog, prog);

        // Citrus slice
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 17, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Inner citrus segments
        ctx.fillStyle = '#fef3c7';
        for (let a = 0; a < 5; a++) {
          const ang = (Math.PI / 5) * a + 0.15;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 9, Math.sin(ang) * 9, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      observer.disconnect();
    };
  }, [cupType, step, primaryColor, secondaryColor, garnish]);

  return (
    <div ref={containerRef} className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[280px] max-h-[300px] block"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
