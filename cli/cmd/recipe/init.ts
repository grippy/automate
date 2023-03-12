import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { logging, template } from '../../../core/src/mod.ts';
import * as constants from '../../constants.ts';

const log = logging.Category('automate.recipe');

const automatePackageNamespaceVerifier =
  constants.automatePackageNamespaceVerifier;
const automatePackageNameVerifier = constants.automatePackageNameVerifier;

const automateConfigFileName = 'Automate.yaml';
const automateConfig = `
# Package details...
package:
  type: recipe
  namespace: {{ namespace }}
  name: {{ name }}
  version: "0.0.0"
  description: |
    My new recipe description.

  # Deno permissions
  # https://deno.land/manual@v1.30.3/basics/permissions
  permissions: [
    --allow-read
    # --allow-env=<allow-env>,
    # --allow-sys=<allow-sys>,
    # --allow-hrtime,
    # --allow-net=<allow-net>,
    # --allow-ffi=<allow-ffi>,
    # --allow-read=<allow-read>,
    # --allow-run=<allow-run>,
    # --allow-write=<allow-write>,
    # --allow-all,
  ]

# Package dependencies...
dependencies:
  provider:
    # name1: "../"
    # name2:
    #   path: "../"
  recipe:
    # name1: "../"
    # name2:
    #   path: "../"
  template:
    # helpers:
    #   $: "../utils/mod.ts"

# Default recipe input values...
values:
  key1: value1

# Recipe definition
recipe:
  steps:
    # step1:
    #  - cmd: provider/name1/get
    #    in:
    #      arg1: "{{ step1arg1 }}"
    #    out: state.key1
`;

const gitIgnoreFileName = '.gitignore';
const gitIgnore = `
.automate/
`;

const readmeFileName = 'README.md';
const readme = `
# Provider: {{ namespace }}.{{ name }}
`;

/**
 * Action initializes a new workspace
 * @param options
 * @param path
 */
const action = (options: any, path: string) => {
  if (path === '/') {
    throw new Error("Writing to root isn't support for this command!");
  }

  log.info('Initialize recipe package...');

  // should check if path exists and already has these files
  if (path === '.') {
    path += '/';
  } else if (
    !path.startsWith('/') &&
    !path.startsWith('./')
  ) {
    // we have a relative path...
    // prepend with `./`
    path = `./${path}`;
  }

  // Check if path already exits
  log.debug(`Checking if path ${path} already exists.`);
  try {
    Deno.readDirSync(path);
    log.debug(`Path ${path} exists... skip making directory.`);
  } catch (e: Deno.errors.NotFound) {
    log.debug(`Create path ${path}...`);
    Deno.mkdirSync(path, { recursive: true });
  }

  // strip slash off the end so we can create file paths...
  if (path.endsWith('/')) {
    path = path.substring(0, path.lastIndexOf('/'));
  }
  // use absolute path from here on out...
  path = Deno.realPathSync(path);

  let namespace = options.namespace;
  if (namespace === undefined) {
    namespace = 'my.namespace';
  }
  if (!automatePackageNamespaceVerifier.test(namespace)) {
    throw new Error(
      'Package namespace should only contain alpha-numeric characters or periods. Namespace must not start or end with periods.',
    );
  }

  let name = options.name;
  if (name === undefined) {
    const parts = path.split('/');
    if (parts.length > 1) {
      name = parts[parts.length - 1];
      log.info(`Set package.name to ${name} (current directory name)`);
    }
  }
  if (name === undefined) {
    name = 'my-provider';
  }
  if (!automatePackageNameVerifier.test(name)) {
    throw new Error(
      'Package name should only contain alpha-numeric characters, periods, dashes, or underscores. Name must not start or end with periods, dashes, or underscores.',
    );
  }

  const writeFiles = [
    {
      fileName: `${path}/${automateConfigFileName}`,
      file: automateConfig,
      data: {
        namespace: namespace,
        name: name,
        step1arg1: '{{ $.utils.fn1(values.key1) }}',
      },
    },
    {
      fileName: `${path}/${readmeFileName}`,
      file: readme,
      data: { namespace: namespace, name: name },
    },
    {
      fileName: `${path}/${gitIgnoreFileName}`,
      file: gitIgnore,
      data: {},
    },
  ];

  if (options.force) {
    log.warn('Force creating files...');
  }

  for (const k in writeFiles) {
    const file = writeFiles[k];
    try {
      if (options.force) {
        throw new Deno.errors.NotFound();
      }
      Deno.readTextFileSync(file.fileName);
      log.warn(`File ${file.fileName} already exists, skipping it.`);
    } catch (e: Deno.errors.NotFound) {
      log.info(`Writing file ${file.fileName}`);
      const data = template.render(file.file, file.data);
      Deno.writeTextFileSync(file.fileName, data);
    }
  }

  log.info(
    'If this new package is a member of a workspace then please remember to add it to the workspace.members list.',
  );
  // TODO: log how to build and run recipes
};

/**
 * Provider init sub-command
 */
export const init = new Command()
  .description('Init new recipe package.')
  .arguments('<path:string>')
  .option(
    '-ns, --namespace <namespace:string>',
    'Set provider package namespace',
  )
  .option('-n, --name <name:string>', 'Set recipe package name')
  .option(
    '-f, --force [force:boolean]',
    'Force create package if it already exists',
    { default: false },
  )
  .action(action);
