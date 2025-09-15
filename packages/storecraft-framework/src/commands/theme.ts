import fs from 'fs-extra';
import path from 'path';
import { prompt } from 'inquirer';
import chalk from 'chalk';

export async function theme(options: any = {}) {
  const rootDir = process.cwd();
  console.log('🎨 StoreCraft Theme Manager');

  if (options.create) {
    await createTheme(rootDir, options.create);
  } else if (options.list) {
    await listThemes(rootDir);
  } else {
    // Interactive mode
    const { action } = await prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Create a new theme', value: 'create' },
          { name: 'List available themes', value: 'list' },
          { name: 'Set active theme', value: 'activate' },
        ]
      }
    ]);

    if (action === 'create') {
      const { name } = await prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter the name for your new theme:',
          validate: (input) => input.trim() !== '' || 'Theme name is required'
        }
      ]);
      await createTheme(rootDir, name);
    } else if (action === 'list') {
      await listThemes(rootDir);
    } else if (action === 'activate') {
      await activateTheme(rootDir);
    }
  }
}

async function createTheme(rootDir: string, themeName: string) {
  const themesDir = path.join(rootDir, 'themes');
  const newThemeDir = path.join(themesDir, themeName);

  // Check if themes directory exists
  if (!fs.existsSync(themesDir)) {
    fs.mkdirSync(themesDir, { recursive: true });
  }

  // Check if theme already exists
  if (fs.existsSync(newThemeDir)) {
    console.error(chalk.red(`❌ Theme '${themeName}' already exists!`));
    return;
  }

  try {
    // Create theme directory structure
    fs.mkdirSync(newThemeDir, { recursive: true });
    fs.mkdirSync(path.join(newThemeDir, 'pages'), { recursive: true });
    fs.mkdirSync(path.join(newThemeDir, 'components'), { recursive: true });
    fs.mkdirSync(path.join(newThemeDir, 'styles'), { recursive: true });
    fs.mkdirSync(path.join(newThemeDir, 'public'), { recursive: true });

    // Create theme.json
    const themeConfig = {
      name: themeName,
      version: '1.0.0',
      description: `${themeName} theme for StoreCraft`,
      author: '',
      license: 'MIT',
    };

    fs.writeFileSync(
      path.join(newThemeDir, 'theme.json'), 
      JSON.stringify(themeConfig, null, 2)
    );

    // Create a sample home page
    const homePage = `export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${themeName} Home Page</h1>
      <p>Welcome to your new StoreCraft theme!</p>
    </div>
  );
}`;

    fs.writeFileSync(path.join(newThemeDir, 'pages', 'page.tsx'), homePage);

    // Create a sample global.css
    const globalCSS = `/* Global styles for ${themeName} theme */
html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

* {
  box-sizing: border-box;
}`;

    fs.writeFileSync(path.join(newThemeDir, 'styles', 'global.css'), globalCSS);

    console.log(chalk.green(`✅ Theme '${themeName}' created successfully!`));

    // Ask if user wants to set as active theme
    const { setActive } = await prompt([
      {
        type: 'confirm',
        name: 'setActive',
        message: `Would you like to set '${themeName}' as the active theme?`,
        default: true
      }
    ]);

    if (setActive) {
      const configPath = path.join(rootDir, 'storecraft.config.json');
      let config = {};
      
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      
      config = { 
        ...config,
        activeTheme: themeName
      };
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green(`✅ '${themeName}' is now the active theme!`));
    }

  } catch (error) {
    console.error(chalk.red(`❌ Failed to create theme '${themeName}':`), error);
  }
}

async function listThemes(rootDir: string) {
  const themesDir = path.join(rootDir, 'themes');
  
  if (!fs.existsSync(themesDir)) {
    console.log(chalk.yellow('⚠️ No themes directory found!'));
    return;
  }

  const themes = fs.readdirSync(themesDir).filter(item => {
    return fs.statSync(path.join(themesDir, item)).isDirectory();
  });

  if (themes.length === 0) {
    console.log(chalk.yellow('⚠️ No themes found!'));
    return;
  }

  // Get active theme
  let activeTheme = '';
  const configPath = path.join(rootDir, 'storecraft.config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    activeTheme = config.activeTheme || '';
  }

  console.log(chalk.bold('\nAvailable themes:'));
  themes.forEach(theme => {
    const isActive = theme === activeTheme;
    const themeJsonPath = path.join(themesDir, theme, 'theme.json');
    let description = '';
    
    if (fs.existsSync(themeJsonPath)) {
      const themeConfig = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
      description = themeConfig.description || '';
    }
    
    if (isActive) {
      console.log(`${chalk.green('✓')} ${chalk.bold(theme)} ${chalk.gray(`- ${description}`)} ${chalk.green('(active)')}`);
    } else {
      console.log(`  ${theme} ${chalk.gray(`- ${description}`)}`);
    }
  });
  console.log('');
}

async function activateTheme(rootDir: string) {
  const themesDir = path.join(rootDir, 'themes');
  
  if (!fs.existsSync(themesDir)) {
    console.log(chalk.yellow('⚠️ No themes directory found!'));
    return;
  }

  const themes = fs.readdirSync(themesDir).filter(item => {
    return fs.statSync(path.join(themesDir, item)).isDirectory();
  });

  if (themes.length === 0) {
    console.log(chalk.yellow('⚠️ No themes found to activate!'));
    return;
  }

  const { selectedTheme } = await prompt([
    {
      type: 'list',
      name: 'selectedTheme',
      message: 'Select a theme to activate:',
      choices: themes
    }
  ]);

  const configPath = path.join(rootDir, 'storecraft.config.json');
  let config = {};
  
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  
  config = { 
    ...config,
    activeTheme: selectedTheme
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green(`✅ '${selectedTheme}' is now the active theme!`));
}
