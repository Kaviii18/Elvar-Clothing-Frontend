import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiUrl } from '../config/api';

export interface CartItem {
  product_id: number;
  title:      string;
  price:      number;
  image_url:  string | null;
  size:       string;
  quantity:   number;
}

export interface OrderResult {
  success: boolean;
  message: string;
  order?: {
    id:                number;
    items:             CartItem[];
    subtotal:          string;
    shipping_fee:      string;
    total_price:       string;
    payment_method:    string;
    delivery_district: string | null;
    status:            string;
  };
}

const SHIPPING_350_DISTRICTS = new Set(['Colombo', 'Gampaha']);

export const getShippingFee = (paymentMethod: string, district: string): number => {
  if (paymentMethod === 'Store Pickup') return 0;
  return SHIPPING_350_DISTRICTS.has(district) ? 350 : 500;
};

export const formatLKR = (amount: number): string => {
  return 'Rs. ' + amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface CartContextType {
  items:             CartItem[];
  deliveryDistrict:  string;
  paymentMethod:     string;
  setDeliveryDistrict: (d: string) => void;
  setPaymentMethod:  (m: string) => void;
  addToCart:         (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart:    (product_id: number, size: string) => void;
  updateQuantity:    (product_id: number, size: string, qty: number) => void;
  clearCart:         () => void;
  totalItems:        number;
  subtotal:          number;
  shippingFee:       number;
  grandTotal:        number;
  placeOrder:        (
    token: string,
    overrideItems?: { product_id: number; size: string; quantity: number }[],
    orderMeta?: Record<string, unknown>
  ) => Promise<OrderResult>;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [items, setItems]                       = useState<CartItem[]>([]);
  const [deliveryDistrict, setDeliveryDistrict] = useState<string>('Colombo');
  const [paymentMethod, setPaymentMethod]       = useState<string>('COD');

  const addToCart = (newItem: Omit<CartItem, 'quantity'>): void => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === newItem.product_id && i.size === newItem.size);
      if (existing) {
        return prev.map(i =>
          i.product_id === newItem.product_id && i.size === newItem.size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (product_id: number, size: string): void => {
    setItems(prev => prev.filter(i => !(i.product_id === product_id && i.size === size)));
  };

  const updateQuantity = (product_id: number, size: string, qty: number): void => {
    if (qty <= 0) {
      removeFromCart(product_id, size);
      return;
    }
    setItems(prev => prev.map(i =>
      i.product_id === product_id && i.size === size ? { ...i, quantity: qty } : i
    ));
  };

  const clearCart = (): void => setItems([]);

  const totalItems  = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal    = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingFee = getShippingFee(paymentMethod, deliveryDistrict);
  const grandTotal  = subtotal + shippingFee;

  const placeOrder = async (
    token: string,
    overrideItems?: { product_id: number; size: string; quantity: number }[],
    orderMeta?: Record<string, unknown>,
  ): Promise<OrderResult> => {
    try {
      const orderItems = overrideItems ?? items.map(i => ({
        product_id: (i as any).product_id ?? (i as any).id,
        size:       (i.size || 'M').trim() || 'M',
        quantity:   Number(i.quantity) >= 1 ? Number(i.quantity) : 1,
      }));

      const invalidItem = orderItems.find(item =>
        !item.product_id ||
        !item.size ||
        item.size.trim().length === 0 ||
        item.quantity < 1
      );

      if (invalidItem) {
        return {
          success: false,
          message: 'Please fix invalid cart items before placing an order. Every item needs product_id, size, and quantity ≥ 1.',
        };
      }

      const body: Record<string, unknown> = {
        items:          orderItems,
        payment_method: paymentMethod,
        ...orderMeta,
      };

      if (paymentMethod !== 'Store Pickup' && !body.delivery_district) {
        body['delivery_district'] = deliveryDistrict;
      }

      const res  = await fetch(apiUrl('/api/orders/create'), {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
      }

      return {
        success: data.success,
        message: data.message,
        order:   data.order,
      };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  return (
    <CartContext.Provider value={{
      items, deliveryDistrict, paymentMethod,
      setDeliveryDistrict, setPaymentMethod,
      addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, subtotal, shippingFee, grandTotal,
      placeOrder,
    }}>
      {children}
    </CartContext.Provider>
  );
};
