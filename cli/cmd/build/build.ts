import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import {
  config,
  logging,
  record,
  template,
  yaml,
} from '../../../core/src/mod.ts';
import * as constants from '../../constants.ts';

// setup logger
const log = logging.Category('automate.build');

// constants used to build packages
const automateCacheDir = constants.automateCacheDir;
const automateCoreModPath = constants.automateCoreModPath;
const automateRegistryDir = constants.automateRegistryDir;
const automateRootDir = constants.automateRootDir;
const automatePackageNamespaceVerifier =
  constants.automatePackageNamespaceVerifier;
const automatePackageNameVerifier = constants.automatePackageNameVerifier;
const configFile = constants.configFile;
const configFileName = constants.configFileName;

// current directory for this file
const dirname = new URL('.', import.meta.url).pathname;

// cache template used for caching packages and registry
const packageRegistryFileTemplate: string = Deno.readTextFileSync(
  `${dirname}/../../template/registry-package.yaml`,
);

const packageCachePackageModFileTemplate: string = Deno.readTextFileSync(
  `${dirname}/../../template/package-cli-mod.ts`,
);

// Prevent cyclic dependencies.
let BUILT = new Set<string>();

const loadAutomateConfig = async (
  path: string,
): Promise<config.AutomateConfig> => {
  const plain = await yaml.load(path);
  const cfg = record.ToInstance(config.AutomateConfig, plain);
  cfg.convertTypes();
  return Promise.resolve(cfg);
};

const mkDirs = (dirs: string[]) => {
  dirs.forEach(path => {
    try {
      Deno.readDirSync(path);
      log.debug(`Path ${path} exists... skip making directory.`);
    } catch (e: Deno.errors.NotFound) {
      log.info(`Create path ${path}...`);
      Deno.mkdirSync(path, { recursive: true });
    }
  });
};

const setupAutomateDirs = () => {
  // setup automate directory structures
  const dirs = [automateRootDir, automateCacheDir, automateRegistryDir];
  mkDirs(dirs);
};

/**
 * BuildWorkspace
 * @param workspace
 * @returns
 */

const buildWorkspace = async (
  workspace: config.Workspace,
): Promise<unknown> => {
  const members = workspace.members || [];

  // validate members...
  if (members.length === 0) {
    throw new Error('Workspace has no members');
  }
  // convert members to absolute paths
  const memberPaths = members.map(Deno.realPathSync);

  // now check if each path is an Automate package
  for (const path of memberPaths) {
    const packageFile = `${path}/${configFileName}`;
    const result = await buildPackage(packageFile);
    log.info(`call buildPackage: ${result}`);
  }

  return Promise.resolve('OK');
};

/**
 * @param packageFile
 *
 * Building a package file does the following:
 * - Creates ~/.automate directory
 * - Copies package/Automate.yaml => ~/.automate/cache/{name}@{version}/Automate.yaml
 * - Creates ~/.automate/cache/{name}@{version}/values.yaml from `package.values`
 * - Creates cli module ~/.automate/cache/{name}@{version}/mod.ts
 * - Creates registry entry ~/.automate/registry/{name}@{version}.yaml
 *    - This contains meta details about the package and pointers to the cache mod.ts
 */

const buildPackage = async (packageFile: string) => {
  if (BUILT.has(packageFile)) {
    log.debug(`Package already built ${packageFile}, moving on...`);
    return Promise.resolve(`SKIPPED`);
  }

  log.info(`Building package file ${packageFile}`);
  const cfg = await loadAutomateConfig(packageFile)
    .catch(err => {
      log.error(`Error loading ${packageFile}`);
      throw err;
    });

  // setup automate directory structures
  setupAutomateDirs();

  // check if package exists
  if (cfg.package === undefined) {
    throw new Error('Package missing package definition');
  }

  // we should have a package name
  const pkg = cfg.package;

  // we should have a package namespace
  if (pkg.namespace === undefined || pkg.namespace === null) {
    throw new Error(
      'Package namespace is missing',
    );
  }
  // verify namespace naming convention
  if (!automatePackageNamespaceVerifier.test(pkg.namespace)) {
    throw new Error(
      'Package namespace should only contain alpha-numeric characters or periods. Namespace must not start or end with periods.',
    );
  }

  if (pkg.name === undefined || pkg.name === null) {
    throw new Error(
      'Package name is missing',
    );
  }

  // verify name naming convention
  if (!automatePackageNameVerifier.test(pkg.name)) {
    throw new Error(
      'Package name should only contain alpha-numeric characters, periods, dashes, or underscores. Name must not start or end with periods, dashes, or underscores.',
    );
  }

  if (pkg.type === undefined || ['recipe', 'provider'].indexOf(pkg.type) < 0) {
    throw new Error(
      `
      Package ${pkg.name} is missing a type or type isn't defined properly.
      Only types allowed are 'recipe' or 'provider'`,
    );
  }

  // we need the path to the package module
  const packagePath = packageFile.replace(`/${configFileName}`, '');
  const packageMod = `${packagePath}/mod.ts`;
  const packageVersion =
    `${pkg.type}.${pkg.namespace}.${pkg.name}@${pkg.version}`;
  const packageCacheDir = `${automateCacheDir}/${packageVersion}`;
  const packageCachePackageConfigFileName = `${packageCacheDir}/Automate.yaml`;
  const packageCachePackageValuesFileName = `${packageCacheDir}/values.yaml`;
  const packageCachePackageFileName = `${packageCacheDir}/mod.ts`;
  const packageRegistryFileName =
    `${automateRegistryDir}/${packageVersion}.yaml`;

  // generate values.yaml file..
  // we remove the top-level `values:` object
  let values = {};
  if (cfg.values !== undefined) {
    values = cfg.values;
  }

  // convert provider types/commands to yaml
  let provider = '';
  if (cfg.provider !== undefined) {
    let types = {};
    let commands = {};
    if (cfg.provider.types !== undefined && cfg.provider.types !== null) {
      types = Object.fromEntries(cfg.provider.types);
    }
    if (cfg.provider.commands !== undefined && cfg.provider.commands !== null) {
      commands = Object.fromEntries(cfg.provider.commands);
    }
    const prov = {
      provider: {
        types: Object.keys(types).length > 0 ? types : null,
        commands: Object.keys(commands).length > 0 ? commands : null,
      },
    };
    provider = yaml.stringify(prov);
  }

  const registryPkg = {
    package: pkg,
    provider: provider,
    package_file: packageFile,
    package_values_file: packageCachePackageValuesFileName,
    registry_file: packageRegistryFileName,
    automate_core_mod: automateCoreModPath,
    package_mod: packageMod,
    cli_mod: packageCachePackageFileName,
  } as config.RegistryPackage;

  const packageCachePackageFile = template.render(
    packageCachePackageModFileTemplate,
    registryPkg,
  );

  const packageRegistryFile = template.render(
    packageRegistryFileTemplate,
    registryPkg,
  );

  // make package cache dir...
  mkDirs([packageCacheDir]);

  // copy package/Automate.yaml
  log.info(`Caching ${packageFile}`);
  Deno.copyFileSync(packageFile, packageCachePackageConfigFileName);
  // create cli wrapper
  log.info(`Building package module ${packageCachePackageFileName}`);
  Deno.writeTextFileSync(packageCachePackageFileName, packageCachePackageFile);
  log.info(`Building package registry file ${packageRegistryFileName}`);
  Deno.writeTextFileSync(packageRegistryFileName, packageRegistryFile);

  log.info(`Writing package values into ${packageCachePackageValuesFileName}`);
  Deno.writeTextFileSync(
    packageCachePackageValuesFileName,
    yaml.stringify(values),
  );

  console.log(cfg);

  // mark this as done
  BUILT.add(packageFile);

  // iterate all deps and build packages for them
  if (cfg.dependencies !== undefined) {
    const deps = cfg.dependencies;
    if (deps.provider !== undefined) {
      buildDep(packageFile, deps.provider);
    }
    if (deps.recipe !== undefined) {
      buildDep(packageFile, deps.recipe);
    }
  }

  return Promise.resolve(`Done building ${packageFile}`);
};

/**
 * Build dependency for packageFile
 * @param packageFile
 * @param packageType:
 * @returns
 */
const buildDep = async (
  packageFile: string,
  packageType: undefined | Map<string, string | config.Dependency>,
) => {
  if (packageType === undefined || packageType === null) {
    return;
  }
  for (const [key, value] of packageType.entries()) {
    log.debug(`Working on dep key ${key} w/ value ${value}`);
    let path = null;
    if (typeof value === 'string') {
      path = value;
    } else if (value instanceof config.Dependency) {
      path = value.path;
    }
    if (path === undefined || path === null) {
      throw new Error('Package dependency is missing a path');
    }

    // TODO: handle http urls
    // we have a path to install... c
    // check if it exists...
    // is this path relative?
    let pathPrefix = '';
    if (path.startsWith('..')) {
      pathPrefix = packageFile.replace('Automate.yaml', '');
    }

    let depPath = `${pathPrefix}${path}`;
    try {
      depPath = Deno.realPathSync(depPath);
    } catch (err: Deno.errors.NotFound) {
      throw new Error(`
      Provider dep ${key} has a path ${depPath} that can't be found.
      Please fix ${packageFile} to make this work.`);
    }

    const depPkgFile = `${depPath}/${configFileName}`;
    log.info(`Dep path verified ${depPkgFile}`);
    try {
      const result = await buildPackage(depPkgFile);
      log.debug('build dep result', result);
    } catch (err) {
      log.error(
        `Error building provider dependency key ${key} pointing to ${depPkgFile}`,
      );
      throw err;
    }
  }
};

/**
 * Action handler for command
 * @param options
 */
const action = async (options: any) => {
  // log.info(`Reading ${configFile}`);
  // Read the Automate.yaml yaml file...
  const cfg = await loadAutomateConfig(configFile)
    .catch(err => {
      log.error(`Error loading ${configFile}`);
      throw err;
    });
  // console.log(cfg);
  if (cfg.workspace !== undefined) {
    log.info('Build workspace...');
    const result = await buildWorkspace(cfg.workspace).catch(err => {
      throw err;
    });
    log.info(`Build workspace ${result}.`);
  } else {
    // we have a standalone package (provider/recipe)
    const packageFile = `${Deno.cwd()}/${configFileName}`;
    const result = await buildPackage(packageFile);
    log.info(`${result}`);
  }
};

/**
 * Build call sub-command
 */
export const build = new Command()
  .description('Build the current workspace or package')
  .action(action);
