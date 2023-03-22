import { deno_lodash } from '../deps.ts';
const lodash = deno_lodash.ld;

type Values = Record<string, unknown>;

// Provider Abstract Class
export abstract class Provider {
  // add this to make Provider types comparable
  className: string;
  constructor() {
    this.className = this.constructor.name;
  }

  /**
   * Merge values objects takes generic Values
   * @param vals
   * @returns
   */
  mergeValues<T>(vals: unknown[]): T {
    let merged: Values = {};
    lodash.forEach(vals, function(v: unknown) {
      if (merged === null) {
        merged = v as Values;
        return;
      }
      lodash.merge(merged, v as Values);
    });
    return merged as T;
  }

  /**
   * `sh` runs shell scripts using `Deno.run`
   * @param opts
   * @returns
   */
  async sh(opts: Deno.RunOptions): Promise<Deno.ProcessStatus> {
    const p = Deno.run(opts);
    return Promise.resolve(await p.status());
  }
}
