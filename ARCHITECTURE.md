# Theme-Based Architecture for StoreCraft Framework

This document outlines the new theme-based architecture for StoreCraft Framework, which abstracts away Next.js configuration while still providing full access to Next.js capabilities.

## Core Principles

1. **Framework-Owned Next.js Configuration**: End users never see or modify Next.js configuration files.
2. **Theme-Based Development**: Users only need to focus on creating themes with pages, components, and styles.
3. **Simplified Project Structure**: User projects only contain themes and configuration.

## Architecture Overview

### Framework Package Structure

```
storecraft-framework/
├── app/                    # Internal Next.js App Router
│   ├── layout.tsx          # Root layout with StorecraftProvider
│   └── page.tsx            # Default home page
├── dist/                   # Compiled framework code
├── node_modules/           # Dependencies
├── scripts/                # Framework scripts
│   └── resolve-theme.ts    # Theme resolver script
├── src/                    # Framework source code
│   ├── cli.ts              # CLI entry point
│   ├── commands/           # CLI commands
│   ├── components/         # Core components
│   ├── lib/                # Framework libraries
│   ├── providers/          # React context providers
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── templates/              # Project templates
├── themes/                 # Default themes
├── next.config.js          # Internal Next.js config
├── package.json
└── tsconfig.json
```

### End User Project Structure

```
my-store/
├── themes/                 # User themes
│   ├── default/            # Default theme
│   └── my-theme/           # Custom theme
├── storecraft.config.json  # StoreCraft configuration
├── package.json
└── .env.local              # Environment variables
```

## How It Works

### Theme Resolution

1. When a StoreCraft command is executed, the theme resolver script runs first.
2. The resolver reads the `storecraft.config.json` file to determine the active theme.
3. Theme files are copied from the themes directory into the framework's internal app structure.
4. Next.js then boots with these files, treating them as if they were always part of the app.

### CLI Commands

The StoreCraft CLI wraps Next.js commands:

- `storecraft dev` → Resolves theme, then runs `next dev`
- `storecraft build` → Resolves theme, then runs `next build`
- `storecraft start` → Resolves theme, then runs `next start`

### Theme Overrides

When a theme includes a file (e.g., `pages/page.tsx`), it overrides the framework's default file. This allows themes to fully customize the storefront while still leveraging the framework's core functionality.

## Benefits

- **Simplified Development Experience**: Users only need to focus on building their theme.
- **Framework Upgrades**: The framework can be upgraded without affecting user themes.
- **Theme Swapping**: Themes can be easily swapped by changing the `activeTheme` in the config.
- **Next.js Power**: Users still get all the benefits of Next.js without the complexity.

## Implementation Steps

1. ✅ Create scripts directory with theme resolver
2. ✅ Create internal app directory with default files
3. ✅ Update next-plugin.ts to use theme resolver
4. ✅ Create CLI commands that wrap Next.js commands
5. ✅ Add theme management commands
6. ✅ Update package.json with new dependencies and bin entries
7. ✅ Create StorecraftProvider for app integration
