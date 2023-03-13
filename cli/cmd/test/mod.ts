import * as constants from '../../constants.ts';
import { automate, cliffy } from '../../deps.ts';

const { logging, record, yaml } = automate;
const log = logging.Category('automate.test');
const configFileName = constants.configFileName;
const configFile = constants.configFile;

const loadAutomateConfig = async (
  path: string,
): Promise<automate.config.AutomateConfig> => {
  const plain = await yaml.load(path);
  const cfg = record.ToInstance(automate.config.AutomateConfig, plain);
  cfg.convertTypes();
  return Promise.resolve(cfg);
};

/**
 * Action handler for command
 * This action generates a `deno test` command
 * for the workspace or package
 *
 * @param options
 */

const action = async (_options: any) => {
  // load the Automate config in the current directory
  const cfg = await loadAutomateConfig(configFile)
    .catch(err => {
      log.error(`Error loading ${configFile}`);
      throw err;
    });

  // skip first two args of Deno.args `test --`
  // and pass everything else to the run cmd
  // as `dent test [options]`
  let opts: string[] = [];
  if (Deno.args.length >= 2) {
    for (var i = 2; i < Deno.args.length; i++) {
      opts.push(Deno.args[i]);
    }
  }
  let permissions: string[] = [];
  if (cfg.workspace !== undefined) {
    // get workspace members so we can load permissions
    const members = cfg.workspace.members || [];

    // validate members...
    if (members.length === 0) {
      throw new Error('Workspace has no members');
    }
    // convert members to absolute paths
    const memberPaths = members.map(Deno.realPathSync);

    // now check if each path is an Automate package
    // and merge package permissions if they exist
    for (const path of memberPaths) {
      const packageFile = `${path}/${configFileName}`;
      const memberCfg = await loadAutomateConfig(packageFile)
        .catch(err => {
          log.error(`Error loading ${packageFile}`);
          throw err;
        });
      (memberCfg.package?.permissions || []).forEach(perm => {
        if (permissions.indexOf(perm) < 0) {
          permissions.push(perm);
        }
      });
    }
  } else {
    log.info('Testing package...');
    permissions = cfg.package?.permissions || [];
  }

  // generate deno test command
  // TODO: add pattern matching
  const runCmd = ['deno', 'test', ...permissions, ...opts, '.'];
  log.info(
    `running "${runCmd.join(' ')}"`,
  );

  // run the command....
  const p = Deno.run({
    cmd: runCmd,
  });
  const status = await p.status();
  log.info(`exit run cmd status ${status.code}`);
  Deno.exit(status.code);
};

/**
 * Test sub-command
 */
export const test = new cliffy.Command()
  .name('test')
  .description(
    'Generate a `deno test [permissions] .` command using the permissions for the workspace or package.',
  )
  .option(
    '--',
    'Configure additional `deno test OPTIONS` directly after this flag',
    {},
  )
  .action(action);
