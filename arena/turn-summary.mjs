import {spaces} from './game.mjs';
// Explain the recorded move, rather than the next player's cash or turn.
export function turnSummary(match){
 const event=match.events.findLast(e=>e.action.type!=='end');
 if(!event)return null;
 const player=match.players.find(p=>p.model.id===event.player);
 const who=id=>id==='bank'?'Bank':match.players.find(p=>p.model.id===id)?.model.name||id;
 const dollars=value=>'$'+Math.round(value).toLocaleString('en-US');
 const purpose={rent:'rent',tax:'compute tax',purchase:'street purchase',build:'house',chance:'news card',start:'passing Start',sale:'property sale'};
 return {title:`${event.name} at ${spaces[player?.position]?.kind==='chance'?'News':spaces[player?.position]?.name||'the board'}`,
 outcome:event.outcome,
 payments:(event.transfers||[]).map(t=>`${who(t.from)} paid ${who(t.to)} ${dollars(t.amount)} for ${purpose[t.category]||t.category}.`),
 cash:`${event.name} ${player?.model.human||event.name==='You'?'have':'has'} ${dollars(event.cashAfter)} cash left.`,
 noPayment:event.action.type==='roll'&&!(event.transfers||[]).length?'No cash changed hands.':''};
}
