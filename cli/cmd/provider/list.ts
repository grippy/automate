import { automate, cliffy } from '../../deps.ts';

const { logging, constants, yaml } = automate;
const automateRegistryDir = constants.automateRegistryDir;

const log = logging.Category('automate.provider.list');

const action = async () => {
  // read all the files inside the registry directory
  // filter only providers

  const rows = [];
  for (const entry of Deno.readDirSync(automateRegistryDir)) {
    if (!entry.isFile) {
      continue;
    }

    // read the registry file
    const regFileName = `${automateRegistryDir}/${entry.name}`;

    // load the registry package file from json
    const pkg = (await import(regFileName, {
      assert: { type: 'json' },
    })).default;

    // only display providers
    if (pkg.cfg.package.type !== 'provider') {
      continue;
    }
    rows.push([
      pkg.name,
      pkg.cfg.package.description,
      pkg.cfg.package.permissions.join(' '),
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
