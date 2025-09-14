import React from 'react'
import { CartProvider } from './CartProvider'
import { AuthProvider } from './AuthProvider'
import { ThemeProvider } from './ThemeProvider'
import { StorecraftConfig } from '../types/theme'

interface RootProviderProps {
  children: React.ReactNode
  config: StorecraftConfig
}

export function RootProvider({ children, config }: RootProviderProps) {
  return (
    <ThemeProvider
      initialTheme={config.activeTheme}
      availableThemes={['default', 'modern']} // TODO: Load from filesystem
    >
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Re-export all providers and hooks
export { CartProvider, useCart } from './CartProvider'
export { AuthProvider, useAuth } from './AuthProvider' 
export { ThemeProvider, useTheme } from './ThemeProvider'
