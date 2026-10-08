import http from 'node:http';
import {readFile,writeFile,mkdir,rename,appendFile} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomInt,timingSafeEqual} from 'node:crypto';
import {startMatch,applyMove,botMove,observation,result,demoRoster} from './arena/game.mjs';
import {catalog,modelMove,parseReply} from './arena/provider.mjs';
const root=dirname(fileURLToPath(import.meta.url));
// Keys are read on the server only. .env and data are never in the static route allowlist.
if(process.env.SKIP_ENV_FILE!=='1')try{for(const line of (await readFile(resolve(root,'.env'),'utf8')).split('\n')){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].trim().replace(/^(['"])(.*)\1$/,'$2');}}catch{}
const apiKey=process.env.OPENROUTER_API_KEY||'',port=Number(process.env.PORT||8765),host=process.env.HOST||'127.0.0.1';
const publicOrigin=process.env.PUBLIC_ORIGIN||(process.env.RENDER_EXTERNAL_URL||''),adminToken=process.env.ADMIN_TOKEN||'';
if(publicOrigin&&!adminToken)throw Error('PUBLIC_ORIGIN requires ADMIN_TOKEN to protect runner controls.');
const dataDir=resolve(process.env.DATA_DIR||resolve(root,'data'));const stateFile=resolve(dataDir,'arena-state.json');await mkdir(dataDir,{recursive:true});
let state={version:3,mode:'demo',running:true,status:'running',message:'Local strategy bots are playing. No model API calls are made.',interval:1500,roster:demoRoster,match:startMatch(demoRoster,1,randomInt(1,0x7fffffff)),history:[],totals:{},limits:{requestsPerDay:200,usdPerDay:1},usage:{date:new Date().toISOString().slice(0,10),requests:0,cost:0,unknownCosts:0},lastUpdated:new Date().toISOString()};
try{const saved=JSON.parse(await readFile(stateFile,'utf8'));if(saved.version===3)state=saved;else if(saved.version===2){await writeFile(resolve(dataDir,'legacy-arena-state-v2.json'),JSON.stringify(saved,null,2));state={...saved,version:3,match:startMatch(saved.roster.slice(0,4),saved.match.id+1,randomInt(1,0x7fffffff)),history:[],totals:{},running:saved.mode==='demo',status:saved.mode==='demo'?'running':'paused',message:saved.mode==='demo'?'Simple edition ready. Local bots are playing.':'Simple edition ready. Previous usage limits and ledger retained. Resume to start model play.'};}}catch{}
if(state.mode==='real'&&!apiKey){state.running=false;state.status='disconnected';state.message='Add OPENROUTER_API_KEY to the server environment, then restart.';}
let models=[],catalogError='',busy=false,clients=new Set(),timer,controlVersion=0;
const colors=['#698f86','#c1866c','#8d82a3','#ad9d61','#7195b0','#a87584','#849661','#cc9b56'];
function publicState(){return {...state,connected:!!apiKey,thinking:busy,catalogError,serverTime:new Date().toISOString(),provider:'OpenRouter',requiresAdmin:!!publicOrigin};}
async function persist(){state.lastUpdated=new Date().toISOString();await writeFile(stateFile+'.tmp',JSON.stringify(state));await rename(stateFile+'.tmp',stateFile);}
function broadcast(){const msg=`data: ${JSON.stringify(publicState())}\n\n`;for(const c of clients)c.write(msg);}
function pause(message,status='error'){state.running=false;state.status=status;state.message=message;}
async function loadModels(){try{models=await catalog();catalogError='';}catch(e){catalogError=e.message;}broadcast();}
function nextTable(){const number=state.match.id+1,offset=((number-1)*4)%state.roster.length;const roster=Array.from({length:Math.min(4,state.roster.length)},(_,i)=>state.roster[(offset+i)%state.roster.length]);return startMatch(roster,number,randomInt(1,0x7fffffff));}
function schedule(){clearTimeout(timer);timer=setTimeout(tick,state.match.finishedAt?6000:state.interval);}
async function tick(){if(busy)return;if(!state.running){schedule();return;}busy=true;broadcast();const version=controlVersion;
 try{
  if(state.match.finishedAt){state.match=nextTable();state.message=state.mode==='demo'?'New local-bot match.':'New OpenRouter match.';}
  else{const p=state.match.players[state.match.current];let move;
   if(state.mode==='demo'){move=botMove(state.match,p);}
   else{
    if(!apiKey)throw Error('OpenRouter is disconnected. Configure the server API key.');
    const today=new Date().toISOString().slice(0,10);if(today!==state.usage.date)state.usage={date:today,requests:0,cost:0,unknownCosts:0};
    const obs=observation(state.match,p),promptTokensUpper=JSON.stringify(obs).length+1200;
    const reserve=promptTokensUpper*p.model.promptPrice+500*p.model.completionPrice;
    if(state.usage.requests>=state.limits.requestsPerDay||state.usage.cost+reserve>state.limits.usdPerDay){pause('Daily API limit reached. Increase the limit or resume on a new UTC day.','limit');await persist();return;}
    if(state.usage.unknownCosts){pause('An API response omitted cost. Check the provider ledger before resuming.','limit');await persist();return;}
    state.usage.requests++;p.requests++;state.usage.cost+=reserve;state.usage.estimatedCost=(state.usage.estimatedCost||0)+reserve;await persist();const start=Date.now();
    const reply=await modelMove(p.model,obs,apiKey);p.latency=Date.now()-start;
    const cost=Number(reply.usage.cost);if(reply.usage.cost==null||!Number.isFinite(cost)||cost<0)state.usage.unknownCosts++;else{state.usage.cost+=cost-reserve;state.usage.estimatedCost=Math.max(0,(state.usage.estimatedCost||0)-reserve);}
    await appendFile(resolve(dataDir,'provider-responses.jsonl'),JSON.stringify({time:new Date().toISOString(),match:state.match.id,player:p.model.id,reportedModel:reply.reportedModel,text:reply.text,usage:reply.usage})+'\n');
    if(version!==controlVersion)return;
    if(reply.reportedModel!==p.model.id&&!reply.reportedModel.startsWith(p.model.id))throw Error('OpenRouter returned a different model identity. Match paused to preserve attribution.');
    move=parseReply(reply.text);
   }
   state.match=applyMove(state.match,move.action,move.reason);
   const last=state.match.events.at(-1);if(last.rejected&&state.mode==='real')pause('Model selected an illegal move. Inspect the transcript, then resume.');
   if(state.match.finishedAt){const r={...result(state.match),mode:state.mode};state.history.unshift(r);state.history=state.history.slice(0,100);for(const row of r.rows){const key=state.mode+':'+row.id;const t=state.totals[key]||{id:row.id,name:row.name,mode:state.mode,games:0,wins:0,tasks:0,open:0,incorrect:0,rejected:0};t.games++;t.wins+=r.winners.includes(row.id)?1:0;t.tasks+=row.tasks;t.open+=row.open;t.incorrect+=row.incorrect;t.rejected+=row.rejected;state.totals[key]=t;}
    await writeFile(resolve(dataDir,`match-${state.match.id}.json`),JSON.stringify({result:r,match:state.match}));
    await appendFile(resolve(dataDir,'matches.jsonl'),JSON.stringify({result:r,match:state.match})+'\n');state.message='Match finished. The next table starts in six seconds.';}
  }
 }catch(e){pause(e.message||'The runner stopped unexpectedly.');}
 finally{busy=false;try{await persist();}catch{pause('The match could not be saved. Check server disk permissions.');}broadcast();schedule();}
}
const json=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
async function body(req){let txt='';for await(const chunk of req){txt+=chunk;if(txt.length>20000)throw Error('Request is too large.');}return JSON.parse(txt||'{}');}
const allowed=new Set(['index.html','play.html','app.mjs','style.css','content.mjs','engine.mjs','case-study.html','print.html','rules.md','arena/client.mjs','arena/client.bundle.js','arena/arena.css','arena/game.mjs','arena/provider.mjs','arena/browser-demo.mjs','assets/board.svg','output/pdf/terms-apply-kit.pdf']);
const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml','.pdf':'application/pdf','.md':'text/plain'};
const server=http.createServer(async(req,res)=>{
 try{
  const reqHost=req.headers.host||'';if(![`${host}:${port}`,`localhost:${port}`,`127.0.0.1:${port}`,...(publicOrigin?[new URL(publicOrigin).host]:[])].includes(reqHost))return json(res,403,{error:'Unrecognized host.'});
  const url=new URL(req.url,`http://${reqHost}`);
  if(req.method==='POST'){
   if(![`http://${reqHost}`,publicOrigin].filter(Boolean).includes(req.headers.origin))return json(res,403,{error:'Same-origin control required.'});
   if(publicOrigin){const token=String(req.headers['x-admin-token']||'');const a=Buffer.from(token),b=Buffer.from(adminToken);if(a.length!==b.length||!timingSafeEqual(a,b))return json(res,401,{error:'Enter the operator token to change this runner.'});}
   if(url.pathname!=='/api/control')return json(res,404,{error:'Not found.'});
   if(busy)return json(res,409,{error:'A move is in flight. Try again when it finishes.'});
   const b=await body(req);
   if(b.action==='pause'){state.running=false;state.status='paused';state.message='The runner is paused. No new API calls will be made.';}
   else if(b.action==='resume'){if(state.mode==='real'&&!apiKey)return json(res,400,{error:'OPENROUTER_API_KEY is missing on the server.'});state.running=true;state.status='running';state.message=state.mode==='real'?'OpenRouter models are playing.':'Local strategy bots are playing.';}
   else if(b.action==='configure'){
    if(!['demo','real'].includes(b.mode))throw Error('Select a valid mode.');
    if(b.mode==='real'&&!apiKey)return json(res,400,{error:'Add OPENROUTER_API_KEY to the server environment and restart. No keys are entered in this page.'});
    const daily=Number(b.requestsPerDay),budget=Number(b.usdPerDay),interval=Number(b.interval);
    if(!Number.isInteger(daily)||daily<1||daily>100000||!Number.isFinite(budget)||budget<=0||budget>1000||!Number.isFinite(interval)||interval<300||interval>60000)throw Error('Enter valid limits and move pacing.');
    let roster=demoRoster;if(b.mode==='real'){if(!Array.isArray(b.models)||b.models.length<2||b.models.length>24||new Set(b.models).size!==b.models.length)throw Error('Select 2 to 24 distinct models.');roster=b.models.map((id,i)=>{const model=models.find(m=>m.id===id);if(!model)throw Error('A selected model is unavailable in the current catalog.');return {...model,color:colors[i%colors.length]};});}
    // Archive incomplete tables instead of mixing model/demo histories.
    await appendFile(resolve(dataDir,'abandoned-tables.jsonl'),JSON.stringify({time:new Date().toISOString(),mode:state.mode,match:state.match})+'\n');
    state.mode=b.mode;state.roster=roster;state.limits={requestsPerDay:daily,usdPerDay:budget};state.interval=interval;state.match=startMatch(roster.slice(0,4),state.match.id+1,randomInt(1,0x7fffffff));state.running=true;state.status='running';state.message=b.mode==='real'?'OpenRouter models are playing.':'Local strategy bots are playing. No model API calls are made.';
   }else throw Error('Unknown control action.');
   controlVersion++;await persist();broadcast();schedule();return json(res,200,{ok:true});
  }
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed.'});
  if(url.pathname==='/health')return json(res,200,{ok:true});
  if(url.pathname==='/api/state')return json(res,200,publicState());
  if(url.pathname==='/api/models')return json(res,200,{models,error:catalogError,connected:!!apiKey});
  if(/^\/api\/matches\/\d+$/.test(url.pathname)){const id=Number(url.pathname.split('/').at(-1));if(!state.history.some(h=>h.id===id))return json(res,404,{error:'This match is not in the retained recent history.'});const record=JSON.parse(await readFile(resolve(dataDir,`match-${id}.json`),'utf8'));return json(res,200,record);}
  if(url.pathname==='/api/export'){res.setHeader('Content-Disposition','attachment; filename="terms-apply-arena-record.json"');return json(res,200,publicState());}
  if(url.pathname==='/api/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});clients.add(res);res.write(`data: ${JSON.stringify(publicState())}\n\n`);const beat=setInterval(()=>res.write(': heartbeat\n\n'),15000);req.on('close',()=>{clearInterval(beat);clients.delete(res);});return;}
  const path=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';if(!allowed.has(path))return json(res,404,{error:'Not found.'});
  const bytes=await readFile(resolve(root,path));res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'self'; frame-ancestors 'none'"});res.end(bytes);
 }catch(e){json(res,400,{error:e.code==='ENOENT'?'Not found.':e.message});}
});
server.listen(port,host,()=>{console.log(`Terms Apply arena: http://${host}:${port}`);loadModels();schedule();});
async function shutdown(){clearTimeout(timer);if(busy&&state.mode==='real')pause('Server stopped during a model request. Inspect the retained usage reservation before resuming.');await persist();for(const c of clients)c.end();server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),2000).unref();}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
