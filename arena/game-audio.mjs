const MUTE_KEY='terms-apply-sound-muted';
export function createGameAudio({storage=globalThis.localStorage,makeContext=()=>{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;return Audio?new Audio():null;},visible=()=>!globalThis.document?.hidden,onChange=()=>{}}={}){
 let muted=false,context=null,master=null,noise=null,unavailable=false;const voices=new Set();
 try{muted=storage?.getItem(MUTE_KEY)==='true';}catch{}
 function status(){return {muted,unavailable};}
 function stop(){for(const node of voices){try{node.stop();}catch{}}voices.clear();}
 function unlock(){
  if(muted||!visible()||unavailable)return;
  try{
   if(!context){context=makeContext();if(!context){unavailable=true;onChange(status());return;}master=context.createGain();master.gain.value=.22;master.connect(context.destination);noise=context.createBuffer(1,Math.ceil(context.sampleRate*.08),context.sampleRate);const data=noise.getChannelData(0);let seed=9173;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/0xffffffff*2-1);}}
   if(context.state==='suspended')context.resume()?.catch(()=>{});
  }catch{unavailable=true;stop();onChange(status());}
 }
 function keep(node,connections){voices.add(node);node.onended=()=>{voices.delete(node);for(const item of [node,...connections])item.disconnect();};}
 function envelope(gain,time,length,level){gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(level,time+.003);gain.gain.exponentialRampToValueAtTime(.0001,time+length);}
 function tap(time,pitch,level,length=.05){
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noise;filter.type='bandpass';filter.frequency.value=pitch;filter.Q.value=.7;envelope(gain,time,length,level);source.connect(filter);filter.connect(gain);gain.connect(master);keep(source,[filter,gain]);source.start(time);source.stop(time+length);
 }
 function tone(time,pitch,endPitch,level,length,type='triangle'){
  const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;oscillator.frequency.setValueAtTime(pitch,time);oscillator.frequency.exponentialRampToValueAtTime(endPitch,time+length);envelope(gain,time,length,level);oscillator.connect(gain);gain.connect(master);keep(oscillator,[gain]);oscillator.start(time);oscillator.stop(time+length+.01);
 }
 function play(kind){
  if(muted||!visible()||!context||context.state!=='running')return false;
  const now=context.currentTime;
  try{
   if(kind==='dice')for(const [i,offset] of [.015,.085,.17,.29,.43,.56,.68,.83,1.04].entries()){tap(now+offset,1100+(i%3)*450,.55-i*.035,.045);tone(now+offset,240+(i%2)*60,110,.12,.055);}
   else if(kind==='step'){tap(now,850,.20,.035);tone(now,330,150,.12,.055);}
   else if(kind==='payment'){tone(now,880,880,.15,.16,'sine');tone(now+.065,1320,1320,.12,.20,'sine');}
   else return false;
   return true;
  }catch{stop();return false;}
 }
 function setMuted(value){muted=!!value;try{storage?.setItem(MUTE_KEY,String(muted));}catch{}if(muted){stop();context?.suspend()?.catch(()=>{});}else unlock();onChange(status());}
 function suspend(){stop();context?.suspend()?.catch(()=>{});}
 function resumeExisting(){if(context&&!muted&&visible())unlock();}
 return {unlock,play,setMuted,status,stop,suspend,resumeExisting};
}

// Consume recorded payments once, after the piece lands. Never replay saved history.
export function createPaymentSoundQueue(play){
 let matchId=null,seen=0,pending=false;
 return {observe(match,{moving=false,paused=false}={}){
  if(matchId!==match.id){matchId=match.id;seen=match.tick;pending=false;return;}
  for(const event of match.events){if(event.id>seen&&(event.transfers||[]).some(t=>t.amount>0))pending=true;}
  seen=Math.max(seen,match.tick);
  if(paused){pending=false;return;}
  if(pending&&!moving){pending=false;play('payment');}
 },clear(){pending=false;}};
}
