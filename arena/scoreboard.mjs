import {netWorth,owned} from './game.mjs';
export function scoreboard(match){
 const rows=match.players.map(p=>({id:p.model.id,name:p.model.name,cash:p.cash,streets:owned(match,p).length,wealth:netWorth(match,p),out:p.bankrupt,current:!match.finishedAt&&match.players[match.current]===p}));
 const best=Math.max(...rows.filter(r=>!r.out).map(r=>r.wealth));
 return rows.map(r=>({...r,leader:!r.out&&r.wealth===best,rank:r.out?null:1+rows.filter(other=>!other.out&&other.wealth>r.wealth).length}));
}
