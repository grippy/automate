import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';

/**
 * Recipe cooke sub-command
 */
export const cook = new Command()
  .arguments('<source:string> [destination:string]')
  .description('Clone a repository into a newly created directory.')
  .action((options: any, source: string, destination?: string) => {
    console.log('clone command called');
  });
