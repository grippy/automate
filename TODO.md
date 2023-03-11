# Install Automate Cli
deno install "http://github.com/grippy/automate/cli/mod.ts"
deno compile "http://github.com/grippy/automate/cli/mod.ts"
deno bundle "http://github.com/grippy/automate/cli/mod.ts"


See `Rad` for install examples:
https://deno.land/x/rad@v6.9.1

# Next Steps

# [x] Simplify Provider

# [x] Build packages in cache and registry for local packages

# [x] Add test file to provider package init command

# [ ] Publish release version 0.0.0 as git tag

# [ ] Build packages stored on the web

# [ ] Packages should define a namespace

# [x] Add provider commands with types to Automate.yaml
# [ ]   - Surface these commands when calling `automate provider list`

# [ ] `automate provider run`
# [ ]   - Add values parsing with flags
# [ ]   - Use files to store output

# [ ] `automate test`
# [ ]   - Generate `deno test --allow-env ... path` for workspace

# [ ] Numerous todo's in the project
# [ ]   - Make automate home directory configurable
# [ ]   - Make automateCoreModPath configurable for local development

# Automate.yaml
# [x] - Should define default `values.env` section for provider/recipes
