import {
  automatePackageNamespaceVerifier,
  automatePackageNameVerifier,
} from './constants.ts';
import { Exclude, FromInstance, Plain, ToInstance, Type } from './record.ts';
import * as yaml from './yaml.ts';
/**
 * This file describes how to parse Automate.yaml files.
 * We have a couple of cases where we need to manually coerce
 * types from object/maps into Classes defined here.
 */

/**
 * loadAutomateConfig from path
 * @param path
 * @returns
 */
export const loadAutomateConfig = async (
  path: string,
): Promise<AutomateConfig> => {
  const plain = await yaml.load(path);
  const cfg = ToInstance(AutomateConfig, plain);
  cfg.convertTypes();
  return Promise.resolve(cfg);
};

/**
 * Values
 */
type Values = Record<string, unknown>;
type Path = string;

/**
 * Dependencies
 */
class Dependencies {
  @Type(() => Map<string, Dependency | Path>)
  provider: Map<string, Dependency | Path> = new Map();

  @Type(() => Map<string, Dependency | Path>)
  recipe: Map<string, Dependency | Path> = new Map();

  @Type(() => Map<string, Dependency | Path>)
  template: Map<string, Dependency | Path> = new Map();

  @Exclude()
  private converted = false;

  convertDeps(): void {
    if (this.converted) {
      return;
    }

    if (this.provider !== undefined && this.provider !== null) {
      for (const [key, value] of this.provider) {
        // console.log('convert', key, value);
        if (typeof value === 'object') {
          this.provider.set(
            key,
            ToInstance(
              Dependency,
              value,
            ),
          );
        }
      }
    }
    if (this.recipe !== undefined && this.recipe !== null) {
      for (const [key, value] of this.recipe) {
        // console.log('convert', key, value);
        if (typeof value === 'object') {
          this.recipe.set(
            key,
            ToInstance(
              Dependency,
              value,
            ),
          );
        }
      }
    }
    if (this.template !== undefined && this.template !== null) {
      for (const [key, value] of this.template) {
        // console.log('convert', key, value);
        if (typeof value === 'object') {
          this.template.set(
            key,
            ToInstance(
              Dependency,
              value,
            ),
          );
        }
      }
    }

    this.converted = true;
  }
}

class Dependency {
  name!: string;
  path!: Path;
}

/**
 * Workspace
 */
class Workspace {
  // name of this workspace
  name!: string;
  // a list of paths pointing to packages
  // under this workspace
  members!: Array<string>;
}

/**
 * Package
 */
class Package {
  // type of package (provider or recipe)
  type!: string;
  // namespace to cache package as
  namespace!: string;
  // package name
  name!: string;
  // describes this package
  description!: string;
  // the semver of this package
  version!: string;
  // the deno permissions to run package with
  permissions!: string[];
}

/**
 * Registry Package
 */
class RegistryPackage {
  package!: Package;
  provider!: string;
  recipe!: string;
  package_file!: string;
  package_values_file!: string;
  registry_file!: string;
  automate_core_mod!: string;
  cli_mod!: string;
  package_mod!: string;
}

/**
 * Provider
 */
class Provider {
  @Type(() => ProviderDataTypes)
  types: ProviderDataTypes = new ProviderDataTypes();

  @Type(() => ProviderCmds)
  commands: ProviderCmds = new ProviderCmds();
}

class ProviderDataTypes extends Map<string, ProviderDataType> {}

class ProviderDataType extends Map<string, string> {}

class ProviderCmds extends Map<string, ProviderCmd> {
  @Exclude()
  private converted = false;

  convertCmds(): void {
    if (this.converted) {
      return;
    }
    for (const [key, value] of this) {
      this.set(
        key,
        ToInstance(
          ProviderCmd,
          value,
        ),
      );
    }
    this.converted = true;
  }
}

// ProviderCmd
// This class is used to describe
// the provider commands name and input / output types
class ProviderCmd {
  async = false;
  description = '';
  in = '';
  out = 'void';
}

/**
 * Recipe
 */
class Recipe {
  @Type(() => Steps)
  steps: Steps = new Steps();

  // Calling FromInstance doesn't here
  // for some reason. Do this for now
  toObject(): Plain {
    const obj: Plain = {};
    const steps: Record<string, Array<Plain>> = {};
    for (const [key, value] of this.steps) {
      steps[key] = [];
      for (const step of value) {
        steps[key].push(step.toObject());
      }
    }
    obj.steps = steps;
    return obj;
  }

  // plainToInstance (or reflect-metadata) doesn't
  // properly handle to Map types with value Arrays
  @Exclude()
  private converted = false;

  convertSteps(): void {
    if (this.converted) {
      return;
    }
    for (const [key, value] of this.steps) {
      // console.log('convert', key, value);
      this.steps.set(
        key,
        ToInstance(
          Step,
          value,
        ),
      );
    }
    this.converted = true;
  }
}

// Steps should be an ordered map
// of recipe step lists
class Steps extends Map<string, Step[]> {}

class Step {
  // name of this step
  name!: string;
  // recipe step description
  description!: string;
  // recipe dep run command on...
  // this should be the dependencies provider or recipes
  // key name assigned to the map...
  // for example, if the dependency was defined as `dependencies.provider.name1`
  // you make the dep value `provider.name1`, or `recipe.name1` for recipes.
  dep!: string;
  // recipe dep cmd to run
  cmd!: string;
  // input values for recipe dep cmd
  in: Record<string, unknown> = {};
  // save recipe step output to
  // this state key
  out!: string;

  toObject(): Plain {
    const obj: Plain = FromInstance(this);
    // we need to remove undefined values
    // or we won't be able to serialize this
    // back to yaml
    for (const key in obj) {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    }
    return obj;
  }
}

/**
 * Automate.yaml
 * This object defines how to parse an Automate.yaml config.
 */
class AutomateConfig {
  @Type(() => Workspace)
  workspace?: Workspace;

  @Type(() => Package)
  package?: Package;

  @Type(() => Dependencies)
  dependencies?: Dependencies;

  @Type(() => Provider)
  provider?: Provider;

  @Type(() => Recipe)
  recipe?: Recipe;

  values?: Values;

  @Exclude()
  private converted = false;

  validateWorkspace() {
    // validate workspace
    const workspace = this.workspace;
    if (workspace === undefined) {
      throw new Error('workspace is undefined');
    }
    // validate members...
    const members = workspace.members || [];
    if (members.length === 0) {
      throw new Error('Workspace has no members');
    }
  }

  validatePackage(): void {
    const pkg = this.package;

    // check if package exists
    if (pkg === undefined) {
      throw new Error('Package missing package definition');
    }
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

    if (
      pkg.type === undefined || ['recipe', 'provider'].indexOf(pkg.type) < 0
    ) {
      throw new Error(
        `
      Package ${pkg.name} is missing a type or type isn't defined properly.
      Only types allowed are 'recipe' or 'provider'`,
      );
    }
  }

  toObject(): Plain {
    return FromInstance(this);
  }

  /**
   * convertTypes
   * We need to patch some of the inner types because
   * class-transform isn't handling Map value types
   * as advertised.
   */
  convertTypes() {
    if (this.converted) {
      return;
    }
    if (this.dependencies !== undefined && this.dependencies !== null) {
      this.dependencies.convertDeps();
    }
    if (this.provider !== undefined && this.provider !== null) {
      this.provider.commands.convertCmds();
    }
    if (this.recipe !== undefined && this.recipe !== null) {
      this.recipe.convertSteps();
    }
    this.converted = true;
  }
}

export {
  AutomateConfig,
  Dependencies,
  Dependency,
  Package,
  Provider,
  ProviderCmd,
  Recipe,
  RegistryPackage,
  Step,
  Steps,
  Workspace,
};
