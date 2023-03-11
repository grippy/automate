import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';

import { build, provider, recipe, test, workspace } from './cmd/mod.ts';

const main = new Command()
  .name('automate')
  .env('AUTOMATE_LOG_LEVEL=<value:string>', 'set log-level', {
    global: true,
    prefix: 'AUTOMATE_',
  })
  // build
  .command('build', build)
  .description('Build workspaces, providers, or recipes')
  // provider sub-commands
  .command('provider', provider)
  .description('Provider management commands')
  // test sub-command
  .command('test', test)
  .description(
    'Generate and run a `deno test [permissions] .` command using the collective permissions across a workspace or package.',
  )
  // recipe sub-commands
  .command('recipe', recipe)
  .description('Recipe management commands')
  // workspace sub-commands
  .command('workspace', workspace)
  .description('Workspace management commands')
  .parse(Deno.args);

if (import.meta.main) {
  await main;
}
