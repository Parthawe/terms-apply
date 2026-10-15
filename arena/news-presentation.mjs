// Read recorded transfers; never recompute a saved card with today's rules.
export function newsPresentation(match){
 const card=match.lastNews;if(!card)return null;
 const event=match.events.find(e=>e.id===card.tick);
 if(!event)return {card,cash:'Cash result unavailable for this saved turn.'};
 const rows=(event.transfers||[]).filter(t=>t.category==='chance');
 const incoming=rows.filter(t=>t.to===event.player).reduce((sum,t)=>sum+t.amount,0);
 const outgoing=rows.filter(t=>t.from===event.player).reduce((sum,t)=>sum+t.amount,0);
 const dollars=n=>'$'+Math.round(n).toLocaleString('en-US'),net=incoming-outgoing;
 const change=net>0?'gained '+dollars(net):net<0?'paid '+dollars(-net):'no cash change';
 return {card,incoming,outgoing,net,cash:`${event.name}: ${change} · ${dollars(event.cashAfter)} after this turn.`,breakdown:incoming&&outgoing?`${dollars(incoming)} in − ${dollars(outgoing)} out = ${dollars(net)} net.`:''};
}
