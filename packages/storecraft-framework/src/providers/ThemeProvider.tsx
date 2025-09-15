'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreConfig, ThemeConfig } from '../types';

interface ThemeContextValue {
  activeTheme: string;
  themeConfig: ThemeConfig | null;
  storeConfig: StoreConfig | null;
  switchTheme: (themeName: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ 
  children: React.ReactNode;
  config: StoreConfig;
}> = ({ children, config }) => {
  const [activeTheme, setActiveTheme] = useState(config.activeTheme);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemeConfig = async () => {
      try {
        // In a real implementation, this would load from the theme's config file
        const mockThemeConfig: ThemeConfig = {
          name: activeTheme,
          version: '1.0.0',
          author: {
            name: 'StoreCraft',
            email: 'team@storecraft.com'
          },
          description: `${activeTheme} theme for StoreCraft`,
          settings: {
            colors: {
              primary: '#3B82F6',
              secondary: '#6B7280',
              accent: '#F59E0B',
              background: '#FFFFFF',
              foreground: '#000000',
              muted: '#F3F4F6',
              mutedForeground: '#6B7280',
              border: '#E5E7EB',
              input: '#FFFFFF',
              ring: '#3B82F6',
              destructive: '#EF4444',
              destructiveForeground: '#FFFFFF'
            },
            typography: {
              fontFamily: 'Inter, sans-serif',
              headingFontFamily: 'Inter, sans-serif',
              fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem'
              }
            },
            spacing: {
              xs: '0.25rem',
              sm: '0.5rem',
              md: '1rem',
              lg: '1.5rem',
              xl: '2rem',
              '2xl': '3rem'
            },
            borderRadius: {
              none: '0',
              sm: '0.125rem',
              md: '0.375rem',
              lg: '0.5rem',
              full: '9999px'
            },
            layout: {
              maxWidth: '1200px',
              containerPadding: '1rem',
              headerHeight: '4rem',
              footerHeight: '8rem'
            }
          }
        };
        
        setThemeConfig(mockThemeConfig);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load theme config:', error);
        setIsLoading(false);
      }
    };

    loadThemeConfig();
  }, [activeTheme]);

  const switchTheme = (themeName: string) => {
    setActiveTheme(themeName);
    // In a real implementation, this would update the store.config.js file
    // For now, we just update the state
  };

  return (
    <ThemeContext.Provider value={{
      activeTheme,
      themeConfig,
      storeConfig: config,
      switchTheme,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};