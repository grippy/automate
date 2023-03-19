import { asserts } from '../deps_dev.ts';
import { pkg } from '../mod.ts';

const dirname = new URL('.', import.meta.url).pathname;

Deno.test(
  async function testPackageProviderFromPath() {
    const pkgFile = `${dirname}/workspace-example/provider/name1/Automate.yaml`;
    const pack = await pkg.Package.fromPath(pkgFile);
    asserts.assertEquals(
      pack.name,
      'provider.test.workspace.example.name1@0.0.0',
    );
    asserts.assertEquals(
      pack.registry.depInjectionName,
      'provider.name1',
    );
    asserts.assertEquals(
      pack.registry.providerClassName,
      'ProviderName1',
    );
  },
);

Deno.test(
  async function testPackageRecipeFromPath() {
    const pkgFile = `${dirname}/workspace-example/recipe/name1/Automate.yaml`;
    const pack = await pkg.Package.fromPath(pkgFile);
    asserts.assertEquals(
      pack.name,
      'recipe.test.workspace.example.name1@0.0.0',
    );
    asserts.assertEquals(
      pack.registry.depInjectionName,
      'recipe.name1',
    );
    asserts.assertEquals(
      pack.registry.providerClassName,
      'ProviderName1',
    );
  },
);
