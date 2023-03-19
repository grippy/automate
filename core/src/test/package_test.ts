import { asserts } from '../../deps_dev.ts';
import { pkg } from '../../mod.ts';

const pkgRecipeName1File = './workspace-example/recipe/name1/Automate.yaml';

Deno.test(
  async function testPackageFromPath() {
    const pkgRecipeName1 = await pkg.Package.fromPath(pkgRecipeName1File);
    console.log(pkgRecipeName1.toObject());
    // console.log(pkgRecipeName1);
  },
);
