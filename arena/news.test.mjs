import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newsCards,playerProfiles} from './news.mjs';
import {startMatch,applyMove,demoRoster,finances} from './game.mjs';
test('each named player has a sourced dated story and a distinct authored role',()=>{
 assert.equal(new Set(Object.values(playerProfiles).map(p=>p.role)).size,5);
 for(const p of demoRoster){const card=newsCards.find(c=>c.player===p.name);assert.ok(card);assert.match(card.url,/^https:\/\//);assert.match(card.date,/^2026-\d\d-\d\d$/);assert.ok(card.fact&&card.lesson&&card.effect);}
});
test('a news card applies equally to any player and reconciles with the cash ledger',()=>{
 for(const model of demoRoster){let played;
  for(let seed=1;seed<200;seed++){const m=startMatch([model,demoRoster.find(p=>p.id!==model.id)],1,seed);m.newsDeck=[newsCards[0]];const next=applyMove(m,{type:'roll'});if(next.lastNews){played=next;break;}}
  assert.ok(played);const p=played.players[0],flow=finances(played,p);assert.equal(p.cash,1300);assert.equal(flow.chanceIn,100);assert.equal(played.lastNews.drawnBy,model.name);assert.equal(played.events[0].lesson.title,'Real news, fictional game effect');
 }
});
test('negative news effects settle through the same ledger, including forced sales',()=>{
 let played;
 for(let seed=1;seed<200;seed++){const m=startMatch(demoRoster,1,seed);m.newsDeck=[newsCards[2]];m.players[0].cash=30;m.players[0].openingCash=30;m.properties[1].owner=m.players[0].model.id;const next=applyMove(m,{type:'roll'});if(next.lastNews){played=next;break;}}
 assert.ok(played);const flow=finances(played,played.players[0]);assert.equal(flow.chanceOut,60);assert.equal(flow.sales,60);assert.equal(flow.cash,30);assert.equal(played.players[0].bankrupt,false);
});
test('legacy matches keep their old chance deck and new matches snapshot editorial cards',()=>{
 const a=startMatch(demoRoster);a.newsDeck[0].title='A saved snapshot';assert.notEqual(newsCards[0].title,a.newsDeck[0].title);
 delete a.newsDeck;for(let seed=1;seed<100;seed++){a.seed=a.rng=seed;const b=applyMove(a,{type:'roll'});assert.equal(b.lastNews,null);}
});
