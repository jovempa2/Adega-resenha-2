import React, { useRef, useEffect } from 'react';

export interface RoshCanvasAnimationProps {
  showSmoke: boolean;
  coalsGlowing: boolean;
  modelBrand: string;
  modelName: string;
  flavors: { name: string; color: string; proportion: string }[];
  step?: number; // 1: Vaso & Stem, 2: Prato & Rosh, 3: Essências, 4: Alumínio & Brasas, 5: Completo
  className?: string;
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  spin: number;
  spinSpeed: number;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  alpha: number;
  size: number;
}

interface WaterBubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  seed: number;
}

export const RoshCanvasAnimation: React.FC<RoshCanvasAnimationProps> = ({
  showSmoke,
  coalsGlowing,
  modelBrand,
  modelName,
  flavors,
  step = 5,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Static particle pools to prevent garbage collection pauses
  const smokeParticlesRef = useRef<SmokeParticle[]>([]);
  const sparkParticlesRef = useRef<SparkParticle[]>([]);
  const waterBubblesRef = useRef<WaterBubble[]>([]);

  // Initialize particle pools once
  useEffect(() => {
    const smokeCount = 38;
    const smokePool: SmokeParticle[] = [];
    for (let i = 0; i < smokeCount; i++) {
      smokePool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 4,
        maxRadius: 18 + Math.random() * 14,
        alpha: 0,
        maxAlpha: 0.16 + Math.random() * 0.14,
        life: Math.random() * 2.5,
        maxLife: 2.2 + Math.random() * 1.2,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.8,
      });
    }
    smokeParticlesRef.current = smokePool;

    const sparkCount = 14;
    const sparkPool: SparkParticle[] = [];
    for (let i = 0; i < sparkCount; i++) {
      sparkPool.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 20,
        vy: -20 - Math.random() * 26,
        life: Math.random() * 1.5,
        maxLife: 1.0 + Math.random() * 0.8,
        alpha: 0,
        size: 1 + Math.random() * 1.6,
      });
    }
    sparkParticlesRef.current = sparkPool;

    const bubbleCount = 8;
    const bubblePool: WaterBubble[] = [];
    for (let i = 0; i < bubbleCount; i++) {
      bubblePool.push({
        x: (Math.random() - 0.5) * 36,
        y: Math.random(),
        r: 1 + Math.random() * 2,
        speed: 0.2 + Math.random() * 0.3,
        seed: Math.random() * Math.PI * 2,
      });
    }
    waterBubblesRef.current = bubblePool;
  }, []);

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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      } else {
        isVisibleRef.current = true;
        if (!animFrameIdRef.current) {
          lastTimeRef.current = performance.now();
          animFrameIdRef.current = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

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

      // Central Shisha Geometry coordinate calculations
      const cx = w * 0.48; // slight offset to allow hose draping to the right

      // Key vertical markers along the shisha
      // Total height span: h * 0.12 (top of coals) down to h * 0.94 (base of glass vase)
      const baseBottomY = h * 0.93;
      const baseTopY = h * 0.64;
      const stemTopY = h * 0.28;
      const trayY = stemTopY - 2;
      const bowlBottomY = trayY - 6;
      const bowlTopY = bowlBottomY - 34;
      const foilY = bowlTopY - 2;
      const coalsCenterY = foilY - 14;

      const effectiveStep = step || 5;

      // 1. SMOKE PARTICLES (Active when coals are glowing and smoke is enabled)
      if (showSmoke && effectiveStep >= 4) {
        smokeParticlesRef.current.forEach((p) => {
          p.life += dt;
          if (p.life >= p.maxLife) {
            p.life = 0;
            p.x = cx + (Math.random() - 0.5) * 36;
            p.y = coalsCenterY - 4;
            p.vx = (Math.random() - 0.5) * 14;
            p.vy = -34 - Math.random() * 26;
            p.radius = 4 + Math.random() * 4;
            p.spin = Math.random() * Math.PI * 2;
          }

          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.spin += p.spinSpeed * dt;

          const progress = p.life / p.maxLife;
          const currentRadius = p.radius + (p.maxRadius - p.radius) * progress;

          let alpha = 0;
          if (progress < 0.22) {
            alpha = (progress / 0.22) * p.maxAlpha;
          } else {
            alpha = (1 - (progress - 0.22) / 0.78) * p.maxAlpha;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin);

          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
          grad.addColorStop(0, `rgba(240, 240, 255, ${alpha})`);
          grad.addColorStop(0.6, `rgba(215, 215, 235, ${alpha * 0.45})`);
          grad.addColorStop(1, 'rgba(200, 200, 220, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      // 2. GLASS VASE (Vaso de Vidro) at Bottom
      const baseWidth = w * 0.46;
      const baseNeckWidth = w * 0.16;

      ctx.save();
      // Drop shadow for vase floor
      const vaseShadowGrad = ctx.createRadialGradient(cx, baseBottomY + 2, 4, cx, baseBottomY + 2, baseWidth * 0.6);
      vaseShadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      vaseShadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = vaseShadowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, baseBottomY + 3, baseWidth * 0.55, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glass Vase Body Path
      ctx.beginPath();
      ctx.moveTo(cx - baseNeckWidth * 0.5, baseTopY);
      ctx.bezierCurveTo(
        cx - baseWidth * 0.35,
        baseTopY + (baseBottomY - baseTopY) * 0.3,
        cx - baseWidth * 0.55,
        baseBottomY - 10,
        cx - baseWidth * 0.45,
        baseBottomY
      );
      ctx.lineTo(cx + baseWidth * 0.45, baseBottomY);
      ctx.bezierCurveTo(
        cx + baseWidth * 0.55,
        baseBottomY - 10,
        cx + baseWidth * 0.35,
        baseTopY + (baseBottomY - baseTopY) * 0.3,
        cx + baseNeckWidth * 0.5,
        baseTopY
      );
      ctx.closePath();

      // Glass fill with depth
      const glassGrad = ctx.createLinearGradient(cx - baseWidth * 0.5, baseTopY, cx + baseWidth * 0.5, baseBottomY);
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      glassGrad.addColorStop(0.3, 'rgba(15, 23, 42, 0.5)');
      glassGrad.addColorStop(0.8, 'rgba(30, 41, 59, 0.6)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.fillStyle = glassGrad;
      ctx.fill();

      // Water Level Inside Vase (Fills 65% of base)
      const waterTopY = baseTopY + (baseBottomY - baseTopY) * 0.35;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - baseWidth * 0.42, waterTopY);
      ctx.bezierCurveTo(
        cx - baseWidth * 0.52,
        baseBottomY - 12,
        cx - baseWidth * 0.45,
        baseBottomY - 2,
        cx,
        baseBottomY - 2
      );
      ctx.bezierCurveTo(
        cx + baseWidth * 0.45,
        baseBottomY - 2,
        cx + baseWidth * 0.52,
        baseBottomY - 12,
        cx + baseWidth * 0.42,
        waterTopY
      );
      ctx.closePath();

      const waterGrad = ctx.createLinearGradient(0, waterTopY, 0, baseBottomY);
      waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      waterGrad.addColorStop(1, 'rgba(14, 165, 233, 0.65)');
      ctx.fillStyle = waterGrad;
      ctx.fill();

      // Water surface meniscus
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, waterTopY, baseWidth * 0.38, 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Water bubbles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      waterBubblesRef.current.forEach((b) => {
        b.y -= b.speed * dt;
        if (b.y <= 0) b.y = 1;
        const by = waterTopY + b.y * (baseBottomY - waterTopY - 4);
        const bx = cx + b.x + Math.sin(time * 0.003 + b.seed) * 3;
        ctx.beginPath();
        ctx.arc(bx, by, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // Downstem submerging into water
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - 3, baseTopY, 6, baseBottomY - baseTopY - 8);

      // Glass outer border & specular gloss line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - baseNeckWidth * 0.5, baseTopY);
      ctx.bezierCurveTo(
        cx - baseWidth * 0.35,
        baseTopY + (baseBottomY - baseTopY) * 0.3,
        cx - baseWidth * 0.55,
        baseBottomY - 10,
        cx - baseWidth * 0.45,
        baseBottomY
      );
      ctx.lineTo(cx + baseWidth * 0.45, baseBottomY);
      ctx.bezierCurveTo(
        cx + baseWidth * 0.55,
        baseBottomY - 10,
        cx + baseWidth * 0.35,
        baseTopY + (baseBottomY - baseTopY) * 0.3,
        cx + baseNeckWidth * 0.5,
        baseTopY
      );
      ctx.stroke();

      // Specular highlight on left shoulder of glass
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - baseWidth * 0.28, baseTopY + 12);
      ctx.bezierCurveTo(
        cx - baseWidth * 0.42,
        baseTopY + (baseBottomY - baseTopY) * 0.4,
        cx - baseWidth * 0.44,
        baseBottomY - 18,
        cx - baseWidth * 0.38,
        baseBottomY - 10
      );
      ctx.stroke();

      ctx.restore();

      // 3. STEM METÁLICO (Metal Anodized Stem) with Purge Valve & Hose Port
      const stemWidth = 10;
      ctx.save();

      // Stem column gradient (anodized titanium / metallic steel)
      const stemGrad = ctx.createLinearGradient(cx - stemWidth * 0.5, stemTopY, cx + stemWidth * 0.5, baseTopY);
      stemGrad.addColorStop(0, '#e2e8f0');
      stemGrad.addColorStop(0.35, '#475569');
      stemGrad.addColorStop(0.7, '#1e293b');
      stemGrad.addColorStop(1, '#94a3b8');

      ctx.fillStyle = stemGrad;
      ctx.fillRect(cx - stemWidth * 0.5, stemTopY, stemWidth, baseTopY - stemTopY);

      // Central ring ribs on stem (luxury turning lathe detail)
      const ringY1 = stemTopY + (baseTopY - stemTopY) * 0.35;
      const ringY2 = stemTopY + (baseTopY - stemTopY) * 0.65;
      ctx.fillStyle = '#f59e0b'; // gold ring accents
      ctx.fillRect(cx - stemWidth * 0.7, ringY1, stemWidth * 1.4, 3.5);
      ctx.fillRect(cx - stemWidth * 0.7, ringY2, stemWidth * 1.4, 3.5);

      // Heart / Chamber Hub above vase neck
      const hubY = baseTopY - 10;
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - baseNeckWidth * 0.45, hubY, baseNeckWidth * 0.9, 12);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - baseNeckWidth * 0.45, hubY, baseNeckWidth * 0.9, 12);

      // Purge Valve (left side of hub)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - baseNeckWidth * 0.45 - 6, hubY + 2, 6, 7);

      // Hose Port (right side of hub)
      const hosePortX = cx + baseNeckWidth * 0.45;
      const hosePortY = hubY + 5;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(hosePortX, hubY + 1);
      ctx.lineTo(hosePortX + 8, hubY + 3);
      ctx.lineTo(hosePortX + 8, hubY + 9);
      ctx.lineTo(hosePortX, hubY + 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // 4. MANGUEIRA DE SILICONE COM PITEIRA METÁLICA (Hose & Wand)
      // Connects from hose port, loops down and curves up gracefully with piteira
      if (effectiveStep >= 1) {
        ctx.save();
        const startX = hosePortX + 7;
        const startY = hosePortY;
        const control1X = startX + 38;
        const control1Y = startY + 40;
        const control2X = cx + baseWidth * 0.58;
        const control2Y = baseBottomY - 15;
        const wandEndX = cx + baseWidth * 0.52;
        const wandEndY = baseTopY + 10;

        // Silicone Hose Tube Path
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(control1X, control1Y, control2X, control2Y, wandEndX, wandEndY);

        // Hose outer dark soft-touch silicone
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Hose inner core accent (gold/red line)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Metallic Piteira (Aluminum Mouthpiece Wand) at wandEnd pointing upwards
        const wandLength = 48;
        const wandAngle = -0.35; // angled up
        ctx.save();
        ctx.translate(wandEndX, wandEndY);
        ctx.rotate(wandAngle);

        const wandGrad = ctx.createLinearGradient(-4, 0, 4, -wandLength);
        wandGrad.addColorStop(0, '#475569');
        wandGrad.addColorStop(0.5, '#f8fafc');
        wandGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = wandGrad;

        ctx.fillRect(-3.5, -wandLength, 7, wandLength);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-3.5, -wandLength, 7, wandLength);

        // Piteira grip ridges
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4.5, -wandLength * 0.6, 9, 3);
        ctx.fillRect(-4.5, -wandLength * 0.4, 9, 3);

        ctx.restore();
        ctx.restore();
      }

      // 5. PRATO DE CINZAS (Ash Tray Disc)
      if (effectiveStep >= 2) {
        ctx.save();
        const trayWidth = w * 0.54;
        const trayGrad = ctx.createLinearGradient(cx - trayWidth * 0.5, trayY, cx + trayWidth * 0.5, trayY);
        trayGrad.addColorStop(0, '#94a3b8');
        trayGrad.addColorStop(0.3, '#f1f5f9');
        trayGrad.addColorStop(0.7, '#64748b');
        trayGrad.addColorStop(1, '#334155');

        ctx.fillStyle = trayGrad;
        ctx.beginPath();
        ctx.ellipse(cx, trayY, trayWidth * 0.5, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tray inner recess lip
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, trayY, trayWidth * 0.42, 4.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 6. ROSH CERÂMICO (Ceramic Bowl Body)
      if (effectiveStep >= 2) {
        ctx.save();
        const bowlWidth = w * 0.38;
        const bowlBaseWidth = 14;

        // Bowl Ceramic Body
        const ceramicGrad = ctx.createLinearGradient(cx - bowlWidth * 0.5, bowlTopY, cx + bowlWidth * 0.5, bowlBottomY);
        if (modelName.toLowerCase().includes('gold') || modelBrand.toLowerCase().includes('belli')) {
          ceramicGrad.addColorStop(0, '#f8fafc');
          ceramicGrad.addColorStop(0.5, '#e2e8f0');
          ceramicGrad.addColorStop(1, '#94a3b8');
        } else {
          ceramicGrad.addColorStop(0, '#27272a');
          ceramicGrad.addColorStop(0.5, '#3f3f46');
          ceramicGrad.addColorStop(1, '#18181b');
        }

        ctx.fillStyle = ceramicGrad;
        ctx.beginPath();
        ctx.moveTo(cx - bowlWidth * 0.5, bowlTopY);
        ctx.bezierCurveTo(
          cx - bowlWidth * 0.4,
          bowlTopY + 22,
          cx - bowlBaseWidth * 0.5,
          bowlBottomY - 4,
          cx - bowlBaseWidth * 0.5,
          bowlBottomY
        );
        ctx.lineTo(cx + bowlBaseWidth * 0.5, bowlBottomY);
        ctx.bezierCurveTo(
          cx + bowlBaseWidth * 0.5,
          bowlBottomY - 4,
          cx + bowlWidth * 0.4,
          bowlTopY + 22,
          cx + bowlWidth * 0.5,
          bowlTopY
        );
        ctx.closePath();
        ctx.fill();

        // Gold Trim Line
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(cx - bowlWidth * 0.36, bowlTopY + 8);
        ctx.lineTo(cx + bowlWidth * 0.36, bowlTopY + 8);
        ctx.stroke();

        ctx.restore();
      }

      // 7. ESSÊNCIAS DE TABACO (Tobacco Flavors Proportion Slices)
      if (effectiveStep >= 3) {
        ctx.save();
        const bowlWidth = w * 0.36;
        const tobaccoH = 14;
        const tobY = bowlTopY + 1;

        ctx.beginPath();
        ctx.rect(cx - bowlWidth * 0.5, tobY, bowlWidth, tobaccoH);
        ctx.clip();

        if (flavors.length === 0) {
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(cx - bowlWidth * 0.5, tobY, bowlWidth, tobaccoH);
        } else {
          let curX = cx - bowlWidth * 0.5;
          flavors.forEach((f) => {
            let segW = bowlWidth / flavors.length;
            if (f.proportion === '70%') segW = bowlWidth * 0.7;
            else if (f.proportion === '30%') segW = bowlWidth * 0.3;
            else if (f.proportion === '80%') segW = bowlWidth * 0.8;
            else if (f.proportion === '20%') segW = bowlWidth * 0.2;

            ctx.fillStyle = f.color || '#ef4444';
            ctx.fillRect(curX, tobY, segW, tobaccoH);

            // Grains texture
            ctx.fillStyle = 'rgba(0,0,0,0.24)';
            ctx.fillRect(curX, tobY + tobaccoH * 0.5, segW, tobaccoH * 0.5);

            curX += segW;
          });
        }
        ctx.restore();
      }

      // 8. PAPEL ALUMÍNIO ESTICADO COM MICRO-PERFURAÇÕES (Foil with Pinhole Matrix)
      if (effectiveStep >= 4) {
        ctx.save();
        const foilW = w * 0.40;
        const foilH = 9;

        const foilGrad = ctx.createLinearGradient(cx - foilW * 0.5, foilY, cx + foilW * 0.5, foilY);
        foilGrad.addColorStop(0, '#94a3b8');
        foilGrad.addColorStop(0.5, '#f8fafc');
        foilGrad.addColorStop(1, '#94a3b8');

        ctx.fillStyle = foilGrad;
        ctx.beginPath();
        ctx.ellipse(cx, foilY + foilH * 0.5, foilW * 0.5, foilH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Concentric pinholes
        ctx.fillStyle = '#09090b';
        const holes = 8;
        for (let i = 0; i < holes; i++) {
          const hx = cx - foilW * 0.4 + (i / (holes - 1)) * (foilW * 0.8);
          ctx.beginPath();
          ctx.arc(hx, foilY + foilH * 0.5, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 9. CARVÕES DE COCO EM BRASA COM FAGULHAS (Glowing Coconut Coals)
      if (effectiveStep >= 4) {
        const emberPulse = coalsGlowing ? 0.75 + Math.sin(time * 0.0035) * 0.25 : 0;
        const emberGlowRadius = 24 + emberPulse * 14;

        if (coalsGlowing) {
          // Heat aura
          const auraGrad = ctx.createRadialGradient(cx, coalsCenterY, 3, cx, coalsCenterY, emberGlowRadius * 1.4);
          auraGrad.addColorStop(0, `rgba(249, 115, 22, ${0.48 * emberPulse})`);
          auraGrad.addColorStop(0.5, `rgba(234, 88, 12, ${0.22 * emberPulse})`);
          auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(cx, coalsCenterY, emberGlowRadius * 1.4, 0, Math.PI * 2);
          ctx.fill();

          // Spark particles
          sparkParticlesRef.current.forEach((sp) => {
            sp.life += dt;
            if (sp.life >= sp.maxLife) {
              sp.life = 0;
              sp.x = cx + (Math.random() - 0.5) * 32;
              sp.y = coalsCenterY - 4;
              sp.vx = (Math.random() - 0.5) * 22;
              sp.vy = -26 - Math.random() * 40;
            }

            sp.x += sp.vx * dt;
            sp.y += sp.vy * dt;

            const pProg = sp.life / sp.maxLife;
            const sparkAlpha = (1 - pProg) * 0.85;

            ctx.fillStyle = `rgba(254, 240, 138, ${sparkAlpha})`;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // 3 Physical Coal Cubes
        const coalW = 18;
        const coalH = 16;
        const coalPositions = [
          { x: cx - 16, y: coalsCenterY, rot: -0.14 },
          { x: cx, y: coalsCenterY - 4, rot: 0.02 },
          { x: cx + 16, y: coalsCenterY, rot: 0.16 },
        ];

        coalPositions.forEach((pos) => {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(pos.rot);

          if (coalsGlowing) {
            const coalGrad = ctx.createLinearGradient(-coalW * 0.5, -coalH * 0.5, coalW * 0.5, coalH * 0.5);
            coalGrad.addColorStop(0, '#f97316');
            coalGrad.addColorStop(0.45, '#ef4444');
            coalGrad.addColorStop(1, '#991b1b');
            ctx.fillStyle = coalGrad;
            ctx.shadowColor = '#ea580c';
            ctx.shadowBlur = 8 * emberPulse;
          } else {
            ctx.fillStyle = '#27272a';
            ctx.shadowColor = 'transparent';
          }

          ctx.fillRect(-coalW * 0.5, -coalH * 0.5, coalW, coalH);

          ctx.strokeStyle = coalsGlowing ? 'rgba(254, 215, 170, 0.75)' : '#3f3f46';
          ctx.lineWidth = 1.1;
          ctx.strokeRect(-coalW * 0.5, -coalH * 0.5, coalW, coalH);

          if (coalsGlowing) {
            // Incandescent hot core
            ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
            ctx.beginPath();
            ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showSmoke, coalsGlowing, modelBrand, modelName, flavors, step]);

  return (
    <div ref={containerRef} className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[320px] max-h-[380px] block"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
