# Automate Tutorial

This tutorial assumes you're familiar with the high-level concepts.
[See the README](../../) if you need a refresher.

# Table of Contents

Here are the high-level ideas we're going to go over in this tutorial.

<!-- dprint-ignore-start -->

<!-- TOC start -->
- [Install `automate`](#install-automate)
- [Automate Config](#automate-config)
  - [Workspace](#workspace)
  - [Package](#package)
    - [Provider](#provider)
    - [Recipe](#recipe)
  - [Values](#values)
  - [YAML Values to TypeScript Types](#yaml-values-to-typescript-types)
  - [Provider Example](#provider-example)
      - [Build ThingProvider](#build-thingprovider)
      - [Provider Registry](#provider-registry)
      - [Modify ThingProvider Module](#modify-thingprovider-module)
      - [Test Package](#test-package)
      - [ThingProvider CLI](#thingprovider-cli)
  - [Recipe Example](#recipe-example)
    - [Modify Recipe Example](#modify-recipe-example)
    - [Build Recipe Example](#build-recipe-example)
    - [Run Recipe Example](#run-recipe-example)
    - [Complex Recipe Example](#complex-recipe-example)
<!-- TOC end -->

<!-- dprint-ignore-end -->

## Install `automate`

Automate only runs on Linux/MacOS for now...

- [Install `Deno`](https://deno.land/manual@v1.32.0/getting_started/installation)
- Install `automate` cli:

  ```
  git clone https://github.com/grippy/automate.git
  deno task install-cli
  ```

## Automate Config

`Automate.yaml` is the main configuration file.

This file is expected to reside in the root directory for either a `workspace` or `package`.

### Workspace

For example, this is how we define the `automate.ext` workspace.

```yaml
workspace:
  name: ext
  # list paths to workspace packages
  members: ["./provider/docker", "./provider/helm"]
```

### Package

Next up, we have `package` definition types.

These come in two flavors.

#### Provider

```yaml
# This describes a provider for calling `docker run` commands
package:
  type: provider
  namespace: automate.ext
  name: docker
  version: "0.0.0"
  description: |
    Generates `docker` commands and runs them for common docker tasks.
  permissions: [--allow-read, --allow-env, --allow-run]

# Default values go here...
values:
  provider:
    docker:
      run:
```

You'll notice we have a `values` section. "Ok, what's this do, exactly?"

This is something we borrowed from Helm. You know how we can pass multiple values files for a chart and they're merged into a single hierarchical object?

"Yes."

We'll this is a similar concept. Your package definition contains a top-level `values:` object. This section defines your default values for a given provider command.

#### Recipe

This is a basic one-step recipe.

```yaml
# This describes a "helloworld" recipe
package:
  type: recipe
  namespace: automate.ext
  name: helloworld
  version: "0.0.0"
  description: |
    Recipe
  permissions: [--allow-read, --allow-env, --allow-run]

# our greeting for running shell commands
values:
  greet: hello world

recipe:
  steps:
    shell-call:
      - name: Call run command
        # `run` defined as a string runs
        # this text as a shell script
        run: echo '{{ values.greet }}'
```

As you can see, recipes should look/feel familiar. (That's because the `steps` aren't too far removed from GitHub Actions. It's just we call it a recipe, GitHub calls 'em Workflows).

### Values

There's no rules to how we nest Values. In general, you should aim for something like this:

```yaml
values:
  my:
    [name]
      arg1: Matey
      arg2: Captain
      arg3: Ship
  provider:
    [name]:
      [cmd]:
        arg1: {{ values.my.[name].arg1 }}
        arg2: {{ values.my.[name].arg2 }}
        arg3: {{ values.my.[name].arg3 }}
```

This ensures your provider and recipes (if they're shareable) **_should_** have a unique node on the values tree.

Ensuring uniqueness means you must only ever have one package with the same name added as a dependency.

For now, use `my` to define hard coded states we bind to the provider values tree defaults. (We need to do a better job at fleshing out how the values should be defined and used.)

### YAML Values to TypeScript Types

Let's see how we map YAML `values` to TypeScript types:

```yaml
provider:
  thing:
    one:
      likes: [
        - Dr. Seuss
        - Cat in the Hat
      ]
```

This makes working with these values a little on the wordy side, sorry.

But it also means values stomping will be less likely. Fair tradeoff.

Over in TypeScript land, we'd have this:

```typescript
type ThingValues = {
  provider: {
    thing: {
      one?: {
        likes: string[];
      };
      two?: {
        likes?: string[];
      };
    };
  };
};

async one(values: ThingValues): Promise<string> {
  const _likes = values.provider.things.one.likes || [];
  return Promise.resolve('OK');
}
```

## Provider Example

To get started writing a provider you can run the following command to generate an Automate provider package. For example, let's create new `thing` provider package in the current directory, with the following namespace:

```
automate provider init ./thing --namespace=example.org
```

We just created a few files:

- `Automate.yaml` which describes your provider package.
- `mod.ts` which is the bare bones class named `ThingProvider` and few command (automate terminology for a class method) examples.
- `mod_test.ts` which contains a silly test file for asserting `ThingProvider` inputs and outputs.

### Build ThingProvider

There's a required build step which auto-generates a `CLI` wrapper for your new class.

From the `./thing` directory, run the following command:

```
automate build .
```

Now, what just happened?

- A new folder which contains the package cache at `~/.automate/cache/provider.example.org.thing@0.0.0/`
  - `mod.ts` which is the cli wrapper for you package. Yay! Let's test it out:
  - `Automate.yaml` copy
  - `values.yaml` which is copied from `Automate.yaml` values.

- An package entry at `~/.automate/registry/provider.example.org.thing@0.0.0.json` which describes more metadata about this package.

### Provider Registry

> _FYI: These commands don't currently exist for a Recipes yet._

Let's take a looks at the Provider Registry to see what's there:

```
automate provider list
```

This displays the currently installed packages.

From here, we can see how things are named. If we copy and paste the ThingProvider package name we can then show its details:

```
automate provider show provider.example.org.thing@0.0.0
```

Nothing super-special. Just some paths and another version of the config (We need to pick which one we want to use delete the duplicate).

### Modify ThingProvider Module

By default, initializing a new Provider module displays the various sync/async ways we can define command inputs and outputs.

Let's modify `thing/mod.ts` and make `ThingProvider` look something like this:

```typescript
import {
  logging,
  provider,
} from 'https://raw.githubusercontent.com/myorg/myrepo@0.0.1/automate/core/mod.ts';

// create logger
const log = logging.Category('provider.example.org.thing@0.0.0');

// Generic object-literal type for incoming command values
type Values = Record<string, string>;

// Command `one` defines this input type:
type ThingValues = {
  provider: {
    thing: {
      one?: {
        likes: string[];
      };
      two?: {
        likes?: string[];
      };
    };
  };
};

class ThingProvider extends provider.Provider {
  constructor() {
    super();
  }

  // deno-lint-ignore require-await
  async one(values: ThingValues): Promise<string> {
    log.debug(`one called w/ ${values}`);
    const _likes = values.provider.things.one.likes || [];
    return Promise.resolve('OK');
  }

  two(values: ThingValues): string {
    log.debug(`one called w/ ${values}`);
    const _likes = values.provider.things.one.likes || [];
    return 'OK';
  }
}

// All packages export this function...
// deno-lint-ignore require-await
export const initializeProvider = async (): Promise<provider.Provider> => {
  // Notes:
  //
  // 1. This is where you'd initialize any dependencies
  // required by your Provider.
  //
  // 2. This is also where you'd read ENV variables defined in your package
  // definition as `values.env` variable, which are passed as ENV vars
  // when automate runs your this as a CLI or as part of a recipe.
  // const myVar = Deno.env.get('MY_VAR');

  const instance = new ThingProvider();
  return Promise.resolve(instance);
};
```

How you define the input types is completely up to. You can have one type that describes all the commands or you can break each command out with its own type. This example shares a single type.

### Test package

If you want to test your package, you can use this command from any `workspace` or `package` folder.

For example, from the `./thing` directory:

```
automate test .
```

All this does is generate a `deno test`.

If you want to pass additional values to `deno test` then you'd do this:

```
# rerun deno test on every change
automate test . -- --check --watch
```

See `deno test --help` for more details

### ThingProvider CLI

"Hold, up. you said something making a CLI wrapper for my class?"

Yes.

```
automate provider run provider.example.org.thing@0.0.0
```

All Provider CLI's accept the same flags:

```
  Options:

    -h, --help              - Show this help.
    -f, --value   <value>   - Specify values in a YAML file (can specify multiple) (default [])
    -o, --output  <output>  - Write output to file
```

And that's it.

- You describe where to fine input files are and automate calls provider commands with them. You may define multiple input files and these are merged from left-to-right in flag order passed.

- You may also define the name of a file to write output values into. This feature enables reusing Automate Providers from within existing shell scripts...

```bash
#!/bin/bash
export YES='yes'
if [ "$YES" = "yes" ]; then
  automate provider run \
    provider.package@version call \
      -f ./values1.yaml -f ./values2.yaml \
      -o ./output/something.json
fi
```

"Now, this is great, but how often do I need to run the `automate build` stuff?"

- You'll only need to run this command if you edit your `Automate.yaml`.
- Since the CLI wrapper points directly to the provider `mod.ts`, you can edit this without re-running the build step, with one exception:
  - If you change the command input types, you should rebuild to avoid confusion.

** We need to work on a `deno` task to automatically rebuild a package if you modify its files. This could should probably run test scripts before or after the build.

## Recipe Example

Providers are the only real "functionality" behind Automate. That's because Recipes are converted from YAML to TypeScript by calling `automate build`.

Let's write a new recipe named `something` and we'll have it use our `ThingProvider` we defined above.

To make a new recipe

```
automate recipe init ./something --namespace=example.org
```

We just created a single new file:

- `Automate.yaml` which describes your recipe package.

### Modify Recipe Example

Right now, we have a bare-bones recipe, let's define some dependencies and show how to use them.

```yaml
package:
  type: recipe
  namespace: automate.ext
  name: something
  version: "0.0.0"
  description: |
    Recipe to do something
  permissions: [--allow-read, --allow-env, --allow-run]

dependencies:
  provider:
    # this assumes `thing` has the same parent directory
    thing: '../thing'

# our greeting for running shell commands
values:

  my:
    name: Can and the Hat

  provider:
    thing:
      one:
        likes:
          - stuff

recipe:
  steps:
    update:
      - name: Call `thing.one` command with input
        run:
          # recipes use dependency injection so we can make it possible
          # to enable template binding....
          # Since we use dot notation in code, this make it really easy
          # convert this into a function call we make while generating the
          # `RecipeProvider` class. We just need to reference the thing provider
          # like this:
          provider.thing.one:
            # by default, we automatically copy the
            # entire values tree as the input which would
            # look like this:
            # in: {{ values }}
            #
            # However, what if we want to add to the defaults
            # defined in the `package.values`?
            # We could merge additional values like this.
            # `likes` is now [stuff, otherstuff]
            in:
              provider:
                thing:
                  one:
                    likes:
                      - 'otherstuff'
```

This demos some additional recipe features.

In code, we convert this run command to something like this:

```typescript
const result = await provider.thing.one({
  provider: { thing: { one: { likes: ['stuff', 'otherstuff'] } } },
});
```

### Build Recipe Example

Similar to how we build providers, we need to build recipes, too.

From the `./something` directory, run this command to build the recipe:

```
automate build .
```

During the build stage, all the same files are created as part of the Provider build.

There's a new file that's added which that now lives at this path in the registry:

- `~/.automate/cache/recipe.example.org.something@0.0.0/provider/mod.ts`

This file is the auto-generated `RecipeProvider` class (which sub-types `automate.core.provider.Provider`). It converts your Recipe steps into step functions, initializes all defined `provider` and `recipe` dependencies, and provides a command to run the Recipe.

### Run Recipe Example:

If you want to run your new recipe you'd do it like this:

```
automate recipe run recipe.example.org.something@0.0.0
```

Or, if you'd like provide runtime values:

```
automate recipe run recipe.example.org.something@0.0.0 -f ./values1.yaml
```

### Complex Recipe Example

"Ok, the above examples define the bare-minium, can you show me something more complex?"

Sure, let's do it...

```yaml
# This describes a fictitious recipe
package:
  type: recipe
  namespace: automate.ext
  name: helm-install
  version: "0.0.0"
  description: |
    Recipe to install a helm chart into Kubernetes.
  permissions: [--allow-read, --allow-env, --allow-run]

dependencies:
  provider:
    helm: '../path/to/helm/package'
    vault: https://raw.githubusercontent.com/myorg/myrepo@0.0.1/provider/vault

values:
  my:
    docker:
      workdir: /my-app
    helm:
      install:
        force: true
      namespace: production
      release_name: my-app
      flags:
        - '--kubeconfig=./.kube/config'
  docker:
    run:
      options:
        - '--workdir={{ values.my.docker.workdir }}
        - '-v ./:{{ values.my.docker.workdir }}'
  helm:
    get:
      namespace: {{ values.my.helm.namespace }}
      name: {{ values.my.helm.release_name }}
      flags: {{ values.my.helm.flags }}

recipe:
  steps:
    # lookup state values
    gather:
      - name: Write kubeconfig file
        run:
          provider.vault.get:
            in:
              provider:
                vault:
                  key: secret/production/kubeconfig
            # store cmd value in `file ./kubeconfig`
            out:
              file: ./kubeconfig
    check:
      - name: Check if helm release exists
        run:provider.helm.get:
          in:
            provider:
              helm:
                get:
                  release_name: {{ values.my.helm.release_name }}
          out: release_exists
    install:
      - if: (state.release_exists && "{{ values.my.helm.install.force }}" === "true")
        name: Helm uninstall release
        run:provider.helm.uninstall:
          in:
          out:
            state: previous_release
      - if: (!state.release_exists)
        name: Helm install release
        run:provider.helm.install:
          in:
          out:
            state: next_release
```
