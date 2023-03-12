# Done
- [x] Simplify Provider
- [x] Build packages in cache and registry for local packages
- [x] Add test file to provider package init command
- [x] `AUTOMATE_ROOT` (automate home directory should be configurable)
- [x] Packages should define a namespace
- [x] Packages should name registry package entries as type.namespace.name@version
- [x] Package names and namespaces need character validation (a-zA-Z0-9-.)

# `automate test`
- [x] Generate `deno test --allow-env ... path` for workspace/packages (pass deno test options through)

# `automate clean`
- [x] clan the AUTOMATE_ROOT directory

# Automate.yaml
- [x] Should define default `values.env` section for provider/recipes

# Package Stuff
- [x] Add provider commands with types to Automate.yaml
    - [ ] Surface these commands when calling `automate provider list`
- [ ] Publish release version 0.0.0 as git tag
- [ ] Publish `automate-examples` project
- [ ] Build packages stored on the web


# CLI Stuff
## `automate provider run`
- [x] Add values parsing with flags
- [ ] Use files to store provider output

## `automate build`
- [ ] Ideate how building/running recipes should work

## `automate` ENV variables
- [ ] `AUTOMATE_TMP` (automate temp directory for where to store output files)

# Inline todo's in the project
- [ ] Make `automateCoreModPath` configurable for local development
