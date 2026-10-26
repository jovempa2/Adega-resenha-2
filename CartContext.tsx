import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CustomizerOption, RoshModel, ShishaFlavor, RoshAccessory, ComboItem } from '../types.ts';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'totalPrice'>, quantity?: number) => void;
  addCustomDrink: (params: {
    baseDrink: CustomizerOption;
    ices: CustomizerOption[];
    energy: CustomizerOption | null;
    addOns: CustomizerOption[];
    cupSize?: CustomizerOption;
    totalPrice: number;
    quantity?: number;
  }) => void;
  addCustomRosh: (params: {
    model: RoshModel;
    flavors: { flavor: ShishaFlavor; proportion: string }[];
    accessories: RoshAccessory[];
    totalPrice: number;
    quantity?: number;
  }) => void;
  addFixedCombo: (combo: ComboItem, quantity?: number) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'adega_resenha_cart_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity' | 'totalPrice'>, quantity: number = 1) => {
    setCart((prev) => {
      // If it's a standard catalog or hookah item with the same ID, increment quantity
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1 && item.type === 'catalog') {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * updated[existingIndex].unitPrice,
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...item,
          quantity,
          totalPrice: quantity * item.unitPrice,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const addCustomDrink = (params: {
    baseDrink: CustomizerOption;
    ices: CustomizerOption[];
    energy: CustomizerOption | null;
    addOns: CustomizerOption[];
    cupSize?: CustomizerOption;
    totalPrice: number;
    quantity?: number;
  }) => {
    const qty = params.quantity || 1;
    const uniqueId = `custom-copo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const iceNames = params.ices.map((i) => i.name);
    const energyName = params.energy ? params.energy.name : 'Sem energético';
    const addOnNames = params.addOns.map((a) => a.name);
    const cupName = params.cupSize ? params.cupSize.name : 'Copão 700ml';

    const title = `Copo Personalizado — ${params.baseDrink.name}`;
    const subtitle = `${cupName} · ${iceNames.join(' + ') || 'Sem gelo'} · ${energyName}${addOnNames.length > 0 ? ` + ${addOnNames.join(', ')}` : ''}`;

    const newCartItem: CartItem = {
      id: uniqueId,
      type: 'custom_drink',
      title,
      subtitle,
      unitPrice: params.totalPrice,
      quantity: qty,
      totalPrice: params.totalPrice * qty,
      image: '/src/assets/images/custom_drink_copao_1792974928549.jpg',
      customDetails: {
        baseDrink: params.baseDrink.name,
        ices: iceNames,
        energyDrink: energyName,
        addOns: addOnNames,
        cupSize: cupName,
      },
    };

    setCart((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const addCustomRosh = (params: {
    model: RoshModel;
    flavors: { flavor: ShishaFlavor; proportion: string }[];
    accessories: RoshAccessory[];
    totalPrice: number;
    quantity?: number;
  }) => {
    const qty = params.quantity || 1;
    const uniqueId = `custom-rosh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const flavorStrings = params.flavors.map(f => `${f.flavor.name} (${f.proportion})`);
    const accStrings = params.accessories.map(a => a.name);

    const title = `Rosh Personalizado — ${params.model.name}`;
    const subtitle = `${flavorStrings.join(' + ')}${accStrings.length > 0 ? ` · ${accStrings.join(', ')}` : ''}`;

    const newCartItem: CartItem = {
      id: uniqueId,
      type: 'custom_rosh',
      title,
      subtitle,
      unitPrice: params.totalPrice,
      quantity: qty,
      totalPrice: params.totalPrice * qty,
      image: params.model.image || '/src/assets/images/hookah_lounge_setup_1792974929241.jpg',
      customRoshDetails: {
        model: params.model.name,
        flavors: params.flavors.map(f => ({ name: f.flavor.name, proportion: f.proportion })),
        accessories: accStrings,
      },
    };

    setCart((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const addFixedCombo = (combo: ComboItem, quantity: number = 1) => {
    const existingIndex = cart.findIndex(i => i.id === combo.id && i.type === 'combo');
    if (existingIndex > -1) {
      updateQuantity(combo.id, cart[existingIndex].quantity + quantity);
      return;
    }

    const newCartItem: CartItem = {
      id: combo.id,
      type: 'combo',
      title: combo.name,
      subtitle: `Combo Fechado · Preço Fixo R$ ${combo.price.toFixed(2).replace('.', ',')}`,
      unitPrice: combo.price,
      quantity,
      totalPrice: combo.price * quantity,
      image: combo.image,
      comboDetails: {
        comboId: combo.id,
        itemsIncluded: combo.itemsIncluded,
      },
    };

    setCart((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addCustomDrink,
        addCustomRosh,
        addFixedCombo,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
