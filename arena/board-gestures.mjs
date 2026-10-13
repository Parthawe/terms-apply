// A drag or multi-touch gesture must never count as a street tap.
export function attachBoardGestures(canvas,{getZoom,setZoom,pointAt,panBy,onTap}){
 const pointers=new Map();let startPoint=null,startZoom=1,startDistance=0,dragged=false;
 function begin(){const points=[...pointers.values()];startZoom=getZoom();startPoint=points.length===1?pointAt(points[0].x,points[0].y):null;startDistance=points.length===2?Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y):0;}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY});if(pointers.size===1)dragged=false;else dragged=true;begin();});
 canvas.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;if(Math.hypot(p.x-p.originX,p.y-p.originY)>6)dragged=true;const points=[...pointers.values()];if(points.length===2&&startDistance){setZoom(startZoom*Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)/startDistance);}else if(points.length===1&&getZoom()>1&&startPoint){const point=pointAt(e.clientX,e.clientY);if(point)panBy(startPoint.x-point.x,startPoint.z-point.z);}});
 function end(e){if(!pointers.has(e.pointerId))return;const tap=pointers.size===1&&!dragged&&e.type==='pointerup';pointers.delete(e.pointerId);if(tap)onTap(e.clientX,e.clientY);if(pointers.size)begin();}
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 canvas.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();setZoom(getZoom()*Math.exp(-e.deltaY*.01));},{passive:false});
}
