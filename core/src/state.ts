// State represents basic Map functions
// for storing data...
export class State {
  map: Map<string, any>;

  constructor() {
    this.map = new Map();
  }
  get size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }
  get(key: string): string | null {
    return this.map.get(key);
  }
  delete(key: string): void {
    this.map.delete(key);
  }
  set(key: string, value: string) {
    this.map.set(key, value);
  }

  // sub classes will mostly override these
  async initialize(): Promise<string> {
    return Promise.resolve('');
  }
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

  async initialize(): Promise<string> {
    // read file and initialize the map
    return Promise.resolve('');
  }

  async finalize(): Promise<string> {
    // convert map to yaml and write to disk
    return Promise.resolve('');
  }
}
