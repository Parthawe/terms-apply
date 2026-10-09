const OR='https://openrouter.ai/api/v1',PENDING='terms-apply-pkce-v1';
const safeError=status=>status===401?'The key was rejected. Check it or reconnect OpenRouter.':status===402?'OpenRouter needs credits before this match can continue.':status===429?'OpenRouter is rate limiting this request. Wait, then retry.':'OpenRouter could not complete this request. Retry when the service is available.';
export function createCredentials({fetcher=fetch,cryptoAPI=globalThis.crypto,storage=globalThis.sessionStorage,now=Date.now}={}){
 let key='',validated=false,generation=0;const controllers=new Set(),listeners=new Set();
 try{const pending=JSON.parse(storage?.getItem(PENDING));if(pending&&(!Number.isFinite(pending.created)||now()-pending.created>600000||now()<pending.created))storage.removeItem(PENDING);}catch{storage?.removeItem(PENDING);}
 const notify=()=>listeners.forEach(fn=>fn(!!key&&validated));
 async function call(path,options={},authenticated=true){
  if(authenticated&&!key)throw Error('Connect OpenRouter to continue.');
  const gen=generation,controller=new AbortController();controllers.add(controller);const timer=setTimeout(()=>controller.abort(),30000);
  try{const res=await fetcher(OR+path,{...options,credentials:'omit',referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json',...options.headers,...(authenticated?{Authorization:'Bearer '+key}:{})},signal:controller.signal});
   if(gen!==generation)throw Error('Connection changed. Reconnect to continue.');
   if(!res.ok)throw Error(safeError(res.status));const data=await res.json();if(gen!==generation)throw Error('Connection changed. Reconnect to continue.');if(data.error)throw Error('OpenRouter could not complete this request.');return data;
  }catch(e){if(e.message?.startsWith('OpenRouter')||e.message?.startsWith('Connection changed')||e.message?.startsWith('The key'))throw e;throw Error('The request was interrupted. Reconnect or retry; it may already have been billed.');}
  finally{clearTimeout(timer);controllers.delete(controller);}
 }
 function disconnect(){key='';validated=false;generation++;controllers.forEach(c=>c.abort());notify();}
 async function connect(candidate){disconnect();if(typeof candidate!=='string'||!candidate.trim()||candidate.trim().length>512)throw Error('Enter an OpenRouter API key.');key=candidate.trim();const ownGeneration=generation;try{const info=await call('/key');if(info.data?.is_management_key||info.data?.is_provisioning_key)throw Error('Use an inference key, not a management key.');if(!info.data)throw Error('The key could not be validated.');validated=true;notify();return {remaining:info.data.limit_remaining??null};}catch(e){if(ownGeneration===generation)disconnect();throw e;}}
 function random(){return Array.from(cryptoAPI.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');}
 async function begin(callbackURL){const callback=new URL(callbackURL);if(callback.protocol!=='https:'&&!(callback.protocol==='http:'&&['localhost','127.0.0.1'].includes(callback.hostname)))throw Error('A secure callback URL is required.');callback.search='';callback.hash='';const verifier=random(),state=random(),bytes=new Uint8Array(await cryptoAPI.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));const challenge=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');storage.setItem(PENDING,JSON.stringify({verifier,state,created:now(),callback:callback.href}));const url=new URL('https://openrouter.ai/auth');Object.entries({callback_url:callback.href,code_challenge:challenge,code_challenge_method:'S256',state,key_label:'Terms Apply private game'}).forEach(([k,v])=>url.searchParams.set(k,v));return url.href;}
 async function finish(callbackURL){const url=new URL(callbackURL);if(!url.searchParams.has('code')&&!url.searchParams.has('error'))return null;let pending;try{pending=JSON.parse(storage.getItem(PENDING));}catch{}storage.removeItem(PENDING);
  if(url.searchParams.has('error'))throw Error('OpenRouter connection was cancelled. You can try again.');
  if(!pending||now()-pending.created>600000||now()<pending.created||url.searchParams.get('state')!==pending.state||url.origin+url.pathname!==new URL(pending.callback).origin+new URL(pending.callback).pathname)throw Error('The connection expired or could not be verified. Connect again.');
  const body=await call('/auth/keys',{method:'POST',body:JSON.stringify({code:url.searchParams.get('code'),code_verifier:pending.verifier,code_challenge_method:'S256'})},false);if(typeof body.key!=='string')throw Error('The connection did not return a usable key.');return connect(body.key);
 }
 return {connect,disconnect,begin,finish,request:(...args)=>{if(!validated)throw Error('Connect OpenRouter to continue.');return call(...args);},redact:text=>key?String(text).split(key).join('[redacted]'):String(text),connected:()=>!!key&&validated,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
}
export function cleanCallbackURL(value){const url=new URL(value);['code','state','error','error_description'].forEach(p=>url.searchParams.delete(p));return url.href;}
