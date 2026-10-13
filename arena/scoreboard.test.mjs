import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreboard} from './scoreboard.mjs';
import {startQuick} from './quick-game.mjs';
import {demoRoster} from './game.mjs';
test('standings use wealth, show every player and mark the current turn',()=>{
 const m=startQuick(demoRoster);m.players[0].cash=1100;m.players[1].cash=1000;m.properties[1].owner=m.players[1].model.id;m.properties[1].houses=1;
 const rows=scoreboard(m);assert.equal(rows.length,6);assert.equal(rows[0].current,true);assert.equal(rows[1].streets,1);assert.equal(rows[1].leader,true);assert.equal(rows[0].leader,false);
});
test('ties share the lead and eliminated players cannot lead',()=>{
 const m=startQuick(demoRoster.slice(0,2));let rows=scoreboard(m);assert.ok(rows.every(r=>r.leader&&r.rank===1));m.players[0].bankrupt=true;m.players[0].cash=9000;rows=scoreboard(m);assert.equal(rows[0].leader,false);assert.equal(rows[0].rank,null);assert.equal(rows[1].leader,true);
});
