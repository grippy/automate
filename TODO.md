# Done

## alpha
- [x] Simplify Provider
- [x] Build packages in cache and registry for local packages
- [x] Add test file to provider package init command
- [x] `AUTOMATE_ROOT` (automate home directory should be configurable)
- [x] Packages should define a namespace
- [x] Packages should name registry package entries as type.namespace.name@version
- [x] Package names and namespaces need character validation (a-zA-Z0-9-.)
- [x] Automate.yaml should define default `values.env` section for provider/recipes
- [x] Automate.yaml should define provider commands with input/output types
- [x] use deps.ts and deps_dev.ts for re-exporting external modules
- [x] add `automate provider show` cli command and display package registry details
- [x] `automate test` Generate `deno test --allow-env ... path` for workspace/packages (pass deno test options through)
- [x] `automate clean` clean the AUTOMATE_ROOT directory
#
- [x] `automate provider run` add values parsing with flags
- [x] `automate provider run` generate `deno run` command along with permissions and env vars for calling provider cli wrapper
- [x] `automate provider init` Using `-ns` with `-n`: error: Option "-n" can only occur once, but was found several times.

## alpha-2
- [x] should detect if initializeProvider is async or sync
- [x] mv cli/constants.ts to core
- [x] Refactor build command into Package class
- [x] `automate recipe run` ideate how building/running recipes should work
- [x] Move automate config loading to `config.ts`
- [ ] Move directory `core/src/test` => `core/test`
- [ ] Make sure all commands work
- [ ] Make a `watch` command for running build

# TODO

## Recipes
- [ ] Add Step field name `sh` for running shell commands
- [ ] Figure out how passing values into recipe steps works
- [ ] Figure out how registering template helpers works

## Template
- [ ] Replace Eta w/ Handlebars

## Core `version.ts`
- [ ] Create a placeholder for now. This file should have the automate version in it (along with the minimum Deno version allowed)

## Automate.yaml
- [ ] `Automate.yaml` adds `recipe.steps.step.name`, `recipe.steps.step.description`, and `recipe.steps.step.dep`

## Package Stuff
- [ ] Publish release version 0.0.0 as git tag
- [ ] Publish `automate-examples` project
- [ ] Build packages stored on the web

## CLI Stuff

### Provider
- [ ] Use files to store provider output

### Refactor

### `automate` ENV variables
- [ ] `AUTOMATE_TMP` (automate temp directory for where to store output files)

## Inline todo's in the project
- [ ] Make `automateCoreModPath` configurable for local development

## Testing
- [ ] More core tests are needed.
- [ ] Providers should have a `-h` command

## Github Action
- [ ] Wire up the test suit

## Packaging Automate CLI
- [ ] Docs around installing this tool
- [ ] Figure out how we package the automate cli.

## Docker Runtime Container
- [ ] This would make it easier to distribute
