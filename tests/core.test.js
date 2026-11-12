import test from 'node:test';import assert from 'node:assert/strict';import {hash,next} from '../src/worker.js';
test('password derivation is repeatable and salted',async()=>{assert.equal(await hash('sample-password','salt1'),await hash('sample-password','salt1'));assert.notEqual(await hash('sample-password','salt1'),await hash('sample-password','salt2'))});
test('lifecycle blocks skipping stages and binding retirement automatically',()=>{assert.deepEqual(next.idea,['validation']);assert.equal(next.idea.includes('launch'),false);assert.deepEqual(next.retirement,[])});
