import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Maximize2, Upload, Heart, Check, AlertCircle, Sparkles } from 'lucide-react';
import { GalleryItem, CustomerPhoto } from '../types.ts';
import { api } from '../services/api.ts';

interface GallerySectionProps {
  items: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ items }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<{
    id: string;
    image: string;
    title: string;
    category: string;
    description?: string;
    customerName?: string;
  } | null>(null);

  // Customer photos loaded from backend
  const [customerPhotos, setCustomerPhotos] = useState<CustomerPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
      setLoadingPhotos(true);
      const data = await api.getCustomerPhotos(true);
      setCustomerPhotos(data);
    } catch (err) {
      console.error('Failed to load customer photos in gallery', err);
    } finally {
      setLoadingPhotos(false);
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

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!photoPreview) {
      setErrorMessage('Selecione uma foto da sua resenha para enviar.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Informe seu nome ou seu @ do Instagram.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Você deve autorizar o uso da imagem na Galeria oficial da Adega Resenha.');
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
        setIsUploadModalOpen(false);
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

  const filters = [
    { id: 'all', label: 'Todas as Fotos' },
    { id: 'clientes', label: 'Clientes na Resenha' },
    { id: 'ambiente', label: 'Fachada & Espaço' },
    { id: 'bebidas', label: 'Copões & Bebidas' },
    { id: 'narguile', label: 'Hookah Lounge' },
  ];

  // Combine gallery items and approved customer photos
  const clientGalleryItems = customerPhotos.map((cp) => ({
    id: `cp-${cp.id}`,
    image: cp.photoUrl,
    title: `Foto por @${cp.customerName}`,
    category: 'clientes',
    description: cp.caption || 'Cliente na resenha oficial',
    customerName: cp.customerName,
  }));

  const standardGalleryItems = items.map((it) => ({
    id: it.id,
    image: it.image,
    title: it.title,
    category: it.category,
    description: it.description,
    customerName: undefined,
  }));

  const allDisplayItems = [...clientGalleryItems, ...standardGalleryItems];

  const filteredItems = allDisplayItems.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  return (
    <section id="galeria" className="py-20 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>Nossa Atmosfera & Comunidade</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
              GALERIA DA ADEGA RESENHA
            </h2>
            <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-xl">
              Nossa estrutura, bar de copões, narguilé lounge e os melhores momentos registrados pelos nossos clientes.
            </p>
          </div>

          {/* Prominent Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-rose-950/60 cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Envie sua foto para a Galeria</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filters.map((f) => {
            const count =
              f.id === 'all'
                ? allDisplayItems.length
                : f.id === 'clientes'
                ? clientGalleryItems.length
                : standardGalleryItems.filter((it) => it.category === f.id).length;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap border flex items-center gap-1.5 cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] opacity-75 font-mono font-bold">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-2xl border border-zinc-800 max-w-md mx-auto">
            <Camera className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p>Nenhuma foto nesta categoria no momento.</p>
            {selectedFilter === 'clientes' && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-3 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Seja o primeiro a enviar!
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveModalItem(item)}
                className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer aspect-[4/3] shadow-lg hover:border-rose-500/50 transition-all"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 font-mono">
                      {item.category === 'clientes' ? 'Cliente Resenha' : item.category}
                    </span>
                    {item.customerName && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        @{item.customerName}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white font-['Outfit']">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>

                <div className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-950/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-950/80 text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/9] w-full bg-black max-h-[65vh] flex items-center justify-center overflow-hidden">
              <img
                src={activeModalItem.image}
                alt={activeModalItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
                  {activeModalItem.category === 'clientes' ? 'Cliente na Adega Resenha' : activeModalItem.category}
                </span>
                {activeModalItem.customerName && (
                  <span className="text-xs font-bold text-rose-300 font-mono">
                    Postado por @{activeModalItem.customerName}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white font-['Outfit'] mt-1">
                {activeModalItem.title}
              </h3>
              {activeModalItem.description && (
                <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                  {activeModalItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Customer Photo Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white font-['Outfit']">Envie sua Foto para a Galeria</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
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
                  Obrigado por compartilhar sua resenha! Nossa equipe irá aprovar sua foto para que ela apareça na Galeria da Adega Resenha.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPhoto} className="mt-6 space-y-5">
                {errorMessage && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/70 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Photo Picker */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Sua Foto na Resenha (Balcão, mesas ou seu copão) *
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
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
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
                        Clique para escolher do celular ou computador
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
                    placeholder="Ex: Noite de resenha com o copão de Eternity!"
                    value={caption}
                    maxLength={120}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Legal Terms */}
                <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-950 text-rose-600 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    Declaro que sou maior de 18 anos e autorizo a exibição desta foto na Galeria da Adega Resenha.
                  </span>
                </label>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-rose-950/60 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Foto'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
