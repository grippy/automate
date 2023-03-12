# Done
- [x] Simplify Provider
- [x] Build packages in cache and registry for local packages
- [x] Add test file to provider package init command
- [x] `AUTOMATE_ROOT` (automate home directory should be configurable)
- [x] Packages should define a namespace
- [x] Packages should name registry package entries as type.namespace.name@version
- [x] Package names and namespaces need character validation (a-zA-Z0-9-.)
- [x] Automate.yaml should define default `values.env` section for provider/recipes
- [x] Automate.yaml should define provider commands with input/output types

# `automate provider show`
- [x] add cli command and display package registry details

# `automate test`
- [x] Generate `deno test --allow-env ... path` for workspace/packages (pass deno test options through)

# `automate clean`
- [x] clan the AUTOMATE_ROOT directory

# `automate provider run`
- [x] Add values parsing with flags
- [x] Generate `deno run` command along with permissions and env vars for calling provider cli wrapper

# TODO

## Automate.yaml

## Package Stuff
- [ ] Publish release version 0.0.0 as git tag
- [ ] Publish `automate-examples` project
- [ ] Build packages stored on the web

## CLI Stuff

### Provider
- [ ] Use files to store provider output

### Refactor
- [ ] Move copy/paste automate config loading somewhere else

### Recipes
- [ ] Ideate how building/running recipes should work

### `automate` ENV variables
- [ ] `AUTOMATE_TMP` (automate temp directory for where to store output files)

## Inline todo's in the project
- [ ] Make `automateCoreModPath` configurable for local development

## Testing
- [ ] More core tests are needed.

## Github Action
- [ ] Wire up the test suit

## Packaging Automate CLI
- [ ] Docs around installing this tool
- [ ] Figure out how we package the automate cli.

## Docker Runtime Container
- [ ] This would make it easier to distribute
