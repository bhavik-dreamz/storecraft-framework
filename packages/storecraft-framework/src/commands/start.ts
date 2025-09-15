import { execSync } from 'child_process';
import path from 'path';
import { resolveTheme } from '../../scripts/resolve-theme';

export function start() {
  const rootDir = process.cwd();
  console.log('🚀 Starting StoreCraft production server...');
  
  try {
    // Resolve theme and get config
    const config = resolveTheme(rootDir);
    
    // Set internal mode flag
    process.env.NEXT_CONFIG_INTERNAL = 'true';
    
    // Get path to framework's next start command
    const nextBinPath = path.join(__dirname, '../../node_modules/.bin/next');
    
    // Run next start
    console.log('▶️ Starting Next.js production server...');
    execSync(`${nextBinPath} start`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        STORECRAFT_CONFIG: JSON.stringify(config),
      }
    });
  } catch (error) {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  }
}
