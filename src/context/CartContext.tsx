import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Menu, CartItem, SelectedVariation } from "../types";

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (menu: Menu, quantity: number, variations?: SelectedVariation[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (menuId: number) => number;
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

  const calculateItemPrice = (menu: Menu, variations?: SelectedVariation[]): number => {
    const basePrice = Number(menu.price) || 0;
    if (!variations || variations.length === 0) return basePrice;

    // Use 'price' property from SelectedVariation (updated type)
    const variationAdjustment = variations.reduce((sum, v) => sum + (Number(v.price) || 0), 0);
    return basePrice + variationAdjustment;
  };

  // Helper to check if two variation arrays are effectively the same
  const areVariationsEqual = (vars1?: SelectedVariation[], vars2?: SelectedVariation[]): boolean => {
    if (!vars1 && !vars2) return true;
    if (!vars1 || !vars2) return false;
    if (vars1.length !== vars2.length) return false;

    // Sort by group_name + option_name to ensure order doesn't matter
    const sorted1 = [...vars1].sort((a, b) => (a.group_name + a.option_name).localeCompare(b.group_name + b.option_name));
    const sorted2 = [...vars2].sort((a, b) => (a.group_name + a.option_name).localeCompare(b.group_name + b.option_name));

    return sorted1.every((v, i) =>
      v.group_name === sorted2[i].group_name &&
      v.option_name === sorted2[i].option_name &&
      v.price === sorted2[i].price
    );
  };

  const addItem = (menu: Menu, quantity: number, variations: SelectedVariation[] = []) => {
    setCartItems((prevItems) => {
      // Find exact same item (same menu and same variations)
      const existingItemIndex = prevItems.findIndex((item) =>
        item.menu.id === menu.id && areVariationsEqual(item.variations, variations)
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        const itemPrice = calculateItemPrice(menu, variations);
        const newItem: CartItem = {
          id: `${menu.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique instance ID
          menu,
          quantity,
          variations,
          total_price: itemPrice
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeItem = (cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getItemQuantity = (menuId: number): number => {
    // This now returns TOTAL quantity of a menu ID across all variations
    return cartItems
      .filter((item) => item.menu.id === menuId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => {
      const itemPrice = Number(item.total_price) || Number(item.menu.price) || 0;
      return sum + itemPrice * item.quantity;
    },
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
