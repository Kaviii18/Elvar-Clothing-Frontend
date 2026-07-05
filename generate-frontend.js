#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = process.cwd();

function write(relPath, content) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log('  \u2713  ' + relPath);
}

console.log('\n  \u25C6  \u00C9lvar Clothing \u2014 Frontend Generator\n');

// ─────────────────────────────────────────────────────────────────
//  package.json
// ─────────────────────────────────────────────────────────────────
write('package.json', `{
  "name": "elvar-clothing-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
`);

// ─────────────────────────────────────────────────────────────────
//  vite.config.ts
// ─────────────────────────────────────────────────────────────────
write('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
`);

// ─────────────────────────────────────────────────────────────────
//  tsconfig.json
// ─────────────────────────────────────────────────────────────────
write('tsconfig.json', `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`);

// ─────────────────────────────────────────────────────────────────
//  tsconfig.node.json
// ─────────────────────────────────────────────────────────────────
write('tsconfig.node.json', `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`);

// ─────────────────────────────────────────────────────────────────
//  postcss.config.js
// ─────────────────────────────────────────────────────────────────
write('postcss.config.js', `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

// ─────────────────────────────────────────────────────────────────
//  tailwind.config.js
// ─────────────────────────────────────────────────────────────────
write('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'elvar-bg':         '#0f0d0b',
        'elvar-surface':    '#1a1714',
        'elvar-card':       '#211e1a',
        'elvar-border':     '#3d3630',
        'elvar-cream':      '#f0ebe0',
        'elvar-muted':      '#8c7d6e',
        'elvar-gold':       '#c4a55a',
        'elvar-gold-light': '#dfc07a',
        'elvar-accent':     '#7a5c3e',
      },
      fontFamily: {
        'display': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'body':    ['"Jost"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest2': '0.25em',
        'widest3': '0.35em',
      },
    },
  },
  plugins: [],
};
`);

// ─────────────────────────────────────────────────────────────────
//  index.html
// ─────────────────────────────────────────────────────────────────
write('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\u00C9lvar Clothing</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

// ─────────────────────────────────────────────────────────────────
//  src/index.css
// ─────────────────────────────────────────────────────────────────
write('src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-elvar-bg text-elvar-cream font-body antialiased;
    font-size: 15px;
  }

  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-elvar-bg;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-elvar-border rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-elvar-muted;
  }

  ::selection {
    @apply bg-elvar-gold text-elvar-bg;
  }
}

@layer components {
  .elvar-btn {
    @apply inline-flex items-center justify-center px-6 py-3 border border-elvar-gold text-elvar-gold
           font-body font-medium tracking-widest text-xs uppercase
           transition-all duration-300 cursor-pointer select-none;
  }
  .elvar-btn:hover {
    @apply bg-elvar-gold text-elvar-bg;
  }
  .elvar-btn:disabled {
    @apply opacity-40 cursor-not-allowed;
  }

  .elvar-btn-ghost {
    @apply inline-flex items-center justify-center px-6 py-3 border border-elvar-border
           text-elvar-muted font-body font-medium tracking-widest text-xs uppercase
           transition-all duration-300 cursor-pointer select-none;
  }
  .elvar-btn-ghost:hover {
    @apply border-elvar-cream text-elvar-cream;
  }

  .elvar-input {
    @apply w-full bg-transparent border-b border-elvar-border text-elvar-cream
           font-body text-sm py-3 px-0 outline-none placeholder-elvar-muted
           transition-colors duration-200;
  }
  .elvar-input:focus {
    @apply border-elvar-gold;
  }

  .elvar-label {
    @apply block text-xs font-body font-medium tracking-widest2 uppercase text-elvar-muted mb-2;
  }

  .elvar-card {
    @apply bg-elvar-card border border-elvar-border;
  }

  .section-title {
    @apply font-display text-4xl md:text-5xl font-light text-elvar-cream;
  }

  .gold-line {
    @apply w-12 h-px bg-elvar-gold;
  }
}

@layer utilities {
  .text-shadow-gold {
    text-shadow: 0 0 40px rgba(196, 165, 90, 0.3);
  }
}
`);

// ─────────────────────────────────────────────────────────────────
//  src/main.tsx
// ─────────────────────────────────────────────────────────────────
write('src/main.tsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`);

// ─────────────────────────────────────────────────────────────────
//  src/contexts/AuthContext.tsx
// ─────────────────────────────────────────────────────────────────
write('src/contexts/AuthContext.tsx', `import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  token: string | null;
  loginAsCustomer: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginAsAdmin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [user, setUser]       = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken]     = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('elvar_token');
    const storedUser  = localStorage.getItem('elvar_user');
    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin');
      } catch {
        localStorage.removeItem('elvar_token');
        localStorage.removeItem('elvar_user');
      }
    }
    setIsLoading(false);
  }, []);

  const persist = (tkn: string, usr: User): void => {
    localStorage.setItem('elvar_token', tkn);
    localStorage.setItem('elvar_user', JSON.stringify(usr));
  };

  const loginAsCustomer = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res  = await fetch('http://localhost:5000/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsAdmin(data.user.role === 'admin');
        persist(data.token, data.user);
      }
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const loginAsAdmin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res  = await fetch('http://localhost:5000/api/auth/admin-login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsAdmin(true);
        persist(data.token, data.user);
      }
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res  = await fetch('http://localhost:5000/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsAdmin(false);
        persist(data.token, data.user);
      }
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem('elvar_token');
    localStorage.removeItem('elvar_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, token, loginAsCustomer, loginAsAdmin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
`);

// ─────────────────────────────────────────────────────────────────
//  src/contexts/CartContext.tsx
// ─────────────────────────────────────────────────────────────────
write('src/contexts/CartContext.tsx', `import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const WESTERN_DISTRICTS = new Set(['Colombo', 'Gampaha', 'Kalutara']);

export const getShippingFee = (paymentMethod: string, district: string): number => {
  if (paymentMethod === 'Store Pickup') return 0;
  return WESTERN_DISTRICTS.has(district) ? 350 : 450;
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
  placeOrder:        (token: string) => Promise<OrderResult>;
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

  const placeOrder = async (token: string): Promise<OrderResult> => {
    try {
      const orderItems = items.map(i => ({
        product_id: i.product_id,
        size:       i.size,
        quantity:   i.quantity,
      }));

      const body: Record<string, unknown> = {
        items:          orderItems,
        payment_method: paymentMethod,
      };

      if (paymentMethod !== 'Store Pickup') {
        body['delivery_district'] = deliveryDistrict;
      }

      const res  = await fetch('http://localhost:5000/api/orders/create', {
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
`);

// ─────────────────────────────────────────────────────────────────
//  src/components/AdminRoute.tsx
// ─────────────────────────────────────────────────────────────────
write('src/components/AdminRoute.tsx', `import React, { useEffect, useState, ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children:  ReactElement;
  onReject:  () => void;
}

const AdminRoute = ({ children, onReject }: AdminRouteProps): ReactElement => {
  const { isAdmin, isLoading } = useAuth();
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onReject();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isAdmin, isLoading, onReject]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-elvar-bg">
        <div className="text-elvar-muted font-body text-sm tracking-widest uppercase animate-pulse">
          Verifying credentials&hellip;
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-elvar-bg px-6">
        <div className="text-center max-w-sm">
          <div className="text-elvar-gold font-display text-lg tracking-widest2 mb-1">&#9650;</div>
          <p className="font-body text-xs tracking-widest3 uppercase text-elvar-muted mb-6">
            Restricted Area
          </p>
          <h1 className="font-display text-5xl font-light text-elvar-cream mb-4 leading-tight">
            Access<br />Restricted
          </h1>
          <div className="gold-line mx-auto mb-6" />
          <p className="font-body text-sm text-elvar-muted leading-relaxed mb-8">
            You do not have the necessary clearance to view this area.
            Administrator credentials are required.
          </p>
          <div className="border border-elvar-border p-4">
            <p className="font-body text-xs tracking-widest text-elvar-muted uppercase">
              Returning to home in
            </p>
            <p className="font-display text-4xl text-elvar-gold mt-1">{countdown}</p>
          </div>
          <button
            onClick={onReject}
            className="elvar-btn-ghost mt-4 w-full"
          >
            Return Now
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
`);

// ─────────────────────────────────────────────────────────────────
//  src/components/CheckoutForm.tsx
// ─────────────────────────────────────────────────────────────────
write('src/components/CheckoutForm.tsx', `import React, { useState, ReactElement } from 'react';
import { useCart, formatLKR, getShippingFee } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara',
  'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
  'Puttalam', 'Kurunegala',
  'Anuradhapura', 'Polonnaruwa',
  'Badulla', 'Monaragala',
  'Ratnapura', 'Kegalle',
  'Ampara', 'Batticaloa', 'Trincomalee',
];

type PaymentMethod = 'COD' | 'Bank Transfer' | 'Store Pickup';

interface CheckoutFormProps {
  onSuccess: (orderId: number) => void;
  onCancel:  () => void;
}

const CheckoutForm = ({ onSuccess, onCancel }: CheckoutFormProps): ReactElement => {
  const { items, subtotal, deliveryDistrict, paymentMethod,
          setDeliveryDistrict, setPaymentMethod, placeOrder, grandTotal } = useCart();
  const { token, user } = useAuth();

  const [loading, setLoading]       = useState<boolean>(false);
  const [errorMsg, setErrorMsg]     = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const selectedPayment = paymentMethod as PaymentMethod;
  const shipping        = getShippingFee(selectedPayment, deliveryDistrict);
  const total           = subtotal + shipping;

  const handlePlaceOrder = async (): Promise<void> => {
    setErrorMsg('');
    if (!token) {
      setErrorMsg('You must be logged in to place an order.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }
    setLoading(true);
    const result = await placeOrder(token);
    setLoading(false);
    if (result.success && result.order) {
      setSuccessMsg('Order #' + result.order.id + ' placed successfully! A confirmation email has been sent.');
      setTimeout(() => onSuccess(result.order!.id), 2000);
    } else {
      setErrorMsg(result.message || 'Order failed. Please try again.');
    }
  };

  if (successMsg) {
    return (
      <div className="flex items-center justify-center py-24 px-6">
        <div className="text-center max-w-md">
          <div className="text-elvar-gold text-5xl mb-6">&#10003;</div>
          <h2 className="font-display text-4xl font-light text-elvar-cream mb-4">{successMsg}</h2>
          <div className="gold-line mx-auto mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-widest3 uppercase text-elvar-muted font-body mb-2">Step 3 of 3</p>
        <h2 className="font-display text-5xl font-light text-elvar-cream">Secure Checkout</h2>
        <div className="gold-line mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* LEFT — Delivery & Payment */}
        <div className="space-y-10">

          {/* Customer Info */}
          {user && (
            <div>
              <p className="elvar-label">Customer</p>
              <p className="text-elvar-cream font-body text-sm">{user.name}</p>
              <p className="text-elvar-muted font-body text-xs mt-0.5">{user.email}</p>
            </div>
          )}

          {/* Delivery District */}
          {selectedPayment !== 'Store Pickup' && (
            <div>
              <label className="elvar-label" htmlFor="district-select">Delivery District</label>
              <div className="relative">
                <select
                  id="district-select"
                  value={deliveryDistrict}
                  onChange={e => setDeliveryDistrict(e.target.value)}
                  className="w-full bg-elvar-card border border-elvar-border text-elvar-cream font-body
                             text-sm py-3 px-4 outline-none appearance-none cursor-pointer
                             focus:border-elvar-gold transition-colors duration-200"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d} style={{ background: '#211e1a' }}>{d}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-elvar-gold text-xs">
                  &#9660;
                </div>
              </div>
              <p className="text-xs text-elvar-muted mt-2 font-body">
                {['Colombo', 'Gampaha', 'Kalutara'].includes(deliveryDistrict)
                  ? 'Western Province — ' + formatLKR(350) + ' shipping'
                  : 'Outstation — ' + formatLKR(450) + ' shipping'}
              </p>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <p className="elvar-label">Payment Method</p>
            <div className="space-y-3 mt-3">
              {(['COD', 'Bank Transfer', 'Store Pickup'] as PaymentMethod[]).map(method => (
                <label
                  key={method}
                  className={'flex items-start gap-4 p-4 border cursor-pointer transition-all duration-200 ' +
                    (selectedPayment === method
                      ? 'border-elvar-gold bg-elvar-gold/5'
                      : 'border-elvar-border hover:border-elvar-muted')}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={selectedPayment === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-elvar-gold"
                    />
                  </div>
                  <div>
                    <p className="font-body text-sm text-elvar-cream font-medium">
                      {method === 'COD'          && 'Cash on Delivery'}
                      {method === 'Bank Transfer' && 'Direct Bank Transfer'}
                      {method === 'Store Pickup'  && 'Store Pickup — Free'}
                    </p>
                    <p className="font-body text-xs text-elvar-muted mt-0.5">
                      {method === 'COD'          && 'Pay when your order arrives at your door.'}
                      {method === 'Bank Transfer' && 'Transfer to our bank account before dispatch.'}
                      {method === 'Store Pickup'  && 'Collect from our boutique. No shipping fee.'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Bank Transfer Details */}
          {selectedPayment === 'Bank Transfer' && (
            <div className="border border-elvar-gold/40 bg-elvar-gold/5 p-6">
              <p className="elvar-label text-elvar-gold mb-4">Commercial Bank Account Details</p>
              <div className="grid grid-cols-2 gap-y-3 text-sm font-body">
                <span className="text-elvar-muted">Account Name</span>
                <span className="text-elvar-cream">Élvar Clothing (Pvt) Ltd</span>
                <span className="text-elvar-muted">Account No.</span>
                <span className="text-elvar-cream tracking-wider">1234 5678 9012</span>
                <span className="text-elvar-muted">Bank</span>
                <span className="text-elvar-cream">Commercial Bank of Ceylon</span>
                <span className="text-elvar-muted">Branch</span>
                <span className="text-elvar-cream">Colombo 03</span>
                <span className="text-elvar-muted">Swift Code</span>
                <span className="text-elvar-cream">CCEYLKLX</span>
              </div>
              <p className="text-xs text-elvar-muted mt-4 font-body leading-relaxed">
                Please use your name as the payment reference and send us the receipt via email.
                Orders are dispatched after payment verification.
              </p>
            </div>
          )}

          {/* Store Info */}
          {selectedPayment === 'Store Pickup' && (
            <div className="border border-elvar-border p-6">
              <p className="elvar-label mb-4">Boutique Location</p>
              <div className="space-y-2 text-sm font-body">
                <p className="text-elvar-cream">42 Galle Road, Colombo 03</p>
                <p className="text-elvar-muted">Mon – Sat  &nbsp;·&nbsp;  10:00 AM – 8:00 PM</p>
                <p className="text-elvar-muted">Sun  &nbsp;·&nbsp;  11:00 AM – 6:00 PM</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Order Summary */}
        <div>
          <div className="elvar-card p-8 sticky top-24">
            <p className="elvar-label mb-6">Order Summary</p>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-elvar-surface flex-shrink-0 overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-elvar-accent/30 to-elvar-gold/10" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-elvar-cream text-sm font-body truncate">{item.title}</p>
                    <p className="text-elvar-muted text-xs font-body mt-0.5">
                      Size {item.size} &nbsp;&middot;&nbsp; Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-elvar-cream text-sm font-body flex-shrink-0">
                    {formatLKR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-elvar-border pt-6 space-y-3">
              <div className="flex justify-between text-sm font-body">
                <span className="text-elvar-muted">Subtotal</span>
                <span className="text-elvar-cream">{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-elvar-muted">Shipping</span>
                <span className={shipping === 0 ? 'text-elvar-gold' : 'text-elvar-cream'}>
                  {shipping === 0 ? 'Free' : formatLKR(shipping)}
                </span>
              </div>
            </div>

            <div className="border-t border-elvar-gold/40 mt-4 pt-4 flex justify-between">
              <span className="font-display text-lg text-elvar-cream">Total</span>
              <span className="font-display text-xl text-elvar-gold">{formatLKR(total)}</span>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 border border-red-800/60 bg-red-900/10">
                <p className="text-red-400 text-xs font-body">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading || items.length === 0}
              className="elvar-btn w-full mt-6"
            >
              {loading ? 'Processing\u2026' : 'Place Secure Order'}
            </button>

            <button
              onClick={onCancel}
              className="elvar-btn-ghost w-full mt-3"
            >
              Back to Cart
            </button>

            <p className="text-center text-xs text-elvar-muted font-body mt-4 leading-relaxed">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutForm;
`);

// ─────────────────────────────────────────────────────────────────
//  src/pages/CustomerLogin.tsx
// ─────────────────────────────────────────────────────────────────
write('src/pages/CustomerLogin.tsx', `import React, { useState, ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CustomerLoginProps {
  onSuccess: () => void;
  onBack:    () => void;
}

type Tab = 'login' | 'register';

const CustomerLogin = ({ onSuccess, onBack }: CustomerLoginProps): ReactElement => {
  const { loginAsCustomer, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [loginEmail,    setLoginEmail]    = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError,    setLoginError]    = useState<string>('');
  const [loginLoading,  setLoginLoading]  = useState<boolean>(false);

  // Register state
  const [regName,     setRegName]     = useState<string>('');
  const [regEmail,    setRegEmail]    = useState<string>('');
  const [regPhone,    setRegPhone]    = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirm,  setRegConfirm]  = useState<string>('');
  const [regError,    setRegError]    = useState<string>('');
  const [regLoading,  setRegLoading]  = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter your email and password.');
      return;
    }
    setLoginLoading(true);
    const result = await loginAsCustomer(loginEmail.trim(), loginPassword);
    setLoginLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setLoginError(result.message);
    }
  };

  const handleRegister = async (): Promise<void> => {
    setRegError('');
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Name, email and password are required.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters.');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }
    setRegLoading(true);
    const result = await register(regName.trim(), regEmail.trim(), regPassword, regPhone || undefined);
    setRegLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setRegError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-elvar-bg flex">

      {/* Decorative left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-elvar-surface p-12 border-r border-elvar-border flex-shrink-0">
        <div>
          <p className="font-body text-xs tracking-widest3 uppercase text-elvar-muted mb-6">
            \u00C9lvar Clothing
          </p>
          <h2 className="font-display text-5xl font-light text-elvar-cream leading-tight">
            Dressed<br />
            <em>with</em><br />
            Purpose.
          </h2>
          <div className="gold-line mt-8" />
        </div>
        <div>
          <p className="font-body text-xs text-elvar-muted leading-relaxed">
            Handcrafted haute couture from the<br />island of Sri Lanka.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Back */}
          <button onClick={onBack} className="flex items-center gap-2 text-elvar-muted text-xs font-body tracking-widest uppercase mb-10 hover:text-elvar-cream transition-colors">
            <span>&#8592;</span> Back to Store
          </button>

          <p className="font-body text-xs tracking-widest3 uppercase text-elvar-muted mb-2">
            My Account
          </p>

          {/* Tabs */}
          <div className="flex mb-8 border-b border-elvar-border">
            <button
              onClick={() => setTab('login')}
              className={'pb-3 mr-8 font-body text-sm tracking-widest uppercase transition-colors ' +
                (tab === 'login'
                  ? 'text-elvar-gold border-b border-elvar-gold'
                  : 'text-elvar-muted hover:text-elvar-cream')}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={'pb-3 font-body text-sm tracking-widest uppercase transition-colors ' +
                (tab === 'register'
                  ? 'text-elvar-gold border-b border-elvar-gold'
                  : 'text-elvar-muted hover:text-elvar-cream')}
            >
              Create Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <div className="space-y-8">
              <div>
                <label className="elvar-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="you@example.com"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="elvar-input"
                />
              </div>
              {loginError && (
                <p className="text-red-400 text-xs font-body">{loginError}</p>
              )}
              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="elvar-btn w-full"
              >
                {loginLoading ? 'Signing In\u2026' : 'Sign In to Your Account'}
              </button>
              <p className="text-center text-xs text-elvar-muted font-body">
                New to \u00C9lvar?{' '}
                <button
                  onClick={() => setTab('register')}
                  className="text-elvar-gold hover:text-elvar-gold-light underline underline-offset-2"
                >
                  Create an account
                </button>
              </p>
            </div>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <div className="space-y-8">
              <div>
                <label className="elvar-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Your full name"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="reg-phone">Phone Number <span className="normal-case font-light">(optional)</span></label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+94 77 000 0000"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  placeholder="Repeat your password"
                  className="elvar-input"
                />
              </div>
              {regError && (
                <p className="text-red-400 text-xs font-body">{regError}</p>
              )}
              <button
                onClick={handleRegister}
                disabled={regLoading}
                className="elvar-btn w-full"
              >
                {regLoading ? 'Creating Account\u2026' : 'Create My Account'}
              </button>
              <p className="text-center text-xs text-elvar-muted font-body">
                Already have an account?{' '}
                <button
                  onClick={() => setTab('login')}
                  className="text-elvar-gold hover:text-elvar-gold-light underline underline-offset-2"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
`);

// ─────────────────────────────────────────────────────────────────
//  src/pages/AdminLogin.tsx
// ─────────────────────────────────────────────────────────────────
write('src/pages/AdminLogin.tsx', `import React, { useState, ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack:    () => void;
}

const AdminLogin = ({ onSuccess, onBack }: AdminLoginProps): ReactElement => {
  const { loginAsAdmin } = useAuth();
  const [email,    setEmail]    = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error,    setError]    = useState<string>('');
  const [loading,  setLoading]  = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    setError('');
    if (!email.trim() || !password) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    const result = await loginAsAdmin(email.trim(), password);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.message || 'Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-elvar-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-elvar-gold/40 mb-6">
            <span className="text-elvar-gold text-lg">&#9650;</span>
          </div>
          <p className="font-body text-xs tracking-widest3 uppercase text-elvar-muted mb-2">
            Restricted Access
          </p>
          <h1 className="font-display text-4xl font-light text-elvar-cream">
            Administrator Portal
          </h1>
          <div className="gold-line mx-auto mt-4" />
        </div>

        {/* Form */}
        <div className="space-y-8">
          <div>
            <label className="elvar-label" htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="admin@elvarclothing.com"
              className="elvar-input"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="elvar-label" htmlFor="admin-password">Admin Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="elvar-input"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="border border-red-800/60 bg-red-900/10 p-4">
              <p className="text-red-400 text-xs font-body">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="elvar-btn w-full"
          >
            {loading ? 'Authenticating\u2026' : 'Enter Admin Panel'}
          </button>
        </div>

        {/* Back */}
        <div className="mt-10 text-center">
          <button
            onClick={onBack}
            className="text-elvar-muted text-xs font-body tracking-widest uppercase hover:text-elvar-cream transition-colors"
          >
            &#8592; Return to Store
          </button>
        </div>

        <p className="text-center text-xs text-elvar-border font-body mt-8">
          This area is monitored and all access attempts are logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
`);

// ─────────────────────────────────────────────────────────────────
//  src/pages/Home.tsx
// ─────────────────────────────────────────────────────────────────
write('src/pages/Home.tsx', `import React, { useState, useEffect, ReactElement } from 'react';
import { useCart, formatLKR } from '../contexts/CartContext';

interface StockEntry {
  size:     string;
  quantity: number;
}

interface Product {
  id:          number;
  title:       string;
  description: string | null;
  price:       number;
  category:    string;
  image_url:   string | null;
  is_active:   number;
  stock:       StockEntry[] | null;
}

interface HomeProps {
  onGoToCart: () => void;
}

const CATEGORIES = [
  { label: 'All',          value: '' },
  { label: 'Shirts',       value: 'shirts' },
  { label: 'Dresses',      value: 'dresses' },
  { label: 'Sarees',       value: 'sarees' },
  { label: 'Batik',        value: 'batik' },
  { label: 'Accessories',  value: 'accessories' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductCard = ({ product, onGoToCart }: { product: Product; onGoToCart: () => void }): ReactElement => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [added,        setAdded]        = useState<boolean>(false);
  const [sizeError,    setSizeError]    = useState<boolean>(false);

  const stock = product.stock || [];

  const getStock = (size: string): number => {
    const entry = stock.find(s => s.size === size);
    return entry ? entry.quantity : 0;
  };

  const availableSizes = SIZES.filter(s => getStock(s) > 0);

  const handleAdd = (): void => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 1500);
      return;
    }
    addToCart({
      product_id: product.id,
      title:      product.title,
      price:      Number(product.price),
      image_url:  product.image_url,
      size:       selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group elvar-card flex flex-col overflow-hidden transition-all duration-300 hover:border-elvar-gold/40">

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-elvar-surface">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-elvar-accent/20 via-elvar-surface to-elvar-card flex items-center justify-center">
            <div className="text-center">
              <p className="font-display text-3xl text-elvar-gold/30 italic">\u00C9</p>
              <p className="font-body text-xs tracking-widest text-elvar-border mt-2 uppercase">
                {product.category}
              </p>
            </div>
          </div>
        )}
        {availableSizes.length === 0 && (
          <div className="absolute inset-0 bg-elvar-bg/70 flex items-center justify-center">
            <p className="font-body text-xs tracking-widest uppercase text-elvar-muted">Sold Out</p>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="font-body text-xs tracking-widest uppercase text-elvar-gold bg-elvar-bg/80 px-2 py-1">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-xl font-light text-elvar-cream leading-tight mb-1 flex-1">
          {product.title}
        </h3>
        <p className="font-display text-lg text-elvar-gold mt-2 mb-4">
          {formatLKR(Number(product.price))}
        </p>

        {/* Size selector */}
        {availableSizes.length > 0 && (
          <div className="mb-4">
            <p className={'text-xs font-body tracking-widest uppercase mb-2 ' + (sizeError ? 'text-red-400' : 'text-elvar-muted')}>
              {sizeError ? 'Select a size' : 'Select size'}
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={'w-9 h-9 text-xs font-body font-medium border transition-all duration-200 ' +
                    (selectedSize === size
                      ? 'bg-elvar-gold border-elvar-gold text-elvar-bg'
                      : 'border-elvar-border text-elvar-muted hover:border-elvar-cream hover:text-elvar-cream')}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={availableSizes.length === 0}
          className={'elvar-btn w-full text-xs ' + (added ? 'bg-elvar-gold text-elvar-bg' : '')}
        >
          {added ? '\u2713 Added to Cart' : availableSizes.length === 0 ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const Home = ({ onGoToCart }: HomeProps): ReactElement => {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading,  setLoading]    = useState<boolean>(true);
  const [error,    setError]      = useState<string>('');
  const [category, setCategory]   = useState<string>('');
  const [page,     setPage]       = useState<number>(1);
  const [hasMore,  setHasMore]    = useState<boolean>(true);
  const LIMIT = 12;

  const fetchProducts = async (cat: string, pg: number, append: boolean): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      let url = 'http://localhost:5000/api/products?limit=' + LIMIT + '&page=' + pg;
      if (cat) url += '&category=' + encodeURIComponent(cat);
      const res  = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const incoming: Product[] = data.products || [];
        setProducts(prev => append ? [...prev, ...incoming] : incoming);
        setHasMore(incoming.length === LIMIT);
      } else {
        setError(data.message || 'Could not load products.');
      }
    } catch {
      setError('Could not connect to the server. Please ensure the backend is running on port 5000.');
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(category, 1, false);
  }, [category]);

  const loadMore = (): void => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(category, nextPage, true);
  };

  const activeProducts = products.filter(p => p.is_active === 1 || p.is_active as unknown as boolean === true);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-elvar-surface overflow-hidden px-6">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c4a55a 0, #c4a55a 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative text-center max-w-3xl">
          <p className="font-body text-xs tracking-widest3 uppercase text-elvar-gold mb-6">
            Sri Lanka's Finest Boutique
          </p>
          <h1 className="font-display text-7xl md:text-9xl font-light text-elvar-cream leading-none text-shadow-gold">
            &Eacute;lvar
          </h1>
          <p className="font-display text-2xl md:text-3xl font-light italic text-elvar-muted mt-3">
            Clothing
          </p>
          <div className="gold-line mx-auto mt-8 mb-8" />
          <p className="font-body text-sm text-elvar-muted leading-relaxed max-w-md mx-auto">
            Handcrafted couture, batik artistry, and timeless elegance — curated from the heart of Sri Lanka.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="sticky top-0 z-10 bg-elvar-bg border-b border-elvar-border px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={'px-5 py-4 font-body text-xs tracking-widest uppercase whitespace-nowrap transition-colors duration-200 border-b-2 ' +
                (category === cat.value
                  ? 'text-elvar-gold border-elvar-gold'
                  : 'text-elvar-muted border-transparent hover:text-elvar-cream')}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        {loading && products.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-elvar-gold animate-bounce"
                  style={{ animationDelay: (i * 0.15) + 's' }}
                />
              ))}
            </div>
            <p className="text-elvar-muted font-body text-xs tracking-widest uppercase mt-4">
              Loading collection&hellip;
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-24">
            <p className="text-red-400 font-body text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && activeProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-3xl font-light text-elvar-muted italic">
              No pieces found.
            </p>
            <p className="text-elvar-muted font-body text-xs mt-3">
              Try a different category or check back later.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {activeProducts.map(product => (
            <ProductCard key={product.id} product={product} onGoToCart={onGoToCart} />
          ))}
        </div>

        {hasMore && !loading && products.length > 0 && (
          <div className="text-center mt-12">
            <button onClick={loadMore} className="elvar-btn-ghost px-12">
              Load More
            </button>
          </div>
        )}

        {loading && products.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-elvar-muted font-body text-xs tracking-widest uppercase animate-pulse">
              Loading more&hellip;
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
`);

// ─────────────────────────────────────────────────────────────────
//  src/pages/CartPage.tsx
// ─────────────────────────────────────────────────────────────────
write('src/pages/CartPage.tsx', `import React, { ReactElement } from 'react';
import { useCart, formatLKR } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartPageProps {
  onCheckout:   () => void;
  onContinue:   () => void;
  onLogin:      () => void;
}

const CartPage = ({ onCheckout, onContinue, onLogin }: CartPageProps): ReactElement => {
  const { items, removeFromCart, updateQuantity, subtotal, shippingFee, grandTotal, totalItems } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <p className="font-display text-6xl text-elvar-border font-light mb-6">&#9675;</p>
        <h2 className="font-display text-4xl font-light text-elvar-muted italic">Your cart is empty.</h2>
        <div className="gold-line mx-auto mt-6 mb-8" />
        <button onClick={onContinue} className="elvar-btn px-12">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-widest3 uppercase text-elvar-muted font-body mb-2">
          {totalItems} {totalItems === 1 ? 'piece' : 'pieces'} selected
        </p>
        <h2 className="font-display text-5xl font-light text-elvar-cream">Your Cart</h2>
        <div className="gold-line mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Item list */}
        <div className="lg:col-span-2 space-y-0 divide-y divide-elvar-border">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-5 py-6">
              {/* Image */}
              <div className="w-24 h-32 flex-shrink-0 bg-elvar-surface overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-elvar-accent/20 to-elvar-card" />}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-light text-elvar-cream leading-tight">{item.title}</h3>
                  <p className="font-body text-xs text-elvar-muted mt-1 tracking-widest uppercase">
                    Size: {item.size}
                  </p>
                  <p className="font-display text-base text-elvar-gold mt-2">{formatLKR(item.price)}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-0 border border-elvar-border">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                      className="w-8 h-8 text-elvar-muted hover:text-elvar-cream hover:bg-elvar-surface transition-colors font-body text-lg leading-none"
                    >
                      &minus;
                    </button>
                    <span className="w-10 text-center text-sm font-body text-elvar-cream">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                      className="w-8 h-8 text-elvar-muted hover:text-elvar-cream hover:bg-elvar-surface transition-colors font-body text-lg leading-none"
                    >
                      &#43;
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-display text-base text-elvar-cream">
                      {formatLKR(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product_id, item.size)}
                      className="text-elvar-muted hover:text-red-400 transition-colors font-body text-xs tracking-widest uppercase"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="elvar-card p-6 sticky top-24">
            <p className="elvar-label mb-6">Order Summary</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-body">
                <span className="text-elvar-muted">Subtotal ({totalItems} items)</span>
                <span className="text-elvar-cream">{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-elvar-muted">Estimated Shipping</span>
                <span className="text-elvar-muted text-xs italic">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-elvar-border pt-4 mb-6 flex justify-between">
              <span className="font-display text-lg text-elvar-cream">Total</span>
              <span className="font-display text-xl text-elvar-gold">{formatLKR(subtotal)}</span>
            </div>

            {user ? (
              <button onClick={onCheckout} className="elvar-btn w-full">
                Proceed to Checkout
              </button>
            ) : (
              <div>
                <button onClick={onLogin} className="elvar-btn w-full">
                  Sign In to Checkout
                </button>
                <p className="text-center text-xs text-elvar-muted font-body mt-3">
                  You must be logged in to place an order.
                </p>
              </div>
            )}

            <button onClick={onContinue} className="elvar-btn-ghost w-full mt-3">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
`);

// ─────────────────────────────────────────────────────────────────
//  src/pages/MyOrders.tsx
// ─────────────────────────────────────────────────────────────────
write('src/pages/MyOrders.tsx', `import React, { useEffect, useState, ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatLKR } from '../contexts/CartContext';

interface OrderItem {
  product_id: number;
  title:      string;
  size:       string;
  quantity:   number;
  unit_price: number;
}

interface Order {
  id:                number;
  items_json:        OrderItem[];
  total_price:       string;
  shipping_fee:      string;
  payment_method:    string;
  delivery_district: string | null;
  status:            string;
  created_at:        string;
}

interface MyOrdersProps {
  onBack: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:    'text-yellow-400 bg-yellow-900/20 border-yellow-800/40',
  Processing: 'text-blue-400 bg-blue-900/20 border-blue-800/40',
  Shipped:    'text-purple-400 bg-purple-900/20 border-purple-800/40',
  Delivered:  'text-green-400 bg-green-900/20 border-green-800/40',
  Cancelled:  'text-red-400 bg-red-900/20 border-red-800/40',
};

const MyOrders = ({ onBack }: MyOrdersProps): ReactElement => {
  const { token } = useAuth();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error,   setError]   = useState<string>('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('http://localhost:5000/api/orders/my-orders', {
      headers: { 'Authorization': 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        else setError(data.message);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load orders.');
        setLoading(false);
      });
  }, [token]);

  const fmt = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-elvar-muted text-xs font-body tracking-widest uppercase mb-6 hover:text-elvar-cream transition-colors">
          <span>&#8592;</span> Back
        </button>
        <p className="text-xs tracking-widest3 uppercase text-elvar-muted font-body mb-2">Account</p>
        <h2 className="font-display text-5xl font-light text-elvar-cream">My Orders</h2>
        <div className="gold-line mt-4" />
      </div>

      {loading && (
        <div className="text-center py-20">
          <p className="text-elvar-muted font-body text-xs tracking-widest uppercase animate-pulse">
            Loading orders&hellip;
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-red-400 font-body text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-20">
          <p className="font-display text-4xl text-elvar-muted font-light italic">No orders yet.</p>
          <p className="font-body text-xs text-elvar-muted mt-3">
            Your order history will appear here once you place your first order.
          </p>
          <button onClick={onBack} className="elvar-btn mt-8">Start Shopping</button>
        </div>
      )}

      <div className="space-y-6">
        {orders.map(order => {
          const items: OrderItem[] = Array.isArray(order.items_json)
            ? order.items_json
            : (typeof order.items_json === 'string' ? JSON.parse(order.items_json) : []);

          return (
            <div key={order.id} className="elvar-card p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-elvar-border">
                <div>
                  <p className="font-body text-xs tracking-widest uppercase text-elvar-muted mb-1">
                    Order #{order.id}
                  </p>
                  <p className="font-body text-xs text-elvar-muted">{fmt(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={'px-3 py-1 text-xs font-body tracking-widest uppercase border ' + (STATUS_COLORS[order.status] || 'text-elvar-muted bg-elvar-surface border-elvar-border')}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-5">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm font-body">
                    <span className="text-elvar-cream">
                      {item.title}
                      <span className="text-elvar-muted ml-2">({item.size} &times; {item.quantity})</span>
                    </span>
                    <span className="text-elvar-muted">{formatLKR(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-elvar-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-body text-elvar-muted">
                  <span className="mr-4">{order.payment_method}</span>
                  {order.delivery_district && <span>{order.delivery_district}</span>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-body text-elvar-muted">
                    Shipping: {formatLKR(Number(order.shipping_fee))}
                  </p>
                  <p className="font-display text-lg text-elvar-gold">
                    {formatLKR(Number(order.total_price))}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
`);

// ─────────────────────────────────────────────────────────────────
//  src/pages/AdminDashboard.tsx
// ─────────────────────────────────────────────────────────────────
write('src/pages/AdminDashboard.tsx', `import React, { useState, useEffect, ReactElement, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatLKR } from '../contexts/CartContext';

interface DashStats {
  total_orders:    number;
  pending_orders:  number;
  total_revenue:   string;
  total_products:  number;
  total_customers: number;
}

interface StockEntry { size: string; quantity: number; }

interface Product {
  id:          number;
  title:       string;
  description: string | null;
  price:       number;
  category:    string;
  image_url:   string | null;
  is_active:   number;
  stock:       StockEntry[] | null;
}

interface OrderItem {
  product_id: number;
  title:      string;
  size:       string;
  quantity:   number;
  unit_price: number;
}

interface AdminOrder {
  id:                number;
  customer_name:     string;
  customer_email:    string;
  items_json:        OrderItem[];
  total_price:       string;
  shipping_fee:      string;
  payment_method:    string;
  delivery_district: string | null;
  status:            string;
  created_at:        string;
}

type AdminTab = 'overview' | 'orders' | 'products' | 'add_product';

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const SIZES          = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps): ReactElement => {
  const { token, user } = useAuth();
  const [tab, setTab]   = useState<AdminTab>('overview');

  // ── Overview ──────────────────────────────────────────────────
  const [stats,         setStats]         = useState<DashStats | null>(null);
  const [statsLoading,  setStatsLoading]  = useState<boolean>(false);

  // ── Orders ────────────────────────────────────────────────────
  const [orders,        setOrders]        = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  // ── Products ──────────────────────────────────────────────────
  const [products,         setProducts]         = useState<Product[]>([]);
  const [productsLoading,  setProductsLoading]  = useState<boolean>(false);
  const [editingProduct,   setEditingProduct]   = useState<Product | null>(null);
  const [editForm,         setEditForm]         = useState<Partial<Product>>({});
  const [editError,        setEditError]        = useState<string>('');
  const [editSuccess,      setEditSuccess]      = useState<string>('');

  // ── Add Product ───────────────────────────────────────────────
  const [newTitle,       setNewTitle]       = useState<string>('');
  const [newDesc,        setNewDesc]        = useState<string>('');
  const [newPrice,       setNewPrice]       = useState<string>('');
  const [newCategory,    setNewCategory]    = useState<string>('shirts');
  const [newImageUrl,    setNewImageUrl]    = useState<string>('');
  const [newStock,       setNewStock]       = useState<{ size: string; quantity: string }[]>(
    SIZES.map(s => ({ size: s, quantity: '0' }))
  );
  const [addLoading,    setAddLoading]     = useState<boolean>(false);
  const [addError,      setAddError]       = useState<string>('');
  const [addSuccess,    setAddSuccess]     = useState<string>('');

  // ── Stock update ──────────────────────────────────────────────
  const [stockProductId, setStockProductId] = useState<string>('');
  const [stockSize,      setStockSize]      = useState<string>('M');
  const [stockQty,       setStockQty]       = useState<string>('');
  const [stockMsg,       setStockMsg]       = useState<{ ok: boolean; text: string } | null>(null);

  const authHeader = useCallback((): Record<string, string> => ({
    'Content-Type':  'application/json',
    'Authorization': 'Bearer ' + (token || ''),
  }), [token]);

  const fetchStats = useCallback(async (): Promise<void> => {
    setStatsLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/admin/dashboard/stats', { headers: authHeader() });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } finally { setStatsLoading(false); }
  }, [authHeader]);

  const fetchOrders = useCallback(async (): Promise<void> => {
    setOrdersLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/admin/orders', { headers: authHeader() });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } finally { setOrdersLoading(false); }
  }, [authHeader]);

  const fetchProducts = useCallback(async (): Promise<void> => {
    setProductsLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/admin/products', { headers: authHeader() });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } finally { setProductsLoading(false); }
  }, [authHeader]);

  useEffect(() => {
    if (tab === 'overview') fetchStats();
    if (tab === 'orders')   fetchOrders();
    if (tab === 'products' || tab === 'add_product') fetchProducts();
  }, [tab, fetchStats, fetchOrders, fetchProducts]);

  const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
    setStatusUpdating(orderId);
    try {
      const res  = await fetch('http://localhost:5000/api/admin/orders/update-status', {
        method:  'PUT',
        headers: authHeader(),
        body:    JSON.stringify({ order_id: orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      } else {
        alert(data.message);
      }
    } finally { setStatusUpdating(null); }
  };

  const handleAddProduct = async (): Promise<void> => {
    setAddError('');
    setAddSuccess('');
    if (!newTitle.trim() || !newPrice || !newCategory) {
      setAddError('Title, price and category are required.');
      return;
    }
    const stockPayload = newStock
      .filter(s => parseInt(s.quantity) > 0)
      .map(s => ({ size: s.size, quantity: parseInt(s.quantity) }));
    if (stockPayload.length === 0) {
      setAddError('Add at least one size with stock > 0.');
      return;
    }
    setAddLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/admin/products/add', {
        method:  'POST',
        headers: authHeader(),
        body:    JSON.stringify({
          title:       newTitle.trim(),
          description: newDesc || null,
          price:       parseFloat(newPrice),
          category:    newCategory,
          image_url:   newImageUrl || null,
          stock:       stockPayload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddSuccess('Product "' + newTitle + '" added successfully!');
        setNewTitle(''); setNewDesc(''); setNewPrice('');
        setNewImageUrl(''); setNewCategory('shirts');
        setNewStock(SIZES.map(s => ({ size: s, quantity: '0' })));
        fetchProducts();
      } else {
        setAddError(data.message);
      }
    } catch { setAddError('Network error.'); }
    setAddLoading(false);
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingProduct) return;
    setEditError(''); setEditSuccess('');
    try {
      const res  = await fetch('http://localhost:5000/api/admin/products/' + editingProduct.id, {
        method:  'PUT',
        headers: authHeader(),
        body:    JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditSuccess('Product updated.');
        fetchProducts();
        setTimeout(() => { setEditingProduct(null); setEditSuccess(''); }, 1200);
      } else { setEditError(data.message); }
    } catch { setEditError('Network error.'); }
  };

  const handleStockUpdate = async (): Promise<void> => {
    setStockMsg(null);
    if (!stockProductId || !stockSize || !stockQty) {
      setStockMsg({ ok: false, text: 'All fields are required.' });
      return;
    }
    try {
      const res  = await fetch('http://localhost:5000/api/admin/products/stock/update', {
        method:  'PUT',
        headers: authHeader(),
        body:    JSON.stringify({ product_id: parseInt(stockProductId), size: stockSize, quantity: parseInt(stockQty) }),
      });
      const data = await res.json();
      setStockMsg({ ok: data.success, text: data.message });
      if (data.success) fetchProducts();
    } catch { setStockMsg({ ok: false, text: 'Network error.' }); }
  };

  const STATUS_COLORS: Record<string, string> = {
    Pending:    'text-yellow-400',
    Processing: 'text-blue-400',
    Shipped:    'text-purple-400',
    Delivered:  'text-green-400',
    Cancelled:  'text-red-400',
  };

  const fmt = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'overview',     label: 'Overview' },
    { key: 'orders',       label: 'Orders' },
    { key: 'products',     label: 'Products' },
    { key: 'add_product',  label: 'Add Product' },
  ];

  return (
    <div className="min-h-screen bg-elvar-bg">

      {/* Admin Header */}
      <header className="bg-elvar-surface border-b border-elvar-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-elvar-gold font-display text-xl">&#9650;</span>
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-elvar-muted">Administrator</p>
            <p className="font-display text-lg text-elvar-cream">&Eacute;lvar Clothing</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-elvar-muted font-body text-xs hidden sm:block">{user?.name}</p>
          <button onClick={onLogout} className="elvar-btn-ghost text-xs py-2 px-4">
            Sign Out
          </button>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="bg-elvar-surface border-b border-elvar-border px-6">
        <div className="flex overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={'px-5 py-4 font-body text-xs tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 ' +
                (tab === t.key
                  ? 'text-elvar-gold border-elvar-gold'
                  : 'text-elvar-muted border-transparent hover:text-elvar-cream')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ── OVERVIEW ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div>
            <h2 className="font-display text-4xl font-light text-elvar-cream mb-8">Dashboard</h2>
            {statsLoading && <p className="text-elvar-muted font-body text-sm animate-pulse">Loading stats&hellip;</p>}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {([
                  { label: 'Total Orders',    value: stats.total_orders.toString(),    accent: false },
                  { label: 'Pending Orders',  value: stats.pending_orders.toString(),  accent: stats.pending_orders > 0 },
                  { label: 'Total Revenue',   value: formatLKR(Number(stats.total_revenue)), accent: true },
                  { label: 'Active Products', value: stats.total_products.toString(),  accent: false },
                  { label: 'Customers',       value: stats.total_customers.toString(), accent: false },
                ] as { label: string; value: string; accent: boolean }[]).map(card => (
                  <div key={card.label} className="elvar-card p-6">
                    <p className="elvar-label mb-3">{card.label}</p>
                    <p className={'font-display text-3xl font-light ' + (card.accent ? 'text-elvar-gold' : 'text-elvar-cream')}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 border border-elvar-border p-6">
              <p className="elvar-label mb-2">Quick Actions</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={() => setTab('orders')}      className="elvar-btn text-xs">View Orders</button>
                <button onClick={() => setTab('add_product')} className="elvar-btn text-xs">Add Product</button>
                <button onClick={fetchStats}                  className="elvar-btn-ghost text-xs">Refresh</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ───────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-4xl font-light text-elvar-cream">All Orders</h2>
              <button onClick={fetchOrders} className="elvar-btn-ghost text-xs py-2">Refresh</button>
            </div>
            {ordersLoading && <p className="text-elvar-muted font-body text-sm animate-pulse">Loading orders&hellip;</p>}
            {!ordersLoading && orders.length === 0 && (
              <p className="text-elvar-muted font-body text-sm">No orders yet.</p>
            )}
            <div className="space-y-4">
              {orders.map(order => {
                const items: OrderItem[] = Array.isArray(order.items_json)
                  ? order.items_json
                  : (typeof order.items_json === 'string' ? JSON.parse(order.items_json) : []);
                return (
                  <div key={order.id} className="elvar-card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-body text-sm font-medium text-elvar-cream">
                          Order #{order.id}
                          <span className={'ml-3 text-xs ' + (STATUS_COLORS[order.status] || 'text-elvar-muted')}>
                            {order.status}
                          </span>
                        </p>
                        <p className="font-body text-xs text-elvar-muted mt-0.5">
                          {order.customer_name} &middot; {order.customer_email}
                        </p>
                        <p className="font-body text-xs text-elvar-muted mt-0.5">{fmt(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value)}
                          disabled={statusUpdating === order.id || order.status === 'Delivered' || order.status === 'Cancelled'}
                          className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-xs py-2 px-3 outline-none cursor-pointer disabled:opacity-50 focus:border-elvar-gold"
                        >
                          {VALID_STATUSES.map(s => (
                            <option key={s} value={s} style={{ background: '#1a1714' }}>{s}</option>
                          ))}
                        </select>
                        {statusUpdating === order.id && (
                          <span className="text-elvar-muted text-xs font-body animate-pulse">Saving&hellip;</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {items.map((item, i) => (
                        <p key={i} className="font-body text-xs text-elvar-muted">
                          {item.title} — {item.size} &times; {item.quantity} @ {formatLKR(item.unit_price)}
                        </p>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-body border-t border-elvar-border pt-3">
                      <span className="text-elvar-muted">{order.payment_method}</span>
                      {order.delivery_district && <span className="text-elvar-muted">{order.delivery_district}</span>}
                      <span className="text-elvar-muted">Shipping: {formatLKR(Number(order.shipping_fee))}</span>
                      <span className="text-elvar-gold ml-auto font-medium">{formatLKR(Number(order.total_price))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PRODUCTS ─────────────────────────────────────────── */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-4xl font-light text-elvar-cream">All Products</h2>
              <div className="flex gap-3">
                <button onClick={fetchProducts} className="elvar-btn-ghost text-xs py-2">Refresh</button>
                <button onClick={() => setTab('add_product')} className="elvar-btn text-xs py-2">+ Add Product</button>
              </div>
            </div>

            {productsLoading && <p className="text-elvar-muted font-body text-sm animate-pulse">Loading products&hellip;</p>}

            {/* Stock quick-update */}
            <div className="elvar-card p-6 mb-8">
              <p className="elvar-label mb-4">Quick Stock Update</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <p className="elvar-label text-xs mb-1">Product ID</p>
                  <input
                    type="number"
                    value={stockProductId}
                    onChange={e => setStockProductId(e.target.value)}
                    placeholder="e.g. 3"
                    className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-sm py-2 px-3 w-28 outline-none focus:border-elvar-gold"
                  />
                </div>
                <div>
                  <p className="elvar-label text-xs mb-1">Size</p>
                  <select
                    value={stockSize}
                    onChange={e => setStockSize(e.target.value)}
                    className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-sm py-2 px-3 outline-none cursor-pointer focus:border-elvar-gold"
                  >
                    {SIZES.map(s => <option key={s} value={s} style={{ background: '#1a1714' }}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <p className="elvar-label text-xs mb-1">Quantity</p>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={e => setStockQty(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-sm py-2 px-3 w-24 outline-none focus:border-elvar-gold"
                  />
                </div>
                <button onClick={handleStockUpdate} className="elvar-btn text-xs py-2 px-5">Update</button>
              </div>
              {stockMsg && (
                <p className={'text-xs font-body mt-3 ' + (stockMsg.ok ? 'text-green-400' : 'text-red-400')}>
                  {stockMsg.text}
                </p>
              )}
            </div>

            {/* Products table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm font-body">
                <thead>
                  <tr className="border-b border-elvar-border">
                    {['ID', 'Title', 'Category', 'Price', 'Status', 'Stock', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs tracking-widest uppercase text-elvar-muted py-3 px-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const stock: StockEntry[] = Array.isArray(p.stock)
                      ? p.stock.filter(s => s && s.size)
                      : [];
                    const totalStock = stock.reduce((acc, s) => acc + (s.quantity || 0), 0);
                    return (
                      <tr key={p.id} className="border-b border-elvar-border/50 hover:bg-elvar-surface/50 transition-colors">
                        <td className="py-4 px-3 text-elvar-muted">{p.id}</td>
                        <td className="py-4 px-3 text-elvar-cream max-w-xs truncate">{p.title}</td>
                        <td className="py-4 px-3 text-elvar-muted capitalize">{p.category}</td>
                        <td className="py-4 px-3 text-elvar-gold">{formatLKR(Number(p.price))}</td>
                        <td className="py-4 px-3">
                          <span className={'text-xs ' + (p.is_active ? 'text-green-400' : 'text-red-400')}>
                            {p.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-elvar-muted">{totalStock} units</td>
                        <td className="py-4 px-3">
                          <button
                            onClick={() => { setEditingProduct(p); setEditForm({ title: p.title, description: p.description, price: p.price, category: p.category, image_url: p.image_url, is_active: p.is_active }); setEditError(''); setEditSuccess(''); }}
                            className="text-elvar-gold hover:text-elvar-gold-light text-xs uppercase tracking-widest transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-elvar-bg/90 z-50 flex items-center justify-center p-6 overflow-y-auto">
                <div className="elvar-card p-8 w-full max-w-lg max-h-screen overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-2xl text-elvar-cream">Edit Product #{editingProduct.id}</h3>
                    <button onClick={() => setEditingProduct(null)} className="text-elvar-muted hover:text-elvar-cream text-xl">&times;</button>
                  </div>
                  <div className="space-y-5">
                    {([
                      { label: 'Title',     key: 'title',     type: 'text'   },
                      { label: 'Price',     key: 'price',     type: 'number' },
                      { label: 'Category',  key: 'category',  type: 'text'   },
                      { label: 'Image URL', key: 'image_url', type: 'text'   },
                    ] as { label: string; key: keyof Product; type: string }[]).map(field => (
                      <div key={field.key}>
                        <label className="elvar-label">{field.label}</label>
                        <input
                          type={field.type}
                          value={(editForm[field.key] as string | number) ?? ''}
                          onChange={e => setEditForm(prev => ({ ...prev, [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                          className="elvar-input"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="elvar-label">Description</label>
                      <textarea
                        value={(editForm.description as string) ?? ''}
                        onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full bg-transparent border-b border-elvar-border text-elvar-cream font-body text-sm py-3 px-0 outline-none placeholder-elvar-muted resize-none focus:border-elvar-gold"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is-active"
                        checked={Boolean(editForm.is_active)}
                        onChange={e => setEditForm(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                        className="accent-elvar-gold"
                      />
                      <label htmlFor="is-active" className="font-body text-sm text-elvar-cream cursor-pointer">Product is active (visible on store)</label>
                    </div>
                    {editError   && <p className="text-red-400 text-xs font-body">{editError}</p>}
                    {editSuccess && <p className="text-green-400 text-xs font-body">{editSuccess}</p>}
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSaveEdit} className="elvar-btn flex-1">Save Changes</button>
                      <button onClick={() => setEditingProduct(null)} className="elvar-btn-ghost flex-1">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADD PRODUCT ───────────────────────────────────────── */}
        {tab === 'add_product' && (
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-light text-elvar-cream mb-8">Add New Product</h2>
            <div className="space-y-7">
              <div>
                <label className="elvar-label">Product Title *</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Handwoven Batik Saree" className="elvar-input" />
              </div>
              <div>
                <label className="elvar-label">Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Optional product description..."
                  className="w-full bg-transparent border-b border-elvar-border text-elvar-cream font-body text-sm py-3 px-0 outline-none placeholder-elvar-muted resize-none focus:border-elvar-gold transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="elvar-label">Price (LKR) *</label>
                  <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="e.g. 4500" min="0" step="0.01" className="elvar-input" />
                </div>
                <div>
                  <label className="elvar-label">Category *</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-elvar-card border-b border-elvar-border text-elvar-cream font-body text-sm py-3 px-0 outline-none cursor-pointer focus:border-elvar-gold"
                  >
                    {['shirts', 'dresses', 'sarees', 'batik', 'accessories', 'other'].map(c => (
                      <option key={c} value={c} style={{ background: '#211e1a' }} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="elvar-label">Image URL</label>
                <input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://..." className="elvar-input" />
              </div>
              <div>
                <p className="elvar-label mb-4">Stock Quantities by Size *</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {newStock.map((entry, i) => (
                    <div key={entry.size} className="text-center">
                      <p className="font-body text-xs text-elvar-muted mb-2">{entry.size}</p>
                      <input
                        type="number"
                        value={entry.quantity}
                        onChange={e => {
                          const updated = [...newStock];
                          updated[i] = { ...entry, quantity: e.target.value };
                          setNewStock(updated);
                        }}
                        min="0"
                        className="w-full bg-elvar-surface border border-elvar-border text-elvar-cream text-center font-body text-sm py-2 px-1 outline-none focus:border-elvar-gold transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {addError   && <div className="border border-red-800/60 bg-red-900/10 p-4"><p className="text-red-400 text-xs font-body">{addError}</p></div>}
              {addSuccess && <div className="border border-green-800/60 bg-green-900/10 p-4"><p className="text-green-400 text-xs font-body">{addSuccess}</p></div>}

              <button onClick={handleAddProduct} disabled={addLoading} className="elvar-btn px-12">
                {addLoading ? 'Adding Product\u2026' : 'Add Product to Store'}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
`);

// ─────────────────────────────────────────────────────────────────
//  src/App.tsx
// ─────────────────────────────────────────────────────────────────
write('src/App.tsx', `import React, { useState, useRef, ReactElement } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import AdminRoute    from './components/AdminRoute';
import CheckoutForm  from './components/CheckoutForm';
import Home          from './pages/Home';
import CustomerLogin from './pages/CustomerLogin';
import AdminLogin    from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CartPage      from './pages/CartPage';
import MyOrders      from './pages/MyOrders';

type View = 'home' | 'cart' | 'checkout' | 'customer_login' | 'admin_login' | 'admin_dashboard' | 'my_orders' | 'order_success';

// ─── Inner App (consumes contexts) ────────────────────────────────

const InnerApp = (): ReactElement => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems, clearCart } = useCart();

  const [view,          setView]          = useState<View>('home');
  const [lastOrderId,   setLastOrderId]   = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // ── Triple-click admin trigger ─────────────────────────────────
  const clickCountRef  = useRef<number>(0);
  const clickTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = (): void => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      setView('admin_login');
      return;
    }
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
  };

  const handleLogout = (): void => {
    logout();
    clearCart();
    setView('home');
  };

  const handleOrderSuccess = (orderId: number): void => {
    setLastOrderId(orderId);
    setView('order_success');
  };

  const hideChrome = view === 'admin_login' || view === 'admin_dashboard';

  // ── Navigation bar ─────────────────────────────────────────────
  const NavBar = (): ReactElement => (
    <header className="sticky top-0 z-40 bg-elvar-bg/95 backdrop-blur-sm border-b border-elvar-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="font-display text-xl md:text-2xl font-light tracking-widest text-elvar-cream select-none cursor-pointer hover:text-elvar-gold transition-colors duration-300"
          title="\u00C9lvar Clothing"
        >
          &Eacute;LVAR CLOTHING
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setView('home')}
            className={'font-body text-xs tracking-widest uppercase transition-colors ' +
              (view === 'home' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
          >
            Collection
          </button>
          {user && (
            <button
              onClick={() => setView('my_orders')}
              className={'font-body text-xs tracking-widest uppercase transition-colors ' +
                (view === 'my_orders' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
            >
              My Orders
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setView('admin_dashboard')}
              className="font-body text-xs tracking-widest uppercase text-elvar-gold hover:text-elvar-gold-light transition-colors"
            >
              Admin
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-elvar-muted font-body text-xs hidden lg:block">{user.name}</span>
              <button
                onClick={handleLogout}
                className="font-body text-xs tracking-widest uppercase text-elvar-muted hover:text-elvar-cream transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView('customer_login')}
              className="font-body text-xs tracking-widest uppercase text-elvar-muted hover:text-elvar-cream transition-colors"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => setView('cart')}
            className={'relative font-body text-xs tracking-widest uppercase transition-colors ' +
              (view === 'cart' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
          >
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 w-4 h-4 rounded-full bg-elvar-gold text-elvar-bg text-[9px] font-bold flex items-center justify-center leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="flex md:hidden items-center gap-4">
          <button onClick={() => setView('cart')} className="relative text-elvar-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-elvar-gold text-elvar-bg text-[9px] font-bold flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(p => !p)}
            className="text-elvar-muted hover:text-elvar-cream"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-elvar-surface border-t border-elvar-border px-6 py-4 space-y-4">
          {[
            { label: 'Collection', action: () => { setView('home'); setMobileMenuOpen(false); } },
            ...(user ? [{ label: 'My Orders', action: () => { setView('my_orders'); setMobileMenuOpen(false); } }] : []),
            ...(isAdmin ? [{ label: 'Admin Panel', action: () => { setView('admin_dashboard'); setMobileMenuOpen(false); } }] : []),
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="block w-full text-left font-body text-xs tracking-widest uppercase text-elvar-muted hover:text-elvar-cream transition-colors"
            >
              {item.label}
            </button>
          ))}
          {user ? (
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="block w-full text-left font-body text-xs tracking-widest uppercase text-elvar-muted hover:text-elvar-cream transition-colors"
            >
              Sign Out ({user.name})
            </button>
          ) : (
            <button
              onClick={() => { setView('customer_login'); setMobileMenuOpen(false); }}
              className="block w-full text-left font-body text-xs tracking-widest uppercase text-elvar-muted hover:text-elvar-cream transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );

  // ── Footer ──────────────────────────────────────────────────────
  const Footer = (): ReactElement => (
    <footer className="border-t border-elvar-border mt-20 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <p className="font-display text-2xl font-light text-elvar-cream mb-3">&Eacute;lvar Clothing</p>
            <p className="font-body text-xs text-elvar-muted leading-relaxed">
              Couture from the island. Crafted with intention,<br />worn with grace.
            </p>
          </div>
          <div>
            <p className="elvar-label mb-4">Navigate</p>
            <div className="space-y-2">
              {[
                { label: 'Collection',  action: () => setView('home') },
                { label: 'My Orders',   action: () => setView('my_orders') },
                { label: 'My Account',  action: () => user ? null : setView('customer_login') },
              ].map(l => (
                <button key={l.label} onClick={l.action} className="block font-body text-xs text-elvar-muted hover:text-elvar-cream transition-colors">
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="elvar-label mb-4">Boutique</p>
            <div className="space-y-1 font-body text-xs text-elvar-muted">
              <p>42 Galle Road, Colombo 03</p>
              <p>+94 11 234 5678</p>
              <p>hello@elvarclothing.lk</p>
              <p className="mt-3">Mon\u2013Sat  10:00 AM \u2013 8:00 PM</p>
              <p>Sun  11:00 AM \u2013 6:00 PM</p>
            </div>
          </div>
        </div>
        <div className="border-t border-elvar-border pt-6 flex flex-col sm:flex-row justify-between gap-2">
          <p className="font-body text-xs text-elvar-border">&copy; 2025 \u00C9lvar Clothing. All rights reserved.</p>
          <p className="font-body text-xs text-elvar-border">Sri Lanka</p>
        </div>
      </div>
    </footer>
  );

  // ── Admin Dashboard with gate ───────────────────────────────────
  if (view === 'admin_dashboard') {
    return (
      <AdminRoute onReject={() => setView('home')}>
        <AdminDashboard onLogout={handleLogout} />
      </AdminRoute>
    );
  }

  // ── Admin Login ─────────────────────────────────────────────────
  if (view === 'admin_login') {
    return (
      <AdminLogin
        onSuccess={() => setView('admin_dashboard')}
        onBack={() => setView('home')}
      />
    );
  }

  // ── Customer Login ──────────────────────────────────────────────
  if (view === 'customer_login') {
    return (
      <CustomerLogin
        onSuccess={() => setView('home')}
        onBack={() => setView('home')}
      />
    );
  }

  // ── Order success ───────────────────────────────────────────────
  if (view === 'order_success') {
    return (
      <div>
        <NavBar />
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 border border-elvar-gold flex items-center justify-center mb-8">
            <span className="text-elvar-gold text-2xl">&#10003;</span>
          </div>
          <p className="font-body text-xs tracking-widest3 uppercase text-elvar-muted mb-3">Thank You</p>
          <h1 className="font-display text-5xl font-light text-elvar-cream mb-4">
            Order Confirmed
          </h1>
          {lastOrderId && (
            <p className="font-body text-sm text-elvar-muted mb-2">Order #{lastOrderId}</p>
          )}
          <div className="gold-line mx-auto my-6" />
          <p className="font-body text-sm text-elvar-muted max-w-sm leading-relaxed">
            Your order has been received and is being processed. A confirmation email has been sent to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button onClick={() => setView('my_orders')} className="elvar-btn px-10">View My Orders</button>
            <button onClick={() => setView('home')}      className="elvar-btn-ghost px-10">Continue Shopping</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main chrome views ───────────────────────────────────────────
  return (
    <div>
      {!hideChrome && <NavBar />}

      {view === 'home' && (
        <Home onGoToCart={() => setView('cart')} />
      )}

      {view === 'cart' && (
        <CartPage
          onCheckout={() => setView('checkout')}
          onContinue={() => setView('home')}
          onLogin={()    => setView('customer_login')}
        />
      )}

      {view === 'checkout' && (
        <CheckoutForm
          onSuccess={handleOrderSuccess}
          onCancel={() => setView('cart')}
        />
      )}

      {view === 'my_orders' && (
        <MyOrders onBack={() => setView('home')} />
      )}

      {!hideChrome && <Footer />}
    </div>
  );
};

// ─── Root App with Providers ───────────────────────────────────────

const App = (): ReactElement => (
  <AuthProvider>
    <CartProvider>
      <InnerApp />
    </CartProvider>
  </AuthProvider>
);

export default App;
`);

// ─────────────────────────────────────────────────────────────────
//  Done
// ─────────────────────────────────────────────────────────────────
console.log('\n  \u2714  All files generated successfully!\n');
console.log('  Next steps:\n');
console.log('    1.  npm install');
console.log('    2.  npm run dev');
console.log('    3.  Open http://localhost:3000\n');
console.log('  Tip: Make sure your backend is running on http://localhost:5000\n');
console.log('  \u25C6  Secret admin trigger: triple-click "\u00C9LVAR CLOTHING" in the header within 2 seconds.\n');
