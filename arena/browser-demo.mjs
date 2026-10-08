import {startMatch,applyMove,botMove,result,demoRoster} from './game.mjs';
const storageKey='terms-apply-browser-demo-v3';
let singleton;
export function browserDemo(){
 if(singleton)return singleton;
 let state={version:3,browserDemo:true,mode:'demo',running:true,status:'running',connected:false,thinking:false,requiresAdmin:false,interval:1500,roster:demoRoster,match:startMatch(demoRoster,1,Math.floor(Math.random()*1e8)),history:[],totals:{},limits:{requestsPerDay:200,usdPerDay:1},usage:{requests:0,cost:0,unknownCosts:0},message:'This browser runs the demo. Play stops when the page closes.'};
 try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved?.version===3&&saved.browserDemo)state=saved;}catch{}
 const stream={onmessage:null,onerror:null};let timer;
 const emit=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}stream.onmessage?.({data:JSON.stringify(state)});};
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(tick,state.match.finishedAt?6000:state.interval);};
 function tick(){try{if(state.running){if(state.match.finishedAt){const next=state.match.id+1;state.match=startMatch(demoRoster,next,Math.floor(Math.random()*1e8));}else{const p=state.match.players[state.match.current],move=botMove(state.match,p);state.match=applyMove(state.match,move.action,move.reason);if(state.match.finishedAt){const record={...result(state.match),mode:'demo'};state.history.unshift(record);state.history=state.history.slice(0,15);for(const row of record.rows){const key='demo:'+row.id,t=state.totals[key]||{...row,mode:'demo',games:0,wins:0,tasks:0,open:0,incorrect:0,rejected:0};t.games++;t.wins+=record.winners.includes(row.id)?1:0;t.tasks+=row.tasks;t.open+=row.open;t.incorrect+=row.incorrect;t.rejected+=row.rejected;state.totals[key]=t;}try{localStorage.setItem(storageKey+'-match-'+record.id,JSON.stringify({result:record,match:state.match}));const old=record.id-15;if(old>0)localStorage.removeItem(storageKey+'-match-'+old);}catch{}}}emit();}}catch{state.running=false;state.status='error';state.message='The browser demo stopped. Reload to resume the saved table.';emit();}schedule();}
 async function request(path,options={}){let status=200,body;
 if(path==='/api/control'){const b=JSON.parse(options.body||'{}');if(b.action==='pause'){state.running=false;state.status='paused';}else if(b.action==='resume'){state.running=true;state.status='running';}else if(b.action==='configure'&&b.mode==='demo'){state.interval=Number(b.interval);state.match=startMatch(demoRoster,state.match.id+1,Math.floor(Math.random()*1e8));state.running=true;state.status='running';}else{status=400;body={error:'This free page runs local bots. Real model play requires the separately hosted server.'};}if(!body){body={ok:true};emit();schedule();}}
 else if(path==='/api/models')body={models:[],error:'Model selection is available on the full server, not this browser demo.',connected:false};
 else if(path.startsWith('/api/matches/')){try{body=JSON.parse(localStorage.getItem(storageKey+'-match-'+path.split('/').at(-1)));}catch{}if(!body){status=404;body={error:'This record is unavailable in this browser.'};}}
 else if(path==='/api/state'||path==='/api/export')body=state;
 else{status=404;body={error:'Not available in browser demo.'};}
 return {ok:status===200,status,json:async()=>structuredClone(body)};
 }
 singleton={stream,request,dispose:()=>{state.running=false;clearTimeout(timer);}};queueMicrotask(emit);schedule();return singleton;
}
