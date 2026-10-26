import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, MessageCircle, SlidersHorizontal, Check } from 'lucide-react';
import { Product, ProductCategory, SiteSettings } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductCatalogProps {
  products: Product[];
  settings: SiteSettings;
}

const CATEGORIES: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todas as Bebidas' },
  { id: 'gin', label: 'Gin' },
  { id: 'vodka', label: 'Vodka' },
  { id: 'whisky', label: 'Whisky' },
  { id: 'cervejas', label: 'Cervejas' },
  { id: 'energeticos', label: 'Energéticos' },
  { id: 'destilados', label: 'Destilados' },
  { id: 'refrigerantes', label: 'Refrigerantes' },
  { id: 'sem_alcool', label: 'Sem Álcool' },
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, settings }) => {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc'>('relevance');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: Product) => {
    if (!product.available) return;
    addToCart({
      id: product.id,
      type: 'catalog',
      title: product.name,
      subtitle: `${product.brand} · ${product.volume}`,
      unitPrice: product.price,
      image: product.image,
    });
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 1200);
  };

  const handleWhatsAppInquiry = (product: Product) => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const message = `Olá! Gostaria de consultar a disponibilidade do produto *${product.name}* (${formatPrice(product.price)}) na Adega Resenha.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="bebidas" className="py-20 bg-[#09090b] border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
              <span>Cardápio Oficial</span>
              <span aria-hidden="true">·</span>
              <span>100% Originais & Lacradas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
              CATÁLOGO DE BEBIDAS
            </h2>
            <p className="mt-2 text-zinc-400 text-sm max-w-xl">
              Linha completa de gins, vodkas, whiskies escoceses, cervejas e energéticos para sua festa ou consumo no local.
            </p>
          </div>

          {/* Search Input & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar bebida ou marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-rose-500 cursor-pointer transition-colors"
              >
                <option value="relevance">Mais Relevantes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8">
            <p className="text-zinc-400 text-sm">Nenhum produto encontrado com os filtros selecionados.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isAdded = justAddedId === product.id;

              return (
                <div
                  key={product.id}
                  className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all hover:-translate-y-0.5 shadow-lg"
                >
                  {/* Image Slot with Fallback Container */}
                  <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

                    {!product.available && (
                      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
                          Esgotado
                        </span>
                      </div>
                    )}

                    {product.volume && (
                      <span className="absolute bottom-2.5 left-3 text-[11px] font-mono font-medium text-zinc-300 bg-zinc-950/70 backdrop-blur-xs px-2 py-0.5 rounded">
                        {product.volume}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Quiet unboxed metadata */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                        <span>{product.brand}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{product.category}</span>
                      </div>

                      <h3 className="text-base font-bold text-white font-['Outfit'] group-hover:text-rose-400 transition-colors">
                        {product.name}
                      </h3>

                      <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Preço</span>
                        <span className="text-lg font-bold text-white font-mono tabular-nums">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleWhatsAppInquiry(product)}
                          title="Consultar pelo WhatsApp"
                          aria-label={`Consultar ${product.name} no WhatsApp`}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                        </button>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.available}
                          aria-label={`Adicionar ${product.name} ao carrinho`}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : product.available
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Adicionado</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{product.available ? 'Pedir' : 'Sem Estoque'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
