import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'gin' | 'vodka' | 'whisky' | 'cervejas' | 'destilados' | 'energeticos' | 'refrigerantes' | 'sem_alcool' | 'combos';
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

export interface HookahItem {
  id: string;
  name: string;
  brand: string;
  subcategory: 'completos' | 'portateis' | 'vasos' | 'mangueiras' | 'piteiras' | 'rosh' | 'carvao' | 'essencias' | 'acessorios';
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
  validUntil?: string; // YYYY-MM-DD
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
  startDate: string; // ISO or YYYY-MM-DDTHH:mm
  endDate: string;   // ISO or YYYY-MM-DDTHH:mm
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
  whatsapp: string; // e.g. 5511999998888
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

export interface OrderItem {
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
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pendente' | 'aguardando_pagamento_presencial' | 'pago' | 'em_preparo' | 'saiu_entrega' | 'pronto_retirada' | 'finalizado' | 'cancelado';
  notes?: string;
}

export interface DatabaseSchema {
  settings: SiteSettings;
  adminPasswordHash: string;
  products: Product[];
  customizer: CustomizerConfig;
  roshCustomizer: RoshCustomizerConfig;
  hookahs: HookahItem[];
  combos: ComboItem[];
  gallery: GalleryItem[];
  customerPhotos: CustomerPhoto[];
  themeEvents: ThemeEvent[];
  orders: Order[];
}

const DB_PATH = path.resolve(process.cwd(), 'data', 'database.json');

// Default initial seed data reflecting authentic Adega Resenha business rules
const DEFAULT_DATA: DatabaseSchema = {
  settings: {
    storeName: "Adega Resenha",
    tagline: "O ponto de encontro da sua noite — Bebidas geladas, Copão e Narguilé",
    storeLogoUrl: "",
    whatsapp: "5511999998888",
    whatsappGreeting: "Olá! Gostaria de fazer um pedido na Adega Resenha.",
    phone: "(11) 99999-8888",
    address: "R. Honório Maia, 252 - Vila Zilda, São Paulo - SP, 03072-000",
    city: "São Paulo - SP",
    openingHours: "Segunda a Domingo das 18:00 às 04:00",
    instagram: "@adegaresenhatatuape",
    instagramUrl: "https://instagram.com/adegaresenhatatuape",
    pixKey: "contato@adegaresenha.com.br",
    pixKeyType: "E-mail",
    pixBeneficiaryName: "Adega Resenha Bebidas LTDA",
    pixBeneficiaryCity: "Sao Paulo",
    acceptMealVoucher: true,
    deliveryFee: 7.00,
    minOrderValue: 20.00,
    googleMapsUrl: "https://maps.google.com/?q=Consolacao+Sao+Paulo",
    manualThemeOverride: "auto"
  },
  adminPasswordHash: "adegaresenha2026",
  products: [
    {
      id: "prod-1",
      name: "Gin Eternity 1L",
      brand: "Eternity",
      category: "gin",
      description: "O clássico das resenhas paulistas. Ideal para copão com gelo de sabor e energético.",
      volume: "1000ml",
      price: 24.90,
      available: true,
      image: "/src/assets/images/custom_drink_copao_1792974928549.jpg"
    },
    {
      id: "prod-2",
      name: "Gin Tanqueray London Dry 750ml",
      brand: "Tanqueray",
      category: "gin",
      description: "Gin importado destilado com quatro botânicos selecionados para drinques refinados.",
      volume: "750ml",
      price: 119.90,
      available: true,
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-3",
      name: "Vodka Smirnoff Red 998ml",
      brand: "Smirnoff",
      category: "vodka",
      description: "Vodka clássica filtrada 10 vezes para máxima pureza nas misturas e copos.",
      volume: "998ml",
      price: 48.00,
      available: true,
      image: "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-4",
      name: "Vodka Absolut Regular 1L",
      brand: "Absolut",
      category: "vodka",
      description: "Vodka premium sueca, sabor límpido e notas de grãos de trigo de inverno.",
      volume: "1000ml",
      price: 98.90,
      available: true,
      image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-5",
      name: "Whisky Johnnie Walker Red Label 1L",
      brand: "Johnnie Walker",
      category: "whisky",
      description: "Blended Scotch Whisky vibrante, notas de especiarias e suave toque defumado.",
      volume: "1000ml",
      price: 94.90,
      available: true,
      image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-6",
      name: "Whisky Jack Daniel's Old No. 7 1L",
      brand: "Jack Daniel's",
      category: "whisky",
      description: "Tennessee Whiskey suavizado em carvão de bordo, notas de carvalho e caramelo.",
      volume: "1000ml",
      price: 149.90,
      available: true,
      image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-7",
      name: "Cerveja Heineken Long Neck 330ml",
      brand: "Heineken",
      category: "cervejas",
      description: "Cerveja puro malte gelada no ponto, amargor marcante e frescor inconfundível.",
      volume: "330ml",
      price: 8.50,
      available: true,
      image: "https://images.unsplash.com/photo-1608270119330-8a0715697669?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-8",
      name: "Cerveja Corona Extra 330ml",
      brand: "Corona",
      category: "cervejas",
      description: "Cerveja premium leve com toque cítrico refrescante, perfeita servida com limão.",
      volume: "330ml",
      price: 9.00,
      available: true,
      image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-9",
      name: "Energético Baly Melancia 2L",
      brand: "Baly",
      category: "energeticos",
      description: "Sabor marcante de melancia gelada em garrafa econômica para toda a galera.",
      volume: "2000ml",
      price: 14.00,
      available: true,
      image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-10",
      name: "Energético Red Bull Energy Drink 250ml",
      brand: "Red Bull",
      category: "energeticos",
      description: "O clássico que te dá asas. Gelado e pronto para consumo ou montagem de drinques.",
      volume: "250ml",
      price: 10.90,
      available: true,
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-11",
      name: "Coca-Cola Original 2L",
      brand: "Coca-Cola",
      category: "refrigerantes",
      description: "Refrigerante em garrafa família, gelado e ideal para misturar com destilados.",
      volume: "2000ml",
      price: 11.50,
      available: true,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-12",
      name: "Água Mineral Minalba Sem Gás 500ml",
      brand: "Minalba",
      category: "sem_alcool",
      description: "Água mineral pura e cristalina para hidratação durante o rolê.",
      volume: "500ml",
      price: 4.00,
      available: true,
      image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80"
    }
  ],
  customizer: {
    maxIceFlavors: 2,
    cupSizes: [
      { id: "cup-700", name: "Copão Oficial 700ml", price: 0.00, available: true, description: "Copo de acrílico resistente clássico da resenha" },
      { id: "cup-taca-gin", name: "Taça Gin de Acrílico 600ml", price: 5.00, available: true, description: "Taça bojuda premium para drinque mais estilizado" }
    ],
    baseDrinks: [
      {
        id: "base-gin-10",
        name: "Gin de 10 — Eternity",
        price: 10.00,
        available: true,
        description: "A pedida oficial da Resenha. Dose generosa de Gin Eternity servida no copão de 700ml.",
        image: "/src/assets/images/custom_drink_copao_1792974928549.jpg"
      },
      {
        id: "base-gin-tanqueray",
        name: "Gin Tanqueray London Dry",
        price: 22.00,
        available: true,
        description: "Dose premium com botânicos nobres e final aromático impecável.",
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "base-vodka-smirnoff",
        name: "Vodka Smirnoff Red",
        price: 14.00,
        available: true,
        description: "Dose de vodka destilada e purificada para a combinação ideal de frutas e gelos.",
        image: "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "base-vodka-absolut",
        name: "Vodka Absolut Original",
        price: 24.00,
        available: true,
        description: "Vodka sueca pura para quem busca sabor marcante e zero ressaca.",
        image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "base-whisky-red",
        name: "Whisky Red Label",
        price: 19.00,
        available: true,
        description: "Dose de Scotch Whisky encorpado para copão tradicional.",
        image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "base-whisky-jack",
        name: "Whisky Jack Daniel's Tennessee",
        price: 26.00,
        available: true,
        description: "Dose premium de Tennessee Whiskey com notas adocicadas de carvalho.",
        image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=600&q=80"
      }
    ],
    iceFlavors: [
      { id: "ice-morango", name: "Gelo de Morango", price: 3.50, available: true, colorHex: "#f43f5e", description: "Polpa de morango doce congelada em cubo gigante" },
      { id: "ice-melancia", name: "Gelo de Melancia", price: 3.50, available: true, colorHex: "#fb7185", description: "Refrescância máxima com sabor tropical de melancia" },
      { id: "ice-maracuja", name: "Gelo de Maracujá", price: 3.50, available: true, colorHex: "#facc15", description: "Acidez natural e sementes selecionadas de maracujá" },
      { id: "ice-coco", name: "Gelo de Coco", price: 3.50, available: true, colorHex: "#f4f4f5", description: "Água de coco pura congelada, o sabor favorito do copão" },
      { id: "ice-maca-verde", name: "Gelo de Maçã Verde", price: 3.50, available: true, colorHex: "#4ade80", description: "Toque cítrico e vibrante que equilibra com gin" },
      { id: "ice-agua", name: "Gelo de Água (Sem Sabor)", price: 0.00, available: true, colorHex: "#38bdf8", description: "Gelo filtrado tradicional para manter a bebida gelada" }
    ],
    balyFlavors: [
      { id: "baly-maracuja", name: "Baly Maracujá", price: 6.00, available: true, colorHex: "#eab308", description: "Sabor tropical e doce de maracujá brasileiro" },
      { id: "baly-melancia", name: "Baly Melancia", price: 6.00, available: true, colorHex: "#f43f5e", description: "A explosão de melancia mais pedida dos finais de semana" },
      { id: "baly-morango-pessego", name: "Baly Morango com Pêssego", price: 6.00, available: true, colorHex: "#fb923c", description: "Combinação frutada e aveludada" },
      { id: "baly-tropical", name: "Baly Tropical", price: 6.00, available: true, colorHex: "#f59e0b", description: "Mix de manga, abacaxi e maracujá" },
      { id: "baly-maca-verde", name: "Baly Maçã Verde", price: 6.00, available: true, colorHex: "#22c55e", description: "Sabor cítrico marcante para contraste" }
    ],
    redBullFlavors: [
      { id: "rb-tradicional", name: "Red Bull Tradicional", price: 11.00, available: true, colorHex: "#38bdf8", description: "Lata clássica 250ml — energia e sabor autêntico" },
      { id: "rb-tropical", name: "Red Bull Tropical Edition", price: 12.00, available: true, colorHex: "#facc15", description: "Frutas tropicais amarelas para drinques solares" },
      { id: "rb-melancia", name: "Red Bull Red Edition (Melancia)", price: 12.00, available: true, colorHex: "#ef4444", description: "Refrescante sabor de melancia gelada" },
      { id: "rb-acai", name: "Red Bull Purple Edition (Açaí)", price: 12.00, available: true, colorHex: "#9333ea", description: "Intensidade do açaí com energia pura" },
      { id: "rb-sugarfree", name: "Red Bull Sugarfree", price: 11.00, available: true, colorHex: "#67e8f9", description: "Zero açúcar sem abrir mão da energia" }
    ],
    addOns: [
      { id: "addon-fini-dentaduras", name: "Gomas Fini (Dentaduras/Beijos)", price: 2.50, available: true, description: "Doçura e visual descontraído no topo do copo" },
      { id: "addon-limao-siciliano", name: "Rodelas de Limão Siciliano", price: 2.00, available: true, description: "Fatias frescas para aroma cítrico perfumado" },
      { id: "addon-especiarias", name: "Especiarias Zimbro & Pimenta Rosa", price: 2.50, available: true, description: "Toque clássico de coquetelaria para realçar o gin" },
      { id: "addon-hortela", name: "Ramo de Hortelã Fresco", price: 1.50, available: true, description: "Aroma herbal fresco a cada gole" }
    ]
  },
  roshCustomizer: {
    maxFlavors: 3,
    proportions: ['100% Sabor Único', '50% / 50%', '70% / 30%', '33% / 33% / 34%'],
    models: [
      {
        id: "rosh-belli",
        name: "Rosh Belli Hookah Cerâmica Refratária",
        brand: "Belli Hookah",
        price: 25.00,
        available: true,
        image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg",
        description: "Cerâmica esmaltada de alto rendimento térmico que queima a essência por igual.",
        capacityGrams: 18
      },
      {
        id: "rosh-seven",
        name: "Rosh Seven Gold Phunnel",
        brand: "Seven Hookah",
        price: 32.00,
        available: true,
        image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg",
        description: "Pino central alargado com excelente fluxo e economia de essência.",
        capacityGrams: 20
      },
      {
        id: "rosh-pro",
        name: "Rosh Pro Hookah Vortex Prime",
        brand: "Pro Hookah",
        price: 28.00,
        available: true,
        image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg",
        description: "Circulação uniforme do melaço mantendo o sabor vivo por mais de 90 minutos.",
        capacityGrams: 22
      }
    ],
    flavors: [
      { id: "shisha-love66", name: "Love 66", brand: "Adalya", price: 10.00, available: true, colorHex: "#f43f5e", profile: "tropical", description: "Melão, melancia doce e toque mentolado lendário" },
      { id: "shisha-strong-mint", name: "Strong Mint", brand: "Zomo", price: 8.00, available: true, colorHex: "#10b981", profile: "mentolado", description: "A menta mais famosa e gelada do Brasil" },
      { id: "shisha-tanger", name: "Fresh Tanger", brand: "Nay", price: 10.00, available: true, colorHex: "#f97316", profile: "citrico", description: "Tangerina fresca suculenta com fundo gelado" },
      { id: "shisha-maracuja", name: "Yellow Tropical (Maracujá)", brand: "Ziggy", price: 10.00, available: true, colorHex: "#eab308", profile: "citrico", description: "Maracujá cítrico e aromático de longa duração" },
      { id: "shisha-melancia", name: "Watermelon Twist", brand: "Smyrna", price: 9.00, available: true, colorHex: "#ef4444", profile: "frutado", description: "Melancia doce refrescante pura" },
      { id: "shisha-blue-horse", name: "The Double Melon", brand: "Blue Horse", price: 11.00, available: true, colorHex: "#06b6d4", profile: "doce", description: "Melão cantaloupe e melancia envolventes" }
    ],
    accessories: [
      { id: "acc-carvao-3", name: "3 Carvões de Coco Aceso na Brasa", price: 6.00, available: true, description: "Carvão 100% fibra de coco sem cheiro químico" },
      { id: "acc-aluminio", name: "Alumínio Predator Esticado & Furado", price: 4.00, available: true, description: "Montagem profissional com furação milimétrica" },
      { id: "acc-piteira-higienica", name: "Kit 5 Piteiras Higiênicas", price: 5.00, available: true, description: "Descartáveis individuais para a galera dividir a mangueira" },
      { id: "acc-controlador", name: "Controlador de Calor em Alumínio", price: 8.00, available: true, description: "Distribuição homogênea sem queimar a essência" }
    ]
  },
  hookahs: [
    {
      id: "hk-1",
      name: "Narguilé Completo Amazon Pride Anodizado",
      brand: "Amazon Hookah",
      subcategory: "completos",
      description: "Setup completo com stem em alumínio anodizado de alta durabilidade, vaso transparente e mangueira lavável.",
      price: 289.90,
      available: true,
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    },
    {
      id: "hk-2",
      name: "Narguilé Portátil Nay Mini Bolt",
      brand: "Nay",
      subcategory: "portateis",
      description: "Compacto e potente, perfeito para transporte no rolê com fluxo leve e vedação impecável.",
      price: 189.00,
      available: true,
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    },
    {
      id: "hk-3",
      name: "Rosh Belli Hookah Cerâmica Refratária",
      brand: "Belli Hookah",
      subcategory: "rosh",
      description: "Cerâmica esmaltada de alto rendimento térmico que queima a essência por igual sem queimar a sessão.",
      price: 45.00,
      available: true,
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    },
    {
      id: "hk-4",
      name: "Carvão de Coco Hexagonal CocoBR 1kg",
      brand: "CocoBR",
      subcategory: "carvao",
      description: "100% fibra natural de coco, sem cheiro químico, longa duração (acima de 70 min) e cinza reduzida.",
      price: 38.00,
      available: true,
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    },
    {
      id: "hk-5",
      name: "Essência Zomo Strong Mint 50g",
      brand: "Zomo",
      subcategory: "essencias",
      description: "A menta mais famosa do Brasil, refrescância intensa e nuvens densas de fumaça.",
      price: 14.00,
      available: true,
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    },
    {
      id: "hk-6",
      name: "Essência Adalya Love 66 50g",
      brand: "Adalya",
      subcategory: "essencias",
      description: "Mistura lendária de melancia, melão e menta refrescante, sucesso garantido na resenha.",
      price: 16.50,
      available: true,
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    },
    {
      id: "hk-7",
      name: "Piteira Higiênica de Silicone Embalada",
      brand: "Resenha Hookah",
      subcategory: "piteiras",
      description: "Pacote com 10 unidades descartáveis higiênicas para dividir o narguilé com a galera em segurança.",
      price: 8.00,
      available: true,
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    },
    {
      id: "hk-8",
      name: "Pegador de Carvão Reforçado em Aço Inox",
      brand: "Hookah Pro",
      subcategory: "acessorios",
      description: "Pegador anatômico longo com dentes firmes para manipulação segura das brasas.",
      price: 22.00,
      available: true,
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    }
  ],
  combos: [
    {
      id: "combo-1",
      name: "Combo Resenha Gin Eternity & Tropical",
      description: "O combo mais vendido para começar o final de semana no estilo da casa. Preço fixo e composição fechada.",
      itemsIncluded: [
        "1 Garrafa Gin Eternity 1L",
        "4 Latas Baly Tropical 473ml",
        "2 Gelos Saborizados de Coco",
        "2 Copões de 700ml com canudos"
      ],
      price: 59.90,
      originalPrice: 72.00,
      available: true,
      validUntil: "2026-12-31",
      image: "/src/assets/images/combos_party_kit_1792974929979.jpg"
    },
    {
      id: "combo-2",
      name: "Kit Vodka Smirnoff + 4 Red Bull",
      description: "Vodka premium com energéticos líderes de mercado para elevar a energia da noite. Preço fixo da adega.",
      itemsIncluded: [
        "1 Garrafa Vodka Smirnoff 998ml",
        "4 Latas Red Bull Tradicional ou Tropical 250ml",
        "2 Gelos de Morango",
        "Balde de gelo exclusivo"
      ],
      price: 89.90,
      originalPrice: 105.00,
      available: true,
      validUntil: "2026-12-31",
      image: "/src/assets/images/combos_party_kit_1792974929979.jpg"
    },
    {
      id: "combo-3",
      name: "Combo Whisky Red Label & Coco",
      description: "Combinação clássica que agrada a todos com whisky escocês e sabor leve de água de coco.",
      itemsIncluded: [
        "1 Garrafa Johnnie Walker Red Label 1L",
        "4 Gelos artesanais de Coco 180ml",
        "1 Garrafa de Energético Baly Tradicional 2L",
        "Copos especiais de vidro"
      ],
      price: 119.00,
      originalPrice: 138.00,
      available: true,
      validUntil: "2026-12-31",
      image: "/src/assets/images/combos_party_kit_1792974929979.jpg"
    },
    {
      id: "combo-4",
      name: "Kit Narguilé Sessão Completa",
      description: "Tudo o que você precisa para uma sessão de mais de duas horas sem interrupções.",
      itemsIncluded: [
        "1 Caixa Carvão CocoBR 1kg",
        "2 Essências à sua escolha (Adalya ou Zomo)",
        "1 Rolo Alumínio Predator especial para rosh",
        "10 Piteiras descartáveis higiênicas"
      ],
      price: 69.90,
      originalPrice: 82.00,
      available: true,
      validUntil: "2026-12-31",
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    }
  ],
  gallery: [
    {
      id: "gal-1",
      title: "Fachada e Espaço Noturno",
      category: "ambiente",
      description: "Fachada contemporânea iluminada na Vila Zilda / Tatuapé com atendimento de balcão e delivery.",
      image: "/src/assets/images/adega_facade_ambience_1792974930253.jpg"
    },
    {
      id: "gal-2",
      title: "Balcão de Drinques & Copos",
      category: "bebidas",
      description: "Nossos bartenders preparando copos gelados na hora com frutas frescas e gelos artesanais.",
      image: "/src/assets/images/hero_adega_resenha_1792974927845.jpg"
    },
    {
      id: "gal-3",
      title: "Copo Artesanal com Gelo Saborizado",
      category: "bebidas",
      description: "Gin Eternity com gelo saborizado de maracujá e morango, servido em copo especial.",
      image: "/src/assets/images/custom_drink_copao_1792974928549.jpg"
    },
    {
      id: "gal-4",
      title: "Lounge de Narguilé",
      category: "narguile",
      description: "Espaço acolhedor e ventilado com carvão de coco sempre em brasa viva.",
      image: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg"
    },
    {
      id: "gal-5",
      title: "Kits e Baldes para Festas",
      category: "eventos",
      description: "Combos preparados para levar para sua festa ou curtir na mesa com os amigos.",
      image: "/src/assets/images/combos_party_kit_1792974929979.jpg"
    }
  ],
  customerPhotos: [
    {
      id: "cphoto-1",
      customerName: "Matheus Silva",
      photoUrl: "/src/assets/images/custom_drink_copao_1792974928549.jpg",
      caption: "Sabadou com copo de Gin Eternity trincando na Adega Resenha! 🔥🍹",
      createdAt: "2026-10-24T22:30:00.000Z",
      status: "aprovada"
    },
    {
      id: "cphoto-2",
      customerName: "Camila & Gabriel",
      photoUrl: "/src/assets/images/hookah_lounge_setup_1792974929241.jpg",
      caption: "Melhor sessão de narguilé da Zona Leste. Love 66 com rosh Belli!",
      createdAt: "2026-10-25T01:15:00.000Z",
      status: "aprovada"
    }
  ],
  themeEvents: [
    {
      id: "theme-halloween-2026",
      name: "Halloween da Adega Resenha",
      themeVisual: "halloween",
      startDate: "2026-10-25T00:00:00",
      endDate: "2026-11-02T23:59:59",
      priority: 10,
      isManualActive: false,
      status: "ativo",
      bannerImage: "/src/assets/images/hero_adega_resenha_1792974927845.jpg",
      message: "🎃 Noite Macabra na Adega Resenha: Copos monstruosos, sessões sombrias e drinques com Eternity!"
    },
    {
      id: "theme-neon-resenha",
      name: "Noite Neon Glow",
      themeVisual: "neon",
      startDate: "2026-11-14T18:00:00",
      endDate: "2026-11-15T05:00:00",
      priority: 5,
      isManualActive: false,
      status: "agendado",
      message: "⚡ Festa Neon da Resenha: Iluminação ultra-violeta e copos fluorescentes!"
    }
  ],
  orders: [
    {
      id: "ord-1",
      code: "RES-1042",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      customerName: "Lucas Mendes",
      customerPhone: "(11) 98765-4321",
      deliveryType: "delivery",
      address: {
        street: "Rua Frei Caneca",
        number: "890",
        neighborhood: "Consolação",
        complement: "Apt 42",
        reference: "Próximo ao shopping"
      },
      paymentMethod: "pix",
      items: [
        {
          type: "custom_drink",
          name: "Copo Resenha Personalizado",
          quantity: 2,
          unitPrice: 19.50,
          totalPrice: 39.00,
          customDetails: {
            baseDrink: "Gin de 10 — Eternity",
            ices: ["Gelo de Morango", "Gelo de Melancia"],
            energyDrink: "Baly Melancia",
            addOns: ["Gomas Fini (Dentaduras/Beijos)"],
            cupSize: "Copão Oficial 700ml"
          }
        },
        {
          type: "hookah",
          name: "Carvão de Coco Hexagonal CocoBR 1kg",
          quantity: 1,
          unitPrice: 38.00,
          totalPrice: 38.00
        }
      ],
      subtotal: 77.00,
      deliveryFee: 7.00,
      total: 84.00,
      status: "em_preparo",
      notes: "Por favor enviar com canudos reforçados."
    }
  ]
};

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);

        // Harmonize name: global replacement of Eterneti/Eternet in stringified form
        const sanitizedContent = JSON.stringify(parsed)
          .replace(/Eterneti/g, 'Eternity')
          .replace(/eterneti/g, 'eternity')
          .replace(/Eternet /g, 'Eternity ');
        const sanitizedData: DatabaseSchema = JSON.parse(sanitizedContent);

        // Ensure missing arrays / objects from updates are merged
        if (!sanitizedData.roshCustomizer) sanitizedData.roshCustomizer = DEFAULT_DATA.roshCustomizer;
        if (!sanitizedData.customerPhotos) sanitizedData.customerPhotos = DEFAULT_DATA.customerPhotos;
        if (!sanitizedData.themeEvents) sanitizedData.themeEvents = DEFAULT_DATA.themeEvents;
        if (!sanitizedData.settings.whatsappGreeting) sanitizedData.settings.whatsappGreeting = DEFAULT_DATA.settings.whatsappGreeting;
        if (!sanitizedData.settings.instagramUrl) sanitizedData.settings.instagramUrl = DEFAULT_DATA.settings.instagramUrl;
        if (!sanitizedData.settings.pixBeneficiaryName) sanitizedData.settings.pixBeneficiaryName = DEFAULT_DATA.settings.pixBeneficiaryName;
        if (!sanitizedData.settings.pixBeneficiaryCity) sanitizedData.settings.pixBeneficiaryCity = DEFAULT_DATA.settings.pixBeneficiaryCity;
        if (sanitizedData.settings.acceptMealVoucher === undefined) sanitizedData.settings.acceptMealVoucher = true;
        if (!sanitizedData.settings.manualThemeOverride) sanitizedData.settings.manualThemeOverride = 'auto';

        return sanitizedData;
      } else {
        fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
        return DEFAULT_DATA;
      }
    } catch (err) {
      console.error('Error loading database, using default seed:', err);
      return DEFAULT_DATA;
    }
  }

  private saveData(): void {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  // Settings
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
    return this.data.settings;
  }

  // Auth
  public verifyPassword(password: string): boolean {
    return this.data.adminPasswordHash === password;
  }

  public updatePassword(oldPass: string, newPass: string): boolean {
    if (this.data.adminPasswordHash === oldPass) {
      this.data.adminPasswordHash = newPass;
      this.saveData();
      return true;
    }
    return false;
  }

  // Products
  public getProducts(): Product[] {
    return this.data.products;
  }

  public saveProduct(product: Product): Product {
    const index = this.data.products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      this.data.products[index] = product;
    } else {
      this.data.products.push(product);
    }
    this.saveData();
    return product;
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Customizer (Copos)
  public getCustomizer(): CustomizerConfig {
    return this.data.customizer;
  }

  public updateCustomizer(config: CustomizerConfig): CustomizerConfig {
    this.data.customizer = config;
    this.saveData();
    return this.data.customizer;
  }

  // Rosh Customizer
  public getRoshCustomizer(): RoshCustomizerConfig {
    return this.data.roshCustomizer;
  }

  public updateRoshCustomizer(config: RoshCustomizerConfig): RoshCustomizerConfig {
    this.data.roshCustomizer = config;
    this.saveData();
    return this.data.roshCustomizer;
  }

  // Hookahs
  public getHookahs(): HookahItem[] {
    return this.data.hookahs;
  }

  public saveHookah(item: HookahItem): HookahItem {
    const index = this.data.hookahs.findIndex(h => h.id === item.id);
    if (index >= 0) {
      this.data.hookahs[index] = item;
    } else {
      this.data.hookahs.push(item);
    }
    this.saveData();
    return item;
  }

  public deleteHookah(id: string): boolean {
    const initialLen = this.data.hookahs.length;
    this.data.hookahs = this.data.hookahs.filter(h => h.id !== id);
    if (this.data.hookahs.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Combos
  public getCombos(): ComboItem[] {
    return this.data.combos;
  }

  public saveCombo(combo: ComboItem): ComboItem {
    const index = this.data.combos.findIndex(c => c.id === combo.id);
    if (index >= 0) {
      this.data.combos[index] = combo;
    } else {
      this.data.combos.push(combo);
    }
    this.saveData();
    return combo;
  }

  public deleteCombo(id: string): boolean {
    const initialLen = this.data.combos.length;
    this.data.combos = this.data.combos.filter(c => c.id !== id);
    if (this.data.combos.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Gallery
  public getGallery(): GalleryItem[] {
    return this.data.gallery;
  }

  public saveGalleryItem(item: GalleryItem): GalleryItem {
    const index = this.data.gallery.findIndex(g => g.id === item.id);
    if (index >= 0) {
      this.data.gallery[index] = item;
    } else {
      this.data.gallery.push(item);
    }
    this.saveData();
    return item;
  }

  public deleteGalleryItem(id: string): boolean {
    const initialLen = this.data.gallery.length;
    this.data.gallery = this.data.gallery.filter(g => g.id !== id);
    if (this.data.gallery.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Customer Photos
  public getCustomerPhotos(onlyApproved: boolean = false): CustomerPhoto[] {
    if (onlyApproved) {
      return this.data.customerPhotos.filter(p => p.status === 'aprovada');
    }
    return this.data.customerPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addCustomerPhoto(photo: Omit<CustomerPhoto, 'id' | 'createdAt' | 'status'>): CustomerPhoto {
    const newPhoto: CustomerPhoto = {
      ...photo,
      id: `cphoto-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pendente'
    };
    this.data.customerPhotos.unshift(newPhoto);
    this.saveData();
    return newPhoto;
  }

  public updateCustomerPhotoStatus(id: string, status: 'aprovada' | 'recusada'): CustomerPhoto | null {
    const photo = this.data.customerPhotos.find(p => p.id === id);
    if (photo) {
      photo.status = status;
      this.saveData();
      return photo;
    }
    return null;
  }

  public deleteCustomerPhoto(id: string): boolean {
    const initialLen = this.data.customerPhotos.length;
    this.data.customerPhotos = this.data.customerPhotos.filter(p => p.id !== id);
    if (this.data.customerPhotos.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Themes & Events
  public getThemeEvents(): ThemeEvent[] {
    return this.data.themeEvents;
  }

  public saveThemeEvent(event: ThemeEvent): ThemeEvent {
    const index = this.data.themeEvents.findIndex(e => e.id === event.id);
    if (index >= 0) {
      this.data.themeEvents[index] = event;
    } else {
      this.data.themeEvents.push(event);
    }
    this.saveData();
    return event;
  }

  public deleteThemeEvent(id: string): boolean {
    const initialLen = this.data.themeEvents.length;
    this.data.themeEvents = this.data.themeEvents.filter(e => e.id !== id);
    if (this.data.themeEvents.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * Determine currently active visual theme based on rules:
   * 1. Manual override by admin (if not 'auto')
   * 2. Any theme with isManualActive: true
   * 3. Scheduled event active by current date/time in America/Sao_Paulo (with highest priority)
   * 4. Default 'padrao'
   */
  public getActiveTheme(): {
    activeTheme: 'padrao' | 'halloween' | 'neon' | 'festa_roxa' | 'aniversario' | 'verao';
    reason: string;
    event?: ThemeEvent;
    nowSaoPaulo: string;
  } {
    // Current time in America/Sao_Paulo
    const now = new Date();
    const spDateStr = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const spDate = new Date(spDateStr);
    const nowIso = spDate.toISOString();

    // 1. Settings manual override
    if (this.data.settings.manualThemeOverride && this.data.settings.manualThemeOverride !== 'auto') {
      return {
        activeTheme: this.data.settings.manualThemeOverride as any,
        reason: 'Override manual fixo nas configurações',
        nowSaoPaulo: nowIso
      };
    }

    // 2. Event manual toggle
    const manualEvent = this.data.themeEvents.find(e => e.isManualActive);
    if (manualEvent) {
      return {
        activeTheme: manualEvent.themeVisual,
        reason: `Ativado manualmente: ${manualEvent.name}`,
        event: manualEvent,
        nowSaoPaulo: nowIso
      };
    }

    // 3. Scheduled active events by date
    const eligibleEvents = this.data.themeEvents.filter(e => {
      if (e.status === 'encerrado' || e.status === 'rascunho') return false;
      const start = new Date(e.startDate).getTime();
      const end = new Date(e.endDate).getTime();
      const current = spDate.getTime();
      return current >= start && current <= end;
    }).sort((a, b) => b.priority - a.priority);

    if (eligibleEvents.length > 0) {
      const topEvent = eligibleEvents[0];
      return {
        activeTheme: topEvent.themeVisual,
        reason: `Agendamento automático ativo: ${topEvent.name} (${topEvent.startDate.split('T')[0]} até ${topEvent.endDate.split('T')[0]})`,
        event: topEvent,
        nowSaoPaulo: nowIso
      };
    }

    // 4. Fallback to default
    return {
      activeTheme: 'padrao',
      reason: 'Tema padrão ativo (nenhum evento no período)',
      nowSaoPaulo: nowIso
    };
  }

  // Orders
  public getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createOrder(orderData: Omit<Order, 'id' | 'code' | 'createdAt' | 'status'> & { status?: Order['status'] }): Order {
    const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      code,
      createdAt: new Date().toISOString(),
      status: orderData.status || (orderData.paymentMethod === 'pix' ? 'pendente' : 'aguardando_pagamento_presencial')
    };
    this.data.orders.unshift(newOrder);
    this.saveData();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status']): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      this.saveData();
      return order;
    }
    return null;
  }

  public deleteOrder(id: string): boolean {
    const initialLen = this.data.orders.length;
    this.data.orders = this.data.orders.filter(o => o.id !== id);
    if (this.data.orders.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseService();
