import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio,createPaymentSoundQueue} from './game-audio.mjs';
function fakeAudio(){
 const starts=[],stops=[];const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
 const node=()=>({gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){},start(t){starts.push(t);},stop(t){stops.push(t);}});
 const context={state:'running',currentTime:1,sampleRate:1000,destination:{},createGain:node,createOscillator:node,createBufferSource:node,createBiquadFilter:node,createBuffer:(channels,length)=>({getChannelData:()=>new Float32Array(length)}),resume(){this.state='running';return Promise.resolve();},suspend(){this.state='suspended';return Promise.resolve();}};
 return {context,starts,stops};
}
test('sounds require interaction, mute cancels scheduled voices and remembers only a boolean',()=>{
 const fake=fakeAudio(),saved=new Map();let created=0;const storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
 const a=createGameAudio({storage,visible:()=>true,makeContext:()=>{created++;return fake.context;}});
 assert.equal(a.play('dice'),false);assert.equal(created,0);a.unlock();assert.equal(a.play('dice'),true);assert.equal(fake.starts.length,18);
 const cancelled=fake.stops.length;a.setMuted(true);assert.ok(fake.stops.length>cancelled);assert.equal(a.play('step'),false);assert.deepEqual([...saved],[['terms-apply-sound-muted','true']]);
 const reloaded=createGameAudio({storage,visible:()=>true,makeContext:()=>{throw Error('must not start while muted');}});assert.equal(reloaded.status().muted,true);reloaded.unlock();assert.equal(reloaded.status().unavailable,false);
 a.setMuted(false);assert.equal(a.play('payment'),true);assert.equal(created,1);
});
test('hidden tabs and unsupported audio remain silent without breaking play',()=>{
 let visible=false,created=0;const a=createGameAudio({storage:null,visible:()=>visible,makeContext:()=>{created++;return null;}});a.unlock();assert.equal(created,0);visible=true;a.unlock();assert.equal(a.status().unavailable,true);assert.equal(a.play('dice'),false);
 const failing=createGameAudio({storage:null,visible:()=>true,makeContext:()=>{throw Error('device unavailable');}});assert.doesNotThrow(()=>failing.unlock());assert.equal(failing.status().unavailable,true);
});
test('rent chimes wait for landing, play once, and never replay saved history',()=>{
 const plays=[],queue=createPaymentSoundQueue(kind=>plays.push(kind)),match={id:1,tick:5,events:[{id:5,transfers:[{amount:40}]}]};queue.observe(match);assert.equal(plays.length,0);
 match.tick=6;match.events.push({id:6,transfers:[{amount:45,category:'rent'}]});queue.observe(match,{moving:true});queue.observe(match,{moving:true});assert.equal(plays.length,0);queue.observe(match);queue.observe(match);assert.deepEqual(plays,['payment']);
 queue.observe({...match,id:2});assert.equal(plays.length,1);
});
test('pausing cancels pending payments and zero transfers make no sound',()=>{
 const plays=[],queue=createPaymentSoundQueue(kind=>plays.push(kind)),match={id:1,tick:0,events:[]};queue.observe(match);match.tick=1;match.events=[{id:1,transfers:[{amount:50}]}];queue.observe(match,{moving:true});queue.observe(match,{paused:true});queue.observe(match);assert.equal(plays.length,0);match.tick=2;match.events.push({id:2,transfers:[{amount:0}]});queue.observe(match);assert.equal(plays.length,0);
});
