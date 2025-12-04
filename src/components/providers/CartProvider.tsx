'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  salePrice?: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  stockQuantity?: number;
  variantStock?: number;
  variants?: Array<{
    type: string;
    value: string;
    valueAr: string;
    stock?: number;
  }>;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => { success: boolean; message?: string };
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          // Silently handle error
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever items change (but not on initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    // Check stock availability first
    const availableStock = item.variantStock !== undefined ? item.variantStock : item.stockQuantity;
    
    if (availableStock !== undefined && availableStock <= 0) {
      return { success: false, message: 'Product is out of stock' };
    }

    const existingItem = items.find(
      cartItem => 
        cartItem.productId === item.productId &&
        cartItem.selectedSize === item.selectedSize &&
        cartItem.selectedColor === item.selectedColor
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + item.quantity;
      
      // Check if total quantity exceeds stock
      if (availableStock !== undefined && newQuantity > availableStock) {
        return { 
          success: false, 
          message: `Only ${availableStock} items available in stock` 
        };
      }
      
      setItems(items.map(cartItem =>
        cartItem.id === existingItem.id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
      return { success: true };
    } else {
      // Check if requested quantity exceeds stock
      if (availableStock !== undefined && item.quantity > availableStock) {
        return { 
          success: false, 
          message: `Only ${availableStock} items available in stock` 
        };
      }
      
      const newItem: CartItem = {
        ...item,
        id: `${item.productId}-${item.selectedSize || 'no-size'}-${item.selectedColor || 'no-color'}-${Date.now()}`,
      };
      setItems([...items, newItem]);
      return { success: true };
    }
  };

  const removeFromCart = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setItems(items.map(item => {
        if (item.id === id) {
          // Check stock availability
          const availableStock = item.variantStock !== undefined ? item.variantStock : item.stockQuantity;
          
          // If stock information is available, limit quantity to available stock
          if (availableStock !== undefined && quantity > availableStock) {
            quantity = availableStock;
          }
          
          return { ...item, quantity };
        }
        return item;
      }));
    }
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.salePrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
