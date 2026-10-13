import test from 'node:test';
import assert from 'node:assert/strict';
import {followPan} from './camera-follow.mjs';
test('camera tracking is smooth and independent of frame rate',()=>{
 const target={x:2.5,z:-2.5},one={x:0,z:0},many={x:0,z:0};
 followPan(one,target,.1);
 for(let i=0;i<10;i++)followPan(many,target,.01);
 assert.ok(one.x>0&&one.x<target.x);
 assert.ok(Math.abs(one.x-many.x)<1e-10);
 assert.ok(Math.abs(one.z-many.z)<1e-10);
});
test('reduced motion snaps to the piece without camera drift',()=>{
 const pan={x:-2,z:1};followPan(pan,{x:2,z:-1},.016,true);
 assert.deepEqual(pan,{x:2,z:-1});
 followPan(pan,{x:0,z:0},0);assert.deepEqual(pan,{x:2,z:-1});
});
