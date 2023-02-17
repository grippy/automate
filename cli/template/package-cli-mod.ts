// Automate-generated file: {{ cli_mod }}
import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { logging, provider as prov } from '{{ automate_core_mod }} ';
import { initializeProvider } from '{{ package_mod }}';

// package variables
const packageType = '{{ package.type }}';
const packageName = '{{ package.name }}@{{ package.version }}';
const cliName = `${packageType}/${packageName}`;
// cli logger
const log = logging.Category(`${packageType}.${packageName}`);

const action = async (_options: any, cmd: string) => {
  const values = {};
  const provider: prov.Provider = await initializeProvider();
  log.info(`Calling ${cmd}`);
  const result = await provider[cmd](values);
  log.info(`Output: ${result}`);
};

// TODO: add value files loading and merging
// TODO: add --input-format --output-format options
// TODO: figure out how to deal with output values
const main = new Command()
  .name(cliName)
  .arguments('<cmd:string>')
  .description('Run package')
  .action(action)
  .parse(Deno.args);

if (import.meta.main) {
  await main;
}
