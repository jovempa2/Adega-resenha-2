import React, { useState } from 'react';
import { ShoppingBag, Flame, Menu, X, MessageCircle, ShieldCheck, Skull } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { SiteSettings } from '../types.ts';

interface NavbarProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, onOpenAdmin }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { isAdmin } = useAuth();
  const { isHalloween } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', href: '#inicio' },
    { label: 'Bebidas', href: '#bebidas' },
    { label: 'Monte seu Copo', href: '#monte-seu-copo' },
    { label: 'Monte seu Rosh', href: '#monte-seu-rosh' },
    { label: 'Narguilés', href: '#narguiles' },
    { label: 'Combos & Ofertas', href: '#combos' },
    { label: 'Galeria Resenha', href: '#galeria' },
    { label: 'Contato', href: '#contato' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWhatsAppDirect = () => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Olá! Gostaria de consultar o cardápio e bebidas disponíveis na Adega Resenha.')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isHalloween
          ? 'bg-[#08040d]/92 border-b border-orange-900/50 shadow-lg shadow-purple-950/20'
          : 'bg-[#09090b]/90 border-b border-zinc-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#inicio"
          className="flex items-center gap-2.5 text-white font-extrabold tracking-wider text-xl uppercase shrink-0 transition-opacity hover:opacity-90 font-['Outfit']"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-lg ${
              isHalloween
                ? 'bg-gradient-to-tr from-orange-600 via-purple-600 to-orange-400 shadow-orange-950/50'
                : 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-rose-950/40'
            }`}
          >
            {isHalloween ? (
              <Skull className="w-5 h-5 text-orange-200 animate-pulse" />
            ) : (
              <Flame className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="flex items-center gap-1.5">
            ADEGA <span className={isHalloween ? 'text-orange-400' : 'text-rose-500'}>RESENHA</span>
          </span>
        </a>

        {/* Zone 2: Navigation Links (Clean unboxed typography) */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-zinc-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="whitespace-nowrap transition-colors hover:text-white hover:underline underline-offset-8 decoration-rose-500/80"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Actions (WhatsApp & Cart) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleWhatsAppDirect}
            aria-label="Falar no WhatsApp"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/60 hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir carrinho de compras"
            className="relative flex items-center justify-center p-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-950/50"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-zinc-950 text-[11px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-zinc-950/98 border-b border-zinc-800 px-4 pt-3 pb-6 space-y-3 shadow-2xl">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2.5 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleWhatsAppDirect();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/60 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chamar no WhatsApp ({settings.phone})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
