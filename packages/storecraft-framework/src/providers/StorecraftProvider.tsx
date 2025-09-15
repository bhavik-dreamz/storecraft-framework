'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { RootProvider } from './RootProvider';
import { StoreConfig } from '../types';

// Create a context for StoreCraft config
export interface StorecraftContextType {
  config: StoreConfig;
  theme: string;
}

const defaultConfig: StoreConfig = {
  activeTheme: 'default',
  shopify: {
    domain: '',
    storefrontAccessToken: '',
  }
};

const StorecraftContext = createContext<StorecraftContextType>({
  config: defaultConfig,
  theme: 'default'
});

export const useStorecraft = () => useContext(StorecraftContext);

export function StorecraftProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<StoreConfig>(defaultConfig);
  const [theme, setTheme] = useState<string>('default');

  useEffect(() => {
    // Fetch config if needed
    // For now, we'll just use what was resolved by the theme resolver
    const storecraftConfig = (window as any).__STORECRAFT_CONFIG__ || defaultConfig;
    setConfig(storecraftConfig);
    setTheme(storecraftConfig.activeTheme || 'default');
  }, []);

  return (
    <StorecraftContext.Provider value={{ config, theme }}>
      <RootProvider config={config}>
        {children}
      </RootProvider>
    </StorecraftContext.Provider>
  );
}
