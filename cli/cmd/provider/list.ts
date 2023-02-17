import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { Table } from 'https://deno.land/x/cliffy@v0.25.7/table/mod.ts';
import { logging, yaml } from '../../../core/src/mod.ts';
import * as constants from '../../constants.ts';

const automateRegistryDir = constants.automateRegistryDir;

const log = logging.Category('automate.provider');

const action = async () => {
  // read all the files inside the registry directory
  // filter only providers

  let rows = [];
  for (const entry of Deno.readDirSync(automateRegistryDir)) {
    if (!entry.isFile) {
      continue;
    }

    const regFileName = `${automateRegistryDir}/${entry.name}`;
    const registry = await yaml.load(regFileName);
    if (registry.type !== 'provider') {
      continue;
    }
    rows.push([
      registry.type,
      registry.name,
      registry.description,
      registry.permissions.join(' '),
    ]);
  }
  console.log('');

  const table1 = new Table()
    .header(['Registry'])
    .body([[automateRegistryDir]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table1.render();

  console.log('');

  console.log('Current list of installed providers...');
  const table2 = new Table()
    .header(['Type', 'Name', 'Description', 'Permissions'])
    .body(rows)
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table2.sort();
  table2.render();
  console.log('');
};

/**
 * Provider list sub-command
 */
export const list = new Command()
  .description('List provider packages stored in the registry')
  .action(action);
