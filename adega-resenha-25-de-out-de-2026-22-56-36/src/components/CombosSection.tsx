import React, { useState } from 'react';
import { Tag, Check, ShoppingBag, Clock, Sparkles, Eye, Play, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ComboItem } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface CombosSectionProps {
  combos: ComboItem[];
}

export const CombosSection: React.FC<CombosSectionProps> = ({ combos }) => {
  const { addFixedCombo } = useCart();
  const [assemblyCombo, setAssemblyCombo] = useState<ComboItem | null>(null);
  const [animStep, setAnimStep] = useState<number>(0);

  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const handleOpenAssembly = (combo: ComboItem) => {
    setAssemblyCombo(combo);
    setAnimStep(0);
    // Trigger animated sequence of items entering
    setTimeout(() => setAnimStep(1), 200);
    setTimeout(() => setAnimStep(2), 600);
    setTimeout(() => setAnimStep(3), 1000);
    setTimeout(() => setAnimStep(4), 1400);
  };

  const handleAddAndClose = (combo: ComboItem) => {
    addFixedCombo(combo);
    setAssemblyCombo(null);
  };

  const activeCombos = combos.filter((combo) => {
    if (!combo.available) return false;
    if (combo.validUntil) {
      const today = new Date().toISOString().split('T')[0];
      if (combo.validUntil < today) return false;
    }
    return true;
  });

  return (
    <section id="combos" className="py-20 bg-[#09090b] border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-950/40 border border-rose-800/50 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Kits Fechados & Prontos</span>
            <span aria-hidden="true">·</span>
            <span>Preço Fixo Promocional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            COMBOS OFICIAIS DA RESENHA
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Combinações completas pensadas para o seu rolê. Garrafas lacradas, energéticos trincando, gelos saborizados e copos — sem alteração de itens, máxima economia.
          </p>
        </div>

        {/* Combos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeCombos.map((combo) => {
            const hasDiscount = combo.originalPrice && combo.originalPrice > combo.price;
            const savings = hasDiscount ? combo.originalPrice! - combo.price : 0;

            return (
              <div
                key={combo.id}
                className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl group"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                  {hasDiscount && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded shadow">
                      Economize {formatPrice(savings)}
                    </div>
                  )}

                  {combo.validUntil && (
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-rose-400" />
                      <span>Válido até {combo.validUntil.split('-').reverse().join('/')}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 font-mono">
                        Kit Fechado
                      </span>
                      <button
                        onClick={() => handleOpenAssembly(combo)}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-rose-400" />
                        <span>Ver Montagem</span>
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white font-['Outfit'] group-hover:text-rose-400 transition-colors">
                      {combo.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{combo.description}</p>

                    {/* Items list */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                        Itens Inclusos no Kit:
                      </span>
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        {combo.itemsIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span className="leading-tight">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="mt-6 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <div>
                      {combo.originalPrice && (
                        <span className="text-xs text-zinc-500 line-through tabular-nums block font-mono">
                          {formatPrice(combo.originalPrice)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-rose-500 font-mono tabular-nums">
                        {formatPrice(combo.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => addFixedCombo(combo)}
                      disabled={!combo.available}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-md shadow-rose-950/50 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Visual Animated Assembly of Combo Kit */}
        {assemblyCombo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 font-mono">
                    Montagem Automática do Kit
                  </span>
                  <h3 className="text-xl font-bold text-white font-['Outfit'] mt-0.5">
                    {assemblyCombo.name}
                  </h3>
                </div>
                <button
                  onClick={() => setAssemblyCombo(null)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Animated Assembly Stage */}
              <div className="my-6 p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 relative min-h-[220px] flex flex-col items-center justify-center overflow-hidden">
                
                {/* Glow backdrop */}
                <div className="absolute inset-0 bg-radial from-rose-900/20 via-transparent to-transparent pointer-events-none" />

                {/* Fixed Combo Alert Banner */}
                <div className="absolute top-3 inset-x-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Combo Fechado · Itens e proporções padronizados de fábrica</span>
                </div>

                {/* Staggered Items Animation Container */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                  {assemblyCombo.itemsIncluded.map((item, idx) => {
                    const isVisible = animStep > idx;

                    return (
                      <div
                        key={idx}
                        className={`transition-all duration-700 transform flex flex-col items-center p-3 rounded-xl border ${
                          isVisible
                            ? 'opacity-100 translate-y-0 scale-100 bg-zinc-900/90 border-rose-500/60 shadow-lg shadow-rose-950/40'
                            : 'opacity-0 translate-y-8 scale-75 bg-zinc-900/20 border-zinc-800'
                        }`}
                        style={{ minWidth: '130px', maxWidth: '160px' }}
                      >
                        <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-2 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-bold text-white text-center leading-tight">
                          {item}
                        </span>
                        {isVisible && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Incluso</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Final Complete Stamp */}
                {animStep >= assemblyCombo.itemsIncluded.length && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kit 100% Montado & Pronto para Envio</span>
                  </div>
                )}
              </div>

              {/* Price and Add button */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div>
                  <span className="text-xs text-zinc-400 block">Preço Promocional Fixo:</span>
                  <span className="text-2xl font-black text-rose-500 font-mono">
                    {formatPrice(assemblyCombo.price)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenAssembly(assemblyCombo)}
                    className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    title="Repetir animação"
                  >
                    <Play className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleAddAndClose(assemblyCombo)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
