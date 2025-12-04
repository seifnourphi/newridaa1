'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  image: string;
  slug: string;
  addedAt: Date;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsedItems = JSON.parse(savedWishlist).map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));
          setItems(parsedItems);
        } catch (error) {
          console.error('Error loading wishlist from localStorage:', error);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Save wishlist to localStorage whenever items change (but not on initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToWishlist = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    const existingItem = items.find(wishlistItem => wishlistItem.productId === item.productId);

    if (!existingItem) {
      const newItem: WishlistItem = {
        ...item,
        id: `wishlist-${item.productId}-${Date.now()}`,
        addedAt: new Date(),
      };
      setItems([...items, newItem]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const getWishlistCount = () => {
    return items.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
