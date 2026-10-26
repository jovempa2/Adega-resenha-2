import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface ReelCard {
  id: string;
  title: string;
  category: string;
  tag: string;
  image: string;
  targetId: string;
}

const REEL_CARDS: ReelCard[] = [
  {
    id: 'card-1',
    title: 'Gin de 10 — Eternity',
    category: 'O Clássico da Casa',
    tag: 'R$ 10,00',
    image: '/src/assets/images/custom_drink_copao_1792974928549.jpg',
    targetId: 'monte-seu-copo',
  },
  {
    id: 'card-2',
    title: 'Monte seu Rosh Interativo',
    category: 'Mix de Essências',
    tag: 'Tabacaria +18',
    image: '/src/assets/images/hookah_lounge_setup_1792974929241.jpg',
    targetId: 'monte-seu-rosh',
  },
  {
    id: 'card-3',
    title: 'Copos & Gelos Saborizados',
    category: 'Monte do seu Jeito',
    tag: 'Personalizável',
    image: '/src/assets/images/hero_adega_resenha_1792974927845.jpg',
    targetId: 'monte-seu-copo',
  },
  {
    id: 'card-4',
    title: 'Combos & VIP Party Kits',
    category: 'Economia Real',
    tag: 'Kits Fechados',
    image: '/src/assets/images/combos_party_kit_1792974929979.jpg',
    targetId: 'combos',
  },
  {
    id: 'card-5',
    title: 'Mural da Galera',
    category: 'Compartilhe sua Resenha',
    tag: 'Fotos Reais',
    image: '/src/assets/images/adega_facade_ambience_1792974930253.jpg',
    targetId: 'compartilhe-sua-resenha',
  },
  {
    id: 'card-6',
    title: 'Destilados & Cervejas Geladas',
    category: 'Catálogo Oficial',
    tag: 'Originais',
    image: '/src/assets/images/hero_adega_resenha_1792974927845.jpg',
    targetId: 'bebidas',
  },
];

export const ReelmarkCurvedGallery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Repeat cards 3 times for a seamless infinite loop
  const displayCards = [...REEL_CARDS, ...REEL_CARDS, ...REEL_CARDS];

  // Physics & Animation State
  const offsetRef = useRef(0);
  const velocityRef = useRef(-0.65); // Default auto-scroll speed px/frame
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const isHoveredRef = useRef(false);
  const animFrameIdRef = useRef<number | null>(null);

  const [, setRerender] = useState(0);

  // Handle Drag / Touch
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastXRef.current;
    offsetRef.current += deltaX;
    velocityRef.current = deltaX * 0.8;
    lastXRef.current = e.clientX;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Continuous RAF Loop with Cylinder Perspective Calculation
  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    let singleSetWidth = 0;

    const measureWidth = () => {
      // Calculate width of one set of cards
      const children = track.children;
      if (children.length >= REEL_CARDS.length) {
        let w = 0;
        for (let i = 0; i < REEL_CARDS.length; i++) {
          w += (children[i] as HTMLElement).offsetWidth + 20; // 20px gap
        }
        singleSetWidth = w || 1600;
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isDraggingRef.current) {
        // Target baseline speed
        const baseSpeed = isHoveredRef.current ? -0.2 : -0.75;
        // Friction / inertia decay towards base speed
        velocityRef.current += (baseSpeed - velocityRef.current) * 0.05;
        offsetRef.current += velocityRef.current;
      }

      // Infinite wrap without jumping
      if (singleSetWidth > 0) {
        if (offsetRef.current <= -singleSetWidth) {
          offsetRef.current += singleSetWidth;
        } else if (offsetRef.current >= 0) {
          offsetRef.current -= singleSetWidth;
        }
      }

      // Apply transform to track
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;

      // Apply 3D Cylindrical Curvature & perspective to visible cards
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;

      const cardElements = track.children;
      for (let i = 0; i < cardElements.length; i++) {
        const card = cardElements[i] as HTMLElement;
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distFromCenter = cardCenter - centerX;
        const normDist = Math.max(-1, Math.min(1, distFromCenter / (containerRect.width * 0.65)));

        // Cylindrical angle (curves back at the edges)
        const rotY = normDist * 16; // -16 deg to +16 deg
        const translateZ = -Math.abs(normDist) * 45; // pushed back at edges
        const scale = 1 - Math.abs(normDist) * 0.08;
        const opacity = 1 - Math.abs(normDist) * 0.25;

        card.style.transform = `perspective(900px) rotateY(${rotY}deg) translateZ(${translateZ}px) scale(${scale})`;
        card.style.opacity = `${opacity}`;
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', measureWidth);
    };
  }, []);

  const handleCardClick = (targetId: string) => {
    // If not dragging significantly
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-14 overflow-hidden bg-gradient-to-b from-zinc-950 via-[#0d0d12] to-zinc-950 border-t border-b border-zinc-900/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-56 bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Referência Reelmark · Catálogo em Movimento</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            DESTAQUES DA RESENHA EM FLUXO CONTÍNUO
          </h3>
        </div>
        <p className="text-xs text-zinc-400 max-w-sm">
          Arraste horizontalmente para navegar com inércia ou clique no card para pular direto para a seção.
        </p>
      </div>

      {/* Curved Cylindrical Viewport Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onMouseEnter={() => (isHoveredRef.current = true)}
        onMouseLeave={() => (isHoveredRef.current = false)}
        className="relative w-full cursor-grab active:cursor-grabbing select-none py-6 overflow-hidden"
        style={{ perspective: '1100px' }}
      >
        {/* Soft edge gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent z-20 pointer-events-none" />

        {/* Sliding Track with 3D child transformations */}
        <div
          ref={trackRef}
          className="flex gap-5 will-change-transform pl-4"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {displayCards.map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
              onClick={() => handleCardClick(card.targetId)}
              className="group relative w-64 sm:w-72 md:w-80 h-[380px] sm:h-[420px] rounded-2xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 shadow-2xl transition-all duration-200"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Photo with soft zoom on card hover */}
              <img
                src={card.image}
                alt={card.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Multi-step vignette scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-transparent to-transparent opacity-60" />

              {/* Top Tag */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="text-[11px] font-bold text-rose-300 bg-rose-950/70 border border-rose-800/60 backdrop-blur-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {card.tag}
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-950/60 border border-zinc-700/60 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                </div>
              </div>

              {/* Bottom Details */}
              <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
                <span className="text-xs text-zinc-400 font-medium block">{card.category}</span>
                <h4 className="text-base sm:text-lg font-bold text-white font-['Outfit'] group-hover:text-rose-400 transition-colors leading-snug">
                  {card.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
