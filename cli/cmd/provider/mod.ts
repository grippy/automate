import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { call } from './call.ts';
import { init } from './init.ts';
import { list } from './list.ts';
import { show } from './show.ts';

/**
 * Provider commands
 */
export const provider = new Command()
  .command('call', call)
  .command('init', init)
  .command('list', list)
  .command('show', show);
