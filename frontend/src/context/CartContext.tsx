import React, {
  createContext, useCallback, useContext,
  useEffect, useMemo, useRef, useState
} from 'react';
import { CartItem, Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export interface CartTotals {
  subtotal: number;
  gst: number;       // 18%
  total: number;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  cartTotals: CartTotals;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/* ─── Guest localStorage helpers (no user = guest) ──────────────────────────── */
const GUEST_KEY = 'cart_guest';

const loadGuest = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]'); } catch { return []; }
};
const saveGuest = (items: CartItem[]) =>
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
const clearGuest = () => localStorage.removeItem(GUEST_KEY);

/* ─── Server response shape ──────────────────────────────────────────────────── */
interface ServerItem {
  productId: string;
  productName: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  quantity: number;
}

const toCartItems = (rows: ServerItem[]): CartItem[] =>
  rows.map((r) => ({
    product: {
      id: r.productId,
      name: r.productName,
      price: r.price,
      image: r.image,
      description: r.description,
      category: '',
      categoryId: '',
      rating: 0,
      reviews: 0,
      inStock: r.stock > 0,
      stock: r.stock,
    } as Product,
    quantity: r.quantity,
  }));

/* ─── GST calculation (pure function) ───────────────────────────────────────── */
const GST_RATE = 0.18;
const calcTotals = (items: CartItem[]): CartTotals => {
  const subtotal = parseFloat(
    items.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2)
  );
  const gst = parseFloat((subtotal * GST_RATE).toFixed(2));
  return { subtotal, gst, total: parseFloat((subtotal + gst).toFixed(2)) };
};

/* ─── Context ────────────────────────────────────────────────────────────────── */
export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isDB = useRef(false);    // true when user is logged in and using DB cart

  /* ── Effect 1: SYNC wipe on user identity change ────────────────────────────
   * Fires synchronously — no async gap — so old user's items are never visible. */
  useEffect(() => {
    if (authLoading) return;
    setCartItems([]);
    isDB.current = false;
  }, [user?.id, authLoading]);

  /* ── Effect 2: ASYNC load correct cart ──────────────────────────────────────*/
  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      setLoading(true);
      try {
        if (user && token) {
          /* Logged-in → use DB */
          const guestItems = loadGuest();
          if (guestItems.length > 0) {
            // Merge guest items into user's DB cart
            const payload = guestItems.map((ci) => ({
              productId: ci.product.id,
              quantity: ci.quantity,
            }));
            const merged = await apiRequest('/cart/sync', {
              method: 'POST',
              body: JSON.stringify({ items: payload }),
            });
            clearGuest();
            setCartItems(toCartItems(merged));
          } else {
            const rows = await apiRequest('/cart');
            setCartItems(toCartItems(rows));
          }
          isDB.current = true;
        } else {
          /* Guest → use localStorage */
          setCartItems(loadGuest());
          isDB.current = false;
        }
      } catch (err) {
        console.error('[CartContext]', err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user?.id, token, authLoading]);

  /* ── Cart drawer ─────────────────────────────────────────────────────────── */
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  /* ── Mutations ───────────────────────────────────────────────────────────── */
  const addToCart = useCallback(async (product: Product, qty = 1) => {
    if (isDB.current) {
      const updated = await apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      setCartItems(toCartItems(updated));
    } else {
      setCartItems((prev) => {
        const exists = prev.find((i) => i.product.id === product.id);
        const next = exists
          ? prev.map((i) => i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty } : i)
          : [...prev, { product, quantity: qty }];
        saveGuest(next);
        return next;
      });
    }
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    if (isDB.current) {
      const updated = await apiRequest(`/cart/${productId}`, { method: 'DELETE' });
      setCartItems(toCartItems(updated));
    } else {
      setCartItems((prev) => {
        const next = prev.filter((i) => i.product.id !== productId);
        saveGuest(next);
        return next;
      });
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    if (isDB.current) {
      const updated = await apiRequest(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      setCartItems(toCartItems(updated));
    } else {
      setCartItems((prev) => {
        const next = prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        );
        saveGuest(next);
        return next;
      });
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    if (isDB.current) await apiRequest('/cart', { method: 'DELETE' });
    clearGuest();
    setCartItems([]);
  }, []);

  /* ── Derived values ──────────────────────────────────────────────────────── */
  const cartTotals = useMemo(() => calcTotals(cartItems), [cartItems]);
  const getTotalItems = useCallback(() => cartItems.reduce((s, i) => s + i.quantity, 0), [cartItems]);
  const getTotalPrice = useCallback(() => cartTotals.subtotal, [cartTotals]);

  const value = useMemo(() => ({
    cartItems, loading, cartTotals, isCartOpen,
    openCart, closeCart,
    addToCart, removeFromCart, updateQuantity, clearCart,
    getTotalItems, getTotalPrice,
  }), [cartItems, loading, cartTotals, isCartOpen,
    openCart, closeCart, addToCart, removeFromCart, updateQuantity, clearCart,
    getTotalItems, getTotalPrice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be inside CartProvider');
  return ctx;
};
