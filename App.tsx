import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { HalloweenDecorations } from './components/HalloweenDecorations.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ReelmarkCurvedGallery } from './components/ReelmarkCurvedGallery.tsx';
import { DrinkCustomizer } from './components/DrinkCustomizer.tsx';
import { RoshCustomizer } from './components/RoshCustomizer.tsx';
import { ProductCatalog } from './components/ProductCatalog.tsx';
import { HookahSection } from './components/HookahSection.tsx';
import { CombosSection } from './components/CombosSection.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { LocationContactSection } from './components/LocationContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { AgeVerificationModal } from './components/AgeVerificationModal.tsx';
import {
  Product,
  CustomizerConfig,
  HookahItem,
  ComboItem,
  GalleryItem,
  SiteSettings,
  Order,
} from './types.ts';
import { api } from './services/api.ts';
import { Loader2, Skull } from 'lucide-react';

const FALLBACK_SETTINGS: SiteSettings = {
  storeName: 'Adega Resenha',
  tagline: 'O ponto de encontro da sua noite — Bebidas geladas, Copão e Narguilé',
  storeLogoUrl: '',
  whatsapp: '5511999998888',
  whatsappGreeting: 'Olá! Gostaria de consultar o catálogo e fazer um pedido na Adega Resenha.',
  phone: '(11) 99999-8888',
  address: 'Rua Augusta, 1420 - Consolação',
  city: 'São Paulo - SP',
  openingHours: 'Terça a Domingo das 18:00 às 04:00',
  instagram: '@adegaresenha_oficial',
  instagramUrl: 'https://instagram.com/adegaresenha_oficial',
  pixKey: 'contato@adegaresenha.com.br',
  pixKeyType: 'E-mail',
  pixBeneficiaryName: 'Adega Resenha Bebidas Ltda',
  pixBeneficiaryCity: 'SAO PAULO',
  acceptMealVoucher: true,
  deliveryFee: 7.0,
  minOrderValue: 20.0,
  manualThemeOverride: 'auto',
};

const FALLBACK_CUSTOMIZER: CustomizerConfig = {
  maxIceFlavors: 2,
  cupSizes: [
    { id: 'cup-copao-700', name: 'Copão 700ml Acrílico', price: 0, available: true, description: 'O gigante clássico das noites paulistanas.' },
    { id: 'cup-taca-gin-600', name: 'Taça Gin Acrílica 600ml', price: 4.0, available: true, description: 'Taça elegante para preservar aroma e botânicos.' },
  ],
  baseDrinks: [
    {
      id: 'base-gin-10',
      name: 'Gin de 10 — Eternity',
      price: 10.0,
      available: true,
      description: 'A pedida oficial da Resenha. Dose generosa servida no copo de sua escolha.',
    },
    {
      id: 'base-gin-tanqueray',
      name: 'Gin Tanqueray London Dry',
      price: 22.0,
      available: true,
      description: 'Dose premium com botânicos nobres importados.',
    },
  ],
  iceFlavors: [
    { id: 'ice-morango', name: 'Gelo de Morango', price: 3.5, available: true },
    { id: 'ice-melancia', name: 'Gelo de Melancia', price: 3.5, available: true },
    { id: 'ice-maracuja', name: 'Gelo de Maracujá', price: 3.5, available: true },
    { id: 'ice-coco', name: 'Gelo de Coco', price: 3.5, available: true },
    { id: 'ice-maca-verde', name: 'Gelo de Maçã Verde', price: 3.5, available: true },
    { id: 'ice-agua', name: 'Gelo de Água (Sem Sabor)', price: 0.0, available: true },
  ],
  balyFlavors: [
    { id: 'baly-maracuja', name: 'Baly Maracujá', price: 6.0, available: true },
    { id: 'baly-melancia', name: 'Baly Melancia', price: 6.0, available: true },
    { id: 'baly-morango-pessego', name: 'Baly Morango com Pêssego', price: 6.0, available: true },
  ],
  redBullFlavors: [
    { id: 'rb-tradicional', name: 'Red Bull Tradicional', price: 11.0, available: true },
    { id: 'rb-tropical', name: 'Red Bull Tropical Edition', price: 12.0, available: true },
    { id: 'rb-melancia', name: 'Red Bull Red Edition (Melancia)', price: 12.0, available: true },
  ],
  addOns: [
    { id: 'addon-fini-dentaduras', name: 'Gomas Fini (Dentaduras/Beijos)', price: 2.5, available: true },
    { id: 'addon-limao-siciliano', name: 'Rodelas de Limão Siciliano', price: 2.0, available: true },
  ],
};

function MainApp() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [customizer, setCustomizer] = useState<CustomizerConfig>(FALLBACK_CUSTOMIZER);
  const [hookahs, setHookahs] = useState<HookahItem[]>([]);
  const [combos, setCombos] = useState<ComboItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);

  const { isHalloween, refreshTheme } = useTheme();

  const loadAllData = useCallback(async () => {
    try {
      const [
        settingsData,
        productsData,
        customizerData,
        hookahsData,
        combosData,
        galleryData,
      ] = await Promise.all([
        api.getSettings().catch(() => FALLBACK_SETTINGS),
        api.getProducts().catch(() => []),
        api.getCustomizer().catch(() => FALLBACK_CUSTOMIZER),
        api.getHookahs().catch(() => []),
        api.getCombos().catch(() => []),
        api.getGallery().catch(() => []),
      ]);

      setSettings(settingsData);
      setProducts(productsData);
      setCustomizer(customizerData);
      setHookahs(hookahsData);
      setCombos(combosData);
      setGallery(galleryData);

      // Refresh theme context
      await refreshTheme();

      // Try fetching orders (succeeds if logged in as admin)
      api
        .getOrders()
        .then((ords) => setOrders(ords))
        .catch(() => setOrders([]));
    } catch (err) {
      console.error('Error fetching data from Adega Resenha API', err);
    } finally {
      setLoading(false);
    }
  }, [refreshTheme]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">
          Carregando Adega Resenha...
        </span>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isHalloween ? 'bg-[#060408]' : 'bg-[#09090b]'
      } text-[#f4f4f5] selection:bg-rose-600 selection:text-white flex flex-col transition-colors duration-500 relative`}
    >
      {/* Age verification popup for 18+ regulations */}
      <AgeVerificationModal />

      {/* Seasonal Atmosphere Layers: Cobwebs, animated hanging spider, rolling fog mist */}
      <HalloweenDecorations />

      {/* Special Seasonal Theme Alert Banner (Halloween 2026: 25/10 a 02/11) */}
      {isHalloween && (
        <div className="bg-gradient-to-r from-orange-950 via-purple-950 to-orange-950 border-b border-orange-600/60 text-white py-2 px-4 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 relative z-50">
          <Skull className="w-4 h-4 text-orange-400 animate-bounce" />
          <span>
            🎃 <strong className="text-orange-300">ESPECIAL HALLOWEEN 2026 ADEGA RESENHA</strong> — Edição Noturna Limitada: Copos Temáticos, Gin Eternity e Mix Especial de Essências!
          </span>
          <span className="hidden md:inline text-[11px] font-mono text-orange-400/80">(Válido até 02/11)</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar settings={settings} onOpenAdmin={() => setAdminOpen(true)} />

      {/* Main Page Sections */}
      <main className="flex-1">
        <HeroSection
          settings={settings}
          onExploreProducts={() => scrollToSection('bebidas')}
          onOpenCustomizer={() => scrollToSection('monte-seu-copo')}
        />

        {/* Reelmark-inspired curved continuous horizontal product gallery */}
        <ReelmarkCurvedGallery />

        {/* 1. Monte seu Copo (Dose, gelos de sabor, energéticos e guarnições) */}
        <DrinkCustomizer config={customizer} />

        {/* 2. Monte seu Rosh (Narguilé Completo: Vaso, Stem, Prato, Rosh, Essências, Carvões e Mangueira) */}
        <RoshCustomizer />

        {/* 3. Catálogo de Bebidas */}
        <ProductCatalog products={products} settings={settings} />

        {/* 4. Tabacaria Hookah Lounge */}
        <HookahSection items={hookahs} settings={settings} />

        {/* 5. Combos com Montagem Animada */}
        <CombosSection combos={combos} />

        {/* 6. GALERIA DA ADEGA RESENHA (Fotos Oficiais do Espaço + Clientes na Resenha + Upload de Fotos) */}
        <GallerySection items={gallery} />

        {/* 7. Localização & Contato */}
        <LocationContactSection settings={settings} />
      </main>

      {/* Footer (with official discreet admin link) */}
      <Footer settings={settings} onOpenAdmin={() => setAdminOpen(true)} />

      {/* Shopping Cart Drawer */}
      <CartDrawer settings={settings} />

      {/* Checkout and WhatsApp Order Flow Modal */}
      <CheckoutModal settings={settings} />

      {/* Protected Admin Control Panel */}
      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        settings={settings}
        products={products}
        customizer={customizer}
        hookahs={hookahs}
        combos={combos}
        gallery={gallery}
        orders={orders}
        onRefreshData={loadAllData}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
