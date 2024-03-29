[![Deno](https://github.com/grippy/automate/actions/workflows/deno.yml/badge.svg)](https://github.com/grippy/automate/actions/workflows/deno.yml)

# Automate

Automate is a [Deno](https://deno.land/) "framework" and simple package installer for automating things with TypeScript.

To accomplish this, you create `providers` and `recipes`. A provider operates on input and optionally returns output. A provider may make API calls, read/write files, work with secrets, build/deploy code, call other CLI programs, you name it. Providers expose their functionality as class instances which are wrapped as CLI programs.

Recipes construct templated steps for running provider commands. (How this works is still TBD).

Both providers and recipes are written as Automate "packages" to make code reuse easy.

# Inspiration

Do you ever find yourself repeating tasks across multiple repos or file systems? System or DevOps types tasks come mind here.

Automate draws inspiration from the following things:

- Deno for its amazing features
- Puppet/Chef/Ansible for manipulating servers or Terraform for the cloud
- GitHub actions and similar YAML/config driven tools
- Cargo packages for workspaces and package definitions
- Helm/Hiera for hierarchical values as inputs
- OpenAPI spec/code generation

# Automate Dependencies

Automate currently only has one dependency which is Deno. This enables executing TypeScript inside the Deno runtime.

Deno uses V8 under the hood and features permission based sand-boxing (for example: reading/writing to disk, making networks calls, reading env variables, etc).

Deno installs modules at runtime (sourced locally or from the web) and caches missing modules locally (both similar to how Go works).

While Automate only requires Deno, you might find these additional dependencies come in handy:

- `docker`: so we can run commands inside containers without having to install additional dependencies on the local file system.
- `dprint`: for developing Automate code. (Eventually, we can run this as Automate provider package.)
  The VSCode config in this repo uses dprint. You'll want to install [this plugin here](https://marketplace.visualstudio.com/items?itemName=dprint.dprint).

# Automate Packages

All Automate packages must contain an `Automate.yaml` file.

This file defines the following:

- A `workspace` (a collection of local Automate members).

- Or `package` metadata, along with dependencies and where to install additional Automate packages from. Packages describe either provider commands (input and output data types) or recipes.

More details and documentation to come about packages.

# Automate CLI

The `automate` cli features a few useful commands for jumping into things.

## Code Generation Commands

- `automate workspace init`: initializes files for organizing a workspace or providers or recipes.

- `automate provider init`: initializes a new provider library by providing stub to get you started.

- `automate recipe init`: initializes a new recipe file.

## Build Command

- `automate build`: This command iterates and caches workspace members and/or package dependencies. It also creates local CLI wrappers for all provider dependencies or generates code for recipes.

## Clean Command

- `automate clean`: This command cleans the $AUTOMATE_ROOT directory.

## Test Command

- `automate test`: This command generates `deno test` commands across a workspace or package.

## Run Commands

- `automate provider run`: This command runs provider commands. You pass it zero or more `values.yaml` files and define how to save the output.

- `automate recipe run`: This command runs recipes.

## Registry Commands

- `automate provider list`: This command lists all installed providers.

- `automate provider show`: This command shows the registry package details.
