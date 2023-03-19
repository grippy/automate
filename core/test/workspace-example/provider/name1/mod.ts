import { logging, provider } from '../../../../mod.ts';

// create logger
const log = logging.Category('provider.test.workspace.example.name1@0.0.0');
type Values = Record<string, unknown>;

class ProviderName1 implements provider.Provider {
  greeting: string;

  constructor(greeting: string) {
    this.greeting = greeting;
  }

  // deno-lint-ignore require-await
  async greet(values: Values): Promise<string> {
    log.debug(`greeting: ${this.greeting}`);
    log.debug(`greet called w/ ${JSON.stringify(values)}`);
    return Promise.resolve(this.greeting);
  }
}

// deno-lint-ignore require-await
export const initializeProvider = async (): Promise<provider.Provider> => {
  const instance = new ProviderName1('hello');
  return Promise.resolve(instance);
};
