import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  LogOut,
  Package,
  GlassWater,
  Sparkles,
  Tag,
  Camera,
  Settings as SettingsIcon,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Palette,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Product,
  CustomizerConfig,
  HookahItem,
  ComboItem,
  GalleryItem,
  SiteSettings,
  Order,
  CustomizerOption,
  RoshCustomizerConfig,
  RoshModel,
  ShishaFlavor,
  RoshAccessory,
  CustomerPhoto,
  ThemeEvent
} from '../types.ts';
import { api } from '../services/api.ts';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  products: Product[];
  customizer: CustomizerConfig;
  hookahs: HookahItem[];
  combos: ComboItem[];
  gallery: GalleryItem[];
  orders: Order[];
  onRefreshData: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  settings,
  products,
  customizer,
  hookahs,
  combos,
  gallery,
  orders,
  onRefreshData,
}) => {
  const { isAdmin, login, logout } = useAuth();

  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    | 'orders'
    | 'products'
    | 'customizer'
    | 'rosh_customizer'
    | 'hookahs'
    | 'combos'
    | 'gallery'
    | 'customer_photos'
    | 'themes'
    | 'settings'
  >('orders');

  // Local settings
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Product CRUD modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingHookah, setEditingHookah] = useState<Partial<HookahItem> | null>(null);
  const [editingCombo, setEditingCombo] = useState<Partial<ComboItem> | null>(null);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);

  // Monte seu Copo config
  const [localCustomizer, setLocalCustomizer] = useState<CustomizerConfig>(customizer);
  const [savingCustomizer, setSavingCustomizer] = useState(false);

  // Monte seu Rosh config
  const [roshConfig, setRoshConfig] = useState<RoshCustomizerConfig | null>(null);
  const [savingRoshConfig, setSavingRoshConfig] = useState(false);
  const [editingRoshModel, setEditingRoshModel] = useState<Partial<RoshModel> | null>(null);
  const [editingShishaFlavor, setEditingShishaFlavor] = useState<Partial<ShishaFlavor> | null>(null);

  // Customer Photos moderation
  const [customerPhotos, setCustomerPhotos] = useState<CustomerPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<'todas' | 'pendente' | 'aprovada' | 'recusada'>('todas');

  // Themes state
  const [activeThemeInfo, setActiveThemeInfo] = useState<{
    activeTheme: string;
    reason: string;
    nowSaoPaulo: string;
    event?: ThemeEvent;
  } | null>(null);
  const [themeEvents, setThemeEvents] = useState<ThemeEvent[]>([]);
  const [themeUpdating, setThemeUpdating] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setLocalCustomizer(customizer);
  }, [settings, customizer]);

  // Load Rosh config, photos and themes when admin is active
  useEffect(() => {
    if (isAdmin && isOpen) {
      loadRoshConfig();
      loadCustomerPhotos();
      loadThemeInfo();
    }
  }, [isAdmin, isOpen]);

  const loadRoshConfig = async () => {
    try {
      const data = await api.getRoshCustomizer();
      setRoshConfig(data);
    } catch (err) {
      console.error('Failed to load rosh customizer config', err);
    }
  };

  const loadCustomerPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const data = await api.getCustomerPhotos(false);
      setCustomerPhotos(data);
    } catch (err) {
      console.error('Failed to load customer photos', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const loadThemeInfo = async () => {
    try {
      const [activeData, themesData] = await Promise.all([
        api.getActiveTheme(),
        api.getThemes().catch(() => []),
      ]);
      setActiveThemeInfo(activeData);
      setThemeEvents(themesData);
    } catch (err) {
      console.error('Failed to load theme info', err);
    }
  };

  if (!isOpen) return null;

  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const res = await login(passwordInput);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Credenciais inválidas.');
    } else {
      setPasswordInput('');
      onRefreshData();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.updateSettings(localSettings);
      setSettingsSavedSuccess(true);
      await onRefreshData();
      setTimeout(() => setSettingsSavedSuccess(false), 2500);
    } catch (err: any) {
      alert('Erro ao salvar configurações: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    try {
      const res = await api.changePassword(currentPass, newPass);
      if (res.success) {
        setPassMsg({ text: 'Senha alterada com sucesso!', error: false });
        setCurrentPass('');
        setNewPass('');
      } else {
        setPassMsg({ text: res.error || 'Erro ao alterar senha', error: true });
      }
    } catch (err: any) {
      setPassMsg({ text: err.message, error: true });
    }
  };

  // Orders
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Deseja realmente excluir este pedido?')) return;
    try {
      await api.deleteOrder(orderId);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao excluir pedido: ' + err.message);
    }
  };

  // Products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
      } else {
        await api.createProduct(editingProduct as any);
      }
      setEditingProduct(null);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao salvar produto: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      await api.deleteProduct(id);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao excluir produto: ' + err.message);
    }
  };

  // Hookahs
  const handleSaveHookah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHookah) return;
    try {
      if (editingHookah.id) {
        await api.updateHookah(editingHookah.id, editingHookah);
      } else {
        await api.createHookah(editingHookah as any);
      }
      setEditingHookah(null);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao salvar narguilé: ' + err.message);
    }
  };

  const handleDeleteHookah = async (id: string) => {
    if (!confirm('Deseja excluir este item?')) return;
    try {
      await api.deleteHookah(id);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao excluir item: ' + err.message);
    }
  };

  // Combos
  const handleSaveCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCombo) return;
    try {
      if (editingCombo.id) {
        await api.updateCombo(editingCombo.id, editingCombo);
      } else {
        await api.createCombo(editingCombo as any);
      }
      setEditingCombo(null);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao salvar combo: ' + err.message);
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (!confirm('Deseja excluir este combo?')) return;
    try {
      await api.deleteCombo(id);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao excluir combo: ' + err.message);
    }
  };

  // Gallery
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    try {
      await api.createGalleryItem(editingGallery as any);
      setEditingGallery(null);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao salvar item da galeria: ' + err.message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Deseja remover esta foto?')) return;
    try {
      await api.deleteGalleryItem(id);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao excluir foto: ' + err.message);
    }
  };

  // Monte seu Rosh save
  const handleSaveRoshConfig = async () => {
    if (!roshConfig) return;
    setSavingRoshConfig(true);
    try {
      await api.updateRoshCustomizer(roshConfig);
      alert('Configuração do Monte seu Rosh salva com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar Rosh: ' + err.message);
    } finally {
      setSavingRoshConfig(false);
    }
  };

  // Photo Moderation
  const handlePhotoStatus = async (id: string, status: 'aprovada' | 'recusada') => {
    try {
      await api.updateCustomerPhotoStatus(id, status);
      await loadCustomerPhotos();
    } catch (err: any) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  const handleDeleteCustomerPhoto = async (id: string) => {
    if (!confirm('Excluir foto do cliente permanentemente?')) return;
    try {
      await api.deleteCustomerPhoto(id);
      await loadCustomerPhotos();
    } catch (err: any) {
      alert('Erro ao excluir foto: ' + err.message);
    }
  };

  // Themes Override
  const handleSetThemeOverride = async (override: 'auto' | 'padrao' | 'halloween' | 'neon' | 'festa_roxa') => {
    try {
      setThemeUpdating(true);
      await api.setThemeOverride(override);
      await loadThemeInfo();
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao alterar tema: ' + err.message);
    } finally {
      setThemeUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wider">
                Painel Administrativo Oficial
              </h2>
              <span className="text-[11px] text-zinc-400 font-mono">Adega Resenha · Gestão Interna</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Encerrar Sessão</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated: Login View */}
        {!isAdmin ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <form
              onSubmit={handleLoginSubmit}
              className="w-full max-w-sm bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl text-center"
            >
              <div className="w-12 h-12 bg-rose-950 border border-rose-800 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Acesso Restrito</h3>
              <p className="text-xs text-zinc-400">
                Área exclusiva para os administradores da Adega Resenha.
              </p>

              {loginError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Senha de acesso..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-950/60 disabled:opacity-50 cursor-pointer"
              >
                {isLoggingIn ? 'Verificando...' : 'Entrar no Painel'}
              </button>

              <p className="text-[11px] text-zinc-500">
                Senha inicial padrão: <code className="text-zinc-300 font-mono">adegaresenha2026</code>
              </p>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 bg-zinc-900/70 border-b md:border-b-0 md:border-r border-zinc-800 p-3 space-y-1 shrink-0 overflow-x-auto md:overflow-y-auto">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pedidos</span>
                </div>
                {orders.length > 0 && (
                  <span className="text-[10px] bg-zinc-950 text-rose-300 font-mono px-1.5 py-0.5 rounded">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Bebidas & Estoque</span>
              </button>

              <button
                onClick={() => setActiveTab('customizer')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'customizer'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <GlassWater className="w-4 h-4" />
                <span>Monte seu Copo</span>
              </button>

              <button
                onClick={() => setActiveTab('rosh_customizer')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'rosh_customizer'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Monte seu Rosh</span>
              </button>

              <button
                onClick={() => setActiveTab('hookahs')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'hookahs'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Narguilés Lounge</span>
              </button>

              <button
                onClick={() => setActiveTab('combos')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'combos'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Combos Fechados</span>
              </button>

              <button
                onClick={() => setActiveTab('customer_photos')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'customer_photos'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Moderação de Fotos</span>
                </div>
                {customerPhotos.filter((p) => p.status === 'pendente').length > 0 && (
                  <span className="text-[10px] bg-amber-500 text-black font-extrabold px-1.5 py-0.2 rounded-full">
                    {customerPhotos.filter((p) => p.status === 'pendente').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('themes')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'themes'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Palette className="w-4 h-4 text-orange-400" />
                <span>Temas & Eventos</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Configurações Loja</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
              
              {/* TAB: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">Gestão de Pedidos</h3>
                      <p className="text-xs text-zinc-400">
                        Consulte e altere o status dos pedidos registrados pelos clientes.
                      </p>
                    </div>
                    <button
                      onClick={onRefreshData}
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Atualizar</span>
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800">
                      Nenhum pedido recebido até o momento.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white font-mono">{order.code}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                {order.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">
                              {order.customerName} · <span className="text-zinc-400 font-mono text-xs">{order.customerPhone}</span>
                            </h4>
                            <p className="text-xs text-zinc-400 mt-1">
                              {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' | ')}
                            </p>
                            <span className="text-xs font-mono text-zinc-400 font-bold block mt-1">
                              Total: {formatPrice(order.total)} ({order.paymentMethod})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                              className="bg-zinc-950 border border-zinc-700 text-xs text-white rounded-lg px-2.5 py-1.5"
                            >
                              <option value="pendente">Pendente</option>
                              <option value="aguardando_pagamento_presencial">Aguardando Pagto Presencial</option>
                              <option value="pago">Pago</option>
                              <option value="em_preparo">Em Preparo</option>
                              <option value="saiu_entrega">Saiu p/ Entrega</option>
                              <option value="pronto_retirada">Pronto Retirada</option>
                              <option value="finalizado">Finalizado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>

                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">Catálogo de Bebidas</h3>
                      <p className="text-xs text-zinc-400">Garrafas de Gin, Whisky, Vodka, Cervejas e Energéticos.</p>
                    </div>
                    <button
                      onClick={() =>
                        setEditingProduct({
                          name: '',
                          brand: '',
                          category: 'gin',
                          price: 0,
                          volume: '1L',
                          available: true,
                          image: '/src/assets/images/hero_adega_resenha_1792974927845.jpg',
                          description: '',
                        })
                      }
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Bebida</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase font-mono block">{p.brand}</span>
                          <h4 className="text-xs font-bold text-white">{p.name}</h4>
                          <span className="text-xs font-bold text-rose-400 font-mono">{formatPrice(p.price)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 text-zinc-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: MONTE SEU ROSH */}
              {activeTab === 'rosh_customizer' && roshConfig && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">
                        Gestão do "Monte seu Rosh"
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Configure modelos de rosh, catálogo de essências e adicionais de sessão.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveRoshConfig}
                      disabled={savingRoshConfig}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{savingRoshConfig ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </button>
                  </div>

                  {/* Section: Rosh Models */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Modelos de Rosh Físicos
                      </h4>
                      <span className="text-[11px] text-zinc-500">
                        {roshConfig.models.length} modelos cadastrados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {roshConfig.models.map((model, idx) => (
                        <div
                          key={model.id}
                          className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] text-amber-400 font-mono uppercase">{model.brand}</span>
                              <h5 className="text-xs font-bold text-white">{model.name}</h5>
                            </div>
                            <input
                              type="checkbox"
                              checked={model.available}
                              onChange={(e) => {
                                const updated = [...roshConfig.models];
                                updated[idx].available = e.target.checked;
                                setRoshConfig({ ...roshConfig, models: updated });
                              }}
                              className="rounded border-zinc-700 bg-zinc-950 text-amber-500"
                              title="Disponibilidade"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Capacidade: {model.capacityGrams}g</span>
                            <span className="font-mono font-bold text-white">{formatPrice(model.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section: Flavors */}
                  <div className="space-y-3 pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Sabores de Essência
                      </h4>
                      <span className="text-[11px] text-zinc-500">
                        {roshConfig.flavors.length} essências disponíveis
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {roshConfig.flavors.map((flv, idx) => (
                        <div
                          key={flv.id}
                          className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                              style={{ backgroundColor: flv.colorHex }}
                            />
                            <div>
                              <span className="text-[10px] text-zinc-500 uppercase">{flv.brand}</span>
                              <h5 className="text-xs font-bold text-white">{flv.name}</h5>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={flv.available}
                            onChange={(e) => {
                              const updated = [...roshConfig.flavors];
                              updated[idx].available = e.target.checked;
                              setRoshConfig({ ...roshConfig, flavors: updated });
                            }}
                            className="rounded border-zinc-700 bg-zinc-950 text-amber-500"
                            title="Disponível"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section: Accessories */}
                  <div className="space-y-3 pt-3 border-t border-zinc-800">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Acessórios e Carvão
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {roshConfig.accessories.map((acc, idx) => (
                        <div
                          key={acc.id}
                          className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-white">{acc.name}</h5>
                            <span className="text-xs font-mono text-amber-400">{formatPrice(acc.price)}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={acc.available}
                            onChange={(e) => {
                              const updated = [...roshConfig.accessories];
                              updated[idx].available = e.target.checked;
                              setRoshConfig({ ...roshConfig, accessories: updated });
                            }}
                            className="rounded border-zinc-700 bg-zinc-950 text-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CUSTOMER PHOTOS MODERATION */}
              {activeTab === 'customer_photos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">
                        Moderação — Galeria da Adega Resenha (Fotos dos Clientes)
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Aprove ou recuse fotos enviadas pelos clientes para exibição na Galeria oficial.
                      </p>
                    </div>
                    <button
                      onClick={loadCustomerPhotos}
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Atualizar Fotos</span>
                    </button>
                  </div>

                  {/* Filter Sub-Tabs for Queue */}
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                    <button
                      onClick={() => setPhotoFilter('todas')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        photoFilter === 'todas'
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Todas ({customerPhotos.length})
                    </button>
                    <button
                      onClick={() => setPhotoFilter('pendente')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        photoFilter === 'pendente'
                          ? 'bg-amber-600 text-black font-extrabold'
                          : 'text-amber-400 hover:bg-zinc-850'
                      }`}
                    >
                      <span>Pendentes</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-700">
                        {customerPhotos.filter((p) => p.status === 'pendente').length}
                      </span>
                    </button>
                    <button
                      onClick={() => setPhotoFilter('aprovada')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        photoFilter === 'aprovada'
                          ? 'bg-emerald-600 text-white'
                          : 'text-emerald-400 hover:bg-zinc-850'
                      }`}
                    >
                      <span>Aprovadas</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {customerPhotos.filter((p) => p.status === 'aprovada').length}
                      </span>
                    </button>
                    <button
                      onClick={() => setPhotoFilter('recusada')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        photoFilter === 'recusada'
                          ? 'bg-rose-600 text-white'
                          : 'text-rose-400 hover:bg-zinc-850'
                      }`}
                    >
                      <span>Recusadas</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                        {customerPhotos.filter((p) => p.status === 'recusada').length}
                      </span>
                    </button>
                  </div>

                  {loadingPhotos ? (
                    <div className="py-8 text-center text-xs text-zinc-500">Carregando fotos enviadas...</div>
                  ) : customerPhotos.filter((p) => photoFilter === 'todas' || p.status === photoFilter).length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800">
                      Nenhuma foto encontrada nesta categoria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customerPhotos
                        .filter((p) => photoFilter === 'todas' || p.status === photoFilter)
                        .map((photo) => (
                        <div
                          key={photo.id}
                          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg"
                        >
                          <div className="aspect-square bg-zinc-950 relative overflow-hidden">
                            <img
                              src={photo.photoUrl}
                              alt={photo.caption || 'Foto cliente'}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                  photo.status === 'aprovada'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : photo.status === 'recusada'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}
                              >
                                {photo.status}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-2">
                            <div>
                              <span className="text-xs font-bold text-white font-mono">
                                @{photo.customerName}
                              </span>
                              {photo.caption && (
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                  "{photo.caption}"
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                              {photo.status !== 'aprovada' && (
                                <button
                                  onClick={() => handlePhotoStatus(photo.id, 'aprovada')}
                                  className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Aprovar</span>
                                </button>
                              )}

                              {photo.status !== 'recusada' && (
                                <button
                                  onClick={() => handlePhotoStatus(photo.id, 'recusada')}
                                  className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Recusar</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteCustomerPhoto(photo.id)}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: THEMES & EVENTS */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-zinc-800">
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      Sistema de Temas e Eventos Sazonais
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Gerencie temas visuais automáticos por data (ex: Halloween 2026 de 25/10 a 02/11) ou force simulações de teste.
                    </p>
                  </div>

                  {/* Active theme diagnosis card */}
                  {activeThemeInfo && (
                    <div className="p-5 bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-800/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-mono">
                          Status em Tempo Real (Fuso Horário America/Sao_Paulo)
                        </span>
                        <h4 className="text-xl font-extrabold text-white font-['Outfit'] mt-0.5 uppercase">
                          Tema Ativo: <span className="text-orange-400">{activeThemeInfo.activeTheme}</span>
                        </h4>
                        <p className="text-xs text-zinc-300 mt-1">{activeThemeInfo.reason}</p>
                        <span className="text-[11px] text-zinc-500 font-mono block mt-2">
                          Horário Oficial do Servidor: {activeThemeInfo.nowSaoPaulo}
                        </span>
                      </div>

                      <div className="shrink-0 flex flex-col gap-2">
                        <span className="text-xs font-bold text-zinc-400">Override / Simulação Rápida:</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleSetThemeOverride('auto')}
                            disabled={themeUpdating}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                          >
                            Automático (Datas)
                          </button>
                          <button
                            onClick={() => handleSetThemeOverride('halloween')}
                            disabled={themeUpdating}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer shadow-sm"
                          >
                            Forçar Halloween
                          </button>
                          <button
                            onClick={() => handleSetThemeOverride('padrao')}
                            disabled={themeUpdating}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                          >
                            Forçar Padrão
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scheduled Themes Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Eventos Cadastrados no Calendário
                    </h4>
                    <div className="space-y-2">
                      {themeEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-orange-400" />
                            <div>
                              <h5 className="text-xs font-bold text-white">{ev.name}</h5>
                              <span className="text-[11px] text-zinc-400 font-mono">
                                Início: {ev.startDate} · Fim: {ev.endDate}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-zinc-950 text-orange-300 border border-orange-900/60 uppercase">
                            Visual: {ev.themeVisual}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-zinc-800">
                    <h3 className="text-base font-bold text-white font-['Outfit']">Configurações Gerais</h3>
                    <p className="text-xs text-zinc-400">
                      Dados de contato, redes sociais, chave PIX, cartões alimentação e horários.
                    </p>
                  </div>

                  {settingsSavedSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Configurações salvas e aplicadas em todo o site!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                          Nome do Estabelecimento
                        </label>
                        <input
                          type="text"
                          value={localSettings.storeName}
                          onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                          WhatsApp Oficial (somente dígitos com DDD)
                        </label>
                        <input
                          type="text"
                          value={localSettings.whatsapp}
                          onChange={(e) => setLocalSettings({ ...localSettings, whatsapp: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* WhatsApp greeting and Instagram URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                          Instagram URL Oficial
                        </label>
                        <input
                          type="text"
                          value={localSettings.instagramUrl || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/adegaresenha_oficial"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                          Mensagem Padrão no WhatsApp
                        </label>
                        <input
                          type="text"
                          value={localSettings.whatsappGreeting || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, whatsappGreeting: e.target.value })}
                          placeholder="Olá! Quero fazer um pedido na Adega Resenha."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                          Endereço Completo
                        </label>
                        <input
                          type="text"
                          value={localSettings.address}
                          onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                          Cidade / UF
                        </label>
                        <input
                          type="text"
                          value={localSettings.city}
                          onChange={(e) => setLocalSettings({ ...localSettings, city: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* PIX Beneficiary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                          Nome do Favorecido PIX
                        </label>
                        <input
                          type="text"
                          value={localSettings.pixBeneficiaryName || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, pixBeneficiaryName: e.target.value })}
                          placeholder="Adega Resenha Bebidas Ltda"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                          Cidade do Favorecido PIX
                        </label>
                        <input
                          type="text"
                          value={localSettings.pixBeneficiaryCity || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, pixBeneficiaryCity: e.target.value })}
                          placeholder="SAO PAULO"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Meal Voucher toggle */}
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-white">Aceitar Cartão Alimentação / Refeição</h5>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Habilita a opção de pagamento presencial com Alelo, VR, Sodexo e Ticket na maquininha.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={localSettings.acceptMealVoucher}
                        onChange={(e) => setLocalSettings({ ...localSettings, acceptMealVoucher: e.target.checked })}
                        className="rounded border-zinc-700 bg-zinc-950 text-rose-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingSettings}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg cursor-pointer"
                      >
                        {savingSettings ? 'Salvando...' : 'Salvar Configurações'}
                      </button>
                    </div>
                  </form>

                  {/* Password Change Sub-section */}
                  <div className="pt-6 border-t border-zinc-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Alterar Senha do Administrador
                    </h4>
                    {passMsg && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          passMsg.error
                            ? 'bg-rose-950/60 border border-rose-800 text-rose-300'
                            : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {passMsg.error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        <span>{passMsg.text}</span>
                      </div>
                    )}
                    <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="password"
                        placeholder="Senha atual..."
                        required
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="password"
                        placeholder="Nova senha..."
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        Salvar Nova Senha
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Add/Edit Product */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveProduct}
              className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4"
            >
              <h4 className="text-base font-bold text-white font-['Outfit']">
                {editingProduct.id ? 'Editar Bebida' : 'Adicionar Bebida'}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Nome da Bebida</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Categoria</label>
                  <select
                    value={editingProduct.category || 'gin'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white"
                  >
                    <option value="gin">Gin</option>
                    <option value="vodka">Vodka</option>
                    <option value="whisky">Whisky</option>
                    <option value="cervejas">Cervejas</option>
                    <option value="energeticos">Energéticos</option>
                    <option value="destilados">Destilados</option>
                    <option value="refrigerantes">Refrigerantes</option>
                    <option value="sem_alcool">Sem Álcool</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Volume</label>
                  <input
                    type="text"
                    placeholder="Ex: 1L, 750ml"
                    value={editingProduct.volume || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
                >
                  Salvar Bebida
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
