import {writeFileSync,mkdirSync} from 'node:fs';
import {services,tasks,spaces} from './content.mjs';
mkdirSync(new URL('./assets/',import.meta.url),{recursive:true});
const positions=[[4,4],[4,3],[4,2],[4,1],[4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4]];
const e=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const colors={blue:'#3c6672',red:'#a84331',olive:'#667445'};
function lines(text,max=17){const words=text.split(' '),r=[];let line='';for(const w of words){if((line+' '+w).trim().length>max&&line){r.push(line);line=w;}else line=(line+' '+w).trim();}if(line)r.push(line);return r;}
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000"><rect width="1000" height="1000" fill="#eeeade"/><g fill="#283c45" font-family="Georgia,serif">';
for(let i=0;i<spaces.length;i++){
 const [row,col]=positions[i],x=col*200,y=row*200,s=spaces[i],service=services.find(t=>t.id===s.service),c=colors[service?.color]||'#283c45';
 svg+=`<rect x="${x+1}" y="${y+1}" width="198" height="198" fill="#f7f4eb" stroke="#aab0a7"/>`;
 if(service)svg+=`<rect x="${x+1}" y="${y+1}" width="198" height="14" fill="${c}"/>`;
 svg+=`<text x="${x+16}" y="${y+40}" font-size="15" font-family="Courier New,monospace">${String(i+1).padStart(2,'0')}</text>`;
 for(const [j,l]of lines(s.name).entries())svg+=`<text x="${x+16}" y="${y+85+j*27}" font-size="23">${e(l)}</text>`;
 const effect=service?'Acquire here: 1 time':s.kind==='bonus'?'+1 time':s.kind==='source'?'Free source check':s.kind==='review'?'Free terms review':'Interruption: -1 time';
 svg+=`<text x="${x+16}" y="${y+170}" font-size="12" font-family="Courier New,monospace">${effect}</text>`;
}
svg+='<rect x="200" y="200" width="600" height="600" fill="#eeeade" stroke="#aab0a7"/><text x="255" y="305" font-family="Courier New,monospace" font-size="20" fill="#a84331">TERMS APPLY</text><text x="255" y="400" font-size="66">A little</text><text x="255" y="475" font-size="66">convenience.</text><text x="255" y="545" font-size="25">What do you gain?</text><text x="255" y="580" font-size="25">What do you still need to do?</text><path d="M255 625H745" stroke="#aab0a7"/><text x="255" y="675" font-family="Courier New,monospace" font-size="16">FOUR ROUNDS / SHARED WORKBENCH</text><text x="255" y="715" font-size="20">Tasks. Sources. Open obligations.</text><text x="255" y="750" font-size="14">Original game prototype by Parth Pawar</text></g></svg>';
writeFileSync(new URL('./assets/board.svg',import.meta.url),svg);
writeFileSync(new URL('./assets/print-data.json',import.meta.url),JSON.stringify({services,tasks,spaces},null,2));
console.log('Built original board SVG and printable content data.');
