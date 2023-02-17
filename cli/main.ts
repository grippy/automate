import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';

import { build, provider, recipe, workspace } from './cmd/mod.ts';

// automate
//    build
//    provider
//      init
//      call
//    recipe
//      init
//      cook
//    workspace
//      init

const main = new Command()
  .name('automate')
  .env('AUTOMATE_LOG_LEVEL=<value:string>', 'set log-level', {
    global: true,
    prefix: 'AUTOMATE_',
  })
  // build
  .command('build', build)
  .description('build workspaces, providers, and recipes')
  // provider
  .command('provider', provider)
  .description('provider management commands')
  // recipe
  .command('recipe', recipe)
  .description('recipe management commands')
  // workspace
  .command('workspace', workspace)
  .description('workspace management commands')
  .parse(Deno.args);

if (import.meta.main) {
  await main;
}
