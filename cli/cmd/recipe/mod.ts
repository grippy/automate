import { cliffy } from '../../deps.ts';
import { cook } from './cook.ts';
import { init } from './init.ts';

/**
 * Recipe command
 */
export const recipe = new cliffy.Command()
  .command('init', init)
  .command('cook', cook);
