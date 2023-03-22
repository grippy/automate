import { logging, provider } from '../../../../mod.ts';

// create logger
const log = logging.Category('provider.test.workspace.example.name2@0.0.0');

type Values = Record<string, unknown>;

class ProviderName2 extends provider.Provider {
  constructor() {
    super();
  }

  // deno-lint-ignore require-await
  async sayGreeting({ greet, name }: Values): Promise<string> {
    log.debug(`sayGreeting called w/ ${greet}, ${name}`);
    const greeting = `${greet}, ${name} how are you?`;
    return Promise.resolve(greeting);
  }
}

// deno-lint-ignore require-await
export const initializeProvider = async (): Promise<provider.Provider> => {
  const instance = new ProviderName2();
  return Promise.resolve(instance);
};
