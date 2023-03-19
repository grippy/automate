import { Provider } from './provider.ts';
import { Plain } from './record.ts';

// vanilla js object
export type Values = Record<string, unknown>;
export type State = Record<string, unknown>;

// opts
export type Opts = {
  state: State;
  values: Values;
};

// deps injection
export type Deps = {
  provider: Record<string, Provider>;
  recipe: Record<string, Provider>;
};

// Basic unit of work
export type Step = (opts: Opts, deps: Deps) => Promise<unknown>;

// The map of steps we want to run
export type Steps = Map<string, Step>;

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Branches left if condition returns true
// or right if condition returns false. This will most
// likely read from the state object to decide which
// way to route.
function Branch(
  condition: (opts: Opts, deps: Deps) => Promise<boolean>,
  left: Step,
  right: Step,
): Step {
  return async function(opts: Opts, deps: Deps) {
    const result = await condition(opts, deps);
    return result ? await left(opts, deps) : await right(opts, deps);
  };
}

// Sequentially run a list of async steps
function Seq(...tasks: Array<Step>): Step {
  return async function(opts: Opts, deps: Deps) {
    // console.log('<Seq>');
    const results = [];
    for (const fn of tasks) {
      results.push(await fn(opts, deps));
    }
    // console.log('</Seq>');
    return Promise.resolve(results);
  };
}

// Parallelize execution over a list of async steps
function Parallel(...tasks: Array<Step>): Step {
  return async function(opts: Opts, deps: Deps) {
    // console.log('<Parallel>');
    const values = tasks.map(
      async (fn) => {
        await delay(0);
        return await fn(opts, deps);
      },
    );
    const results = await Promise.all(values);
    // console.log('</Parallel>');
    return results;
  };
}

// Recipes are a way to organize a series of async steps, executed either sequentially or in parallel.
// You can seed the recipe with a `state` object that's readable within tasks.
export class Recipe {
  name: string;
  steps: Steps;
  deps: Deps;
  state: State;
  results: Plain;

  // recipe name
  constructor(name: string, deps: Deps) {
    this.name = name;
    this.steps = new Map();
    this.state = {};
    this.results = {};
    this.deps = deps;
  }

  // sets the local state value using the builder pattern
  with_state(state: State): Recipe {
    this.state = state;
    return this;
  }

  // Branch forks execution based on the what the condition returns.
  // If the condition returns true then the left step is executed.
  // If the condition return false then the right step is executed.
  branch(
    name: string,
    condition: (opts: Opts, deps: Deps) => Promise<boolean>,
    left: Step,
    right: Step,
  ): Recipe {
    this.step(name, Branch(condition, left, right));
    return this;
  }

  // Sequence executes a series of steps in order and returns when the
  // last one is finished.
  sequence(name: string, ...step: Step[]): Recipe {
    this.step(name, Seq(...step));
    return this;
  }

  // Parallel executes a series of steps all the same time
  // and returns when they're all finished.
  parallel(name: string, ...step: Step[]): Recipe {
    this.step(name, Parallel(...step));
    return this;
  }

  // Sets a step to run.
  step(name: string, step: Step): Recipe {
    if (this.steps.get(name)) {
      const msg = `Recipe step "${name}" defined twice`;
      throw new Error(msg);
    }
    this.steps.set(name, step);
    return this;
  }

  // Cook this recipe, iterating all steps by order of
  // how they were added to the steps map...
  // Returns a map of results from each step where the step name
  // is the key.
  async cook(): Promise<void> {
    // console.log(`<Recipe name="${this.name}">`);
    for (const [name, step] of this.steps) {
      // console.log(`<Step name="${name}">`);
      try {
        const result = await step({ state: this.state, values: {} }, this.deps);
        this.results[name] = result;
      } catch (err) {
        return Promise.reject(err);
      }
      // console.log(`</Step>`);
    }
    // console.log('</Recipe>');
    return Promise.resolve();
  }
}
