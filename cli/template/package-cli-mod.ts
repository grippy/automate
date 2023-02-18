// Automate-generated file: {{ cli_mod }}
import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { logging, provider as prov, yaml } from '{{ automate_core_mod }} ';
import { initializeProvider } from '{{ package_mod }}';

// package variables
const packageFile = '{{ package_file }}';
const packageValuesFile = '{{ package_values_file }}';
const packageType = '{{ package.type }}';
const packageName = '{{ package.name }}@{{ package.version }}';
const cliName = `${packageType}/${packageName}`;

// cli logger
const log = logging.Category(`${packageType}.${packageName}`);

// test if cmd is async or not...
const AsyncFunction = (async () => {}).constructor;
const isAsync = (fn: Function): boolean => {
  return fn instanceof AsyncFunction;
};

const action = async (options: any, cmd: string) => {
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

  // is this method async?
  const call = provider[cmd];
  if (isAsync(call)) {
    const result = await call(values);
    log.info(`Output: ${result}`);
  } else {
    const result = call(values);
    log.info(`Output: ${result}`);
  }
};

// TODO: add --input-format --output-format options
// TODO: figure out how to deal with output values
const main = new Command()
  .name(cliName)
  .arguments('<cmd:string>')
  .option(
    '-f, --value <value:string>',
    'Specify values in a YAML file or a URL(can specify multiple) (default [])',
    {
      collect: true,
    },
  )
  .option('-o, --output <output:string>', 'Write output to file')
  .description('Run package')
  .action(action)
  .parse(Deno.args);

if (import.meta.main) {
  await main;
}
