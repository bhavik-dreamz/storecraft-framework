'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Cart, CartLine, UseCartReturn, StoreConfig } from '../types';
import { getShopifyAPI } from '../lib/shopify/api';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

type CartAction = 
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_LINE'; payload: { lineId: string; quantity: number } }
  | { type: 'REMOVE_LINE'; payload: string };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_CART':
      return { ...state, cart: null };
    case 'UPDATE_LINE':
      if (!state.cart) return state;
      const updatedLines = state.cart.lines.map(line => 
        line.id === action.payload.lineId 
          ? { ...line, quantity: action.payload.quantity }
          : line
      );
      return {
        ...state,
        cart: { ...state.cart, lines: updatedLines }
      };
    case 'REMOVE_LINE':
      if (!state.cart) return state;
      const filteredLines = state.cart.lines.filter(line => line.id !== action.payload);
      return {
        ...state,
        cart: { ...state.cart, lines: filteredLines }
      };
    default:
      return state;
  }
};

const CartContext = createContext<UseCartReturn | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode; config?: StoreConfig }> = ({ children, config }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    isLoading: false,
    error: null
  });

  const shopifyAPI = config ? getShopifyAPI(config) : null;

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const cartId = localStorage.getItem('storecraft-cart-id');
        
        if (cartId && shopifyAPI) {
          const cart = await shopifyAPI.getCart(cartId);
          dispatch({ type: 'SET_CART', payload: cart });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
      }
    };

    loadCart();
  }, []);

  const addItem = async (variantId: string, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!shopifyAPI) throw new Error('Shopify API not initialized');
      let cartId = state.cart?.id;
      
      if (!cartId) {
        // Create new cart
        const newCart = await shopifyAPI.createCart([]);
        const updatedCart = await shopifyAPI.addToCart(newCart.id, [
          { merchandiseId: variantId, quantity }
        ]);
        localStorage.setItem('storecraft-cart-id', updatedCart.id);
        dispatch({ type: 'SET_CART', payload: updatedCart });
      } else {
        // Add to existing cart
        const updatedCart = await shopifyAPI.addToCart(cartId, [
          { merchandiseId: variantId, quantity }
        ]);
        dispatch({ type: 'SET_CART', payload: updatedCart });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    }
  };

  const removeItem = async (lineId: string) => {
    if (!state.cart) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (!shopifyAPI) throw new Error('Shopify API not initialized');
      const updatedCart = await shopifyAPI.removeFromCart(state.cart.id, [lineId]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const updateItem = async (lineId: string, quantity: number) => {
    if (!state.cart) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (!shopifyAPI) throw new Error('Shopify API not initialized');
      const updatedCart = await shopifyAPI.updateCartLines(state.cart.id, [
        { id: lineId, quantity }
      ]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item quantity' });
    }
  };

  const clearCart = async () => {
    localStorage.removeItem('storecraft-cart-id');
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      cart: state.cart,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      isLoading: state.isLoading,
      error: state.error
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): UseCartReturn => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};