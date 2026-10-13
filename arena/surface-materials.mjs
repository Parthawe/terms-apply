import * as THREE from 'three';

// Small, deterministic textures generated locally. Labels stay on separate crisp planes.
function grainTexture(kind,size=128){
 const pixels=new Uint8Array(size*size*4);let seed=9271;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const noise=(seed>>>24)/255;
  const weave=kind==='felt'?((x%4<2?1:0)+(y%4<2?1:0))*4:0;
  const value=Math.round(kind==='metal'?220+noise*15+(y%3)*6:kind==='felt'?225+noise*14+weave:240+noise*15);
  const i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;
 }
 const texture=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
 texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}

function addSurfaceShader(material,kind){
 // Preserve Three.js lights, shadows, tone mapping and PBR; modulate only the material.
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vSurfacePoint;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSurfacePoint = position;');
  shader.fragmentShader=`varying vec3 vSurfacePoint;
float surfaceHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
`+shader.fragmentShader;
  const surface=kind==='felt'?`
vec2 weavePoint=vSurfacePoint.xz*180.0;
vec2 visibility=1.0-smoothstep(vec2(0.4),vec2(1.4),fwidth(weavePoint));
vec2 threads=sin(weavePoint*6.2831853)*visibility;
float surfaceGrain=surfaceHash(floor(vSurfacePoint*420.0));
diffuseColor.rgb*=0.97+0.012*(threads.x+threads.y)+0.025*surfaceGrain;
`:kind==='metal'?`
float brush=sin(vSurfacePoint.y*900.0);
float visibleBrush=1.0-smoothstep(0.4,1.4,fwidth(vSurfacePoint.y*900.0));
float surfaceGrain=surfaceHash(floor(vSurfacePoint*650.0));
diffuseColor.rgb*=0.97+0.016*brush*visibleBrush+0.025*surfaceGrain;
`:`
float surfaceGrain=surfaceHash(floor(vSurfacePoint*550.0));
diffuseColor.rgb*=0.985+0.015*surfaceGrain;
`;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+surface);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(surfaceGrain-0.5)*0.04,0.05,1.0);');
 };
 material.customProgramCacheKey=()=>`terms-surface-${kind}-v1`;
 return material;
}

export function createSurfaceMaterials(renderer){
 const paper=grainTexture('paper'),felt=grainTexture('felt',256),metal=grainTexture('metal');
 for(const t of [paper,felt,metal])t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const feltBump=felt.clone();feltBump.repeat.set(10,10);feltBump.needsUpdate=true;
 const paperBump=paper.clone();paperBump.repeat.set(2,2);paperBump.needsUpdate=true;
 return {
  paper(color){return addSurfaceShader(new THREE.MeshStandardMaterial({color,roughness:.88,map:paper,bumpMap:paperBump,bumpScale:.008}),'paper');},
  felt(color){return addSurfaceShader(new THREE.MeshStandardMaterial({color,roughness:.96,map:felt,bumpMap:feltBump,bumpScale:.016}),'felt');},
  token(color){return addSurfaceShader(new THREE.MeshPhysicalMaterial({color,metalness:.35,roughness:.3,clearcoat:.3,clearcoatRoughness:.4,roughnessMap:metal,bumpMap:metal,bumpScale:.0015}),'metal');},
  dice(map){return addSurfaceShader(new THREE.MeshPhysicalMaterial({map,roughness:.28,clearcoat:.45,clearcoatRoughness:.24,bumpMap:paper,bumpScale:.002}),'paper');}
 };
}
