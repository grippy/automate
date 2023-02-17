import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';

/**
 * Provider call sub-command
 */
export const call = new Command()
  .arguments('<source:string> [destination:string]')
  .description('Clone a repository into a newly created directory.')
  .action((options: any, source: string, destination?: string) => {
    console.log('clone command called');
  });
