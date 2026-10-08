import {createGame,gameAction,active,completed} from '../engine.mjs';
import {tasks,services,spaces} from '../content.mjs';
export {tasks,services,spaces,active,completed};
export const demoRoster=[{id:'local/checker',name:'Checker',family:'Local bot',color:'#698f86',strategy:'careful'},{id:'local/sprinter',name:'Sprinter',family:'Local bot',color:'#c1866c',strategy:'fast'},{id:'local/planner',name:'Planner',family:'Local bot',color:'#8d82a3',strategy:'planner'},{id:'local/minimalist',name:'Minimalist',family:'Local bot',color:'#ad9d61',strategy:'minimal'}];
export function startMatch(roster,number=1,seed=12345){
 let v=seed>>>0;const dice=Array.from({length:4},()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return 1+(v%6);});
 return {id:number,seed,dice,startedAt:new Date().toISOString(),finishedAt:null,current:0,tick:0,events:[],players:roster.map(model=>{const game=createGame();game.players[0].name=model.name;return {model,game,moves:0,turnMoves:0,rejected:0,incorrect:0,usedTime:0,requests:0,latency:null,lastReason:'Waiting for a turn.'};})};
}
export function legalActions(g){
 if(g.phase==='finished')return [];
 if(g.phase==='roll')return [{type:'roll'}];
 const p=active(g),actions=[{type:'end'}];
 for(const s of services){if(!g.owned.includes(s.id)){if(p.time>=(spaces[p.position].service===s.id?1:2))actions.push({type:'buy',service:s.id});continue;}
 if(g.used.includes(s.id))continue;
 if(['writing','recommend'].includes(s.id)&&p.time)for(const t of g.taskState){if(!t.done&&t.work<tasks.find(d=>d.id===t.id).work)actions.push({type:'use',service:s.id,task:t.id});}
 if(s.id==='companion')actions.push({type:'use',service:s.id,acknowledged:true});
 if(s.id==='schedule'&&p.time>=2&&g.round<4)actions.push({type:'use',service:s.id});
 }
 for(const term of g.pending){if(term.service==='memory'||p.time||g.freeReview){for(const choice of term.service==='recommend'?['task-only','wider']:[null])actions.push({type:'resolve',id:term.id,acknowledged:true,...(choice?{choice}:{})});}}
 for(const t of g.taskState){if(t.done)continue;const d=tasks.find(d=>d.id===t.id);
 if(p.time&&t.work<d.work)actions.push({type:'work',task:t.id});
 if(p.time||g.freeSource)for(let index=0;index<d.sources.length;index++)if(!t.read.includes(index))actions.push({type:'source',task:t.id,index});
 if(t.work>=d.work&&t.read.length===d.sources.length&&!g.pending.some(x=>x.task===t.id))for(const verdict of ['accept','revise','unknown'])actions.push({type:'submit',task:t.id,verdict});
 }
 return actions;
}
export function observation(match,player){const g=player.game;return {rules:'Four rounds, six time per round. Complete at least three tasks and close every obligation. Work costs 1 per mark. Each source costs 1 unless a free pass is available. Service acquisition costs 1 on its space, otherwise 2. Writing/recommendation add 3 work for 1 time, then require a 1-time review. Companion returns 1 time once per turn. Schedule reserves 2 time for next round. Memory protects against interruption but requires free acknowledgement. Submit Accept, Revise, or Unknown from evidence. Wrong submissions do not finish the task. Unused time expires. Players have independent workspaces and the same four dice rolls. At most 24 actions per turn. Highest completed tasks, then fewest open obligations, then fewest incorrect conclusions wins.',round:g.round,time:active(g).time,position:spaces[active(g).position],owned:g.owned,used:g.used,pending:g.pending,freeSource:g.freeSource,freeReview:g.freeReview,services,tasks:g.taskState.map(t=>{const d=tasks.find(d=>d.id===t.id);return {id:t.id,title:d.title,question:d.question,claim:d.claim,requiredWork:d.work,...t,sources:d.sources.map((source,index)=>({index,title:source[0],text:t.read.includes(index)?source[1]:'Inspect this source to reveal it.'}))};}),previousEvents:match.events.filter(e=>e.player===player.model.id).slice(-8).map(e=>({action:e.action,outcome:e.outcome})),legalActions:legalActions(g)};}
export function applyMove(match,action,reason=''){const m=structuredClone(match),p=m.players[m.current],before=p.game;const allowed=legalActions(before);const key=a=>JSON.stringify(a);const valid=allowed.some(a=>key(a)===key(action)||Object.entries(a).every(([k,v])=>action[k]===v)&&Object.keys(action).every(k=>k in a));
 let outcome,rejected=false;
 if(!valid){p.rejected++;rejected=true;outcome='Rejected: action is not legal in the current state.';}
 else {const a=action.type==='roll'?{...action,value:m.dice[before.round-1]}:action;p.game=gameAction(before,a);if(action.type==='buy'){p.game.notice=p.game.notice.replace('The team shares it.','Acquired for this player.');p.game.log[0]=p.game.notice;}outcome=p.game.notice;if(action.type==='submit'&&!p.game.taskState.find(t=>t.id===action.task).done)p.incorrect++;p.usedTime+=Math.max(0,active(before).time-active(p.game).time);if(action.type==='roll')p.turnMoves=0;}
 p.moves++;p.turnMoves++;p.lastReason=String(reason).slice(0,500);m.tick++;
 m.events.push({id:m.tick,time:new Date().toISOString(),player:p.model.id,name:p.model.name,round:before.round,action,reason:p.lastReason,outcome,rejected});m.events=m.events.slice(-400);
 if(p.turnMoves>=24&&p.game.phase==='act'){p.game=gameAction(p.game,{type:'end'});p.turnMoves=0;m.events.push({id:++m.tick,time:new Date().toISOString(),player:p.model.id,name:p.model.name,round:before.round,action:{type:'end'},reason:'Referee action limit reached.',outcome:p.game.notice,rejected:false});}
 const done=m.players.every(x=>x.game.phase==='finished');if(done)m.finishedAt=new Date().toISOString();else{do{m.current=(m.current+1)%m.players.length;}while(m.players[m.current].game.phase==='finished');}
 return m;
}
function infer(t){const texts=t.sources.map(x=>x[1]).join(' ');if(/not been confirmed/.test(texts))return 'unknown';if(/28 mm/.test(texts)&&/32 mm/.test(texts))return 'revise';if(/Thursday/.test(texts)&&/three working days/.test(texts))return 'revise';return 'accept';}
export function botMove(match,p){const g=p.game,actions=legalActions(g),has=(type,extra={})=>actions.find(a=>a.type===type&&Object.entries(extra).every(([k,v])=>a[k]===v));
 if(g.phase==='roll')return {action:has('roll'),reason:'Start the next round with the shared die.'};
 const order=p.model.strategy==='fast'?['lamp','delivery','poster','pickup','booking']:p.model.strategy==='minimal'?['booking','poster','pickup','lamp','delivery']:['poster','pickup','booking','lamp','delivery'];
 let a=actions.find(a=>a.type==='submit');if(a){a=has('submit',{task:a.task,verdict:infer(tasks.find(t=>t.id===a.task))});return {action:a,reason:'Compare the inspected source statements before handing over the task.'};}
 a=has('resolve',{choice:'task-only'})||has('resolve');if(a)return {action:a,reason:'Close the obligation before taking on more work.'};
 if((a=has('use',{service:'companion'})))return {action:a,reason:'Read the authored reassurance and reclaim one unit of time.'};
 if(!g.owned.includes('writing')&&p.model.strategy!=='minimal'&&(a=has('buy',{service:'writing'})))return {action:a,reason:'Acquire writing assistance early enough to reuse it.'};
 if(g.round<3&&!g.owned.includes('companion')&&active(g).time>=4&&(a=has('buy',{service:'companion'})))return {action:a,reason:'Acquire the companion for future time returns.'};
 for(const id of order){const t=g.taskState.find(x=>x.id===id);if(t.done)continue;
 if(t.work>=tasks.find(d=>d.id===id).work){a=has('source',{task:id});}
 else if(p.model.strategy==='careful'&&t.read.length<2){a=has('source',{task:id});}
 else a=has('use',{service:'writing',task:id})||has('work',{task:id});
 if(a)return {action:a,reason:a.type==='source'?'Inspect the evidence supplied for this task.':a.type==='use'?'Use the writing desk; its claim check will follow.':'Put one unit of time into the unfinished task.'};
 }
 return {action:has('end'),reason:'No useful work remains in this time budget. End the round.'};
}
export function result(match){const rows=match.players.map(p=>({id:p.model.id,name:p.model.name,tasks:completed(p.game),open:p.game.pending.length,incorrect:p.incorrect,rejected:p.rejected,success:p.game.outcome==='complete',moves:p.moves}));rows.sort((a,b)=>b.tasks-a.tasks||a.open-b.open||a.incorrect-b.incorrect);const best=rows[0];return {id:match.id,seed:match.seed,startedAt:match.startedAt,finishedAt:match.finishedAt,rows,winners:rows.filter(r=>r.tasks===best.tasks&&r.open===best.open&&r.incorrect===best.incorrect).map(r=>r.id)};}
