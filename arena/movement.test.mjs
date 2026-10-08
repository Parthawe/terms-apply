import {test} from 'node:test';
import assert from 'node:assert/strict';
import {movementRoute} from './movement.mjs';
test('dice movement follows each perimeter square and wraps through Start',()=>{
 assert.deepEqual(movementRoute(18,3,5),[19,0,1,2,3]);
 assert.deepEqual(movementRoute(2,7,5),[3,4,5,6,7]);
});
test('timeout relocation and missing dice never invent a dice path',()=>{
 assert.deepEqual(movementRoute(15,5,4),[5]);
 assert.deepEqual(movementRoute(0,8),[8]);
});
