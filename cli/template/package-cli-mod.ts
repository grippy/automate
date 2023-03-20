// Automate-generated file: {{ registry.cachePackageModFileName }}
import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import {
  logging,
  provider as prov,
  yaml,
} from '{{ registry.automateCoreMod }} ';

// dprint-ignore-start
{{#ifeq cfg.package.type 'provider' }}
import { initializeProvider } from '{{ registry.packageProviderMod }}';
{{else}}
import { initializeProvider } from '{{ registry.packageRecipeProviderMod }}';
{{/ifeq}}
// dprint-ignore-end

// package variables for {{ cfg.package.type }}
const packageValuesFile = '{{ registry.cachePackageValuesFileName }}';
const packageName = '{{ name }}';

// cli logger
const log = logging.Category(packageName);

// test if cmd is async or not...
const AsyncFunction = (async () => {}).constructor;
const isAsync = (
  // deno-lint-ignore ban-types
  fn: Function
): boolean => {
  return fn instanceof AsyncFunction;
};

const action = async (
  // deno-lint-ignore no-explicit-any
  options: any,
  cmd: string
) => {
  // debug ENV variables
  log.debug(`Current ENV variables ${JSON.stringify(Deno.env.toObject())}`);

  // Take values paths and merge them
  const valueFiles = [packageValuesFile].concat(options.value || []);
  log.debug('Merging value files', valueFiles);
  let values = {};
  try {
    values = await yaml.mergeLoad(valueFiles);
  } catch (err) {
    log.error(`Error merging value files ${JSON.stringify(valueFiles)}`);
    throw err;
  }

  // call provider command
  const provider: prov.Provider = await initializeProvider();
  log.info(`Calling provider.${cmd}`);
  // @ts-ignore: ignore 'any' type error
  const fn = provider[cmd];
  // does this cmd exist?
  if (fn === undefined) {
    throw new Error(`Provider ${packageName} has no command named ${cmd}`);
  }
  // we lost `this` context above to verify the cmd exists
  // bind fn with provider & values to add it back...
  const bound = fn.bind(provider, values);
  let result: unknown = null;

  // is this method async?
  if (isAsync(fn)) {
    result = await bound();
    if (typeof result === 'object') {
      result = JSON.stringify(result);
    }
    log.info(`Output: ${result}`);
  } else {
    result = bound();
    if (typeof result === 'object') {
      result = JSON.stringify(result);
    }
    log.info(`Output: ${result}`);
  }
  // TODO: use --output-file to write to disk?

};

const main = new Command()
  .name(packageName)
  .version('{{ cfg.package.version }}')
  .description('Run package cli')
  .arguments('<cmd:string>')
  .option(
    '-f, --value <value:string>',
    'Specify values in a YAML file or a URL(can specify multiple) (default [])',
    {
      collect: true,
    },
  )
  .option('-o, --output=<output:string>', 'Write output to file')
  .action(action)
  .parse(Deno.args);

if (import.meta.main) {
  await main;
}
