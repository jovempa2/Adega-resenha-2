import React, { useState, useMemo } from 'react';
import { Sparkles, ShoppingBag, MessageCircle, ShieldAlert, Search } from 'lucide-react';
import { HookahItem, HookahSubcategory, SiteSettings } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface HookahSectionProps {
  items: HookahItem[];
  settings: SiteSettings;
}

const SUBCATEGORIES: { id: HookahSubcategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos os Itens' },
  { id: 'completos', label: 'Completos' },
  { id: 'portateis', label: 'Portáteis' },
  { id: 'rosh', label: 'Rosh' },
  { id: 'carvao', label: 'Carvão de Coco' },
  { id: 'essencias', label: 'Essências' },
  { id: 'piteiras', label: 'Piteiras' },
  { id: 'acessorios', label: 'Acessórios' },
];

export const HookahSection: React.FC<HookahSectionProps> = ({ items, settings }) => {
  const { addToCart } = useCart();
  const [selectedSubcategory, setSelectedSubcategory] = useState<HookahSubcategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedSubcategory === 'all' || item.subcategory === selectedSubcategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedSubcategory, searchQuery]);

  const handleAddToCart = (item: HookahItem) => {
    if (!item.available) return;
    addToCart({
      id: item.id,
      type: 'hookah',
      title: item.name,
      subtitle: `${item.brand} · Narguilé`,
      unitPrice: item.price,
      image: item.image,
    });
  };

  const handleWhatsApp = (item: HookahItem) => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const message = `Olá! Gostaria de consultar sobre o item de narguilé *${item.name}* (${formatPrice(item.price)}) na Adega Resenha.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="narguiles" className="py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner with 18+ Warning */}
        <div className="mb-10 bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-200">
              <strong>Aviso Legal (Artigo 243 do ECA):</strong> A comercialização de narguilés, carvões, essências e correlatos é expressamente proibida para menores de 18 anos.
            </p>
          </div>
          <span className="hidden sm:inline text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-900/60 px-2.5 py-1 rounded">
            +18 Obrigatório
          </span>
        </div>

        {/* Section Header with Featured Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hookah Lounge & Tabacaria</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
              NARGUILÉS, ESSÊNCIAS & ACESSÓRIOS
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Equipamentos de alto fluxo, roshs em cerâmica refratária de alto rendimento térmico, carvão 100% fibra de coco sem cheiro e as melhores essências das marcas consagradas.
            </p>
          </div>

          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-zinc-800 aspect-[16/9] shadow-xl">
            <img
              src="/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
              alt="Setup de narguilé na Adega Resenha"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-4 text-xs font-semibold text-zinc-200 bg-zinc-950/70 backdrop-blur-xs px-2.5 py-1 rounded border border-zinc-800">
              Setup Completo Disponível
            </span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 scrollbar-none">
            {SUBCATEGORIES.map((sub) => {
              const isActive = selectedSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar no lounge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-[10px] uppercase font-bold tracking-wider text-rose-400 bg-zinc-950/80 px-2 py-0.5 rounded">
                  {item.subcategory}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-zinc-500 font-medium mb-1">{item.brand}</div>
                  <h3 className="text-sm font-bold text-white font-['Outfit'] group-hover:text-rose-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Preço</span>
                    <span className="text-base font-bold text-white font-mono tabular-nums">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleWhatsApp(item)}
                      title="Perguntar no WhatsApp"
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{item.available ? 'Adicionar' : 'Sem Estoque'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
