import {services,tasks,spaces} from './content.mjs';
export function createGame(mode=1){
 return {version:1,mode,round:1,current:0,phase:'roll',roll:null,target:mode===1?3:4,players:Array.from({length:mode},(_,i)=>({name:mode===1?'You':`Player ${i+1}`,position:0,time:mode===1?6:4,bank:0})),owned:[],pending:[],taskState:tasks.map(t=>({id:t.id,work:0,read:[],done:false,verdict:null})),used:[],freeSource:0,freeReview:0,notice:'Roll, then use your time. Complete tasks and resolve your terms before round four ends.',log:['A new four-round game begins.'],outcome:null};
}
export const active=s=>s.players[s.current];
export const completed=s=>s.taskState.filter(t=>t.done).length;
export function gameAction(s,action){
 const n=structuredClone(s); let p=active(n); const task=n.taskState.find(t=>t.id===action.task); const definition=tasks.find(t=>t.id===action.task);
 const say=message=>{n.notice=message;n.log.unshift(message);n.log=n.log.slice(0,60);};
 const fail=message=>{n.notice=message;return n;};
 const pay=cost=>{if(p.time<cost)return false;p.time-=cost;return true;};
 if(n.phase==='finished')return fail('The game has ended. Start a new game to play again.');
 if(action.type==='roll'){
  if(n.phase!=='roll')return fail('You have already rolled this turn.');
  const value=action.value;if(!Number.isInteger(value)||value<1||value>6)return fail('A die roll must be between 1 and 6.');
  const old=p.position;p.position=(old+value)%spaces.length;n.roll=value;n.phase='act';
  if(old+value>=spaces.length)p.time=Math.min(10,p.time+1);
  const space=spaces[p.position];let effect=space.note||'Acquire this service for 1 time here, or 2 time through the market.';
  if(space.kind==='bonus')p.time=Math.min(10,p.time+1);
  if(space.kind==='source')n.freeSource++;
  if(space.kind==='review')n.freeReview++;
  if(space.kind==='interrupt'){
   if(n.owned.includes('memory')){n.pending.push({id:`memory-${n.round}-${n.current}`,service:'memory',task:null,snapshot:n.taskState.filter(t=>!t.done&&t.work>0).map(t=>({id:t.id,work:t.work,read:[...t.read]}))});effect='Your place is saved. Check the saved note to clear the obligation.';}
   else p.time=Math.max(0,p.time-1);
  }
  say(`${p.name} rolled ${value}: ${space.name}. ${effect}`);return n;
 }
 if(n.phase!=='act')return fail('Roll before taking an action.');
 if(action.type==='buy'){
  if(!services.some(x=>x.id===action.service)||n.owned.includes(action.service))return fail('That service is already acquired or unavailable.');
  const cost=spaces[p.position].service===action.service?1:2;
  if(!pay(cost))return fail('Not enough time to acquire that service.');
  n.owned.push(action.service);say(`${p.name} acquired ${services.find(x=>x.id===action.service).name} for ${cost} time. The team shares it.`);
 }else if(action.type==='work'){
  if(!task||task.done||task.work>=definition.work)return fail('Choose an unfinished task that needs work.');
  if(!pay(1))return fail('No time remains for work.');task.work++;say(`One work mark added to ${definition.title}.`);
 }else if(action.type==='source'){
  if(!task||task.done||!Number.isInteger(action.index)||!definition.sources[action.index]||task.read.includes(action.index))return fail('That source is already inspected or unavailable.');
  if(n.freeSource)n.freeSource--;else if(!pay(1))return fail('No time remains to inspect a source.');
  task.read.push(action.index);say(`${definition.sources[action.index][0]} inspected for ${definition.title}.`);
 }else if(action.type==='use'){
  if(!n.owned.includes(action.service)||n.used.includes(action.service))return fail('Acquire the service first. Each service can be used once per turn.');
  if(['writing','recommend'].includes(action.service)){
   if(!task||task.done||task.work>=definition.work)return fail('Choose a task that still needs work.');
   if(!pay(1))return fail('No time remains to use the service.');
   task.work=Math.min(definition.work,task.work+3);
   n.pending.push({id:`${action.service}-${n.round}-${n.current}`,service:action.service,task:action.task});
   say(`Three work marks added. A ${action.service==='writing'?'claim check':'routing choice'} is now open.`);
  }else if(action.service==='schedule'){
   if(p.time<2)return fail('You need 2 time to reserve for your next turn.');
   if(n.round===4)return fail('There is no next turn after round four.');
   p.time-=2;p.bank+=2;say('Two time reserved for this player’s next turn.');
  }else if(action.service==='companion'){
   if(!action.acknowledged)return fail('Read the message note before using reassurance.');
   p.time=Math.min(10,p.time+1);say('One time returned. The reassurance is a fixed authored message, not a personal assessment.');
  }else return fail('Memory operates automatically on interruption spaces.');
  n.used.push(action.service);
 }else if(action.type==='resolve'){
  const i=n.pending.findIndex(x=>x.id===action.id);if(i<0)return fail('That obligation is already closed.');
  const term=n.pending[i];
  if(!action.acknowledged)return fail('Inspect the obligation before closing it.');
  if(term.service==='recommend'&&!['task-only','wider'].includes(action.choice))return fail('Choose a route scope.');
  if(term.service!=='memory'){if(n.freeReview)n.freeReview--;else if(!pay(1))return fail('No time remains to resolve this obligation.');}
  n.pending.splice(i,1);say(`${services.find(x=>x.id===term.service).name} obligation resolved${action.choice?`: ${action.choice==='task-only'?'task-only route':'wider fictional route'}`:''}.`);
 }else if(action.type==='submit'){
  if(!task||task.done||task.work<definition.work||task.read.length!==definition.sources.length)return fail('Finish the work and inspect both sources first.');
  if(n.pending.some(x=>x.task===task.id))return fail('Resolve this task’s service obligations first.');
  if(!['accept','revise','unknown'].includes(action.verdict))return fail('Choose a conclusion.');
  if(action.verdict!==definition.answer){say('That conclusion does not match the supplied evidence. Re-read the sources; there is no time penalty.');return n;}
  task.done=true;task.verdict=action.verdict;say(`Completed: ${definition.title}. ${definition.resolution}`);
 }else if(action.type==='end'){
  const lost=p.time;p.time=0;
  n.current++;
  if(n.current>=n.mode){n.current=0;n.round++;}
  if(n.round>4){n.round=4;n.phase='finished';n.outcome=completed(n)>=n.target&&n.pending.length===0?'complete':'unfinished';say(n.outcome==='complete'?`Ready to hand over: ${completed(n)} tasks complete and all used-service terms resolved.`:`The four rounds ended with ${completed(n)} tasks complete and ${n.pending.length} open obligations. Review the record or try another approach.`);return n;}
  p=active(n);p.time=Math.min(10,(n.mode===1?6:4)+p.bank);p.bank=0;n.phase='roll';n.roll=null;n.used=[];n.freeSource=0;n.freeReview=0;
  say(`${lost} unused time expired. ${p.name} begins round ${n.round}. Reserved time is included.`);
 }else return fail('Unknown action.');
 return n;
}
