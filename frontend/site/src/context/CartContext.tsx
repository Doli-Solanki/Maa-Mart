import React, { createContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCartItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const getTotalPrice = () =>
    cartItems.reduce((t, i) => t + i.product.price * i.quantity, 0);

  const getTotalItems = () => cartItems.reduce((t, i) => t + i.quantity, 0);

  const clearCart = () => setCartItems([]);

  const value = useMemo(
    () => ({ cartItems, addToCart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart }),
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
