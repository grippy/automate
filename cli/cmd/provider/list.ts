import * as constants from '../../constants.ts';
import { automate, cliffy } from '../../deps.ts';

const { logging, yaml } = automate;
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
      registry.name,
      registry.description,
      registry.permissions.join(' '),
    ]);
  }
  console.log('');

  const table1 = new cliffy.Table()
    .header(['Registry'])
    .body([[automateRegistryDir]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table1.render();

  console.log('');

  console.log('Current list of installed providers...');
  const table2 = new cliffy.Table()
    .header(['Name', 'Description', 'Permissions'])
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
export const list = new cliffy.Command()
  .description('List provider packages stored in the registry')
  .action(action);
