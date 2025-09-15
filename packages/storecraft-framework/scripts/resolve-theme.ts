/**
 * Theme Resolver Script
 * 
 * This script is responsible for:
 * 1. Reading the storecraft.config.json from the root project
 * 2. Resolving the active theme
 * 3. Copying or symlinking theme files into the framework's internal app structure
 * 
 * It runs before Next.js boots to ensure all theme files are in place.
 */
import fs from 'fs-extra';
import path from 'path';
import { log } from 'console';

export interface StorecraftConfig {
  activeTheme: string;
  shopify: {
    domain: string;
    storefrontAccessToken: string;
  };
  [key: string]: any;
}

/**
 * Resolves and applies the active theme from the project root
 * 
 * @param rootDir The project root directory
 * @returns The StoreCraft configuration object
 */
export function resolveTheme(rootDir: string): StorecraftConfig {
  console.log('🔍 Resolving theme from:', rootDir);
  
  // Default config in case no config file exists
  const defaultConfig: StorecraftConfig = {
    activeTheme: 'default',
    shopify: {
      domain: '',
      storefrontAccessToken: ''
    }
  };

  // Path to the config file
  const configPath = path.join(rootDir, 'storecraft.config.json');
  
  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.warn('⚠️ No storecraft.config.json found. Using default configuration.');
    return defaultConfig;
  }
  
  // Read and parse the config file
  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent) as StorecraftConfig;
    
    // Set default theme if not specified
    if (!config.activeTheme) {
      config.activeTheme = 'default';
    }
    
    console.log(`✅ Found config. Active theme: ${config.activeTheme}`);
    
    // Get paths
    const themePath = path.join(rootDir, 'themes', config.activeTheme);
    
    // Framework paths (relative to this script)
    const frameworkDir = path.join(__dirname, '..');
    const internalAppDir = path.join(frameworkDir, 'app');
    const internalSrcDir = path.join(frameworkDir, 'src');
    const internalComponentsDir = path.join(internalSrcDir, 'components');
    
    // Create the app directory if it doesn't exist
    if (!fs.existsSync(internalAppDir)) {
      fs.mkdirpSync(internalAppDir);
      console.log('📁 Created internal app directory');
    }
    
    // Theme directories
    const themePageDir = path.join(themePath, 'pages');
    const themeComponentsDir = path.join(themePath, 'components');
    const themeLayoutsDir = path.join(themePath, 'layouts');
    const themePublicDir = path.join(themePath, 'public');
    const themeStylesDir = path.join(themePath, 'styles');
    
    // Copy theme pages to internal app directory if they exist
    if (fs.existsSync(themePageDir)) {
      console.log('📄 Copying theme pages...');
      fs.copySync(themePageDir, internalAppDir, { 
        overwrite: true,
        recursive: true
      });
    }
    
    // Copy theme components to internal components directory if they exist
    if (fs.existsSync(themeComponentsDir)) {
      console.log('🧩 Copying theme components...');
      fs.copySync(themeComponentsDir, internalComponentsDir, { 
        overwrite: true,
        recursive: true
      });
    }
    
    // Copy theme layouts to internal layouts directory if they exist
    if (fs.existsSync(themeLayoutsDir)) {
      console.log('🏗️ Copying theme layouts...');
      const internalLayoutsDir = path.join(internalAppDir, 'layouts');
      fs.ensureDirSync(internalLayoutsDir);
      fs.copySync(themeLayoutsDir, internalLayoutsDir, { 
        overwrite: true,
        recursive: true
      });
    }
    
    // Copy theme public assets if they exist
    if (fs.existsSync(themePublicDir)) {
      console.log('🖼️ Copying theme public assets...');
      const internalPublicDir = path.join(frameworkDir, 'public');
      fs.ensureDirSync(internalPublicDir);
      fs.copySync(themePublicDir, internalPublicDir, { 
        overwrite: true,
        recursive: true
      });
    }
    
    // Copy theme styles if they exist
    if (fs.existsSync(themeStylesDir)) {
      console.log('🎨 Copying theme styles...');
      const internalStylesDir = path.join(internalSrcDir, 'styles');
      fs.ensureDirSync(internalStylesDir);
      fs.copySync(themeStylesDir, internalStylesDir, { 
        overwrite: true,
        recursive: true
      });
    }
    
    console.log('✅ Theme resolution complete');
    return config;
  } catch (error) {
    console.error('❌ Error resolving theme:', error);
    return defaultConfig;
  }
}

/**
 * Cleanup function to remove any temporary files created during theme resolution
 */
export function cleanupTheme(): void {
  // Add cleanup logic if needed
}

// If this script is run directly (for testing)
if (require.main === module) {
  const rootDir = process.argv[2] || process.cwd();
  resolveTheme(rootDir);
}
