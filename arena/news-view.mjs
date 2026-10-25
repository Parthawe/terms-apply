const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
export function newsCashHTML(news){
 if(!Number.isFinite(news.cashBefore)||!Number.isFinite(news.cashAfter))return '';
 const rows=news.cashSteps.length?news.cashSteps:[{label:'News: no cash change',amount:0}];
 return `<dl class="news-cash-ledger" aria-label="Recorded cash this turn"><div><dt>Cash before this turn</dt><dd>${money(news.cashBefore)}</dd></div>${rows.map(row=>`<div><dt>${esc(row.label)}</dt><dd>${row.amount>0?'+':row.amount<0?'−':''}${money(Math.abs(row.amount))}</dd></div>`).join('')}<div class="news-cash-total"><dt>Cash after this turn</dt><dd>${money(news.cashAfter)}</dd></div></dl>`;
}
function previewLabel(card){
 if(card.mechanic==='portfolio-cost')return `Pay ${money(card.perStreet)} per street (${money(card.perStreet)} minimum)`;
 const amount=card.mechanic==='ipo'?card.capital-card.fee:card.amount;
 return amount>0?`+${money(amount)} ${card.mechanic==='ipo'?'net capital':'game cash'}`:amount<0?`−${money(-amount)} game cash`:'No cash change';
}
export function newsCardHTML(card,news=null){
 return `<article class="${news?'recent-news-entry':'news-item'}">${news?`<p class="news-meta">${news.round?'Turn '+esc(news.round)+' · ':''}${esc(card.drawnBy||'News draw')}${news.legacy?' · Older save':''}</p>`:''}<h3>${esc(card.title)}</h3><p class="news-card-impact">${news?esc(news.cash):'Preview · '+esc(previewLabel(card))}</p><h4>What happened in real life</h4><p class="news-fact">${esc(card.fact)}</p><p class="news-meta">${esc(card.date)}${card.status?' · '+esc(card.status):''}</p>${card.url?`<a href="${esc(card.url)}" target="_blank" rel="noopener">Source: ${esc(card.publisher)}</a>`:''}<section class="news-effect"><h4>${news?'What happened to game cash':'If you draw this card'}</h4><p class="recent-news-reason">${esc(news?card.impact?.explanation||card.effect:card.effect)}</p>${news?newsCashHTML(news):'<p class="small">Preview only. No cash has changed.</p>'}</section>${card.lesson?`<details><summary>What you can learn</summary><p>${esc(card.lesson)}</p></details>`:''}</article>`;
}
