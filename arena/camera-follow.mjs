// Frame-rate independent tracking; board framing clamps the resulting pan.
export function followPan(pan,target,dt,reduced=false){
 const amount=reduced?1:1-Math.exp(-14*Math.max(0,dt));
 pan.x+=(target.x-pan.x)*amount;
 pan.z+=(target.z-pan.z)*amount;
 return pan;
}
