import test from 'node:test';
import assert from 'node:assert/strict';
import {turnSummary} from './turn-summary.mjs';
const match=()=>({players:[{model:{id:'you',name:'You'},position:9,cash:1000},{model:{id:'claude',name:'Claude'},position:0,cash:1255}],events:[{player:'you',name:'You',action:{type:'roll'},outcome:'Landed on Memory Lane.',cashAfter:1145,transfers:[{from:'you',to:'claude',amount:55,category:'rent'}]},{action:{type:'end'}}]});
test('rent result names the street, payer, recipient and recorded remaining cash',()=>{
 const s=turnSummary(match());assert.equal(s.title,'You at Memory Lane');assert.deepEqual(s.payments,['You paid Claude $55 for rent.']);assert.equal(s.cash,'You have $1,145 cash left.');
});
test('a no-payment landing is explicit and an empty game has no result',()=>{
 const m=match();m.events[0].transfers=[];assert.equal(turnSummary(m).noPayment,'No cash changed hands.');m.events=[];assert.equal(turnSummary(m),null);
});
