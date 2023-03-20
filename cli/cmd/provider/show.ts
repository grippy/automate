import { automate, cliffy } from '../../deps.ts';

const { logging, constants } = automate;
const automateRegistryDir = constants.automateRegistryDir;
const log = logging.Category('automate.provider.show');

const action = async (_options: any, name: string) => {
  // read all the files inside the registry directory
  // filter only providers
  const regFileName = `${automateRegistryDir}/${name}.json`;

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

  if (pack.cfg.package.type !== 'provider') {
    log.warn(`Package with ${name} isn't a provider.`);
    return;
  }

  const table1 = new cliffy.Table()
    .header([pack.name])
    .body([[pack.cfg.package.description]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table1.render();

  const table2 = new cliffy.Table()
    .header([`Registry`])
    .body([[JSON.stringify(pack.registry, null, 2)]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table2.render();

  const table3 = new cliffy.Table()
    .header([`Config`])
    .body([[JSON.stringify(pack.cfg, null, 2)]])
    .maxColWidth(200)
    .padding(1)
    .indent(0)
    .border(true);
  table3.render();
};

/**
 * Provider show sub-command
 */
export const show = new cliffy.Command()
  .arguments('<name:string>')
  .description(
    'Show provider package details for package name (i.e. type.namespace.name@version) stored in the registry',
  )
  .action(action);
