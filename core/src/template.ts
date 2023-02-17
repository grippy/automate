import * as Eta from 'https://deno.land/x/eta@v2.0.0/mod.ts';

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
  data: object | undefined,
): string {
  return Eta.render(template, data || {});
};
