import {
  parse,
  parseAll,
  stringify,
} from 'https://deno.land/std@0.174.0/encoding/yaml.ts';

import { ld } from 'https://deno.land/x/deno_lodash@v0.1.0/mod.ts';

class YamlLoader {
  private decoder = new TextDecoder('utf-8');

  private async read(filePath: string): Promise<string> {
    const yamlFile = await Deno.readFile(filePath);
    return this.decoder.decode(yamlFile);
  }

  // parse a file that defines a single yaml object
  async parseFile(filePath: string): Promise<any> {
    const text = await this.read(filePath);
    return await parse(text);
  }

  // parse a file that defines a multiple yaml objects
  async parseFileAll(filePath: string): Promise<any> {
    const text = await this.read(filePath);
    return await parseAll(text);
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
  const loaded = await Promise.all(ld.map(files, load));
  ld.forEach(loaded, function(values: Promise<any>) {
    if (merged === null) {
      merged = values;
      return;
    }
    ld.merge(merged, values);
  });
  return merged;
};

export { load, loadAll, mergeLoad, stringify };
