import { automateRootDir } from '../../constants.ts';
import { automate, cliffy } from '../../deps.ts';

const { logging } = automate;
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
    const result = await cliffy.prompt([{
      name: 'confirm',
      message: `Are you sure you want to clean ${automateRootDir}?`,
      type: cliffy.Confirm,
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
export const clean = new cliffy.Command()
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
