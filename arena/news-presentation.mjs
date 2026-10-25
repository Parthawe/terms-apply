// Read recorded transfers; never recompute a saved card with today's rules.
export function newsPresentation(match,card=match.lastNews){
 if(!card)return null;
 const event=match.events.find(e=>e.id===card.tick);
 if(!event)return {card,cash:'Cash result unavailable for this saved turn.'};
 const rows=(event.transfers||[]).filter(t=>t.category==='chance');
 const incoming=rows.filter(t=>t.to===event.player).reduce((sum,t)=>sum+t.amount,0);
 const outgoing=rows.filter(t=>t.from===event.player).reduce((sum,t)=>sum+t.amount,0);
 const dollars=n=>'$'+Math.round(n).toLocaleString('en-US'),net=incoming-outgoing;
 const change=net>0?'gained '+dollars(net):net<0?'paid '+dollars(-net):'no cash change';
 const cashSteps=(event.transfers||[]).filter(t=>t.to===event.player||t.from===event.player).map(t=>({label:({chance:t.to===event.player?'News from bank':'News paid to bank',start:'Passed Start',sale:'Property sold to bank',rent:'Rent',tax:'Compute tax',purchase:'Street purchase',build:'House purchase'})[t.category]||'Other payment',amount:t.to===event.player?t.amount:-t.amount}));
 return {card,incoming,outgoing,net,playerName:event.name,cashBefore:event.cashBefore,cashAfter:event.cashAfter,cashSteps,cash:`${event.name}: ${change} · ${dollars(event.cashAfter)} after this turn.`,breakdown:incoming&&outgoing?`${dollars(incoming)} in − ${dollars(outgoing)} out = ${dollars(net)} net.`:''};
}

// Older saves retain their recorded payments even when the original story was not saved.
export function recentNews(match){
 const rows=match.events.filter(e=>e.news||(match.lastNews&&e.id===match.lastNews.tick)||(e.action?.type==='roll'&&(e.outcome?.startsWith('News card:')||e.lesson?.title==='Real news, fictional game effect'||e.transfers?.some(t=>t.category==='chance')))).map(event=>{
  const candidates=event.lesson?.title==='Real news, fictional game effect'?(match.newsDeck||[]).filter(c=>c.lesson&&c.lesson===event.lesson.text):[];
  const recovered=candidates.length===1?{...candidates[0],tick:event.id,drawnBy:event.name,impact:{explanation:event.outcome?.replace(/^News card:\s*/, '')}}:null;
  const card=event.news||(event.id===match.lastNews?.tick?match.lastNews:null)||recovered||{tick:event.id,title:'Earlier news card',drawnBy:event.name,fact:'This older save does not identify the original story.',effect:event.outcome?.replace(/^(News card:|Chance:)\s*/,''),lesson:event.lesson?.text};
  return {...newsPresentation(match,card),eventId:event.id,round:event.round,legacy:!card.url};
 }).reverse();
 if(match.lastNews&&!rows.some(row=>row.card.tick===match.lastNews.tick))rows.unshift({...newsPresentation(match),eventId:match.lastNews.tick});
 return rows.slice(0,20);
}

// Keep the last recorded draw visible while later turns continue.
export function boardNewsSummary(news){
 if(!news)return null;
 const name=news.playerName||news.card.drawnBy||'Player';
 const amount=n=>'$'+Math.abs(n).toLocaleString('en-US');
 const change=Number.isFinite(news.net)?news.net>0?'gained '+amount(news.net):news.net<0?'paid '+amount(news.net):'no cash change':'cash result unavailable';
 const explanation=news.card.impact?.explanation||news.card.effect||'The reason was not recorded in this saved game.';
 const minimum=explanation.match(/^\$(\d+) × 1 minimum unit/);
 const reason=minimum?`Recovery has a $${minimum[1]} minimum, even with no streets.`:explanation.split(/(?<=[.!?])\s+(?=[A-Z])/)[0];
 return {headline:`${name}: ${change}`,reason};
}
