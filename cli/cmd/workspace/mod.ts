import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { init } from './init.ts';

/**
 * Workspace command
 */
export const workspace = new Command()
  .command('init', init);
