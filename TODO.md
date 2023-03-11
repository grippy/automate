# Done
- [x] Simplify Provider
- [x] Build packages in cache and registry for local packages
- [x] Add test file to provider package init command

# `automate test`
- [x] Generate `deno test --allow-env ... path` for workspace/packages (pass deno test options through)

# Automate.yaml
- [x] Should define default `values.env` section for provider/recipes

# Package Stuff

- [ ] Packages should define a namespace
- [ ] Publish release version 0.0.0 as git tag
- [ ] Publish `automate-examples` project
- [ ] Build packages stored on the web
- [x] Add provider commands with types to Automate.yaml
    - [ ] Surface these commands when calling `automate provider list`

# CLI Stuff
## `automate provider run`
- [x] Add values parsing with flags
- [ ] Use files to store provider output

## `automate build`
- [ ] Ideate how building/running recipes should work

## `automate clean`
- [ ] Nuke the `.automate` home directory

## `automate` ENV variables
- [ ] `AUTOMATE_HOME` (automate home directory should be configurable)
- [ ] `AUTOMATE_TMP` (automate temp directory for where to store output files)

# Inline todo's in the project
- [ ] Make `automateCoreModPath` configurable for local development
