// Exposes transform types for serialize/deserializing
// class types from/into object literals

import { class_transformer as ct } from '../deps.ts';

// Re-export these types from here...
export const Expose = ct.Expose;
export const Exclude = ct.Exclude;
export const Transform = ct.Transform;
export const Type = ct.Type;

// Point to the actual method name
export const ToInstance = ct.plainToInstance;
export const FromInstance = ct.instanceToPlain;

// Plain type defines a placeholder for object literals
export type Plain = Record<string, unknown>;
