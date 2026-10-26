import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Check, Heart, ShieldCheck, AlertCircle, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { CustomerPhoto } from '../types.ts';
import { api } from '../services/api.ts';

export const CustomerPhotoSection: React.FC = () => {
  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [caption, setCaption] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadApprovedPhotos = async () => {
    try {
      const data = await api.getCustomerPhotos(true);
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load customer photos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovedPhotos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A foto deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!photoPreview) {
      setErrorMessage('Selecione uma foto da sua resenha para enviar.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Informe seu nome ou apelido.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Você deve autorizar o uso da imagem no mural oficial da Adega Resenha.');
      return;
    }

    try {
      setSubmitting(true);
      await api.uploadCustomerPhoto({
        customerName: customerName.trim(),
        photoUrl: photoPreview,
        caption: caption.trim() || undefined,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setCustomerName('');
        setCaption('');
        setPhotoPreview(null);
        setTermsAccepted(false);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao enviar foto. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="compartilhe-sua-resenha" className="py-20 bg-[#09090b] border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-950/40 border border-rose-800/50 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Mural da Galera</span>
              <span aria-hidden="true">·</span>
              <span>Comunidade Oficial</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
              COMPARTILHE SUA RESENHA
            </h2>
            <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-xl">
              Postou na Adega ou comemorou com os combos e copões em casa? Envie sua foto para o nosso mural e apareça no site oficial!
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-rose-950/60 cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>Enviar Minha Foto</span>
          </button>
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="py-16 text-center text-zinc-500 text-xs">Carregando fotos da resenha...</div>
        ) : photos.length === 0 ? (
          <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-12 text-center max-w-md mx-auto">
            <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white font-['Outfit']">Seja o Primeiro a Aparecer!</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Ainda não temos fotos aprovadas no mural hoje. Tire uma foto na Adega ou com seus produtos e envie agora!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              Tirar Foto Agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {photos.map((item) => (
              <div
                key={item.id}
                className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-rose-500/50 transition-all shadow-xl"
              >
                <div className="aspect-square overflow-hidden bg-zinc-950 relative">
                  <img
                    src={item.photoUrl}
                    alt={item.caption || `Foto enviada por ${item.customerName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block font-mono">
                    @{item.customerName}
                  </span>
                  {item.caption && (
                    <p className="text-xs text-zinc-200 mt-0.5 line-clamp-2 leading-relaxed">
                      "{item.caption}"
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/60">
                    <span>Resenha Verificada</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/80" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Upload Customer Photo */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-white font-['Outfit']">Envie sua Foto da Resenha</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-600 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-bold text-white font-['Outfit']">Foto Enviada para Moderação!</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Obrigado por compartilhar! Nossa equipe da Adega Resenha irá aprovar sua foto em instantes para que ela apareça no mural público.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {errorMessage && (
                    <div className="p-3 bg-rose-950/60 border border-rose-800/70 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Photo picker area */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Sua Foto (Foto no balcão, na mesa ou com sua bebida)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {photoPreview ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950">
                        <img
                          src={photoPreview}
                          alt="Pré-visualização"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-700 hover:border-rose-500/80 rounded-xl p-8 text-center cursor-pointer bg-zinc-950/60 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-zinc-300 block">
                          Clique para escolher ou tirar foto do celular
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-1 block">JPG, PNG ou WEBP até 5MB</span>
                      </div>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Seu Nome ou @ do Instagram *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: @gabriel_silva ou Gabriel"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Legenda ou Mensagem (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Sextou com o melhor copão de Eternity da Augusta!"
                      value={caption}
                      maxLength={120}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Legal Terms Checkbox */}
                  <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-700 bg-zinc-950 text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span>
                      Declaro que sou maior de 18 anos e autorizo a exibição desta foto no mural da Adega Resenha.
                    </span>
                  </label>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-rose-950/60 disabled:opacity-50"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Foto'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
