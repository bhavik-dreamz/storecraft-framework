import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ThemeConfig, ThemeSettings, ThemeContextValue } from '../types/theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: string
  themesDirectory?: string
  availableThemes?: string[]
}

export function ThemeProvider({ 
  children, 
  initialTheme = 'default',
  themesDirectory = './themes',
  availableThemes = ['default']
}: ThemeProviderProps) {
  const [activeTheme, setActiveTheme] = useState(initialTheme)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load theme configuration
  const loadThemeConfig = useCallback(async (themeName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implement actual theme config loading
      // For now, return mock config
      const mockConfig: ThemeConfig = {
        name: themeName,
        version: '1.0.0',
        description: `${themeName} theme`,
        author: {
          name: 'StoreCraft Team',
          email: 'team@storecraft.com'
        },
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
      }

      setThemeConfig(mockConfig)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theme config')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load initial theme config
  useEffect(() => {
    loadThemeConfig(activeTheme)
  }, [activeTheme, loadThemeConfig])

  // Apply theme CSS custom properties
  useEffect(() => {
    if (typeof window === 'undefined' || !themeConfig?.settings) return

    const root = document.documentElement
    const settings = themeConfig.settings

    // Apply color variables
    if (settings.colors) {
      Object.entries(settings.colors).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--color-${key}`, value)
        }
      })
    }

    // Apply typography variables
    if (settings.typography) {
      if (settings.typography.fontFamily) {
        root.style.setProperty('--font-family', settings.typography.fontFamily)
      }
      if (settings.typography.headingFontFamily) {
        root.style.setProperty('--heading-font-family', settings.typography.headingFontFamily)
      }
      if (settings.typography.fontSize) {
        Object.entries(settings.typography.fontSize).forEach(([key, value]) => {
          if (value) {
            root.style.setProperty(`--font-size-${key}`, value)
          }
        })
      }
    }

    // Apply spacing variables
    if (settings.spacing) {
      Object.entries(settings.spacing).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--spacing-${key}`, value)
        }
      })
    }

    // Apply border radius variables
    if (settings.borderRadius) {
      Object.entries(settings.borderRadius).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--border-radius-${key}`, value)
        }
      })
    }

    // Apply layout variables
    if (settings.layout) {
      Object.entries(settings.layout).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--layout-${key}`, value)
        }
      })
    }

    // Apply custom properties
    if (settings.customProperties) {
      Object.entries(settings.customProperties).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, String(value))
      })
    }
  }, [themeConfig?.settings])

  const switchTheme = useCallback(async (themeName: string) => {
    if (!availableThemes.includes(themeName)) {
      setError(`Theme "${themeName}" is not available`)
      return
    }

    setActiveTheme(themeName)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('storecraft_active_theme', themeName)
    }
  }, [availableThemes])

  // Load saved theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('storecraft_active_theme')
      if (savedTheme && availableThemes.includes(savedTheme) && savedTheme !== activeTheme) {
        setActiveTheme(savedTheme)
      }
    }
  }, [availableThemes, activeTheme])

  const themeSettings: ThemeSettings = themeConfig?.settings || {
    colors: {},
    typography: {},
    spacing: {},
    borderRadius: {},
    layout: {},
  }

  const value: ThemeContextValue = {
    activeTheme,
    themeConfig,
    themeSettings,
    switchTheme,
    availableThemes,
    isLoading,
    error,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}