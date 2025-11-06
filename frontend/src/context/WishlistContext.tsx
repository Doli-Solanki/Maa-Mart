import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = (productId: string) => wishlist.some((p) => p.id === productId);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]));
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const clearWishlist = () => setWishlist([]);

  const getTotalItems = () => wishlist.length;

  const value = useMemo(
    () => ({ wishlist, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist, getTotalItems }),
    [wishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
