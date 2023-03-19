import { automate, cliffy } from '../../deps.ts';

const { logging, constants, yaml } = automate;
const automateRegistryDir = constants.automateRegistryDir;
const log = logging.Category('automate.recipe.run');

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
) => {
  log.debug(
    `provider run ${name} w/ options ${JSON.stringify(options)}`,
  );
  const regFileName = `${automateRegistryDir}/${name}.json`;
  let pkg;
  try {
    pkg = await yaml.load(regFileName);
  } catch (err) {
    log.error(`No registry package exists at ${regFileName}`);
    throw err;
  }
  if (pkg.cfg.package.type !== 'recipe') {
    log.warn(`Package ${name} isn't a recipe.`);
    return;
  }

  // skip first four args of Deno.args
  // and pass everything else to the run cmd as the options
  const opts: string[] = [];
  if (Deno.args.length >= 3) {
    for (let i = 3; i < Deno.args.length; i++) {
      opts.push(Deno.args[i]);
    }
  }

  // Iterate options and generate the run command
  // for calling the provider cli module
  // - pass deno permissions
  // - format env variables

  // read registry permissions for this package
  const permissions = pkg.cfg.package.permissions || [];

  // merge values files for this package so we can
  // properly set the ENV variables if they exist
  const valueFiles = [pkg.registry.cachePackageValuesFileName].concat(
    options.value || [],
  );
  log.debug('Merging value files', valueFiles);
  let values = { env: {} };
  try {
    values = await yaml.mergeLoad(valueFiles);
  } catch (err) {
    log.error(`Error merging value files ${JSON.stringify(valueFiles)}`);
    throw err;
  }
  const env = values['env'] || {};
  log.debug(`Merged ENV variables ${JSON.stringify(env)}`);

  // generate run command
  const runCmd = [
    'deno',
    'run',
    ...permissions,
    pkg.registry.cachePackageModFileName,
    'cook',
    ...opts,
  ];

  log.info(
    `Running "${runCmd.join(' ')}" w/ ENV ${JSON.stringify(env)}`,
  );

  // We skip trying to read and work with
  // the stdout here because we can't control
  // what is sent to stdout. So it becomes impossible
  // to work with the cmd response unless we do something
  // whacky with how its formatted. Instead, if instructed,
  // we should tell have the program we call capture its
  // output and save it to disk.

  // run the command....
  const p = Deno.run({
    cmd: runCmd,
    env: env,
  });
  const status = await p.status();
  log.info(`exit run cmd status ${status.code}`);
  Deno.exit(status.code);
};

/**
 * Provider run sub-command
 */
export const run = new cliffy.Command()
  .name('run')
  .description(
    'Run recipe name@version',
  )
  .arguments('<name:string>')
  .option(
    '-f, --value=<value:string>',
    'Specify values in a YAML file (can specify multiple) (default [])',
    {
      collect: true,
    },
  )
  .option('-o, --output=<output:string>', 'Write output to file')
  .action(action);
