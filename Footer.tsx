import React from 'react';
import { Flame, ShieldCheck, Heart } from 'lucide-react';
import { SiteSettings } from '../types.ts';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-900">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold tracking-wider text-lg uppercase font-['Outfit']">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white">
                <Flame className="w-4 h-4" />
              </div>
              <span>
                ADEGA <span className="text-rose-500">RESENHA</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              O ponto de encontro da sua noite. Copos e taças artesanais montados na hora com Gin Eternity, gelos de sabor, energéticos Baly e Red Bull, e espaço completo de narguilé.
            </p>
            <div className="text-[11px] text-zinc-500 space-y-0.5 font-mono">
              <p>CNPJ: 45.123.890/0001-77 · Inscrição Estadual: 110.456.789.112</p>
              <p>{settings.address} — {settings.city}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="hover:text-white transition-colors">Início</a>
              </li>
              <li>
                <a href="#bebidas" className="hover:text-white transition-colors">Catálogo de Bebidas</a>
              </li>
              <li>
                <a href="#monte-seu-copo" className="hover:text-white transition-colors">Monte seu Copo</a>
              </li>
              <li>
                <a href="#monte-seu-rosh" className="hover:text-white transition-colors">Monte seu Rosh</a>
              </li>
              <li>
                <a href="#narguiles" className="hover:text-white transition-colors">Narguilés & Acessórios</a>
              </li>
              <li>
                <a href="#combos" className="hover:text-white transition-colors">Combos & Ofertas</a>
              </li>
              <li>
                <a href="#compartilhe-sua-resenha" className="hover:text-white transition-colors">Mural da Galera</a>
              </li>
            </ul>
          </div>

          {/* Regulatory & Admin */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Atendimento & Gestão</h4>
            <div className="space-y-2 text-zinc-400">
              <p>Horário: {settings.openingHours}</p>
              <p>WhatsApp: {settings.phone}</p>
              <p>Instagram: {settings.instagram}</p>
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Painel Administrativo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimers & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
          </p>

          <p className="text-center sm:text-right text-zinc-400 font-medium">
            Aprecie com moderação. Se beber, não dirija. Venda proibida para menores de 18 anos.
          </p>
        </div>
      </div>
    </footer>
  );
};
