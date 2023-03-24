import {
  logging,
  provider as __provider,
  recipe as __recipe,
  template2 as __template,
} from '{{ registry.automateCoreMod }}';

import * as deno_lodash from 'https://deno.land/x/deno_lodash@v0.1.0/mod.ts';
const lodash = deno_lodash.ld;

// create initialize functions
// dprint-ignore-start
{{#each dependencies}}
{{#ifeq this.cfg.package.type "provider"}}
import { initializeProvider as initializeProvider{{ this.registry.providerClassName }} } from '{{ this.registry.packageProviderMod }}';
{{else}}
import { initializeProvider as initializeRecipe{{ this.registry.providerClassName }} } from '{{ this.registry.packageRecipeProviderMod }}';
{{/ifeq}}
{{/each}}
// dprint-ignore-end

// create logger
const log = logging.Category('{{ registry.registryName }}');

// create types
type Values = Record<string, unknown>;
type State = __recipe.State;
type Deps = __recipe.Deps;
type Opts = __recipe.Opts;
type CookResponse = __recipe.CookResponse;

// Merge values objects
const mergeValues = function(vals: Values[]): Values {
  let merged = {};
  lodash.forEach(vals, function(v: Values) {
    if (merged === null) {
      merged = v;
      return;
    }
    lodash.merge(merged, v);
  });
  return merged;
};

// Render templates... hacky for now
// JSON.stringify(values) => render => JSON.parse
// TODO: iterate values and only render properties
// with template variables.
const render = function (opts: Opts, values: Values): Values {
  const tmpl = JSON.stringify(values);
  const json = __template.render(tmpl, opts);
  return JSON.parse(json);
}


// generate: recipe step tasks here...
// dprint-ignore-start
{{#each cfg.recipe.steps}}
{{#each this}}
async function {{@../key}}_{{ @index }} ({state, values}: Opts, {provider, recipe}: Deps): Promise<unknown> {

  const name = '{{ this.name }}';
  const description = '{{ this.description }}';
  const dep = '{{ this.dep }}';
  const cmd = '{{ this.cmd }}';
  const input = {{{ json this.in }}};
  const outputKey = '{{ this.out }}';
  const mergedValues = mergeValues([{}, values, input]);
  const boundValues = render({ state, values }, mergedValues);

  log.info(`Call ${dep}.${cmd} w/ merged & bound values ${JSON.stringify(boundValues)}`);
  // @ts-ignore: ignore cmd doesn't exist on Provider
  const result = await {{ dep }}.{{ cmd }}(boundValues);
  if (outputKey !== undefined) {
    state[outputKey] = result;
  }
  return Promise.resolve(result);
}
{{/each}}
{{/each}}
// dprint-ignore-end

// RecipeProvider executes a recipe for a given
// recipe config
export class RecipeProvider extends __provider.Provider {
  // recipe we want to run...
  recipe: __recipe.Recipe;
  constructor(recipe: __recipe.Recipe) {
    super();
    this.recipe = recipe;
  }

  async cook(values: Values): Promise<CookResponse> {
    // we need to merge the default values with values?
    log.info(`RecipeProvider.cook ${JSON.stringify(values)}`);
    const result = await this.recipe.cook(values);
    return Promise.resolve(result);
  }
}

// initializeDeps iterates all dependencies,
// and generates a Deps mapping...
async function initializeDeps(): Promise<Deps> {
  // initialize all dependencies;
  const deps: Deps = {
    provider: {
      {{#each dependencies}}
      {{#ifeq this.cfg.package.type "provider"}}
      {{ this.registry.packageName }}: await initializeProvider{{ this.registry.providerClassName }}(),
      {{/ifeq}}
      {{/each}}
    },
    recipe: {
      {{#each dependencies}}
      {{#ifeq this.cfg.package.type "recipe"}}
      {{ this.registry.packageName }}: await initializeRecipe{{ this.registry.providerClassName }}(),
      {{/ifeq}}
      {{/each}}
    }
  };
  return Promise.resolve(deps);
}

// deno-lint-ignore require-await
const initializeRecipe = async (): Promise<__recipe.Recipe> => {
  const deps = await initializeDeps();

  // define steps
  {{#each cfg.recipe.steps}}
  const {{@key}} = [
  {{#each this}}
    {{@../key}}_{{ @index }},
  {{/each}}
  ];
  {{/each}}

  const recipe = new __recipe.Recipe('{{ registry.registryName }}', deps)
    .with_state({})
    {{#each cfg.recipe.steps}}
    .sequence('{{ @key }}', ...{{@key}})
    {{/each}}
  return Promise.resolve(recipe);
};

// All providers must export this function...
export const initializeProvider = async (): Promise<RecipeProvider> => {
  const recipe = await initializeRecipe();
  const provider = new RecipeProvider(recipe);
  return Promise.resolve(provider);
};
