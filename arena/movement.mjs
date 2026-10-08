// Follow a dice move around the board; forced relocations go directly to their square.
export function movementRoute(from,to,steps){
 if(!Number.isInteger(steps)||steps<1||steps>12||(from+steps)%20!==to)return [to];
 return Array.from({length:steps},(_,i)=>(from+i+1)%20);
}
