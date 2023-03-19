import {
  logging,
  provider as __provider,
  recipe as __recipe,
} from '{{ registry.automateCoreMod }}';

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
type Opts = {
  values: Values;
  state: State;
};

// generate: recipe step tasks here...
// dprint-ignore-start
{{#each cfg.recipe.steps}}
{{#each this}}
async function {{@../key}}_{{ @index }} ({state, values}: Opts, {provider, recipe}: Deps) {

  const name = '{{ this.name }}';
  const description = '{{ this.description }}';
  const dep = '{{ this.dep }}';
  const cmd = '{{ this.cmd }}';
  const input = {{{ json this.in }}};
  const outputKey = '{{ this.out }}';

  log.info(`Call ${dep}.${cmd} w/ values ${JSON.stringify(values)}`);
  const result = await {{ dep }}.{{ cmd }}(values);
  if (outputKey !== undefined) {
    state[outputKey] = result;
  }
}
{{/each}}
{{/each}}
// dprint-ignore-end

// RecipeProvider executes a recipe for a given
// recipe config
export class RecipeProvider implements __provider.Provider {
  // recipe we want to run...
  recipe: __recipe.Recipe;
  constructor(recipe: __recipe.Recipe) {
    this.recipe = recipe;
  }

  async cook(values: Values): Promise<void> {
    // we need to merge the default values with values?
    log.info(`RecipeProvider.cook ${JSON.stringify(values)}`);
    await this.recipe.cook();
    return Promise.resolve();
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
  {{#each this}}
  const {{@../key}} = [
    {{@../key}}_{{ @index }},
  ];
  {{/each}}
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
