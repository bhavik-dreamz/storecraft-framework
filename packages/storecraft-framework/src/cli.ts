#!/usr/bin/env node

import { Command } from 'commander';
import { serve } from './commands/serve';
import { dev } from './commands/dev';
import { build } from './commands/build';
import { start } from './commands/start';
import { theme } from './commands/theme';

const program = new Command();

program
  .name('storecraft')
  .description('StoreCraft Framework CLI')
  .version('1.0.0');

program
  .command('serve')
  .description('Start StoreCraft services (legacy)')
  .action(() => {
    serve();
  });

program
  .command('dev')
  .description('Start StoreCraft development server')
  .action(() => {
    dev();
  });

program
  .command('build')
  .description('Build StoreCraft application for production')
  .action(() => {
    build();
  });

program
  .command('start')
  .description('Start StoreCraft production server')
  .action(() => {
    start();
  });

program
  .command('theme')
  .description('Manage StoreCraft themes')
  .option('-c, --create <name>', 'Create a new theme with the given name')
  .option('-l, --list', 'List all available themes')
  .action((options) => {
    theme(options);
  });

program.parse(process.argv);
