import test from 'node:test';
import assert from 'node:assert/strict';
import {newsPresentation} from './news-presentation.mjs';
import {newsCashHTML,newsCardHTML} from './news-view.mjs';
const card={title:'A sourced event',fact:'Original source fact.',effect:'A fictional payment.',url:'https://example.com/story',publisher:'Source',tick:1};
const match=(transfers,cashBefore,cashAfter)=>({lastNews:card,events:[{id:1,name:'You',player:'you',transfers,cashBefore,cashAfter}]});
test('news cash explains Start and liquidation separately from the news charge',()=>{
 const m=match([{from:'bank',to:'you',amount:200,category:'start'},{from:'bank',to:'you',amount:60,category:'sale'},{from:'you',to:'bank',amount:100,category:'chance'}],40,200),before=JSON.stringify(m),news=newsPresentation(m),html=newsCashHTML(news);
 assert.equal(news.net,-100);assert.equal(news.cashBefore+news.cashSteps.reduce((n,row)=>n+row.amount,0),news.cashAfter);
 for(const label of ['Passed Start','Property sold to bank','News paid to bank','Cash before this turn','Cash after this turn'])assert.ok(html.includes(label));
 assert.ok(html.includes('+$200'));assert.ok(html.includes('−$100'));assert.equal(JSON.stringify(m),before);
});
test('IPO cash shows gross capital and fee as separate recorded payments',()=>{
 const news=newsPresentation(match([{from:'bank',to:'you',amount:200,category:'chance'},{from:'you',to:'bank',amount:10,category:'chance'}],1200,1390));
 assert.equal(news.net,190);const html=newsCashHTML(news);for(const amount of ['+$200','−$10','$1,390'])assert.ok(html.includes(amount));
});
test('preview is clearly hypothetical and escapes source copy',()=>{
 const html=newsCardHTML({...card,title:'<img onerror=alert(1)>',fact:'<script>bad()</script>'});
 assert.ok(html.includes('If you draw this card'));assert.ok(html.includes('Preview only. No cash has changed.'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('Cash after this turn'));
});
test('zero effect and older saves do not invent missing balances',()=>{
 const zero=newsPresentation(match([],1200,1200));assert.ok(newsCashHTML(zero).includes('News: no cash change'));
 const missing=newsPresentation({events:[],lastNews:card});assert.equal(newsCashHTML(missing),'');assert.ok(newsCardHTML(card,missing).includes('Cash result unavailable'));
});
