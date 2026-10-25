import test from 'node:test';
import assert from 'node:assert/strict';
import {newsPresentation,boardNewsSummary} from './news-presentation.mjs';
const card={tick:1,drawnBy:'Claude',effect:'A fictional review costs $60. This is not a real charge.'};
const draw={id:1,name:'Claude',player:'claude',cashBefore:1200,cashAfter:1340,transfers:[{category:'start',from:'bank',to:'claude',amount:200},{category:'chance',from:'claude',to:'bank',amount:60}]};
test('board news persists across later turns without showing the old balance as current',()=>{
 const m={lastNews:card,events:[draw,{id:2,name:'You',action:{type:'buy'},transfers:[],cashAfter:980}]};
 const before=JSON.stringify(m),summary=boardNewsSummary(newsPresentation(m));
 assert.equal(summary.headline,'Claude: paid $60');assert.equal(summary.reason,'A fictional review costs $60.');assert.ok(!summary.headline.includes('1,340'));assert.equal(JSON.stringify(m),before);
});
test('next draw replaces the old summary and a new match clears it',()=>{
 const m={lastNews:{tick:3,drawnBy:'You',effect:'No game payment for this announcement.'},events:[draw,{id:3,name:'You',player:'you',cashBefore:1200,cashAfter:1200,transfers:[]}]};
 assert.equal(boardNewsSummary(newsPresentation(m)).headline,'You: no cash change');assert.equal(boardNewsSummary(newsPresentation({lastNews:null,events:[]})),null);
});
test('summary keeps recorded variable-cost arithmetic and handles missing old records',()=>{
 const c={...card,impact:{explanation:'$20 × 3 owned streets = $60 recovery cost.'}};
 assert.equal(boardNewsSummary(newsPresentation({lastNews:c,events:[draw]})).reason,c.impact.explanation);
 c.impact.explanation='$20 × 1 minimum unit = $20 recovery cost.';assert.equal(boardNewsSummary(newsPresentation({lastNews:c,events:[draw]})).reason,'Recovery has a $20 minimum, even with no streets.');
 assert.equal(boardNewsSummary(newsPresentation({lastNews:card,events:[]})).headline,'Claude: cash result unavailable');
});
