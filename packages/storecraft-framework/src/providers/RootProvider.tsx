'use client';

import React from 'react';
import { CartProvider } from './CartProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { StoreConfig } from '../types';

interface RootProviderProps {
  children: React.ReactNode;
  config: StoreConfig;
}

export const RootProvider: React.FC<RootProviderProps> = ({ children, config }) => {
  return (
    <ThemeProvider config={config}>
      <AuthProvider config={config}>
        <CartProvider config={config}>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
