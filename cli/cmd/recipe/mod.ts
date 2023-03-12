import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { cook } from './cook.ts';
import { init } from './init.ts';

/**
 * Recipe command
 */
export const recipe = new Command()
  .command('init', init)
  .command('cook', cook);
