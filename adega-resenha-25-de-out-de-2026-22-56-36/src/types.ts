export type ProductCategory =
  | 'gin'
  | 'vodka'
  | 'whisky'
  | 'cervejas'
  | 'destilados'
  | 'energeticos'
  | 'refrigerantes'
  | 'sem_alcool'
  | 'combos';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  volume: string;
  price: number;
  available: boolean;
  image: string;
}

export interface CustomizerOption {
  id: string;
  name: string;
  price: number;
  available: boolean;
  image?: string;
  description?: string;
  colorHex?: string;
}

export interface CustomizerConfig {
  baseDrinks: CustomizerOption[];
  iceFlavors: CustomizerOption[];
  balyFlavors: CustomizerOption[];
  redBullFlavors: CustomizerOption[];
  addOns: CustomizerOption[];
  cupSizes: CustomizerOption[];
  maxIceFlavors: number;
}

// Monte seu Rosh models
export interface RoshModel {
  id: string;
  name: string;
  brand: string;
  price: number;
  available: boolean;
  image: string;
  description: string;
  capacityGrams: number;
}

export interface ShishaFlavor {
  id: string;
  name: string;
  brand: string;
  price: number;
  available: boolean;
  colorHex: string;
  profile: 'doce' | 'citrico' | 'mentolado' | 'frutado' | 'tropical';
  description: string;
}

export interface RoshAccessory {
  id: string;
  name: string;
  price: number;
  available: boolean;
  description: string;
}

export interface RoshCustomizerConfig {
  models: RoshModel[];
  flavors: ShishaFlavor[];
  accessories: RoshAccessory[];
  maxFlavors: number;
  proportions: string[];
}

export type HookahSubcategory =
  | 'completos'
  | 'portateis'
  | 'vasos'
  | 'mangueiras'
  | 'piteiras'
  | 'rosh'
  | 'carvao'
  | 'essencias'
  | 'acessorios';

export interface HookahItem {
  id: string;
  name: string;
  brand: string;
  subcategory: HookahSubcategory;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

export interface ComboItem {
  id: string;
  name: string;
  description: string;
  itemsIncluded: string[];
  price: number;
  originalPrice?: number;
  available: boolean;
  validUntil?: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'ambiente' | 'lounge' | 'bebidas' | 'narguile' | 'eventos';
  image: string;
  description?: string;
}

export interface CustomerPhoto {
  id: string;
  customerName: string;
  photoUrl: string;
  caption?: string;
  createdAt: string;
  status: 'pendente' | 'aprovada' | 'recusada';
}

export interface ThemeEvent {
  id: string;
  name: string;
  themeVisual: 'padrao' | 'halloween' | 'neon' | 'festa_roxa' | 'aniversario' | 'verao';
  startDate: string;
  endDate: string;
  priority: number;
  isManualActive?: boolean;
  status: 'rascunho' | 'agendado' | 'ativo' | 'encerrado';
  bannerImage?: string;
  message?: string;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  storeLogoUrl: string;
  whatsapp: string;
  whatsappGreeting: string;
  phone: string;
  address: string;
  city: string;
  openingHours: string;
  instagram: string;
  instagramUrl: string;
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'Telefone' | 'E-mail' | 'Aleatória';
  pixBeneficiaryName: string;
  pixBeneficiaryCity: string;
  acceptMealVoucher: boolean;
  deliveryFee: number;
  minOrderValue: number;
  googleMapsUrl?: string;
  manualThemeOverride: 'auto' | 'padrao' | 'halloween' | 'neon' | 'festa_roxa';
}

export interface CartItem {
  id: string;
  type: 'catalog' | 'custom_drink' | 'custom_rosh' | 'hookah' | 'combo';
  title: string;
  subtitle?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string;
  customDetails?: {
    baseDrink: string;
    ices: string[];
    energyDrink: string;
    addOns: string[];
    cupSize?: string;
  };
  customRoshDetails?: {
    model: string;
    flavors: { name: string; proportion: string }[];
    accessories: string[];
  };
  comboDetails?: {
    comboId: string;
    itemsIncluded: string[];
  };
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'delivery' | 'retirada';
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    reference?: string;
  };
  paymentMethod: 'pix' | 'cartao_entrega' | 'cartao_presencial' | 'dinheiro' | 'alimentacao_presencial';
  changeFor?: number;
  items: {
    type: 'catalog' | 'custom_drink' | 'custom_rosh' | 'hookah' | 'combo';
    productId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customDetails?: {
      baseDrink: string;
      ices: string[];
      energyDrink: string;
      addOns: string[];
      cupSize?: string;
    };
    customRoshDetails?: {
      model: string;
      flavors: { name: string; proportion: string }[];
      accessories: string[];
    };
    comboDetails?: {
      comboId: string;
      itemsIncluded: string[];
    };
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pendente' | 'aguardando_pagamento_presencial' | 'pago' | 'em_preparo' | 'saiu_entrega' | 'pronto_retirada' | 'finalizado' | 'cancelado';
  notes?: string;
}
