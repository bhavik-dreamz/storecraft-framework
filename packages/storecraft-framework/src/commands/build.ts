import { execSync } from 'child_process';
import path from 'path';
import { resolveTheme } from '../../scripts/resolve-theme';

export function build() {
  const rootDir = process.cwd();
  console.log('🏗️ Building StoreCraft application...');
  
  try {
    // Resolve theme and get config
    const config = resolveTheme(rootDir);
    
    // Set internal mode flag
    process.env.NEXT_CONFIG_INTERNAL = 'true';
    
    // Get path to framework's next build command
    const nextBinPath = path.join(__dirname, '../../node_modules/.bin/next');
    
    // Run next build
    console.log('▶️ Running Next.js build...');
    execSync(`${nextBinPath} build`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        STORECRAFT_CONFIG: JSON.stringify(config),
      }
    });
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}
