// automate config file name
export const configFileName = 'Automate.yaml';
// this refers to the workspace or package being built
export const configFile = `./${configFileName}`;

// TODO: make this configurable
export const homeDir = Deno.env.get('HOME');
export const automateRootDir = `${homeDir}/.automate`;
export const automateCacheDir = `${automateRootDir}/cache`;
export const automateRegistryDir = `${automateRootDir}/registry`;

// TODO: make this configurable
export const automateCoreModPath =
  '/Users/gmelton/work/automate/core/src/mod.ts';
