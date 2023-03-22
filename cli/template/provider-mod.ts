import { logging, provider } from '{{ pack.registry.automateCoreMod }}';

// create logger
const log = logging.Category('{{ pack.name }}');

type Values = Record<string, unknown>;

class {{ pack.registry.providerClassName }} extends provider.Provider {

  constructor() {
    super();
  }

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
  const instance = new {{ pack.registry.providerClassName }}();
  return Promise.resolve(instance);
};
