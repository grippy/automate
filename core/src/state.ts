// State represents basic Map functions
// for storing data...
export class State {
  map: Map<string, unknown>;

  constructor() {
    this.map = new Map();
  }
  get size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }
  get(key: string): unknown | undefined {
    return this.map.get(key);
  }
  delete(key: string): void {
    this.map.delete(key);
  }
  set(key: string, value: unknown) {
    this.map.set(key, value);
  }

  // sub classes will mostly override these
  // deno-lint-ignore require-await
  async initialize(): Promise<string> {
    return Promise.resolve('');
  }
  // deno-lint-ignore require-await
  async finalize(): Promise<string> {
    return Promise.resolve('');
  }
}

export class Memory extends State {
  constructor() {
    super();
  }
}

export class File extends State {
  filename: string;

  constructor(filename: string) {
    super();
    this.filename = filename;
  }

  private read() {}
  private write() {}

  // deno-lint-ignore require-await
  async initialize(): Promise<string> {
    // read file and initialize the map
    return Promise.resolve('');
  }
  // deno-lint-ignore require-await
  async finalize(): Promise<string> {
    // convert map to yaml and write to disk
    return Promise.resolve('');
  }
}
