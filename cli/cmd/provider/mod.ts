import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { init } from './init.ts';
import { list } from './list.ts';
import { run } from './run.ts';
import { show } from './show.ts';

/**
 * Provider commands
 */
export const provider = new Command()
  .command('run', run)
  .command('init', init)
  .command('list', list)
  .command('show', show);
