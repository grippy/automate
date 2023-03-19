import { assertEquals } from 'https://deno.land/std@0.174.0/testing/asserts.ts';
import { initializeProvider } from './mod.ts';

Deno.test(async function testProviderName2 () {
  const provider = await initializeProvider();

  const goes2 = 11;
  assertEquals(goes2, 11);
});
