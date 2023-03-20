// deno-lint-ignore-file no-explicit-any
import { deno_lodash, yaml } from '../deps.ts';

const lodash = deno_lodash.ld;
const stringify = yaml.stringify;

class YamlLoader {
  private decoder = new TextDecoder('utf-8');

  private async read(filePath: string): Promise<string> {
    const yamlFile = await Deno.readFile(filePath);
    return this.decoder.decode(yamlFile);
  }

  // parse a file that defines a single yaml object
  async parseFile(filePath: string): Promise<any> {
    const text = await this.read(filePath);
    return await yaml.parse(text);
  }

  // parse a file that defines a multiple yaml objects
  async parseFileAll(filePath: string): Promise<any> {
    const text = await this.read(filePath);
    return await yaml.parseAll(text);
  }
}

// Instance loader
const loader = new YamlLoader();

// Loads filepath contents as an object.
const load = async function(filepath: string): Promise<any> {
  return await loader.parseFile(filepath);
};

// Loads filepath contents as an array of objects.
const loadAll = async function(filepath: string): Promise<any> {
  return await loader.parseFileAll(filepath);
};

// Merges multiple files into a single object. Load the defaults first,
// and then layer changes on top of them.
const mergeLoad = async function(files: string[]): Promise<any> {
  let merged = {};
  const loaded = await Promise.all(lodash.map(files, load));
  lodash.forEach(loaded, function(values: Promise<any>) {
    if (merged === null) {
      merged = values;
      return;
    }
    lodash.merge(merged, values);
  });
  return merged;
};

export { load, loadAll, mergeLoad, stringify };
