import { provider } from '{{ automate_core_mod }}';

// This is an example provider to get you started
// Provider functions have the following characteristics.
// - A function may or not be async
// - A function may not define any input argument
// - A function may take a single input argument of type Values.

type Values = Record<string, unknown>;

class MyProvider implements provider.Provider {
  constructor() {}

  async cmd1(values: Values): Promise<string> {
    console.log('cmd1 called w/', values);
    return Promise.resolve('OK');
  }

  async cmd2(values: Values): Promise<Values> {
    console.log('cmd2 called w/', values);
    return Promise.resolve({ key1: 'value1' });
  }

  async cmd3(): Promise<void> {
    console.log('cmd3 called');
    return Promise.resolve();
  }

  cmd4(): void {
    console.log('cmd1 called');
  }
}

// All providers must export this function...
const initializeProvider = async (): Promise<provider.Provider> => {
  const instance = new MyProvider();
  return Promise.resolve(instance);
};

export { initializeProvider };
