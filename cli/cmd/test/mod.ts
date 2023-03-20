import { automate, cliffy } from '../../deps.ts';

const { config, constants, logging } = automate;
const log = logging.Category('automate.test');
const configFileName = constants.configFileName;
const configFile = constants.configFile;

/**
 * Action handler for command
 * This action generates a `deno test` command
 * for the workspace or package
 *
 * @param options
 */

// deno-lint-ignore no-explicit-any
const action = async (_options: any, path: string) => {
  // load the Automate config from the `path` directory
  let pkgFile = configFile;
  if (path !== '.') {
    path = Deno.realPathSync(path);
    pkgFile = `${path}/${configFileName}`;
  }
  log.info(`Testing package file ${pkgFile}`);
  const cfg = await config.loadAutomateConfig(pkgFile)
    .catch(err => {
      log.error(`Error loading ${pkgFile}`);
      throw err;
    });

  // skip first two args of Deno.args `test --`
  // and pass everything else to the run cmd
  // as `dent test [options]`
  const opts: string[] = [];
  if (Deno.args.length >= 2) {
    for (let i = 2; i < Deno.args.length; i++) {
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
    const memberPaths = members.map(function(memberPath: string) {
      if (memberPath.startsWith('./')) {
        memberPath = memberPath.replace('./', '');
      }
      const resolvedPath = `${path}/${memberPath}`;
      return Deno.realPathSync(resolvedPath);
    });

    // now check if each path is an Automate package
    // and merge package permissions if they exist
    for (const memberPath of memberPaths) {
      const packageFile = `${memberPath}/${configFileName}`;
      log.info(`Checking ${packageFile}`);
      const memberCfg = await config.loadAutomateConfig(packageFile)
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
  const runCmd = ['deno', 'test', ...permissions, ...opts, path];
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
    'Generate a `deno test [permissions] [path]` command using the permissions for the workspace or package file.',
  )
  .arguments('<path:string>')
  .option(
    '--',
    'Configure additional `deno test OPTIONS` directly after this flag',
    {},
  )
  .action(action);
