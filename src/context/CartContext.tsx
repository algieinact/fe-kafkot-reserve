import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Menu, CartItem } from "../types";

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (menu: Menu, quantity: number) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (menuId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "kafkot_cart";

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (menu: Menu, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.menu.id === menu.id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item.menu.id === menu.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { menu, quantity }];
      }
    });
  };

  const removeItem = (menuId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.menu.id !== menuId));
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.menu.id === menuId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getItemQuantity = (menuId: string): number => {
    const item = cartItems.find((item) => item.menu.id === menuId);
    return item ? item.quantity : 0;
  };

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.menu.price * item.quantity,
    0
  );

  const value: CartContextType = {
    cartItems,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
