import { assertEquals } from 'https://deno.land/std@0.174.0/testing/asserts.ts';
import { initializeProvider } from './mod.ts';

Deno.test(async function test{{ pack.registry.providerClassName }} () {
  const _provider = await initializeProvider();

  const goes2 = 11;
  assertEquals(goes2, 11);
});
