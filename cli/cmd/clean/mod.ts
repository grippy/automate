import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import {
  Confirm,
  prompt,
} from 'https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts';

import { config, logging, record, yaml } from '../../../core/src/mod.ts';
import { automateRootDir } from '../../constants.ts';

const log = logging.Category('automate.clean');

/**
 * Clean .automate directory
 *
 * @param options
 */

const action = async (
  options: any,
) => {
  if (!options.force) {
    const result = await prompt([{
      name: 'confirm',
      message: `Are you sure you want to clean ${automateRootDir}?`,
      type: Confirm,
    }]);
    // set force to result.confirm
    options.force = result.confirm;
  }

  if (options.force) {
    try {
      Deno.removeSync(automateRootDir, { recursive: true });
    } catch (e: Deno.errors.NotFound) {
    }
    Deno.mkdirSync(automateRootDir);
    log.info('done');
  } else {
    log.info('skipped');
  }
};

/**
 * Clean command
 */
export const clean = new Command()
  .name('clean')
  .option(
    '-f, --force [force:boolean]',
    'Force clean AUTOMATE_HOME directory no-prompt',
    { default: false },
  )
  .description(
    'Cleans AUTOMATE_HOME directory',
  )
  .action(action);
