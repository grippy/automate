import { automate, casing, cliffy } from '../../deps.ts';

const { logging, constants, template } = automate;
const log = logging.Category('automate.provider');

const automateCoreModPath = constants.automateCoreModPath;
const automatePackageNamespaceVerifier =
  constants.automatePackageNamespaceVerifier;
const automatePackageNameVerifier = constants.automatePackageNameVerifier;

// current directory
const dirname = new URL('.', import.meta.url).pathname;

// scaffolding...
// Automate.yaml example template
const automateConfigFileName = 'Automate.yaml';
const automateConfig = `
# Package details...
package:
  type: provider
  namespace: {{ namespace }}
  name: {{ name }}
  version: "0.0.0"
  description: |
    My new provider description.

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

# Default values go here...
values:
  env:
    HELLO: world
  key1: value1

# Provider types and command map
# This is only used to aid others
# with using this provider.
provider:
  types:
    MyType1:
      key1: string
      key2: number
      key3: MyType2
    MyType2:
      key1: string
  commands:
    cmd1:
      description: |
        This command works magic...
      in: MyType1
      out: MyType2
`;

// /* git ignore file */
// const gitIgnoreFileName = '.gitignore';
// const gitIgnore = `
// .automate/
// `;

// /* deno config */
// // TODO: add some default tasks here
// const denoJsonFileName = 'deno.jsonc';
// const denoJson = `
// {
//   "compilerOptions": {},
//   "tasks": {
//     "dev": "deno run --watch main.ts"
//   }
// }
// `;

// /* import map */
// // TODO: do we need this?
// const importMapFileName = 'import_map.json';
// const importMap = `
// {
//   "imports": {}
// }
// `;

/* README */
const readmeFileName = 'README.md';
const readme = `
# Provider: {{ namespace }}.{{ name }}
`;

/* New provider module */
const packageModuleFileName = 'mod.ts';
const packageModuleFileTemplate: string = Deno.readTextFileSync(
  `${dirname}/../../template/provider-mod.ts`,
);

/* New provider module test */
const packageModuleTestFileName = 'mod_test.ts';
const packageModuleTestFileTemplate: string = Deno.readTextFileSync(
  `${dirname}/../../template/provider-mod-test.ts`,
);

/**
 * Action initializes a new workspace
 * @param options
 * @param path
 */
const action = (options: any, path: string) => {
  if (path === '/') {
    throw new Error("Writing to root isn't support for this command!");
  }
  log.info('Initialize provider package...');
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

  // Get the name/namespace of the project.
  // and pick a default it doesn't exist.

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
      comment: 'Generate Automate.yaml',
      fileName: `${path}/${automateConfigFileName}`,
      file: automateConfig,
      data: {
        namespace: namespace,
        name: name,
      },
    },
    {
      comment: 'Generate README.me',
      fileName: `${path}/${readmeFileName}`,
      file: readme,
      data: {
        namespace: namespace,
        name: name,
      },
    },
    // {
    //   comment: 'Generate .gitignore',
    //   fileName: `${path}/${gitIgnoreFileName}`,
    //   file: gitIgnore,
    //   data: {},
    // },
    // {
    //   comment: 'Generate deno.jsonc',
    //   fileName: `${path}/${denoJsonFileName}`,
    //   file: denoJson,
    //   data: {},
    // },
    // {
    //   comment: 'Generate import_map.json',
    //   fileName: `${path}/${importMapFileName}`,
    //   file: importMap,
    //   data: {},
    // },
    {
      comment: 'Generate mod.ts',
      fileName: `${path}/${packageModuleFileName}`,
      file: packageModuleFileTemplate,
      data: {
        automate_core_mod: automateCoreModPath,
        className: `Provider${casing.pascalCase(name)}`,
        namespace: namespace,
        name: name,
      },
    },
    {
      comment: 'Generate mod_test.ts',
      fileName: `${path}/${packageModuleTestFileName}`,
      file: packageModuleTestFileTemplate,
      data: {
        className: `Provider${casing.pascalCase(name)}`,
        namespace: namespace,
        name: name,
      },
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
  // TODO: add instructions on how to build ad run this package
};

/**
 * Provider init sub-command
 */
export const init = new cliffy.Command()
  .description('Init new provider package.')
  .arguments('<path:string>')
  .option(
    '--namespace <namespace:string>',
    'Set provider package namespace',
  )
  .option('-n, --name <name:string>', 'Set provider package name')
  .option(
    '-f, --force [force:boolean]',
    'Force create package if it already exists',
    { default: false },
  )
  .action(action);
