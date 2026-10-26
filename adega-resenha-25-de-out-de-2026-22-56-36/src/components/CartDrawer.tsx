import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { SiteSettings } from '../types.ts';

interface CartDrawerProps {
  settings: SiteSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ settings }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white font-['Outfit']">Seu Carrinho</h2>
              <span className="text-xs text-zinc-400 font-mono">({cart.length} itens)</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-zinc-900">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-zinc-300 font-semibold text-sm">Seu carrinho está vazio</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Monte um copão exclusivo ou adicione bebidas geladas do nosso catálogo para começar.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-3">
                  {/* Thumbnail */}
                  {item.image && (
                    <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white leading-tight font-['Outfit']">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Custom details if copão */}
                      {item.type === 'custom_drink' && item.customDetails && (
                        <div className="mt-1 text-[11px] text-zinc-400 space-y-0.5 bg-zinc-900/60 p-2 rounded border border-zinc-800/60">
                          {item.customDetails.cupSize && (
                            <p>
                              <span className="text-zinc-300">Copo:</span> {item.customDetails.cupSize}
                            </p>
                          )}
                          <p>
                            <span className="text-zinc-300">Gelos:</span> {item.customDetails.ices.join(', ') || 'Nenhum'}
                          </p>
                          <p>
                            <span className="text-zinc-300">Energético:</span> {item.customDetails.energyDrink}
                          </p>
                          {item.customDetails.addOns.length > 0 && (
                            <p>
                              <span className="text-zinc-300">Adicionais:</span> {item.customDetails.addOns.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {item.type === 'custom_rosh' && item.customRoshDetails && (
                        <div className="mt-1 text-[11px] text-zinc-400 space-y-0.5 bg-zinc-900/60 p-2 rounded border border-zinc-800/60">
                          <p>
                            <span className="text-amber-400 font-semibold">Essências:</span>{' '}
                            {item.customRoshDetails.flavors.map(f => `${f.name} (${f.proportion})`).join(' + ')}
                          </p>
                          {item.customRoshDetails.accessories.length > 0 && (
                            <p>
                              <span className="text-zinc-300">Acessórios:</span> {item.customRoshDetails.accessories.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {item.type === 'combo' && item.comboDetails && (
                        <div className="mt-1 text-[11px] text-zinc-400 space-y-0.5 bg-zinc-900/60 p-2 rounded border border-zinc-800/60">
                          <p className="text-rose-400 font-medium">Kit Fechado:</p>
                          <p>{item.comboDetails.itemsIncluded.join(' · ')}</p>
                        </div>
                      )}

                      {item.type !== 'custom_drink' && item.type !== 'custom_rosh' && item.type !== 'combo' && item.subtitle && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">{item.subtitle}</p>
                      )}
                    </div>

                    {/* Stepper & Subtotal */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center text-xs font-mono font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-rose-400 font-mono tabular-nums">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Totals and Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-950 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-zinc-200">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Taxa de Entrega estimada</span>
                  <span className="font-mono tabular-nums text-zinc-200">
                    A partir de {formatPrice(settings.deliveryFee)} (Grátis na retirada)
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total (sem frete)</span>
                  <span className="text-rose-500 font-mono tabular-nums font-['Outfit']">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:border-zinc-700 transition-colors"
                  title="Esvaziar carrinho"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleProceedToCheckout}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg shadow-rose-950/60"
                >
                  <span>Finalizar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
