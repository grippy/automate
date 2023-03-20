import { automate, cliffy } from '../../deps.ts';

const { logging, constants } = automate;
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
    let pack;
    try {
      pack = (await import(regFileName, {
        assert: { type: 'json' },
      })).default;
    } catch (e: unknown) {
      log.error(`No registry package exists at ${regFileName}`);
      throw e;
    }

    // only display providers
    if (pack.cfg.package.type !== 'provider') {
      continue;
    }
    rows.push([
      pack.name,
      pack.cfg.package.description,
      pack.cfg.package.permissions.join(' '),
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
