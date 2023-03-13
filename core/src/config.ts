import { ToInstance, Type } from './record.ts';

/**
 * This file describes how to parse Automate.yaml files.
 * We have a couple of cases where we need to manually coerce
 * types from object/maps into Classes defined here.
 */

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

class ProviderCmd {
  async = false;
  description = '';
  in = '';
  out = 'void';
}

/**
 * Recipe (Steps, Step)
 */
class Recipe {
  @Type(() => Steps)
  steps: Steps = new Steps();

  // plainToInstance (or reflect-metadata) doesn't
  // properly handle to Map types with value Arrays
  private converted = false;

  convertSteps(): void {
    if (this.converted) {
      return;
    }
    for (let [key, value] of this.steps) {
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

class Steps extends Map<string, Step[]> {}

class Step {
  description!: string;
  cmd!: string;
  template!: string;
  in: Record<string, unknown> = {};
  out!: string;
}

/**
 * Automate.yaml
 * This object defines how to parse an Automate.yaml config.
 */
class AutomateConfig {
  // static members
  static from_path(file: string): void {}

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

  private converted = false;

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
