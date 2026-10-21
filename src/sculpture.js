/**
 * A single parametrically folded textile, animated entirely on the GPU.
 * No 3D framework, external models or runtime network calls are needed.
 * The surface is lit on both sides, with gold selvages and a woven motif.
 */
const vertexSource = `#version 300 es
precision highp float;
in vec2 aUV;
uniform float uTime;
uniform vec2 uPointer;
uniform float uAspect;
out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;
vec3 cloth(vec2 uv){
  float u=uv.x, v=uv.y*2.0-1.0;
  float t=(u-.5)*6.3;
  float twist=t*1.25+.25*sin(u*8.0+uTime*.3);
  float w=(.72+.16*sin(u*3.14159))*v;
  float ripple=.065*sin(v*17.0+u*18.0-uTime*.55)+.025*cos(v*33.0-u*12.0+uTime*.35);
  vec3 p=vec3(.93*sin(t*.83)+w*cos(twist), (u-.5)*4.65+.14*cos(v*3.0+t), .53*cos(t)+w*sin(twist)+ripple);
  p.x+=.09*sin(u*9.0+uTime*.4);
  p.y+=.045*sin(uTime*.45);
  float ry=-.18+uPointer.x*.35+.11*sin(uTime*.17);
  float rx=.14+uPointer.y*.13;
  p.xz=mat2(cos(ry),-sin(ry),sin(ry),cos(ry))*p.xz;
  p.yz=mat2(cos(rx),-sin(rx),sin(rx),cos(rx))*p.yz;
  float rz=-.20;
  p.xy=mat2(cos(rz),-sin(rz),sin(rz),cos(rz))*p.xy;
  return p;
}
void main(){
  vec3 p=cloth(aUV);
  vec3 du=cloth(aUV+vec2(.0005,0.0))-p;
  vec3 dv=cloth(aUV+vec2(0.0,.0005))-p;
  vNormal=normalize(cross(du,dv));
  vPosition=p; vUV=aUV;
  float depth=7.6-p.z;
  float scale=2.45;
  gl_Position=vec4(p.x*scale/uAspect,p.y*scale,depth*1.002-0.2002,depth);
}`;

const fragmentSource = `#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
uniform vec3 uColor;
out vec4 outColor;
void main(){
  vec3 n=normalize(vNormal)*(gl_FrontFacing?1.0:-1.0);
  vec3 view=normalize(vec3(0.0,0.0,7.6)-vPosition);
  vec3 light=normalize(vec3(-3.0,5.0,5.0)-vPosition);
  vec3 fill=normalize(vec3(4.0,1.0,2.0)-vPosition);
  float diffuse=max(dot(n,light),0.0);
  float soft=max(dot(n,fill),0.0);
  float sheen=pow(1.0-abs(dot(n,view)),2.5);
  float spec=pow(max(dot(n,normalize(light+view)),0.0),35.0);
  float edge=1.0-smoothstep(.025,.065,min(vUV.y,1.0-vUV.y));
  float endTrim=1.0-smoothstep(.012,.027,min(vUV.x,1.0-vUV.x));
  vec2 cell=fract(vUV*vec2(35.0,9.0))-.5;
  float diamond=abs(cell.x)+abs(cell.y);
  float motif=(1.0-smoothstep(.035,.070,abs(diamond-.23)))*.32;
  float thread=.5+.5*sin(vUV.x*2600.0)*sin(vUV.y*1100.0);
  vec3 gold=vec3(.68,.40,.13);
  vec3 base=mix(uColor,gold,max(max(edge,endTrim),motif));
  vec3 color=base*(.35+diffuse*.85+soft*.27);
  color+=vec3(.62,.45,.29)*spec*.6;
  color+=mix(vec3(.34,.17,.22),vec3(.65,.46,.27),edge)*sheen*.65;
  color*=.97+thread*.06;
  color=pow(color,vec3(.83));
  outColor=vec4(color,1.0);
}`;

const palettes = { plum:[.34,.095,.20], saffron:[.66,.27,.065], sage:[.19,.34,.25] };

export function createSilkSculpture(canvas, { paused=false, onReady=()=>{}, onLost=()=>{} }={}) {
  const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
  if(!gl) throw new Error('WebGL 2 is unavailable');
  let program, uniforms, vao, frame=0, inView=true, lost=false, last=0, time=4.8;
  let target=[0,0], pointer=[0,0], palette=palettes.plum, aspect=1, firstFrame=true;
  const mobile=matchMedia('(max-width: 700px)').matches;
  const frameInterval=1000/(mobile?30:60);
  const rows=180, cols=36;
  const uv=new Float32Array((rows+1)*(cols+1)*2);
  const indices=new Uint16Array(rows*cols*6);
  let k=0;
  for(let i=0;i<=rows;i++) for(let j=0;j<=cols;j++){uv[k++]=i/rows;uv[k++]=j/cols;}
  k=0;
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
    const a=i*(cols+1)+j,b=a+cols+1;
    indices.set([a,b,a+1,b,b+1,a+1],k);k+=6;
  }
  function compile(type,source){
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(msg);}
    return shader;
  }
  function setup(){
    program=gl.createProgram();
    const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    uniforms=Object.fromEntries(['uTime','uPointer','uAspect','uColor'].map(name=>[name,gl.getUniformLocation(program,name)]));
    vao=gl.createVertexArray();gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,uv,gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
    gl.useProgram(program);
  }
  function draw(){
    if(lost)return;
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);gl.bindVertexArray(vao);
    gl.uniform1f(uniforms.uTime,time);gl.uniform2f(uniforms.uPointer,...pointer);
    gl.uniform1f(uniforms.uAspect,aspect);gl.uniform3fv(uniforms.uColor,palette);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    if(firstFrame){firstFrame=false;onReady();}
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,mobile?1.5:2);
    canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));
    aspect=canvas.width/canvas.height;gl.viewport(0,0,canvas.width,canvas.height);draw();
  }
  function tick(now){
    frame=0;
    if(paused||!inView||document.hidden||lost)return;
    if(now-last>=frameInterval-1){
      time+=Math.min((now-last)/1000,.05);last=now;
      pointer=pointer.map((v,i)=>v+(target[i]-v)*.04);draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function schedule(){
    cancelAnimationFrame(frame);frame=0;last=performance.now();
    if(!paused&&inView&&!document.hidden&&!lost)frame=requestAnimationFrame(tick);
  }
  setup();resize();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;schedule();},{rootMargin:'50px'}).observe(canvas);
  document.addEventListener('visibilitychange',schedule);
  canvas.addEventListener('pointermove',event=>{
    if(paused||event.pointerType==='touch')return;
    const rect=canvas.getBoundingClientRect();target=[(event.clientX-rect.left)/rect.width*2-1,(event.clientY-rect.top)/rect.height*2-1];
  },{passive:true});
  canvas.addEventListener('pointerleave',()=>{target=[0,0];});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);onLost();});
  canvas.addEventListener('webglcontextrestored',()=>{try{lost=false;firstFrame=true;setup();resize();schedule();}catch{lost=true;onLost();}});
  schedule();
  return {setPaused(value){paused=value;schedule();draw();},setPalette(name){palette=palettes[name]||palettes.plum;draw();}};
}
