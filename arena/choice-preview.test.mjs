import test from 'node:test';
import assert from 'node:assert/strict';
import {demoRoster,spaces,rent} from './game.mjs';
import {startQuick,quickApply} from './quick-game.mjs';
import {purchasePreview,buildingPreview} from './choice-preview.mjs';
test('purchase preview reconciles cash and rent, including a newly completed pair',()=>{
 const m=startQuick(demoRoster.slice(0,1));m.phase='act';m.players[0].position=1;
 const pair=spaces.findIndex((s,i)=>i!==1&&s.group===spaces[1].group);m.properties[pair].owner='human/you';
 const original=JSON.stringify(m),preview=purchasePreview(m),bought=quickApply(m,{type:'buy',space:1});
 assert.equal(preview.cashAfter,bought.players[0].cash);assert.equal(preview.visitorRent,rent(bought,1));assert.equal(preview.completesPair,true);
 assert.equal(preview.payingVisits,Math.ceil(spaces[1].price/rent(bought,1)));assert.equal(JSON.stringify(m),original);
});
test('building preview uses the actual house multiplier in beginner and legacy saves',()=>{
 for(const houses of [0,1]){
  const m=startQuick(demoRoster.slice(0,1));m.phase='act';m.houseLimit=3;m.players[0].position=1;m.purchaseResolved=true;
  spaces.forEach((s,i)=>{if(s.group===spaces[1].group)m.properties[i].owner='human/you';});m.properties[1].houses=houses;
  const original=JSON.stringify(m),preview=buildingPreview(m,1),built=quickApply(m,{type:'build',space:1});
  assert.equal(preview.after,rent(built,1));assert.equal(preview.before,rent(m,1));assert.equal(JSON.stringify(m),original);
 }
});
