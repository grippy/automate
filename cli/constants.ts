// automate config file name
export const configFileName = 'Automate.yaml';
// this refers to the workspace or package being built
export const configFile = `./${configFileName}`;

// default .automate directory
export const automateDefaultRoot = `${Deno.env.get('HOME')}/.automate`;

// .automate directory
export const automateRootDir = Deno.env.get('AUTOMATE_ROOT') ||
  automateDefaultRoot;
export const automateCacheDir = `${automateRootDir}/cache`;
export const automateRegistryDir = `${automateRootDir}/registry`;

// TODO: make this configurable
export const automateCoreModPath =
  '/Users/gmelton/work/automate/core/src/mod.ts';

// Verify package namespace passes formatting check
// Allowable: a-z A-Z 0-9 .
export const automatePackageNamespaceVerifier = new RegExp(
  /^(?!\.)[a-zA-z0-9\.]*(?<!\.)$/,
);

// Verify package name passes formatting checks
// a-z A-Z 0-9 - _ .
export const automatePackageNameVerifier = new RegExp(
  /^(?!\-\_\.)[a-zA-z0-9\-\_\.]*(?<!\-\_\.)$/,
);
