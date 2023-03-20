import { asserts } from '../deps_dev.ts';
import { recipe } from '../mod.ts';

type Deps = recipe.Deps;
type Opts = recipe.Opts;
type State = recipe.State;

// async delay
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// create new test recipes
const newRecipe = function(name: string): recipe.Recipe {
  const deps: Deps = {
    provider: {},
    recipe: {},
  };
  return new recipe.Recipe(name, deps);
};

// task stubs
// deno-lint-ignore require-await
async function t1(): Promise<string> {
  return Promise.resolve('task1');
}

// deno-lint-ignore require-await
async function t2(): Promise<string> {
  return Promise.resolve('task2');
}

Deno.test(
  { name: 'Test sequential recipe tasks' },
  async function testSeq() {
    // deno-lint-ignore require-await
    async function t3({ state }: Opts, _deps: Deps): Promise<string> {
      state.value = 't3';
      return Promise.resolve('task3');
    }
    const name = 'testSeq1';
    const r = newRecipe(name)
      .with_state({ 'value': '' })
      .sequence('seq1', t1, t2, t3);
    await r.cook();

    // test name
    asserts.assertEquals(r.name, name);
    // test results
    asserts.assertEquals(r.results.seq1, [
      'task1',
      'task2',
      'task3',
    ]);
    // test state
    asserts.assertEquals(r.state.value, 't3');
  },
);

Deno.test(
  { name: 'Test parallel recipe tasks' },
  async function testParallel() {
    // delay 2ms
    async function t1({ state }: Opts): Promise<string> {
      await delay(10);
      (<Array<string>> state.done).push('task1');
      return Promise.resolve('task1');
    }
    // delay 1ms
    async function t2({ state }: Opts): Promise<string> {
      await delay(5);
      (<Array<string>> state.done).push('task2');
      return Promise.resolve('task2');
    }
    // delay 0ms
    async function t3({ state }: Opts): Promise<string> {
      await delay(0);
      (<Array<string>> state.done).push('task3');
      return Promise.resolve('task3');
    }
    const name = 'testParallel1';
    const r = newRecipe(name)
      .with_state({ done: [] })
      .parallel('parallel1', t1, t2, t3);
    await r.cook();
    asserts.assertEquals(r.name, name);
    // test results comeback in the same order
    // as the tasks were defined.
    asserts.assertEquals(r.results.parallel1, [
      'task1',
      'task2',
      'task3',
    ]);
    // test state.done order based on the delay timing
    asserts.assertEquals(r.state.done, [
      'task3',
      'task2',
      'task1',
    ]);
  },
);

Deno.test(
  { name: 'Test branch recipe tasks fork left or right' },
  async function testBranch() {
    // deno-lint-ignore require-await
    async function c1(): Promise<boolean> {
      return Promise.resolve(true);
    }
    // deno-lint-ignore require-await
    async function t1({ state }: Opts): Promise<unknown> {
      state.called = 'task1';
      return Promise.resolve('task1');
    }
    // deno-lint-ignore require-await
    async function t2({ state }: Opts): Promise<unknown> {
      state.called = 'task2';
      return Promise.resolve('task2');
    }
    const name = 'testBranch1';
    const r = newRecipe(name)
      .branch('branch1', c1, t1, t2);
    await r.cook();
    asserts.assertEquals(r.state.called, 'task1');
    asserts.assertEquals(r.results.branch1, 'task1');
  },
);
