import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';

import { build, clean, provider, recipe, test, workspace } from './cmd/mod.ts';

const main = new Command()
  .name('automate')
  // This enables toggling between local dev & release versions
  .env(
    'AUTOMATE_CORE_MOD_PATH=<value:string>',
    'Set path to the `automate` TypeScript module used for code-gen import statements.',
    {
      global: true,
      prefix: 'AUTOMATE_',
    },
  )
  .env(
    'AUTOMATE_ROOT=<value:string>',
    'Set path to `.automate` directory (defaults to $HOME/.automate)',
    {
      global: true,
      prefix: 'AUTOMATE_',
    },
  )
  .env('AUTOMATE_LOG_LEVEL=<value:string>', 'Set log-level', {
    global: true,
    prefix: 'AUTOMATE_',
  })
  // build
  .command('build', build)
  .description('Build workspaces, providers, or recipes')
  // clean
  .command('clean', clean)
  .description('Cleans AUTOMATE_ROOT directory. Defaults to $HOME/.automate')
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
