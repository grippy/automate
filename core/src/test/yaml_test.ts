import * as asserts from 'https://deno.land/std@0.174.0/testing/asserts.ts';
import { ToInstance, Type } from '../record.ts';
import { load, loadAll, mergeLoad } from '../yaml.ts';

///////////////////////////////////////
// Test loading yaml to classes
///////////////////////////////////////
const DOCUMENT = './src/test/fixture/yaml-test.yaml';
const DOCUMENTS = './src/test/fixture/yaml-test-multiple.yaml';

class MyTest {
  a!: string | null;
  b!: string | null;
}

class Root {
  @Type(() => MyTest)
  mytest!: MyTest;
}

const testDoc = function(doc: any) {
  const root = ToInstance(Root, doc);
  asserts.assertInstanceOf(root, Root, 'expected type Root');
  asserts.assertInstanceOf(root.mytest, MyTest, 'expected type MyTest');
};

Deno.test(
  async function testLoad() {
    const doc = await load(DOCUMENT);
    testDoc(doc);
  },
);

Deno.test(
  async function testLoadAll() {
    const documents = await loadAll(DOCUMENTS);
    documents.forEach(testDoc);
  },
);

///////////////////////////////////////
// Test merging multiple yaml files to objects
///////////////////////////////////////

Deno.test(
  async function testMergeLoad() {
    const merged1 = await mergeLoad([
      './src/test/fixture/yaml-merge-1.yaml',
      './src/test/fixture/yaml-merge-2.yaml',
    ]);
    // console.log('merged1', merged1);
    asserts.assertEquals(merged1.class1.prop1, 'happy2');
    asserts.assertEquals(merged1.class1.prop2.field1, 'default');
    asserts.assertEquals(merged1.class1.prop3.field1.length, 1);
    asserts.assertEquals(merged1.class1.prop3.field1[0], 'golucky');
    asserts.assertEquals(merged1.target.stack, 'dev');

    const merged2 = await mergeLoad([
      './src/test/fixture/yaml-merge-1.yaml',
      './src/test/fixture/yaml-merge-2.yaml',
      './src/test/fixture/yaml-merge-3.yaml',
    ]);
    // console.log('merged2', merged2);
    asserts.assertEquals(merged2.class1.prop1, 'happy2');
    asserts.assertEquals(merged2.class1.prop2.field1, 'is');
    asserts.assertEquals(merged2.class1.prop3.field1.length, 1);
    asserts.assertEquals(merged2.class1.prop3.field1[0], 'golucky');
    asserts.assertEquals(merged2.target.stack, 'production');
  },
);
