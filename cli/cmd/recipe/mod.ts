import { cliffy } from '../../deps.ts';
import { init } from './init.ts';
import { run } from './run.ts';

/**
 * Recipe command
 */
export const recipe = new cliffy.Command()
  .command('init', init)
  .command('run', run);
