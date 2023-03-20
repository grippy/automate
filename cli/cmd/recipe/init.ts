import { automate, cliffy } from '../../deps.ts';

const { constants, logging, pkg, template2 } = automate;
const log = logging.Category('automate.recipe.init');

const automatePackageNamespaceVerifier =
  constants.automatePackageNamespaceVerifier;
const automatePackageNameVerifier = constants.automatePackageNameVerifier;

const automateConfigFileName = constants.configFileName;
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
    --allow-env,
    --allow-read,
    --allow-run,
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

# Recipe definition...
# 'steps:' defaults to an empty object.
# (uncomment once ready to add something)
recipe:
  steps: {}
  # steps:
  #   step1:
  #     - name: one
  #       description: |
  #         This step does the following...
  #       dep: provider.name1
  #       cmd: get
  #       in:
  #         arg1: {{ step1_one_arg1 }}
  #       out: key2

  #     - name: two
  #       description: |
  #         This step does the following...
  #       dep: provider.name1
  #       cmd: get
  #       in:
  #         arg1: {{ step1_two_arg1 }}
  #       out:
`;

const readmeFileName = 'README.md';
const readme = `
# Recipe: {{ pack.name }}
`;

type WriteFile = {
  comment: string;
  fileName: string;
  file: string;
  data: Record<string, unknown>;
};

/**
 * `write` scaffold files
 * @param files
 * @param force
 */
const write = (files: WriteFile[], force: boolean) => {
  for (const k in files) {
    const file = files[k];
    try {
      if (force) {
        throw new Deno.errors.NotFound();
      }
      Deno.readTextFileSync(file.fileName);
      log.warn(`File ${file.fileName} already exists, skipping it.`);
    } catch (e: unknown) {
      if (e instanceof Deno.errors.NotFound) {
        log.info(`Writing file ${file.fileName}`);
        const data = template2.render(file.file, file.data);
        Deno.writeTextFileSync(file.fileName, data);
      }
    }
  }
};

/**
 * Action initializes a new workspace
 * @param options
 * @param path
 */
const action = async (
  // deno-lint-ignore no-explicit-any
  options: any,
  path: string,
  name?: string,
  namespace?: string,
) => {
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
  } catch (e: unknown) {
    if (e instanceof Deno.errors.NotFound) {
      log.debug(`Create path ${path}...`);
      Deno.mkdirSync(path, { recursive: true });
    }
  }

  // strip slash off the end so we can create file paths...
  if (path.endsWith('/')) {
    path = path.substring(0, path.lastIndexOf('/'));
  }
  // use absolute path from here on out...
  path = Deno.realPathSync(path);

  if (namespace === undefined) {
    namespace = 'my.namespace';
  }
  if (!automatePackageNamespaceVerifier.test(namespace)) {
    throw new Error(
      'Package namespace should only contain alpha-numeric characters or periods. Namespace must not start or end with periods.',
    );
  }

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

  if (options.force) {
    log.warn('Force creating files...');
  }

  const pkgFile = `${path}/${automateConfigFileName}`;
  const writeConfig = [
    {
      comment: 'Write Automate.yaml',
      fileName: pkgFile,
      file: automateConfig,
      data: {
        namespace: namespace,
        name: name,
        step1_one_arg1: '{{ values.key1 }}',
        step1_two_arg1: '{{ state.key2 }}',
      },
    },
  ];

  write(writeConfig, options.force);

  const pack = await pkg.Package.fromPath(pkgFile);
  pack.cfg.validatePackage();

  const writeReadme = [{
    comment: 'Write README.md',
    fileName: `${path}/${readmeFileName}`,
    file: readme,
    data: { pack },
  }];

  write(writeReadme, options.force);

  log.info(
    'If this new package is a member of a workspace then please remember to add it to the workspace.members list.',
  );

  // TODO: show how to build and run recipes
  // with notes examples...
};

/**
 * Recipe init sub-command
 */
export const init = new cliffy.Command()
  .description('Init new recipe package.')
  .arguments('<path:string>')
  .option(
    '--namespace <namespace:string>',
    'Set recipe package namespace',
  )
  .option('-n, --name <name:string>', 'Set recipe package name')
  .option(
    '-f, --force [force:boolean]',
    'Force create package if it already exists',
    { default: false },
  )
  .action(action);
