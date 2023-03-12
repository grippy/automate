import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { Table } from 'https://deno.land/x/cliffy@v0.25.7/table/mod.ts';
import { logging, yaml } from '../../../core/src/mod.ts';
import * as constants from '../../constants.ts';

const automateRegistryDir = constants.automateRegistryDir;

const log = logging.Category('automate.provider');

const action = async (_options: any, name: string) => {
  // read all the files inside the registry directory
  // filter only providers

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

  console.log('');
  console.log('Registry');
  console.log('name:', registry.name);
  console.log('description:', registry.description);
  console.log('permissions:', registry.permissions);
  console.log('---');
  console.log('Package file', registry.package_file);
  console.log('---');
  console.log('Cli', registry.cli_mod);
  console.log('---');
  console.log('Package module', registry.package_mod);
  console.log('---');

  let pkg;
  try {
    pkg = await yaml.load(registry.package_file);
  } catch (err) {
    log.error(`No package file exists at ${registry.package_file}`);
    throw err;
  }

  const table1 = new Table()
    .header(['Registry file'])
    .body([[yaml.stringify(registry)]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table1.render();

  const table2 = new Table()
    .header(['Dependencies'])
    .body([[yaml.stringify(pkg.dependencies || {})]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table2.render();

  const table3 = new Table()
    .header(['Provider types/commands'])
    .body([[yaml.stringify(pkg.provider || {})]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table3.render();

  const table4 = new Table()
    .header(['Default Values'])
    .body([[yaml.stringify(pkg.values || {})]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table4.render();
};

/**
 * Provider show sub-command
 */
export const show = new Command()
  .arguments('<name:string>')
  .description(
    'Show provider package details for package name (i.e. type.namespace.name@version) stored in the registry',
  )
  .action(action);
