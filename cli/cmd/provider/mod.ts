import { cliffy } from '../../deps.ts';
import { init } from './init.ts';
import { list } from './list.ts';
import { run } from './run.ts';
import { show } from './show.ts';

/**
 * Provider commands
 */
export const provider = new cliffy.Command()
  .command('run', run)
  .command('init', init)
  .command('list', list)
  .command('show', show);
