#!/usr/bin/env node

import { Command } from 'commander';
import { serve } from './commands/serve';

const program = new Command();

program
  .name('storecraft')
  .description('StoreCraft Framework CLI')
  .version('1.0.0');

program
  .command('serve')
  .description('Start StoreCraft services')
  .action(() => {
    serve();
  });

program.parse(process.argv);
