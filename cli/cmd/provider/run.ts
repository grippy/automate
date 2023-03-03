import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { logging, yaml } from '../../../core/src/mod.ts';
import * as constants from '../../constants.ts';
const automateRegistryDir = constants.automateRegistryDir;

const log = logging.Category('automate.provider');

/**
 * Action handler for command
 * This action generates a `deno run` command
 * to call provider commands with input
 *
 * @param options
 */

const action = async (
  options: any,
  name: string,
  cmd: string,
) => {
  const regFileName = `${automateRegistryDir}/${name}.yaml`;
  let registry;
  try {
    registry = await yaml.load(regFileName);
  } catch (err) {
    log.error(`No registry package exists at ${regFileName}`);
    throw err;
  }
  if (registry.type !== 'provider') {
    log.warn(`Package with ${name} isn't a provider.`);
    return;
  }
  const opts: string[] = [];

  // iterate options and

  const permissions = registry.permissions;
  const provider = registry.provider;
  let env = {};
  if (provider !== undefined && provider !== null) {
    env = provider.env;
  }

  // const p = Deno.run({
  //   cmd: ['deno', 'run', ...permissions, registry.cli_mod, ...opts],
  // });
  // const status = await p.status();
};

/**
 * Provider run sub-command
 */
export const run = new Command()
  .name('run')
  .arguments('<name:string> <cmd:string>')
  .description(
    'Run provider name@version cmd',
  )
  .action(action);
