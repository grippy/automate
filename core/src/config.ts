/**
 *
Automate.yaml:
    workspace:
      name: string
      members: string[]
    ---
    package:
      name: mypackage
      version: 1.0.0

    stack:
        dev:
            hook:
                one
            runtime:
                other
            dependencies:
                name1:
    hook:
        runtime:
            before-run:
            after-run:
            before-install:
            after-install:
            before-upgrade:
            after-upgrade:
    cli:
        cmd1:
        cmd2:
        cmd3:

    runtime:
        python-venv:
            python: 3.10
            name: ./venv
            requirements: ./requirements.txt
        python-poetry:
            file: ./poetry-file
        deno:
            version: 123
        rust:
            version: 123

    capabilities:
        - allow-net
        - allow-stuff

    dependencies:
        name1:
            url: http://my.org/repo@v1.0.0
            version: 1.0.0
            path: "../"

---
AutomateCli.yaml: |
    home: ~/.automate
    cache: ~/.automate/version/{cli-version}/.cache

*/

import { ToInstance, Transform, Type } from './record.ts';

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

  private converted: boolean = false;
  convertDeps(): void {
    if (this.converted) {
      return;
    }

    if (this.provider !== undefined && this.provider !== null) {
      for (let [key, value] of this.provider) {
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
      for (let [key, value] of this.recipe) {
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
      for (let [key, value] of this.template) {
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
  name!: string;
  members!: Array<string>;
}

/**
 * Package
 */
class Package {
  type!: string;
  name!: string;
  description!: string;
  version!: string;
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
  private converted: boolean = false;

  convertCmds(): void {
    if (this.converted) {
      return;
    }
    for (let [key, value] of this) {
      // console.log('convert', key, value);
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
  async: boolean = false;
  description: string = '';
  in: string = '';
  out: string = 'void';
}

/**
 * Recipe (Steps, Step)
 */
class Recipe {
  @Type(() => Steps)
  steps: Steps = new Steps();

  // plainToInstance (or reflect-metadata) doesn't
  // properly handle to Map types with value Arrays
  private converted: boolean = false;
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

  private converted: boolean = false;

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
