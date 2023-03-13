import { cliffy } from '../../deps.ts';

// TODO: rename this command run

/**
 * Recipe cook sub-command
 */
export const cook = new cliffy.Command()
  .arguments('<source:string> [destination:string]')
  .description('Clone a repository into a newly created directory.')
  .action((options: any, source: string, destination?: string) => {
    console.log('clone command called');
  });
