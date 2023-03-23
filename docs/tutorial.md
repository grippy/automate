# Automate Tutorial

This tutorial assumes you're familiar with the high-level concepts.
[See the README](../../) if you need a refresher.

## Install `automate`

Automate only runs on Linux/MacOS for now...

- Install `Deno`
- Install `automate` cli

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

Next up, we have `package` definition types.

These come in two flavors.

### Providers

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

You'll notice we have Values section. "Ok, what's this do, exactly?"

This is something we borrowed from Helm. You know how we can pass multiple values files for a chart and they're merged into a single hierarchical object? "Yes."

We'll this is a similar concept. Your package definition contains a top-level `values:` object. This section defines your default values for a given provider command.

### Values Convention

There's no hard-fast rules to how we nest Values. In general, you should aim for something like this:

```yaml
values:
  provider:
    [provider-name]:
      [provider-cmd]:
        arg1:
        arg2:
        arg3:
  recipe:
    [recipe-name]:
      [recipe-cmd]:
        key1:
        key2:
        key3:
```

This ensures your provider and recipes (if they're shareable) **_might_** have a unique node on the values tree.
Ensuring uniqueness means you should only ever have one package with the same name added a dependency.

We need to do a better job at fleshing out how the values should be defined and used.

### Values => TypeScript Types

Let's see how we can map YAML `values` to TypeScript types:

```
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
type ThingOneValues = {
  provider: {
    thing: {
      one?: {
        likes: string[];
      };
      two?:
        likes?: string[];
    };
  };
};

async one(values: ThingOneValues): Promise<string> {
  const _likes = values.provider.things.one.likes || [];
  return Promise.resolve('OK');
}
```

### Recipes

This is a basic one-step recipe.

```yaml
# This describes a "hello world" recipe
package:
  type: recipe
  namespace: automate.ext
  name: helloworld
  version: "0.0.0"
  description: |
    Recipe
  permissions: [--allow-read, --allow-env, --allow-run]

dependencies:
  provider:
    vault: https://raw.githubusercontent.com/myorg/myrepo@0.0.1/provider/vault

# our greeting for running shell commands
values:
  greet: hello world

recipe:
  steps:
    shell-call:
      - name: Call run command
        run: echo '{{ values.greet }}'
```

As you can see, recipes should look/feel familiar. (That's because the `steps` aren't too far removed from GitHub Actions. It's just we call it a recipe, GitHub calls 'em Workflows).







## Provider Code

To get started writing a provider you can run the following command to generate an Automate provider package. For example, let's create new `thing` package in the current directory, with the following namespace:

```
automate provider init ./thing --namespace=example.org
```

We just created a few files:
- `Automate.yaml` which describes your package.
- `mod.ts` which is the bare bones class named `ThingProvider` and few command (automate terminology for a class method) examples.
- `mod_test.ts` which contains a silly test file for asserting `ThingProvider` inputs and outputs.


### Building ThingProvider

There's a required build step which auto-generates `Provider CLI` wrapper for your new class.

From the `./thing` directory, run the following command:

```
automate build .
```

Now, what just happened:

- A new folder which contains the package cache at `~/.automate/cache/provider.example.org.thing@0.0.0/`
  - `mod.ts` which is the cli wrapper for you package. Yay! Let's test it out:
  - `Automate.yaml` copy
  - `values.yaml` which is copied from `Automate.yaml` values.

- An package entry at `~/.automate/registry/provider.example.org.thing@0.0.0.json` which describes more metadata about this package.

### Provider Registry....

Let's take a looks at the Provider Registry to see what's there:

```
automate provider list
```

This displays the currently installed packages.

From here, we can see how things are named. If we copy and paste the ThingProvider name we can then show its details:

```
automate provider shot provider.example.org.thing@0.0.0
```

Nothing super-special. Just some paths and another version of the config (We need to pick which one we want to use delete the duplicate).


** These commands don't currently exist for a Recipes yet.

### thing/mod.ts:

```ts
import { logging, provider } from 'https://raw.githubusercontent.com/myorg/myrepo@0.0.1/automate/core/mod.ts';

// create logger
const log = logging.Category('provider.example.org.thing@0.0.0');

// Generic object-literal type for incoming command values
type Values = Record<string, string>;

class ThingProvider extends provider.Provider {
  constructor() {
    super();
  }

  // deno-lint-ignore require-await
  async one(values: Values): Promise<string> {
    log.debug(`one called w/ ${values}`);
    return Promise.resolve('OK');
  }

  two(values: Values): string {
    log.debug(`two called w/ ${values}`);
    return 'OK';
  }

}

// All packages export this function...
// deno-lint-ignore require-await
export const initializeProvider = async (): Promise<provider.Provider> => {
  const instance = new ThingProvider();
  return Promise.resolve(instance);
};

```

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


## Recipe

Providers are the only real "functionality" behind Automate.

Recipes are converted from YAML to TypeScript by calling `automate build`.

During the build stage, a `RecipeProvider` class (which sub-types `automate.core.provider.Provider`) is added to the Registry cache at this location:

- `~/.automate/cache/provider.{pkg.namespace}.{pkg.name}@{pkg.version}/provider/mod.ts`

This file converts your Recipe steps into step functions, initializes all defined `provider` and `recipe` dependencies and provides a command to run a Recipe.

For example, here's how you'd run a recipe packaged named `recipe.live.long.prosper@0.42.0`:

```
automate recipe run recipe.live.long.prosper@0.42.0 -f ./values1.yaml -o ./output/spock.yaml
```

### More Complex Recipe

"Ok, the above examples define the bare-minium, can you show me something more complex?

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
    lookup:
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