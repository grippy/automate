import { Eta } from '../deps.ts';

// Set defaults for rendering strings....
Eta.configure({
  tags: ['{{', '}}'],
  parse: {
    exec: '""',
    interpolate: '',
    raw: '~',
  },
  // skip namespacing variables
  useWith: true,
  // don't control whitespace
  autoTrim: false,
});

export const render = function(
  template: string,
  data: Record<string, unknown> | undefined,
): string {
  return Eta.render(template, data || {});
};
