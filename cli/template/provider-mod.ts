import { logging, provider } from '{{ pack.registry.automateCoreMod }}';

// create logger
const log = logging.Category('{{ pack.name }}');

// Provider Notes:
// This is an example provider to get you started
// Provider commands (functions) have the following characteristics.
// - A function may or not be async
// - A function may not define any input arguments
// - A function may take a single input argument of type Values.
// - Synchronous function should T or void
// - Async functions should return Promise<T>
//
// Use ENV variables to initialize runtime values.
// To read ENV variable: `Deno.env.get("MY_VAR")`

type Values = Record<string, unknown>;

class {{ registry.providerClassName }} implements provider.Provider {

  constructor() {}

  // deno-lint-ignore require-await
  async cmd1(values: Values): Promise<string> {
    log.debug(`cmd1 called w/ ${JSON.stringify(values)}`);
    return Promise.resolve('OK');
  }

  // deno-lint-ignore require-await
  async cmd2(values: Values): Promise<Values> {
    log.debug(`cmd2 called w/ ${JSON.stringify(values)}`);
    return Promise.resolve({ key1: 'value1' });
  }

  // deno-lint-ignore require-await
  async cmd3(): Promise<void> {
    log.debug(`cmd3 called`);
    return Promise.resolve();
  }

  cmd4(): void {
    log.info(`cmd4 called`);
  }
}

// All providers must export this function...
// deno-lint-ignore require-await
export const initializeProvider = async (): Promise<provider.Provider> => {
  const instance = new {{ registry.providerClassName }}();
  return Promise.resolve(instance);
};
