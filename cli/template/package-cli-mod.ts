// Automate-generated file: {{ cli_mod }}
import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { logging, provider as prov, yaml } from '{{ automate_core_mod }} ';
import { initializeProvider } from '{{ package_mod }}';

// package variables
const packageFile = '{{ package_file }}';
const packageValuesFile = '{{ package_values_file }}';
const packageName =
  '{{ package.type }}.{{ package.namespace }}.{{ package.name }}@{{ package.version }}';

// cli logger
const log = logging.Category(packageName);

// test if cmd is async or not...
const AsyncFunction = (async () => {}).constructor;
const isAsync = (fn: Function): boolean => {
  return fn instanceof AsyncFunction;
};

const action = async (options: any, cmd: string) => {
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
  log.info(`Calling ${cmd}`);

  const callCmd = provider[cmd];
  // does this cmd exist?
  if (callCmd === undefined) {
    throw new Error(`Provider ${packageName} has no command named ${cmd}`);
  }

  // is this method async?
  let result: any = null;
  if (isAsync(callCmd)) {
    result = await callCmd(values);
    if (typeof result === 'object') {
      result = JSON.stringify(result);
    }
    log.info(`Output: ${result}`);
  } else {
    result = callCmd(values);
    if (typeof result === 'object') {
      result = JSON.stringify(result);
    }
    log.info(`Output: ${result}`);
  }
  // TODO: use --output-file to write to disk?
};

// TODO: add --input-format option
// TODO: add --output-format option
// TODO: add --output-file option for writing to cmd result to disk

// TODO: figure out how to deal with output values
const main = new Command()
  .name(packageName)
  .version('{{ package.version }}')
  .description('Run package')
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
