import { ReactNode, ComponentType } from 'react'

// Theme Configuration Types
export interface ThemeConfig {
  name: string
  version: string
  description?: string
  author?: {
    name: string
    email?: string
    url?: string
  }
  license?: string
  keywords?: string[]
  homepage?: string
  repository?: string
  settings: ThemeSettings
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export interface ThemeSettings {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    foreground?: string
    muted?: string
    mutedForeground?: string
    border?: string
    input?: string
    ring?: string
    destructive?: string
    destructiveForeground?: string
    [key: string]: string | undefined
  }
  typography?: {
    fontFamily?: string
    headingFontFamily?: string
    fontSize?: {
      xs?: string
      sm?: string
      base?: string
      lg?: string
      xl?: string
      '2xl'?: string
      '3xl'?: string
      '4xl'?: string
      [key: string]: string | undefined
    }
    fontWeight?: {
      light?: string
      normal?: string
      medium?: string
      semibold?: string
      bold?: string
      [key: string]: string | undefined
    }
    lineHeight?: {
      tight?: string
      normal?: string
      relaxed?: string
      [key: string]: string | undefined
    }
  }
  spacing?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
    [key: string]: string | undefined
  }
  borderRadius?: {
    none?: string
    sm?: string
    md?: string
    lg?: string
    full?: string
    [key: string]: string | undefined
  }
  layout?: {
    maxWidth?: string
    containerPadding?: string
    headerHeight?: string
    footerHeight?: string
  }
  animations?: {
    duration?: {
      fast?: string
      normal?: string
      slow?: string
    }
    easing?: {
      ease?: string
      easeIn?: string
      easeOut?: string
      easeInOut?: string
    }
  }
  breakpoints?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
  customProperties?: Record<string, string | number | boolean>
}

// Component Override Types
export type ComponentOverride<P = any> = ComponentType<P>

export interface ComponentRegistry {
  [componentName: string]: ComponentOverride
}

export interface PageComponentProps {
  params?: Record<string, string | string[]>
  searchParams?: Record<string, string | string[] | undefined>
}

export interface ThemeProvider {
  name: string
  version: string
  components: ComponentRegistry
  pages: ComponentRegistry
  layouts: ComponentRegistry
  settings: ThemeSettings
  metadata?: ThemeMetadata
}

export interface ThemeMetadata {
  screenshots?: string[]
  demo?: string
  documentation?: string
  changelog?: string
  tags?: string[]
  category?: string
  price?: number
  license?: 'free' | 'premium' | 'custom'
}

// Theme Resolution Types  
export interface ThemeResolutionContext {
  activeTheme: string
  availableThemes: string[]
  themeDirectory: string
  cacheEnabled: boolean
}

export interface ComponentResolution {
  component: ComponentOverride | null
  source: 'theme' | 'framework' | 'default'
  path: string
  resolvedAt: number
}

export interface RouteResolution {
  component: ComponentOverride | null
  layout?: ComponentOverride | null
  source: 'theme' | 'framework' | 'default'
  path: string
  params?: Record<string, string>
}

// Theme Installation Types
export interface ThemeInstallation {
  name: string
  source: 'npm' | 'git' | 'local'
  version?: string
  url?: string
  path?: string
  installed: boolean
  installedAt?: string
  active: boolean
}

export interface ThemeManifest {
  themes: ThemeInstallation[]
  activeTheme: string
  lastUpdated: string
}

// Theme Development Types
export interface ThemeDevServer {
  port: number
  host: string
  hot: boolean
  open: boolean
}

export interface ThemeWatcher {
  enabled: boolean
  ignored: string[]
  extensions: string[]
}

export interface ThemeBuildConfig {
  entry: string
  output: string
  publicPath: string
  sourceMap: boolean
  minify: boolean
  target: string[]
}

// Framework Configuration Types
export interface StorecraftConfig {
  activeTheme: string
  themesDirectory?: string
  shopify: {
    domain: string
    storefrontAccessToken: string
    adminAccessToken?: string
    apiVersion?: string
  }
  features?: {
    cart?: boolean
    auth?: boolean
    search?: boolean
    wishlist?: boolean
    reviews?: boolean
    blog?: boolean
    analytics?: boolean
  }
  seo?: {
    titleTemplate?: string
    defaultTitle?: string
    defaultDescription?: string
    openGraph?: {
      type?: string
      locale?: string
      siteName?: string
    }
    twitter?: {
      handle?: string
      site?: string
      cardType?: string
    }
  }
  performance?: {
    imageOptimization?: boolean
    lazyLoading?: boolean
    prefetching?: boolean
    bundleAnalyzer?: boolean
  }
  development?: {
    devServer?: ThemeDevServer
    watcher?: ThemeWatcher
    showOverlay?: boolean
    logLevel?: 'error' | 'warn' | 'info' | 'debug'
  }
  build?: ThemeBuildConfig
  plugins?: string[]
  customSettings?: Record<string, unknown>
}

// Context Types
export interface ThemeContextValue {
  activeTheme: string
  themeConfig: ThemeConfig | null
  themeSettings: ThemeSettings
  switchTheme: (themeName: string) => Promise<void>
  availableThemes: string[]
  isLoading: boolean
  error: string | null
}

export interface FrameworkContextValue {
  config: StorecraftConfig
  isReady: boolean
  error: string | null
}

// Hook Types
export interface UseThemeReturn extends ThemeContextValue {}

export interface UseFrameworkReturn extends FrameworkContextValue {}

// Route Types
export interface RouteComponent {
  component: ComponentType<any>
  layout?: ComponentType<{ children: ReactNode }>
  loading?: ComponentType
  error?: ComponentType<{ error: Error }>
  metadata?: {
    title?: string
    description?: string
    keywords?: string[]
    openGraph?: Record<string, string>
  }
}

export interface RouteDefinition {
  path: string
  component: RouteComponent
  children?: RouteDefinition[]
}

// Plugin Types  
export interface PluginContext {
  config: StorecraftConfig
  isDevelopment: boolean
  isProduction: boolean
  webpack: any
}

export interface StoreCraftPlugin {
  name: string
  apply: (context: PluginContext) => void
}

// Error Types
export interface ThemeError extends Error {
  code: 'THEME_NOT_FOUND' | 'COMPONENT_NOT_FOUND' | 'INVALID_CONFIG' | 'BUILD_ERROR'
  theme?: string
  component?: string
  details?: Record<string, unknown>
}

export interface FrameworkError extends Error {
  code: 'CONFIG_ERROR' | 'SHOPIFY_ERROR' | 'BUILD_ERROR' | 'RUNTIME_ERROR'
  details?: Record<string, unknown>
}
