import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, Instagram, Truck, ExternalLink } from 'lucide-react';
import { SiteSettings } from '../types.ts';

interface LocationContactSectionProps {
  settings: SiteSettings;
}

export const LocationContactSection: React.FC<LocationContactSectionProps> = ({ settings }) => {
  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const handleWhatsApp = () => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Olá! Gostaria de falar com o atendimento da Adega Resenha.')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleInstagram = () => {
    const cleanHandle = settings.instagram.replace('@', '');
    window.open(`https://instagram.com/${cleanHandle}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contato" className="py-20 bg-[#09090b] border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
            <span>Encontre Nossa Casa</span>
            <span aria-hidden="true">·</span>
            <span>Atendimento Rápido</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            LOCALIZAÇÃO & CONTATO
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Venha buscar seu copão no balcão, curtir uma sessão de narguilé ou peça pelo delivery expresso no conforto da sua resenha.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details Card (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Endereço Oficial</h4>
                  <p className="text-sm font-semibold text-white mt-1">{settings.address}</p>
                  <p className="text-xs text-zinc-400">{settings.city}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Horário de Funcionamento</h4>
                  <p className="text-sm font-semibold text-white mt-1">{settings.openingHours}</p>
                  <p className="text-xs text-zinc-400">Atendimento ininterrupto de delivery durante a noite</p>
                </div>
              </div>

              {/* WhatsApp & Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">WhatsApp & Telefone</h4>
                  <p className="text-sm font-semibold text-white mt-1">{settings.phone}</p>
                  <p className="text-xs text-zinc-400">Central de pedidos e reservas</p>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/80 flex items-center justify-center text-purple-400 shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rede Social</h4>
                  <p className="text-sm font-semibold text-white mt-1">{settings.instagram}</p>
                  <p className="text-xs text-zinc-400">Novidades, stories e promoções relâmpago</p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase">
                  <Truck className="w-4 h-4" />
                  <span>Políticas de Entrega</span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1">
                  <p>• Taxa padrão de entrega: <strong className="text-white font-mono">{formatPrice(settings.deliveryFee)}</strong></p>
                  <p>• Pedido mínimo: <strong className="text-white font-mono">{formatPrice(settings.minOrderValue)}</strong></p>
                  <p>• Bebidas entregues em embalagem térmica com gelo e canudos higienizados.</p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 hover:bg-emerald-900/60 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar</span>
              </button>
              <button
                onClick={handleInstagram}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-purple-300 bg-purple-950/70 border border-purple-800/80 hover:bg-purple-900/60 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </button>
            </div>
          </div>

          {/* Interactive Map Visual (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 flex flex-col min-h-[380px]">
            {/* Map Header */}
            <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold text-zinc-200">
                  {settings.address} — {settings.city}
                </span>
              </div>
              <a
                href={settings.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${settings.address}, ${settings.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Google Maps iFrame */}
            <div className="flex-1 w-full relative min-h-[340px]">
              <iframe
                title="Localização da Adega Resenha"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${settings.address}, ${settings.city}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0 filter invert-[90%] hue-rotate-[180deg] contrast-[1.2]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
