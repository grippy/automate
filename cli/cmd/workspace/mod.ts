import { cliffy } from '../../deps.ts';
import { init } from './init.ts';

/**
 * Workspace command
 */
export const workspace = new cliffy.Command()
  .command('init', init);
