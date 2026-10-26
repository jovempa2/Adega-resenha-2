import {
  Product,
  CustomizerConfig,
  RoshCustomizerConfig,
  HookahItem,
  ComboItem,
  GalleryItem,
  CustomerPhoto,
  ThemeEvent,
  SiteSettings,
  Order,
  CartItem
} from '../types.ts';

const TOKEN_KEY = 'adega_resenha_admin_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (withAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (withAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(true)
      });
    } finally {
      removeStoredToken();
    }
  },

  async verifyAuth(): Promise<boolean> {
    const token = getStoredToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/verify', {
        headers: getHeaders(true)
      });
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return res.json();
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Falha ao carregar configurações');
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Falha ao atualizar configurações');
    return res.json();
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Falha ao carregar catálogo de produtos');
    return res.json();
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Falha ao criar produto');
    return res.json();
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Falha ao atualizar produto');
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao deletar produto');
  },

  // Customizer (Monte seu Copo)
  async getCustomizer(): Promise<CustomizerConfig> {
    const res = await fetch('/api/customizer');
    if (!res.ok) throw new Error('Falha ao carregar configurações do personalizador');
    return res.json();
  },

  async updateCustomizer(config: CustomizerConfig): Promise<CustomizerConfig> {
    const res = await fetch('/api/customizer', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Falha ao salvar personalizador');
    return res.json();
  },

  // Monte seu Rosh
  async getRoshCustomizer(): Promise<RoshCustomizerConfig> {
    const res = await fetch('/api/rosh-customizer');
    if (!res.ok) throw new Error('Falha ao carregar dados do Monte seu Rosh');
    return res.json();
  },

  async updateRoshCustomizer(config: RoshCustomizerConfig): Promise<RoshCustomizerConfig> {
    const res = await fetch('/api/rosh-customizer', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Falha ao atualizar Monte seu Rosh');
    return res.json();
  },

  // Hookahs
  async getHookahs(): Promise<HookahItem[]> {
    const res = await fetch('/api/hookahs');
    if (!res.ok) throw new Error('Falha ao carregar narguilés');
    return res.json();
  },

  async createHookah(item: Omit<HookahItem, 'id'>): Promise<HookahItem> {
    const res = await fetch('/api/hookahs', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Falha ao cadastrar item de narguilé');
    return res.json();
  },

  async updateHookah(id: string, item: Partial<HookahItem>): Promise<HookahItem> {
    const res = await fetch(`/api/hookahs/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Falha ao atualizar item de narguilé');
    return res.json();
  },

  async deleteHookah(id: string): Promise<void> {
    const res = await fetch(`/api/hookahs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao remover item de narguilé');
  },

  // Combos
  async getCombos(): Promise<ComboItem[]> {
    const res = await fetch('/api/combos');
    if (!res.ok) throw new Error('Falha ao carregar combos');
    return res.json();
  },

  async createCombo(combo: Omit<ComboItem, 'id'>): Promise<ComboItem> {
    const res = await fetch('/api/combos', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(combo)
    });
    if (!res.ok) throw new Error('Falha ao criar combo');
    return res.json();
  },

  async updateCombo(id: string, combo: Partial<ComboItem>): Promise<ComboItem> {
    const res = await fetch(`/api/combos/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(combo)
    });
    if (!res.ok) throw new Error('Falha ao atualizar combo');
    return res.json();
  },

  async deleteCombo(id: string): Promise<void> {
    const res = await fetch(`/api/combos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao deletar combo');
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const res = await fetch('/api/gallery');
    if (!res.ok) throw new Error('Falha ao carregar galeria');
    return res.json();
  },

  async createGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Falha ao adicionar item à galeria');
    return res.json();
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const res = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao remover item da galeria');
  },

  // Customer Photos (Compartilhe sua Resenha)
  async getCustomerPhotos(onlyApproved: boolean = false): Promise<CustomerPhoto[]> {
    const res = await fetch(`/api/customer-photos?approvedOnly=${onlyApproved}`);
    if (!res.ok) throw new Error('Falha ao carregar fotos dos clientes');
    return res.json();
  },

  async uploadCustomerPhoto(photo: { customerName: string; photoUrl: string; caption?: string }): Promise<CustomerPhoto> {
    const res = await fetch('/api/customer-photos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(photo)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao enviar foto');
    }
    return res.json();
  },

  async updateCustomerPhotoStatus(id: string, status: 'aprovada' | 'recusada'): Promise<CustomerPhoto> {
    const res = await fetch(`/api/customer-photos/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Falha ao atualizar status da foto');
    return res.json();
  },

  async deleteCustomerPhoto(id: string): Promise<void> {
    const res = await fetch(`/api/customer-photos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao excluir foto');
  },

  // Themes & Events
  async getActiveTheme(): Promise<{
    activeTheme: 'padrao' | 'halloween' | 'neon' | 'festa_roxa' | 'aniversario' | 'verao';
    reason: string;
    event?: ThemeEvent;
    nowSaoPaulo: string;
  }> {
    const res = await fetch('/api/themes/active');
    if (!res.ok) throw new Error('Falha ao consultar tema ativo');
    return res.json();
  },

  async getThemes(): Promise<ThemeEvent[]> {
    const res = await fetch('/api/themes', {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao carregar eventos de tema');
    return res.json();
  },

  async createTheme(theme: Omit<ThemeEvent, 'id'>): Promise<ThemeEvent> {
    const res = await fetch('/api/themes', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(theme)
    });
    if (!res.ok) throw new Error('Falha ao criar tema');
    return res.json();
  },

  async updateTheme(id: string, theme: Partial<ThemeEvent>): Promise<ThemeEvent> {
    const res = await fetch(`/api/themes/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(theme)
    });
    if (!res.ok) throw new Error('Falha ao atualizar tema');
    return res.json();
  },

  async deleteTheme(id: string): Promise<void> {
    const res = await fetch(`/api/themes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao excluir tema');
  },

  async setThemeOverride(override: 'auto' | 'padrao' | 'halloween' | 'neon' | 'festa_roxa'): Promise<any> {
    const res = await fetch('/api/themes/override', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ override })
    });
    if (!res.ok) throw new Error('Falha ao definir override de tema');
    return res.json();
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders', {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao carregar pedidos');
    return res.json();
  },

  async createOrder(orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'delivery' | 'retirada';
    address?: Order['address'];
    paymentMethod: Order['paymentMethod'];
    changeFor?: number;
    items: Order['items'];
    subtotal: number;
    deliveryFee: number;
    total: number;
    notes?: string;
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Falha ao registrar pedido');
    return res.json();
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Falha ao atualizar status do pedido');
    return res.json();
  },

  async deleteOrder(id: string): Promise<void> {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Falha ao deletar pedido');
  }
};

// WhatsApp message format generator
export const buildWhatsAppMessage = (
  settings: SiteSettings,
  order: {
    code: string;
    customerName: string;
    customerPhone: string;
    deliveryType: 'delivery' | 'retirada';
    address?: Order['address'];
    paymentMethod: Order['paymentMethod'];
    changeFor?: number;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    notes?: string;
  }
): string => {
  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;
  const paymentLabels: Record<string, string> = {
    pix: `PIX (Chave: ${settings.pixKey} · ${settings.pixBeneficiaryName})`,
    cartao_entrega: 'Cartão de Débito/Crédito (Levar maquininha na entrega)',
    cartao_presencial: 'Cartão de Débito/Crédito (Pagamento presencial no caixa)',
    alimentacao_presencial: 'Cartão Alimentação (Pagamento presencial no caixa)',
    dinheiro: order.changeFor ? `Dinheiro (Troco para ${formatCurrency(order.changeFor)})` : 'Dinheiro (Sem troco)'
  };

  let lines: string[] = [];
  lines.push(`🔥 *NOVO PEDIDO — ${settings.storeName.toUpperCase()}* 🔥`);
  lines.push(`📋 *Código:* #${order.code}`);
  lines.push(`👤 *Cliente:* ${order.customerName}`);
  lines.push(`📱 *Telefone:* ${order.customerPhone}`);
  lines.push(`🛵 *Modalidade:* ${order.deliveryType === 'delivery' ? 'Entrega em Domicílio' : 'Retirada no Balcão'}`);

  if (order.deliveryType === 'delivery' && order.address) {
    lines.push(`📍 *Endereço:* ${order.address.street}, Nº ${order.address.number}`);
    lines.push(`    Bairro: ${order.address.neighborhood}`);
    if (order.address.complement) lines.push(`    Compl: ${order.address.complement}`);
    if (order.address.reference) lines.push(`    Ref: ${order.address.reference}`);
  }

  lines.push(`💳 *Pagamento:* ${paymentLabels[order.paymentMethod] || order.paymentMethod}`);
  lines.push('');
  lines.push(`🛒 *ITENS DO PEDIDO:*`);

  order.items.forEach((item, index) => {
    lines.push(`*${index + 1}. ${item.quantity}x ${item.title}* — ${formatCurrency(item.totalPrice)}`);

    // Custom drink details
    if (item.type === 'custom_drink' && item.customDetails) {
      if (item.customDetails.cupSize) lines.push(`   • Copo: ${item.customDetails.cupSize}`);
      lines.push(`   • Base: ${item.customDetails.baseDrink}`);
      lines.push(`   • Gelos: ${item.customDetails.ices.join(', ') || 'Sem gelo especial'}`);
      lines.push(`   • Energético: ${item.customDetails.energyDrink || 'Sem energético'}`);
      if (item.customDetails.addOns && item.customDetails.addOns.length > 0) {
        lines.push(`   • Adicionais: ${item.customDetails.addOns.join(', ')}`);
      }
    }

    // Custom rosh details
    if (item.type === 'custom_rosh' && item.customRoshDetails) {
      lines.push(`   • Modelo: ${item.customRoshDetails.model}`);
      lines.push(`   • Essências: ${item.customRoshDetails.flavors.map(f => `${f.name} (${f.proportion})`).join(', ')}`);
      if (item.customRoshDetails.accessories && item.customRoshDetails.accessories.length > 0) {
        lines.push(`   • Acessórios: ${item.customRoshDetails.accessories.join(', ')}`);
      }
    }

    // Fixed combo details
    if (item.type === 'combo' && item.comboDetails) {
      lines.push(`   • Composição Fechada:`);
      item.comboDetails.itemsIncluded.forEach(inc => lines.push(`     - ${inc}`));
    }
  });

  lines.push('');
  lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`);
  if (order.deliveryType === 'delivery') {
    lines.push(`Taxa de Entrega: ${formatCurrency(order.deliveryFee)}`);
  }
  lines.push(`*TOTAL GERAL: ${formatCurrency(order.total)}*`);

  if (order.notes) {
    lines.push('');
    lines.push(`📝 *Observações:* ${order.notes}`);
  }

  lines.push('');
  lines.push(`_Aguardando confirmação do estabelecimento para início do preparo._`);

  return lines.join('\n');
};

export const openWhatsApp = (phone: string, text: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
