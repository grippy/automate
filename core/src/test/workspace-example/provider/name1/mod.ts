import { logging, provider } from '../../../../../mod.ts';

// create logger
const log = logging.Category('name1');
type Values = Record<string, unknown>;

class ProviderName1 implements provider.Provider {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  // deno-lint-ignore require-await
  async cmd1(values: Values): Promise<string> {
    log.info('name', this.name);
    log.debug('cmd1 called w/', values);
    return Promise.resolve('OK');
  }
}

// deno-lint-ignore require-await
export const initializeProvider = async (): Promise<provider.Provider> => {
  const instance = new ProviderName1('hello');
  return Promise.resolve(instance);
};
