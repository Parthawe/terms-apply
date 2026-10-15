import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrivateRunner} from './private-runner.mjs';
import {startQuick,quickApply} from './quick-game.mjs';
import {demoRoster} from './game.mjs';
function fixture({ai=false,final=false,mode='demo'}={}){
 let m;for(let seed=1;seed<200;seed++){const before=startQuick(demoRoster.slice(0,1),1,seed);if(ai)before.current=1;if(final)before.players.forEach((p,i)=>p.turns=i===before.current?9:10);if(quickApply(before,{type:'roll'}).lastNews){m=before;break;}}
 let saved=JSON.stringify({version:1,mode,match:m,started:true,paused:false,status:'playing',message:'',usage:{cost:0,reserved:0,requests:0,uncertain:false},budget:.25});
 const storage={getItem:()=>saved,setItem:(_,v)=>{saved=v;}};let calls=0,canAdvance=true;
 const credentials={connected:()=>true,onChange:()=>()=>{},request:()=>{calls++;throw Error('Should not dispatch');}};
 const runner=createPrivateRunner({storage,credentials,delay:100000,canAdvance:()=>canAdvance});runner.resume();
 return {runner,storage,credentials,calls:()=>calls,setMoving:value=>{canAdvance=!value;}};
}
for(const ai of [false,true])test(`${ai?'AI':'human'} news draw holds every subsequent move until Continue`,async()=>{
 const f=fixture({ai,mode:ai?'real':'demo'});try{if(ai)await f.runner.tick();else f.runner.move({type:'roll'});const held=f.runner.snapshot();assert.equal(held.pendingNews,held.match.lastNews.tick);assert.ok(held.pendingNews);f.runner.resume();await f.runner.tick();assert.equal(f.runner.snapshot().match.tick,held.match.tick);assert.equal(f.calls(),0);assert.throws(()=>f.runner.move({type:'roll'}),/Wait/);f.setMoving(true);assert.throws(()=>f.runner.continueNews(),/land/);f.setMoving(false);f.runner.continueNews();assert.equal(f.runner.snapshot().pendingNews,null);assert.equal(f.runner.snapshot().match.tick,held.match.tick);f.runner.continueNews();assert.equal(f.runner.snapshot().pendingNews,null);}finally{f.runner.dispose();}
});
test('unread news survives export and reload; acknowledging never replays the payment',()=>{const f=fixture();let reopened;try{f.runner.move({type:'roll'});const before=f.runner.snapshot(),balances=before.match.players.map(p=>p.cash);assert.equal(JSON.parse(f.runner.export()).pendingNews,before.pendingNews);f.runner.dispose();reopened=createPrivateRunner({storage:f.storage,credentials:f.credentials,delay:100000});assert.equal(reopened.snapshot().paused,true);assert.equal(reopened.snapshot().pendingNews,before.pendingNews);reopened.resume();assert.equal(reopened.snapshot().pendingNews,before.pendingNews);reopened.continueNews();assert.deepEqual(reopened.snapshot().match.players.map(p=>p.cash),balances);}finally{f.runner.dispose();reopened?.dispose();}});
test('final-turn news can be read before results, without starting another match',async()=>{const f=fixture({ai:true,final:true});try{await f.runner.tick();const s=f.runner.snapshot();assert.ok(s.match.finishedAt);assert.ok(s.pendingNews);f.runner.continueNews();await f.runner.tick();assert.equal(f.runner.snapshot().pendingNews,null);assert.equal(f.runner.snapshot().match.id,s.match.id);assert.equal(f.runner.snapshot().paused,true);}finally{f.runner.dispose();}});
