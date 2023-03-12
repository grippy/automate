// Exposes transform types for serialize/deserializing
// class types from/into object literals

import {
  Expose,
  plainToInstance,
  Transform,
  Type,
} from 'npm:class-transformer@0.5.1';
import 'https://deno.land/x/reflect_metadata@v0.1.12/mod.ts';

// Re-export these types from here...
export { Expose, Transform, Type };

// Point to the actual method name
export const ToInstance = plainToInstance;

// Plain type defines a placeholder for object literals
export type Plain = Record<string, unknown>;
