import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {DICE_FACES,diceRestRotation,dicePose,diceSupport} from './dice-motion.mjs';
const normals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
test('every result lands with the correct face up and opposite faces sum to seven',()=>{
 for(let value=1;value<=6;value++){const pose=dicePose(1,0,value),up=normals.map(n=>new THREE.Vector3(...n).applyQuaternion(pose.rotation).y);assert.equal(DICE_FACES[up.indexOf(Math.max(...up))],value);assert.ok(Math.abs(pose.y-.15)<1e-10);}
 for(let i=0;i<6;i+=2)assert.equal(DICE_FACES[i]+DICE_FACES[i+1],7);
});
test('dice never penetrate the board during the tumble and successive bounces diminish',()=>{
 for(let i=0;i<2;i++)for(let t=0;t<=100;t++){const pose=dicePose(t/100,i,4);assert.ok(pose.y-diceSupport(pose.rotation)>=-.05000001);assert.ok(Number.isFinite(pose.y));}
 const lift=p=>{const pose=dicePose(p,0,4);return pose.y-diceSupport(pose.rotation)+.05;};assert.ok(lift(.275)>lift(.675)&&lift(.675)>lift(.9));
});
test('both dice finish separated, flat, and stable even after the animation deadline',()=>{for(let i=0;i<2;i++){const end=dicePose(1,i,3),late=dicePose(2,i,3);assert.deepEqual(end,late);assert.ok(end.rotation.angleTo(diceRestRotation(3))<1e-8);}assert.ok(dicePose(1,1,3).x-dicePose(1,0,3).x>.4);});
