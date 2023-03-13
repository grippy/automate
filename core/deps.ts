// export template module
export * as Eta from 'https://deno.land/x/eta@v2.0.0/mod.ts';

// export logging
import * as winston from 'npm:winston@3';
export { winston };

// export class-transformer
export * as class_transformer from 'npm:class-transformer@0.5.1';
// monkey patch class transformer w/ reflect metadata
import 'https://deno.land/x/reflect_metadata@v0.1.12/mod.ts';

// export yaml
export * as yaml from 'https://deno.land/std@0.174.0/encoding/yaml.ts';

// export deno_lodash
export * as deno_lodash from 'https://deno.land/x/deno_lodash@v0.1.0/mod.ts';
