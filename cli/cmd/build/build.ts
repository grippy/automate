import { config } from '../../../core/mod.ts';
import { automate, cliffy } from '../../deps.ts';
const {
  constants,
  logging,
  pkg,
  template2,
  yaml,
} = automate;

const Package = pkg.Package;

// track what packages we're built
const BUILT = new Set<string>();

// setup logger
const log = logging.Category('automate.build');

// constants used to build packages
const automateCacheDir = constants.automateCacheDir;
const automateRegistryDir = constants.automateRegistryDir;
const automateRootDir = constants.automateRootDir;
const configFile = constants.configFile;
const configFileName = constants.configFileName;

// current directory for this file
const dirname = new URL('.', import.meta.url).pathname;

/**
 * Make directories
 * @param dirs
 */
const mkDirs = (dirs: string[]) => {
  dirs.forEach(path => {
    try {
      Deno.readDirSync(path);
      log.debug(`Path ${path} exists... skip making directory.`);
    } catch (err: unknown) {
      if (err instanceof Deno.errors.NotFound) {
        log.info(`Create path ${path}`);
        Deno.mkdirSync(path, { recursive: true });
      }
    }
  });
};

/**
 * Setup Automate directories
 */
const setupAutomateDirs = () => {
  // setup automate directory structures
  const dirs = [
    automateRootDir,
    automateCacheDir,
    automateRegistryDir,
  ];
  mkDirs(dirs);
};

/**
 * BuildWorkspace
 * @param workspace
 * @returns
 */

const buildWorkspace = async (
  path: string,
  workspace: automate.config.Workspace,
): Promise<unknown> => {
  // convert members to absolute paths
  const members = workspace.members;
  const memberPaths = members.map(function(memberPath: string) {
    if (memberPath.startsWith('./')) {
      memberPath = memberPath.replace('./', '');
    }
    const resolvedPath = `${path}/${memberPath}`;
    return Deno.realPathSync(resolvedPath);
  });

  // now check if each path is an Automate package
  for (const memberPath of memberPaths) {
    const packageFile = `${memberPath}/${configFileName}`;
    const pack = await pkg.Package.fromPath(packageFile);
    const result = await buildPackage(pack);
    log.debug(`Call buildPackage result: ${result}`);
  }

  return Promise.resolve('OK');
};

/**
 * buildPackage
 * @param Package
 *
 * Building a package file does the following for Providers[P] and Recipes[R]:
 * - [P & R] Creates ~/.automate directory
 * - [P & R] Copies {package}/Automate.yaml => ~/.automate/cache/{type}.{namespace}.{name}@{version}/Automate.yaml
 * - [P & R] Creates ~/.automate/cache/{type}.{namespace}.{name}@{version}/values.yaml from `package.values`
 * - [P & R] Creates cli module ~/.automate/cache/{type}.{namespace}.{name}@{version}/mod.ts
 * - [P & R] Creates cli module ~/.automate/cache/{type}.{namespace}.{name}@{version}/mod.ts
 * - [P & R] Creates registry entry ~/.automate/registry/{type}.{namespace}.{name}@{version}.yaml
 *    - This contains meta details about the package and pointers to the cache mod.ts
 * - [R] Generate RecipeProvider provider module from Recipe.yaml
 *       => ~/.automate/cache/{type}.{namespace}.{name}@{version}/provider/mod.ts
 */

const buildPackage = async (pack: automate.pkg.Package) => {
  const packageFile = pack.cfgPath;

  if (BUILT.has(packageFile)) {
    log.debug(`Package already built ${packageFile}, moving on...`);
    return Promise.resolve(`SKIPPED`);
  }

  log.info(`Building package ${packageFile}`);

  // setup automate directory structures
  setupAutomateDirs();

  // convert package to object
  const registryPkg = pack.toObject();

  // cache template used for caching packages and registry
  // registry/{type}.{namespace}.{name}@{version}.json
  const packageRegistryFileTemplate: string = Deno.readTextFileSync(
    `${dirname}/../../template/registry-package.json`,
  );
  const packageRegistryFile = template2.render(
    packageRegistryFileTemplate,
    {
      registryPkg: registryPkg,
    },
  );

  // cli mod.ts
  const packageCachePackageModFileTemplate: string = Deno.readTextFileSync(
    `${dirname}/../../template/package-cli-mod.ts`,
  );
  const packageCachePackageModFile = template2.render(
    packageCachePackageModFileTemplate,
    registryPkg,
  );

  // Create `provider` package files
  const {
    cacheDir,
    cachePackageConfigFileName,
    cachePackageModFileName,
    cachePackageValuesFileName,
    registryFileName,
  } = pack.registry;

  // Make package cache dir...
  // default here is for Provider
  mkDirs([cacheDir]);

  // copy package/Automate.yaml
  log.debug(`Caching ${packageFile}`);
  Deno.copyFileSync(packageFile, cachePackageConfigFileName);

  // create cli wrapper
  log.debug(`Building package module ${cachePackageModFileName}`);
  Deno.writeTextFileSync(cachePackageModFileName, packageCachePackageModFile);

  // create registry file
  log.debug(`Building package registry file ${registryFileName}`);
  Deno.writeTextFileSync(registryFileName, packageRegistryFile);

  // create values file
  log.debug(`Writing package values into ${cachePackageValuesFileName}`);
  Deno.writeTextFileSync(
    cachePackageValuesFileName,
    yaml.stringify(pack.cfg.values || {}),
  );

  // now we need to generate the recipe provider
  // if we're building a recipe...
  if (pack.cfg.package?.type === 'recipe') {
    // create a sub-folder for this provider/mod.ts
    // file we need to auto-generate
    mkDirs([pack.registry.packageRecipeProviderPath]);

    // recipe as a provider/mod.ts
    const packageCachePackageRecipeProviderModFileTemplate: string = Deno
      .readTextFileSync(
        `${dirname}/../../template/recipe-provider-mod.ts`,
      );
    // render RecipeProvider module
    const packageRecipeProviderModFile = template2.render(
      packageCachePackageRecipeProviderModFileTemplate,
      registryPkg,
    );

    log.debug(
      `Building RecipeProvider module ${pack.registry.packageRecipeProviderMod}`,
    );
    Deno.writeTextFileSync(
      pack.registry.packageRecipeProviderMod,
      packageRecipeProviderModFile,
    );
  }

  // mark this as done
  BUILT.add(packageFile);

  // iterate all deps and build packages for them
  if (pack.cfg.dependencies !== undefined) {
    const deps = pack.cfg.dependencies;
    await buildDep(packageFile, deps.provider);
    await buildDep(packageFile, deps.recipe);
  }

  return Promise.resolve(`Done building ${packageFile}`);
};

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
    } catch (err: unknown) {
      if (err instanceof Deno.errors.NotFound) {
        throw new Error(`
      Provider dep ${key} has a path ${depPath} that can't be found.
      Please fix ${packageFile} to make this work.`);
      }
    }

    const depPkgFile = `${depPath}/${configFileName}`;
    try {
      // load dependency as package
      const pack = await pkg.Package.fromPath(depPkgFile);
      pack.cfg.validatePackage();
      const result = await buildPackage(pack);
      log.debug('Build dep result', result);
    } catch (err) {
      log.error(
        `Error building provider dependency key ${key} pointing to ${depPkgFile}`,
      );
      throw err;
    }
  }
};

/**
 * Action handler `build` command
 * @param options
 */
const action = async (_options: any, path: string) => {
  // TODO: add a --watch flag

  let pkgFile = configFile;
  if (path !== '.') {
    path = Deno.realPathSync(path);
    pkgFile = `${path}/${configFileName}`;
  }

  const cfg = await config.loadAutomateConfig(pkgFile);
  if (cfg.workspace !== undefined) {
    cfg.validateWorkspace();
    log.info(`Building workspace for ${pkgFile}`);
    const result = await buildWorkspace(path, cfg.workspace).catch(err => {
      throw err;
    });
    log.debug(`Build workspace result ${result}`);
  } else {
    // we have a standalone package (provider/recipe)
    // validate package config before loading from path
    cfg.validatePackage();
    const pack = await Package.fromPath(pkgFile);
    const result = await buildPackage(pack);
    log.debug(`Build package result ${result}`);
  }
};

/**
 * Build sub-command
 */
export const build = new cliffy.Command()
  .description('Build the current workspace or package')
  .arguments('<path:string>')
  .action(action);
