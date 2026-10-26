import React, { useRef, useState, useEffect } from 'react';
import { GlassWater, ArrowRight, MessageCircle, Clock, Truck, Sparkles, ShieldCheck, Skull } from 'lucide-react';
import { SiteSettings } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { Eterneti3DCanvas } from './Eterneti3DCanvas.tsx';
import { CursorGlow } from './CursorGlow.tsx';

interface HeroSectionProps {
  settings: SiteSettings;
  onExploreProducts: () => void;
  onOpenCustomizer: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onExploreProducts,
  onOpenCustomizer,
}) => {
  const { isHalloween } = useTheme();
  const heroRef = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Staggered cinematic text reveal trigger on mount
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsApp = () => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Olá! Gostaria de fazer um pedido e conhecer o catálogo da Adega Resenha.')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#09090b] transition-colors"
    >
      {/* 1. Interactive Cursor Glow (violet/magenta halo tracking pointer) */}
      <CursorGlow containerRef={heroRef} />

      {/* 2. Atmospheric Background Layers (graphite, deep violet glow, subtle grain) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-900/18 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-rose-900/12 rounded-full blur-[120px]" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/40 to-[#09090b]" />
      </div>

      {/* 3. Main Split Viewport: Text & CTAs (Left) + 3D Eterneti Bottle (Right) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Cinematic Text Reveal (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline with Animated SVG Drawing Stroke */}
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${
                isHalloween ? 'text-orange-400' : 'text-rose-400'
              } transition-all duration-700 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="relative flex items-center gap-1.5 font-['Outfit']">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isHalloween ? 'bg-orange-500 shadow-sm shadow-orange-500/80 animate-ping' : 'bg-rose-500 shadow-sm shadow-rose-500/80'
                  }`}
                />
                {isHalloween ? 'Especial Halloween 2026' : 'Adega & Lounge Noturno'}
              </span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className={isHalloween ? 'text-orange-200' : 'text-zinc-400'}>
                {isHalloween ? 'Noite do Gin Eternity' : 'Edição Especial Eternity'}
              </span>

              {/* Decorative SVG Drawing Line */}
              <svg className="hidden sm:inline w-20 h-4 ml-2 overflow-visible" aria-hidden="true">
                <line
                  x1="0"
                  y1="8"
                  x2="80"
                  y2="8"
                  stroke="#9333ea"
                  strokeWidth="1.5"
                  strokeDasharray="80"
                  className={`transition-all duration-1000 ease-out ${
                    isRevealed ? 'stroke-dashoffset-0' : 'stroke-dashoffset-80'
                  }`}
                />
              </svg>
            </div>

            {/* Display Headline with Smooth Blur-to-Sharp Transition */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-[1.06] font-['Outfit'] text-balance transition-all duration-700 delay-100 ${
                isRevealed
                  ? 'opacity-100 translate-y-0 filter-none'
                  : 'opacity-0 translate-y-6 blur-xs'
              }`}
            >
              UMA NOVA <br />
              <span className="bg-gradient-to-r from-purple-400 via-rose-500 to-amber-300 bg-clip-text text-transparent">
                EXPERIÊNCIA
              </span>{' '}
              <br />
              COMEÇA AQUI.
            </h1>

            {/* Subtitle with Staggered Fade */}
            <p
              className={`text-base sm:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-xl text-balance transition-all duration-700 delay-200 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              Descubra <strong className="text-white font-semibold">Eternity</strong> e conheça o universo da <strong className="text-white font-semibold">Adega Resenha</strong> — bebidas trincando de geladas, o clássico copo artesanal e espaço de narguilé completo.
            </p>

            {/* Key Quality Markers */}
            <div
              className={`flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1 transition-all duration-700 delay-250 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                London Dry Gin 1L
              </span>
              <span aria-hidden="true" className="text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Gelos Saborizados Exclusivos
              </span>
              <span aria-hidden="true" className="text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Entrega Rápida & Balcão
              </span>
            </div>

            {/* Action CTA Buttons (Staggered Entrance) */}
            <div
              className={`pt-2 flex flex-wrap items-center gap-3.5 transition-all duration-700 delay-300 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <button
                onClick={onExploreProducts}
                className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 hover:from-rose-500 hover:to-purple-500 transition-all shadow-xl shadow-rose-950/60 active:scale-[0.98] cursor-pointer"
              >
                <span>Conhecer Produtos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenCustomizer}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:text-white transition-all shadow-md cursor-pointer"
              >
                <GlassWater className="w-4 h-4 text-rose-400" />
                <span>Monte seu Copo</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Falar no WhatsApp</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D Eternity Bottle (5 cols on desktop) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Soft violet backdrop halo */}
            <div className="absolute w-72 h-72 sm:w-88 sm:h-88 bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />

            {/* 3D Bottle Canvas */}
            <Eterneti3DCanvas className="z-10" />

            {/* Subtle floating badge */}
            <div className="absolute bottom-4 right-2 sm:right-6 bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[11px] text-zinc-300 shadow-xl flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
              <span>Gire com o mouse ou role a página</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Feature Strip with Seamless Section Bridge */}
      <div className="relative z-10 border-t border-zinc-800/70 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-zinc-400 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-rose-400">
                <GlassWater className="w-4 h-4" />
              </div>
              <div>
                <p className="text-zinc-200 font-semibold text-xs sm:text-sm">Gin Eternity 1L</p>
                <p className="text-xs text-zinc-500">Dose oficial no copo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-amber-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-zinc-200 font-semibold text-xs sm:text-sm">Delivery Expresso</p>
                <p className="text-xs text-zinc-500">Bebida trincando na porta</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-zinc-200 font-semibold text-xs sm:text-sm">Narguilé & Sessão</p>
                <p className="text-xs text-zinc-500">Carvão de coco & essências</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-zinc-200 font-semibold text-xs sm:text-sm">Até de Madrugada</p>
                <p className="text-xs text-zinc-500">{settings.openingHours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
