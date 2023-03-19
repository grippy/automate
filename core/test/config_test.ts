import { asserts } from '../deps_dev.ts';
import { config, logging, record, yaml } from '../mod.ts';
const { ToInstance } = record;
const { load } = yaml;

// current directory for this file
const dirname = new URL('.', import.meta.url).pathname;

const log = logging.Category('config.test');

const testAutomateConfig = function(plain: any) {
  const cfg = ToInstance(config.AutomateConfig, plain);
  cfg.convertTypes();
  // console.log(cfg);
  const deps = cfg.dependencies;
  if (deps !== undefined) {
    console.log('Log dependencies');
    asserts.assertInstanceOf(
      deps.provider.get('name1'),
      config.Dependency,
    );
    asserts.assertEquals(
      typeof deps.provider.get('name2'),
      'string',
    );
  }

  const recipe = cfg.recipe;
  if (recipe !== undefined) {
    // console.log('Log recipe steps');
    asserts.assertInstanceOf(
      recipe.steps,
      config.Steps,
    );
    const step = recipe.steps.get('setup');
    if (step !== undefined) {
      asserts.assertEquals(
        step.length > 0,
        true,
      );
      asserts.assertInstanceOf(
        step[0],
        config.Step,
      );
    } else {
      asserts.assertEquals(
        step !== undefined,
        true,
      );
    }
  }
  const provider = cfg.provider;
  if (provider !== undefined) {
    // console.log('Log provider commands...');
    // console.log(provider);
    asserts.assertInstanceOf(
      provider.commands.get('cmd1'),
      config.ProviderCmd,
    );
  }
};

Deno.test(
  async function testLoad() {
    const plain = await load(`${dirname}fixture/Automate.yaml`);
    testAutomateConfig(plain);
  },
);
