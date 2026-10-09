import {startMatch,applyMove,legalActions,active,botMove,netWorth,observation} from './game.mjs';
import {marketSnapshot} from './market-news.mjs';
export function startQuick(opponents,id=1,seed=12345){
 if(opponents.length<1||opponents.length>5||new Set(opponents.map(p=>p.id)).size!==opponents.length)throw Error('Choose one to five distinct opponents.');
 const m=startMatch([{id:'human/you',name:'You',color:'#283d32',human:true},...opponents],id,seed);
 return {...m,...marketSnapshot(),rulesVersion:'quick-v2',turnLimit:10,houseLimit:1,purchaseResolved:false,buildResolved:false};
}
export function quickStage(m){
 if(m.finishedAt)return 'finished';if(m.phase==='roll')return 'roll';
 const actions=legalActions(m);if(!m.purchaseResolved&&actions.some(a=>a.type==='buy'))return 'purchase';
 if(!m.buildResolved&&actions.some(a=>a.type==='build'))return 'build';return 'advance';
}
export function quickActions(m){const stage=quickStage(m),actions=legalActions(m);
 if(stage==='roll')return actions.filter(a=>a.type==='roll');
 if(stage==='purchase')return [...actions.filter(a=>a.type==='buy'),{type:'pass'}];
 if(stage==='build')return [...actions.filter(a=>a.type==='build'),{type:'pass'}];return [];
}
function skip(m,stage,reason){const p=active(m);p.moves++;m.turnActions++;p.lastReason=String(reason).slice(0,160);m.events.push({id:++m.tick,time:new Date().toISOString(),player:p.model.id,name:p.model.name,round:p.turns+1,action:{type:'pass'},outcome:stage==='purchase'?'Kept the cash instead of buying.':'Kept the cash instead of building.',reason,transfers:[],cashBefore:p.cash,cashAfter:p.cash,worthBefore:netWorth(m,p),worthAfter:netWorth(m,p),lesson:{title:'Cash keeps options open',text:'Passing preserves cash for rent, tax and later opportunities.'}});return m;}
export const sameAction=(a,b)=>!!b&&typeof b==='object'&&Object.keys(a).length===Object.keys(b).length&&Object.entries(a).every(([k,v])=>b[k]===v);
export function quickApply(match,action,reason=''){
 if(!quickActions(match).some(a=>sameAction(a,action)))throw Error('That action is not available.');
 const stage=quickStage(match),before=match.current;let m;
 if(action.type==='pass'){m=skip(structuredClone(match),stage,reason);if(stage==='purchase')m.purchaseResolved=true;else m.buildResolved=true;}
 else{m=applyMove(match,action,reason);if(action.type==='buy')m.purchaseResolved=true;if(action.type==='build')m.buildResolved=true;}
 if(!m.finishedAt&&m.current===before&&quickStage(m)==='advance')m=applyMove(m,{type:'end'},'Turn resolved automatically.');
 if(m.current!==before||m.phase==='roll'){m.purchaseResolved=false;m.buildResolved=false;}
 return m;
}
export function quickBotMove(m){const move=botMove(m,active(m));const actions=quickActions(m);return actions.some(a=>sameAction(a,move.action))?move:{action:{type:'pass'},reason:move.reason};}
export function quickObservation(m){const p=active(m),o=observation(m,p);o.rules='Ten turns each. Start with $1200. Highest cash plus original property and house values wins. Dice, rent, tax and news resolve locally. Buy a street or pass. Complete a color pair to double rent and unlock $100 houses: one per street, one building decision per turn. Resale on insolvency is half value. Select one supplied legal action. Future dice and news draws are hidden.';o.newsRules=m.rulesVersion==='quick-v2'?'News is a dated snapshot of sourced facts with fictional effects. IPO: $200 capital in, $10 fees out. Funding is not profit. Outage: $20 per owned street, minimum $20. A secondary shareholder sale adds no company cash. Shares, dilution and stock prices are not simulated.': 'Use this match’s original news deck.';o.newsDeck=m.newsDeck?.map(({title,date,fact,status,category,mechanic,amount,capital,fee,perStreet})=>({title,date,fact,status,category,mechanic,amount,capital,fee,perStreet}));o.legalActions=quickActions(m);return o;}
