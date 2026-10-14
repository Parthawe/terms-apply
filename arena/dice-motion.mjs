import * as THREE from 'three';
export {DICE_ROLL_SECONDS} from './dice-timing.mjs';
// Box material order: +X, -X, +Y, -Y, +Z, -Z. Opposite faces sum to seven.
export const DICE_FACES=[1,6,2,5,3,4];
export function diceRestRotation(value){
 const angles={1:[0,0,Math.PI/2],6:[0,0,-Math.PI/2],2:[0,0,0],5:[Math.PI,0,0],3:[-Math.PI/2,0,0],4:[Math.PI/2,0,0]};
 if(!angles[value])throw Error('A die needs a value from one to six.');
 return new THREE.Quaternion().setFromEuler(new THREE.Euler(...angles[value]));
}
export function diceSupport(rotation){
 const matrix=new THREE.Matrix4().makeRotationFromQuaternion(rotation).elements;
 return .165*(Math.abs(matrix[1])+Math.abs(matrix[5])+Math.abs(matrix[9]))+.035;
}
export function dicePose(progress,index,value){
 const p=Math.min(1,Math.max(0,progress)),rest=diceRestRotation(value);
 const settle=Math.max(0,(p-.78)/.22),ease=settle*settle*(3-2*settle);
 const tumble=new THREE.Quaternion().setFromEuler(new THREE.Euler((1-p)*Math.PI*(4+index),(1-p)*Math.PI*(3+index),(1-p)*Math.PI*(2+index)));
 const rotation=rest.clone().multiply(tumble).slerp(rest,ease);
 const height=p<.55?.68*Math.sin(Math.PI*p/.55):p<.8?.20*Math.sin(Math.PI*(p-.55)/.25):.035*Math.sin(Math.PI*(p-.8)/.2);
 const travel=(1-p)*(1-p);
 return {rotation,x:(index===0?-.38:.38)-.85*travel,z:1.05+(index===0?-.2:.2)*travel,y:-.05+diceSupport(rotation)+Math.max(0,height)};
}
