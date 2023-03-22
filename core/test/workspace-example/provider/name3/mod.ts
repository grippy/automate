import { logging, provider } from '../../../../mod.ts';

// create logger
const log = logging.Category('provider.test.workspace.example.name3@0.0.0');

type Values = Record<string, unknown>;

class ProviderName3 extends provider.Provider {
  constructor() {
    super();
  }

  // deno-lint-ignore require-await
  async cmd1(values: Values): Promise<string> {
    log.debug(`cmd1 called w/ ${values}`);
    return Promise.resolve('OK');
  }
}

// deno-lint-ignore require-await
export const initializeProvider = async (): Promise<provider.Provider> => {
  const instance = new ProviderName3();
  return Promise.resolve(instance);
};
