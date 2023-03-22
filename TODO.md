# Done

## alpha-1
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
- [x] Should detect if initializeProvider is async or sync
- [x] Move `cli/constants.ts` to automate core
- [x] Refactor build config loading into Package class
- [x] `automate recipe run` ideate how building/running recipes should work:
    - [x] Convert recipe yaml => RecipeProvider ts module
    - [x] step template binding from values & state object
    - [x] values merging
    - [x] store step output as state key

- [x] Move automate config loading to `config.ts`
- [x] Move directory `core/src/test` => `core/test`
- [x] Move all file loading out of the cli commands module and into the method that uses the code
- [x] Properly handle `Deno.errors.NotFound` errors
- [x] `automate.test` takes a `path` now and resolves member paths
- [x] `automate.build` takes a `path` now and resolves member paths
- [x] Deno github actions workflow
- [x] Top-level Deno tasks: `install-cli`, `cli-*-test-workspace`
- [x] Rename `AUTOMATE_CORE_MOD_PATH` => `AUTOMATE_CORE` and change it the root core path.
- [x] Make sure all commands work using github actions workflow
- [x] Replace Eta w/ Handlebars
- [x] Make `automateCoreModPath` configurable for local development
- [x] Providers should have a `-h` command
- [x] `Automate.yaml` adds:
    - `recipe.steps.step.name`
    - `recipe.steps.step.description`
    - `recipe.steps.step.dep`

## alpha-3
- [ ] `automate provider run` should use files to store provider output for provider calls
    - [ ] `AUTOMATE_TMP` (automate temp directory for where to store output files)
- [ ] `automate recipe run` Reading values should merge across a top-level package and child dependency. Something like : `recipe.vales & deps1.values & deps2.values, ...`. Then we can move ENV to command options.
- [ ] `automate recipe show` should show log values files and the final state
- [ ] `automate build` Add recipe yaml step field `sh` for running shell commands
- [ ] `automate build` Add recipe yaml step field `ts` for generating typescript code
- [ ] `automate build` Template helpers:
    - [ ] Figure out how registering template helpers works
- [ ] `delete` `cli/template/registry-package.json` and do this in the build step
- [ ] `refactor` cli code and move copypasta into `utils.ts` module.
- [ ] `README.md` add more details about how Recipe generation works.
- [ ] `automate build` should handle building nested workspaces

## alpha-4
- [ ] `release-recipe` define recipe yaml for release code to github
- [ ] `automate recipe run` release recipe
- [ ] `automate.core` add `version.ts` placeholder with defaults.
    - AUTOMATE_VERSION
    - DENO_VERSION
- [ ] Publish release version 0.0.0 as git tag

## alpha-5
- [ ] Build packages stored on the web
    - [ ] `Automate.yaml` Convert remote dependencies from relative to absolute

## Backlog

### Package Stuff
### Automate.yaml
### CLI Stuff
- [ ] `AUTOMATE_WORKSPACE`
### Refactor
### Testing
- [ ] More core tests are needed.
### Packaging Automate CLI
- [ ] Docs around installing this tool
- [ ] Figure out how we package the automate cli and have it generate `deno` commands.
### Docker Runtime Container
- [ ] Docker for local development
