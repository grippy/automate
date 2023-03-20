// deno-lint-ignore-file no-explicit-any
// import Handlebars from 'https://esm.sh/handlebars@4.7.6';
// const template = Handlebars.compile('{{foo}}');
// console.log(template({ foo: 'bar' }));

import { Handlebars } from '../deps.ts';

Handlebars.registerHelper(
  'json',
  function(
    context: unknown,
    replacer?: ((this: any, key: string, value: any) => any) | undefined,
    space?: string | number | undefined,
  ) {
    return JSON.stringify(context, replacer, space);
  },
);

Handlebars.registerHelper(
  'ifeq',
  function(
    this: unknown,
    arg1: unknown,
    arg2: unknown,
    options: Handlebars.HelperOptions,
  ) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  },
);

export const render = function(
  template: string,
  data: Record<string, unknown> | undefined,
): string {
  const compiled = Handlebars.compile(template);
  return compiled(data || {});
};
