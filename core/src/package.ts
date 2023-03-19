import { casing } from '../deps.ts';

import * as config from './config.ts';
import * as constants from './constants.ts';
import * as logging from './logging.ts';
import * as record from './record.ts';

// setup logger
const log = logging.Category('automate.core.package');

// constants used to build packages
const automateCacheDir = constants.automateCacheDir;
const automateCoreModPath = constants.automateCoreModPath;
const automateRegistryDir = constants.automateRegistryDir;
const configFileName = constants.configFileName;

// {type}.{namespace}.{name}@{version} string
// for how to name a registry package
type RegistryName = string;

// cfg.package.name
type PackageName = string;

// package ProviderClassName used in code
type ProviderClassName = string;

// {type}.{name} string for how to name and call
// a dependency via dependency injection
type DepInjectionName = string;

// The dependency map converted to a map of packages
type Dependencies = Map<string, Package>;

/**
 * RegistryEntry defines all the paths for working with
 * a registry `Package`
 */
class RegistryEntry {
  depInjectionName: DepInjectionName;
  packageName: PackageName;
  registryName: RegistryName;
  providerClassName: ProviderClassName;
  automateCoreMod: string;
  cacheDir: string;
  cachePackageConfigFileName: string;
  cachePackageValuesFileName: string;
  cachePackageModFileName: string;
  packageConfigFileName: string;
  packageProviderPath: string;
  packageProviderMod: string;
  packageRecipeProviderPath: string;
  packageRecipeProviderMod: string;
  registryFileName: string;

  constructor(
    opts: {
      cfgPath: string;
      depInjectionName: DepInjectionName;
      packageName: PackageName;
      registryName: RegistryName;
    },
  ) {
    this.depInjectionName = opts.depInjectionName;
    this.packageName = opts.packageName;
    this.registryName = opts.registryName;
    this.providerClassName = `Provider${casing.pascalCase(opts.packageName)}`;

    // automate.core code module path
    this.automateCoreMod = automateCoreModPath;

    // cache dir name
    this.cacheDir = `${automateCacheDir}/${opts.registryName}`;
    // cache dir package Automate.yaml copy
    this.cachePackageConfigFileName = `${this.cacheDir}/Automate.yaml`;
    // cache dir default values copied from Automate.yaml
    this.cachePackageValuesFileName = `${this.cacheDir}/values.yaml`;
    // cli wrapper for package provider mod
    this.cachePackageModFileName = `${this.cacheDir}/mod.ts`;

    // source package config path
    this.packageConfigFileName = opts.cfgPath;

    // Provider types:
    // Take the path to the package file and remove
    // `Automate.yaml` to get path to the mod.ts file
    this.packageProviderPath = opts.cfgPath.replace(`/${configFileName}`, '');
    this.packageProviderMod = `${this.packageProviderPath}/mod.ts`;

    // Recipe types:
    // recipe provider path
    this.packageRecipeProviderPath = `${this.cacheDir}/provider`;
    // recipe provider code-gen mod
    this.packageRecipeProviderMod = `${this.packageRecipeProviderPath}/mod.ts`;

    // path to registry file
    this.registryFileName = `${automateRegistryDir}/${opts.registryName}.json`;
  }
}

class Package {
  // registry package name w/ type, namespace, name and version
  name: PackageName;
  // registry entry
  registry: RegistryEntry;
  // Path to the `Automate.yaml`
  cfgPath: string;
  // Loaded Automate.yaml which describes the package
  cfg: config.AutomateConfig;
  // package deps => package map
  dependencies: Dependencies;

  constructor(cfgPath: string, cfg: config.AutomateConfig) {
    // config path and config object
    this.cfgPath = cfgPath;
    this.cfg = cfg;

    // read cfg package variables
    const type = cfg.package?.type;
    const namespace = cfg.package?.namespace;
    const name = cfg.package?.name;
    const version = cfg.package?.version;

    // create package name variations
    const registryName = `${type}.${namespace}.${name}@${version}`;

    // namespaced and versioned registry package name
    this.name = registryName;

    // registry entry for this package
    this.registry = new RegistryEntry({
      cfgPath: cfgPath,
      depInjectionName: `${type}.${name}`,
      packageName: name || '',
      registryName: registryName,
    });

    // package.dependencies map
    this.dependencies = new Map<string, Package>();
  }

  isWorkspace(): boolean {
    return this.cfg.workspace !== undefined;
  }

  /**
   * toObject converts
   * @returns
   */
  toObject(): record.Plain {
    return record.FromInstance(this);
  }

  /**
   * loadDependencies loads all Package dependencies
   * as `Package` instances
   * @returns
   */
  async loadDependencies(): Promise<void> {
    const deps = this.cfg.dependencies;
    if (deps !== undefined) {
      if (deps.provider !== undefined) {
        await this.loadDependenciesMap(deps.provider);
      }
      if (deps.recipe !== undefined) {
        await this.loadDependenciesMap(deps.recipe);
      }
    }
    return Promise.resolve();
  }

  /**
   * loadDependenciesMap convert the dependency Map
   * for Automate.yaml `dependencies.provider` and
   * `dependencies.recipe` sections
   * @param map
   * @returns
   */
  async loadDependenciesMap(
    map: undefined | Map<string, string | config.Dependency>,
  ): Promise<void> {
    if (map === undefined) {
      return;
    }
    for (const [key, value] of map.entries()) {
      // log.debug(`Working on dep key ${key} w/ value ${value}`);
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
      // handle relative paths...
      if (path.startsWith('..')) {
        pathPrefix = this.cfgPath.replace('Automate.yaml', '');
      }

      let depPath = `${pathPrefix}${path}`;
      try {
        depPath = Deno.realPathSync(depPath);
      } catch (err: unknown) {
        if (err instanceof Deno.errors.NotFound) {
          throw new Error(`
        Provider dep ${key} has a path ${depPath} that can't be found.
        Please fix ${this.cfgPath} to make this work.`);
        } else {
          throw err;
        }
      }

      const depPkgFile = `${depPath}/${configFileName}`;
      try {
        await this.loadDependencyFromPath(depPkgFile);
      } catch (err) {
        log.error(
          `Error loading provider dependency key ${key} pointing to ${depPkgFile}`,
        );
        throw err;
      }
    }
    return Promise.resolve();
  }

  /**
   * loadDependencyFromPath loads a dependency Automate.yaml
   * as a Package and stores it in the parent dependencies Map
   * @param path
   * @returns Promise<void>
   */
  async loadDependencyFromPath(path: string): Promise<void> {
    log.debug(`Loading dep path config ${path}`);
    const depPkg = await Package.fromPath(path, true);
    this.dependencies.set(path, depPkg);
    return Promise.resolve();
  }

  /**
   * Load `Package` instance from AutomateConfig instance
   * @param path
   * @param cfg
   * @returns Promise<Package>
   */
  static async fromAutomateConfig(
    path: string,
    cfg: config.AutomateConfig,
    skipDeps = false,
  ): Promise<Package> {
    // load package
    const pkg = new Package(path, cfg);
    // Track loading this path before loading deps...
    // LOADED.add(path);
    // load package dependencies...
    if (!skipDeps) {
      await pkg.loadDependencies();
    }
    return Promise.resolve(pkg);
  }

  /**
   * Load `Package` instance from Automate.yaml file path
   * @param path
   * @returns Promise<Package>
   */
  static async fromPath(
    path: string,
    skipDeps = false,
  ): Promise<Package> {
    const cfg = await config.loadAutomateConfig(path);
    return Package.fromAutomateConfig(path, cfg, skipDeps);
  }
}

export { Package };
