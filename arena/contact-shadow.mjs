import * as THREE from 'three';
export function createContactShadow(scene,size,floor){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');
 const fade=ctx.createRadialGradient(32,32,4,32,32,30);fade.addColorStop(0,'rgba(20,28,22,0.38)');fade.addColorStop(.45,'rgba(20,28,22,0.14)');fade.addColorStop(1,'rgba(20,28,22,0)');ctx.fillStyle=fade;ctx.fillRect(0,0,64,64);
 const texture=new THREE.CanvasTexture(canvas);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,opacity:1}));mesh.rotation.x=-Math.PI/2;mesh.position.y=floor;scene.add(mesh);return mesh;
}
