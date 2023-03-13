// Exposes transform types for serialize/deserializing
// class types from/into object literals

import { class_transformer as ct } from '../deps.ts';

// Re-export these types from here...
export const Expose = ct.Expose;
export const Transform = ct.Transform;
export const Type = ct.Type;

// Point to the actual method name
export const ToInstance = ct.plainToInstance;

// Plain type defines a placeholder for object literals
export type Plain = Record<string, unknown>;
