import React, { useState } from 'react';
import { X, Check, MessageCircle, MapPin, CreditCard, DollarSign, QrCode, Copy, Truck, Store, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { SiteSettings, Order } from '../types.ts';
import { api, buildWhatsAppMessage, openWhatsApp } from '../services/api.ts';

interface CheckoutModalProps {
  settings: SiteSettings;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ settings }) => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, subtotal, clearCart } = useCart();

  // Form states
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'retirada'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'pix' | 'cartao_entrega' | 'dinheiro' | 'alimentacao_presencial'
  >('pix');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;
  const deliveryFee = deliveryType === 'delivery' ? settings.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Por favor, informe seu nome e telefone.');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setErrorMessage('Por favor, preencha os campos obrigatórios do endereço de entrega.');
        return;
      }
    }

    if (subtotal < settings.minOrderValue) {
      setErrorMessage(`O valor mínimo para pedidos é de ${formatPrice(settings.minOrderValue)}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare payload for backend
      const orderPayload = {
        customerName,
        customerPhone,
        deliveryType,
        address:
          deliveryType === 'delivery'
            ? {
                street,
                number,
                neighborhood,
                complement: complement.trim() || undefined,
                reference: reference.trim() || undefined,
              }
            : undefined,
        paymentMethod,
        changeFor: paymentMethod === 'dinheiro' && changeFor ? parseFloat(changeFor) : undefined,
        items: cart.map((item) => ({
          type: item.type,
          name: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customDetails: item.customDetails,
          customRoshDetails: item.customRoshDetails,
          comboDetails: item.comboDetails,
        })),
        subtotal,
        deliveryFee,
        total: grandTotal,
        notes: notes.trim() || undefined,
      };

      // 2. Persist order in the backend database
      const savedOrder = await api.createOrder(orderPayload);
      setCompletedOrder(savedOrder);

      // 3. Format WhatsApp receipt and send
      const whatsappText = buildWhatsAppMessage(settings, {
        code: savedOrder.code,
        customerName,
        customerPhone,
        deliveryType,
        address: savedOrder.address,
        paymentMethod,
        changeFor: orderPayload.changeFor,
        items: cart,
        subtotal,
        deliveryFee,
        total: grandTotal,
        notes: notes.trim() || undefined,
      });

      openWhatsApp(settings.whatsapp, whatsappText);

      // Clear shopping bag
      clearCart();
    } catch (err: any) {
      console.error('Failed to create order', err);
      setErrorMessage('Ocorreu um erro ao registrar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              {completedOrder ? 'Pedido Enviado com Sucesso!' : 'Finalizar Pedido — Adega Resenha'}
            </h3>
            <p className="text-xs text-zinc-400">
              {completedOrder
                ? 'Seu pedido foi registrado e encaminhado para o WhatsApp oficial.'
                : 'Preencha seus dados para receber ou retirar suas bebidas geladas.'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order Completed Successfully */}
        {completedOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-700 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 block mb-1">
                Código do Pedido
              </span>
              <h4 className="text-3xl font-extrabold text-white font-mono tracking-wider">
                #{completedOrder.code}
              </h4>
            </div>

            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              Obrigado, <strong className="text-white">{completedOrder.customerName}</strong>! A conversa do WhatsApp foi aberta com o resumo do seu pedido. Nossa equipe iniciará o preparo assim que confirmar.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-md mx-auto text-left text-xs text-zinc-400 space-y-1.5 font-mono">
              <p>• Modalidade: {completedOrder.deliveryType === 'delivery' ? 'Entrega em domicílio' : 'Retirada no balcão'}</p>
              <p>• Total: {formatPrice(completedOrder.total)}</p>
              <p>• Pagamento: {completedOrder.paymentMethod.toUpperCase()}</p>
              {completedOrder.paymentMethod === 'pix' && (
                <p className="text-amber-300 mt-2">
                  Chave PIX ({settings.pixKeyType}): <span className="text-white select-all">{settings.pixKey}</span>
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  const text = `Olá! Meu pedido é o #${completedOrder.code}. Gostaria de confirmar se já receberam!`;
                  openWhatsApp(settings.whatsapp, text);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reabrir Conversa no WhatsApp</span>
              </button>

              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 transition-colors"
              >
                Fechar e Voltar ao Início
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Delivery vs Retirada Mode */}
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                1. Como deseja receber?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    deliveryType === 'delivery'
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Truck className="w-4 h-4 text-rose-400" />
                  <span>Entrega (+ {formatPrice(settings.deliveryFee)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('retirada')}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    deliveryType === 'retirada'
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Retirada no Balcão (Grátis)</span>
                </button>
              </div>
            </div>

            {/* Customer Basic Info */}
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                2. Seus Dados de Contato
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp com DDD (Ex: 11 99999-9999) *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Address if Delivery */}
            {deliveryType === 'delivery' && (
              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  3. Endereço de Entrega
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Rua / Avenida *"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Número *"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Bairro *"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Complemento (Apto, bloco)"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Ponto de referência"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-3 pt-2 border-t border-zinc-900">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                {deliveryType === 'delivery' ? '4.' : '3.'} Forma de Pagamento
              </label>

              <div className={`grid ${settings.acceptMealVoucher ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-2.5`}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>PIX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao_entrega')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'cartao_entrega'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>Cartão Maquininha</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'dinheiro'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Dinheiro</span>
                </button>

                {settings.acceptMealVoucher && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('alimentacao_presencial')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'alimentacao_presencial'
                        ? 'bg-rose-950/40 border-rose-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Vale Alimentação</span>
                  </button>
                )}
              </div>

              {/* PIX Details */}
              {paymentMethod === 'pix' && (
                <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                      Chave PIX Oficial ({settings.pixKeyType})
                    </span>
                    <span className="text-zinc-200 font-mono font-bold">{settings.pixKey}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors"
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              )}

              {/* Cash Change */}
              {paymentMethod === 'dinheiro' && (
                <div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Precisa de troco para quanto? (Deixe em branco se tiver exato)"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <textarea
                rows={2}
                placeholder="Observações adicionais para o barman ou motoboy (ex: gelo bem separado, etc.)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            {/* Review Summary */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal dos Itens ({cart.length})</span>
                <span className="font-mono tabular-nums text-zinc-200">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Taxa de Entrega</span>
                <span className="font-mono tabular-nums text-zinc-200">
                  {deliveryFee === 0 ? 'Grátis' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total a Pagar</span>
                <span className="text-rose-500 font-mono tabular-nums font-['Outfit']">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-xl shadow-rose-950/60 active:scale-[0.99] disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{isSubmitting ? 'Registrando Pedido...' : 'Confirmar e Enviar pelo WhatsApp'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
