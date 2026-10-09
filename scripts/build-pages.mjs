import {createHash} from 'node:crypto';
import './build-client.mjs';
import {mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
const output=resolve('_site');await rm(output,{recursive:true,force:true});
const files=['index.html','privacy.html','play.html','app.mjs','style.css','content.mjs','engine.mjs','case-study.html','print.html','rules.md','arena/client.mjs','arena/client.bundle.js','arena/private-client.bundle.js','arena/play.css','arena/arena.css','arena/experience.css','arena/game.mjs','arena/news.mjs','arena/provider.mjs','arena/browser-demo.mjs','assets/board.svg','assets/brands/claude.png','assets/brands/gemini.png','assets/brands/openai.svg','assets/brands/grok.svg','assets/brands/deepseek.ico','output/pdf/terms-apply-kit.pdf'];
for(const file of files){await mkdir(dirname(resolve(output,file)),{recursive:true});await copyFile(file,resolve(output,file));}
let html=await readFile(resolve(output,'index.html'),'utf8');
for(const file of ['arena/client.bundle.js','arena/private-client.bundle.js','arena/play.css','arena/arena.css','arena/experience.css']){const bytes=await readFile(resolve(output,file));const hashed=file.replace(/(\.[^.]+)$/,'-'+createHash('sha256').update(bytes).digest('hex').slice(0,10)+'$1');await writeFile(resolve(output,hashed),bytes);html=html.replace(file,hashed);}
await writeFile(resolve(output,'index.html'),html);await writeFile(resolve(output,'.nojekyll'),'');console.log('Built the private browser game. No server secrets or runtime data included.');
