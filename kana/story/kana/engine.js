/* 앱 engine.js 사본(도구/엔진_가져오기.sh). 페이지용 네 군데: paused, KANA_DPR_K, init outfit, 갈아입을 때 자세 그림 지우기 */
/* 하루 움직임 엔진. 투명 전신 그림 한 장을 눈, 시선, 입, 머리카락, 몸의 휘어짐으로 실시간 변형한다. */
(function(){
const W=1536,H=2752,CX=778,FEET=2700,CUT=1300,BZ=1.3,OUT=['yukata','knit','cardigan','skirt','rose','office','sport','pink','ribbon','uniform','miko','goth','maid'];
const VS='attribute vec2 a;varying vec2 v;uniform vec4 rect;uniform vec2 res;void main(){v=a;vec2 p=rect.xy+a*rect.zw;vec2 n=p/res*2.-1.;gl_Position=vec4(n.x,-n.y,0.,1.);}';
const FS=`precision highp float;varying vec2 v;uniform sampler2D t;uniform sampler2D t2;uniform float wipe,lod;
uniform vec2 look,bend;uniform float tm,blink,mouth,smile,blush,tilt,breath,squash,sway,script,smile2,brow,wide;uniform vec4 pad;uniform float fade,pf,fon;
float ss(float a,float b,float x){float t=clamp((x-a)/(b-a),0.,1.);return t*t*(3.-2.*t);}
vec2 rot(vec2 p,float a){float s=sin(a),k=cos(a);return vec2(p.x*k-p.y*s,p.x*s+p.y*k);}
float skin=0.,sh=0.,gv=0.;vec2 skc=vec2(0.);
/* 눈썹 올림·내림(br), 눈 키움(wd). si=안쪽 방향(+1 오른쪽). 같은 그림을 밀기만 한다 */
vec2 bw(vec2 q,vec2 e,float br,float wd,float si){const vec2 R=vec2(44.,30.);vec2 n=rot(q-e,.11)/R;
 float ix=clamp(n.x*si,-1.5,1.5);float tw=br<0.?1.+.55*ix:1.-.15*ix;
 float mb=ss(1.65,.95,abs(n.x))*(br<0.?ss(-4.6,-3.2,n.y)*ss(-.25,-1.25,n.y):ss(-2.9,-2.3,n.y)*ss(-1.2,-1.65,n.y));float dy=br*12.*tw*mb;
 if(abs(dy)>.05){/* 앞머리 가닥은 밀지 않는다: 지금 자리나 가져올 자리가 머리칼이면 줄인다 */vec4 a0=TEX(t,q/vec2(1536.,2752.)),a1=TEX(t,(q+vec2(0.,dy))/vec2(1536.,2752.));float h0=ss(.62,.45,dot(a0.rgb/max(a0.a,.01),vec3(.3,.59,.11))),h1=ss(.62,.45,dot(a1.rgb/max(a1.a,.01),vec3(.3,.59,.11)));dy*=1.-max(h0,h1)*ss(-.9,-1.3,n.y);/* 속눈썹(어두움)은 그대로 민다 */}
 q.y+=dy;
 float mw=ss(1.9,1.05,length(n*vec2(1.,.9)));q=e+(q-e)/(1.+wd*.10*mw);return q;}
vec2 eye(vec2 q,vec2 e,float b,vec2 g){const vec2 R=vec2(44.,30.);vec2 l=rot(q-e,.11);vec2 n=l/R;float x2=n.x*n.x;
 float edge=ss(1.28,1.06,abs(n.x));
 float ek=ss(1.06,.9,abs(n.x));float lt=-.86+.80*x2,tp=-.40+.52*x2,bt=.84-.16*x2;
 float tg=mix(.52-.34*x2,.02+.50*x2,smile2);float d=b*max(0.,tg-(lt+tp)*.5)*edge;
 if(abs(n.x)<1.28&&d>.001){
  float lu=lt-.28*(1.-ss(.6,.95,b));/* 반쯤 감을 때: 실제 속눈썹 윗선은 lt 보다 위. 다 감을 땐 lt */
  float cut=.14*ss(.6,.95,b);/* 다 감을 때 속눈썹 띠 아래의 흰자 줄은 피부로 */
  if(n.y>=lu+d&&n.y<=tp+d-cut){n.y-=d;return e+rot(n*R,-.11);}
  /* 내려온 눈꺼풀 위: 흰 색칠 대신 위쪽 피부와 머리칼을 늘려 채운다 */
  if(n.y>lu-.22&&n.y<lu+d){float a=lu-.22;n.y=a+(n.y-a)*(.14/(.22+d));return e+rot(n*R,-.11);}
  if(n.y>tp+d-cut&&n.y<bt+.16){float k=ss(.55,.9,b)*ek*ss(bt+.16,bt-.08,n.y);if(k>skin){skin=k;skc=e;gv=clamp((n.y-(tp+d))/(bt+.16-tp-d),0.,1.);sh=ss(.30,0.,n.y-(tp+d))*ss(.55,.9,b);}}
 }
 float gm=ss(1.,.3,length(n*vec2(1.05,1.15)));return q-rot(g*gm,-.11);}
void main(){vec2 p=mix(vec2(-pad.x,-pad.y),vec2(1536.+pad.x,2752.+pad.w),v);vec2 q=p;
 float fy=clamp((q.y-pad.z)/2300.,-.4,1.2);
 /* 움직일 때 몸은 늘어나지 않고 발을 축으로 통째로 기운다 */ q=vec2(780.,2712.)+rot(q-vec2(780.,2712.),bend.x*.00022);
 q.y=2712.-(2712.-q.y)/(1.+squash*.35);
 float ch=ss(520.,700.,q.y)*ss(1150.,800.,q.y);
 q.y+=breath*3.*ss(1700.,600.,q.y);q.x-=(q.x-778.)*breath*.010*ch;
 float side=ss(90.,330.,abs(q.x-778.));
 /* 얼굴(이마~턱, 볼 옆선까지)은 물결에서 뺀다: 볼 윤곽이 출렁이면 얼굴이 물처럼 흐른다 */
 float face=ss(185.,135.,length((q-vec2(778.,395.))*vec2(1.,.82)));
 float hair=side*ss(330.,900.,q.y)*ss(1250.,950.,q.y)*(1.-face);
 /* 머리카락은 물결 대신 덩어리째 살짝 흔들림 */ q.x-=sway*(hair*12.)+sin(tm*1.6+sign(q.x-778.)*.7)*hair*2.5;
 float sk=ss(1050.,1800.,q.y)*ss(2500.,1950.,q.y)*ss(60.,360.,abs(q.x-778.));
 q.x-=sway*sk*7.+sin(tm*1.3)*sk*1.5;
 float wh=ss(640.,440.,q.y);vec2 pv=vec2(788.,520.);
 vec2 hq=pv+rot(q-pv,-tilt*wh);
 float dep=ss(330.,40.,length((hq-vec2(778.,360.))*vec2(1.,.92)));
 /* 위를 볼 때는 약하게: 눈동자가 윗눈꺼풀 밑으로 들어가 졸려 보이던 것(캐릭터가 화면 아래에 있어 마우스가 대개 위) */vec2 lk=vec2(look.x,look.y<0.?look.y*.35:look.y);
 /* 머리는 통째로 돈다(가운데만 더 움직이면 얼굴이 고무처럼 늘어남). 입체감은 아주 조금만 */
 hq-=lk*vec2(15.,9.)*wh*(.62+dep*.12);
 hq.y-=0.;q=hq;
 vec2 g=lk*vec2(8.5,5.);
 if(fon>.5&&abs(brow)+wide>.001){q=bw(q,vec2(712.,353.),brow,wide,1.);q=bw(q,vec2(838.,339.),brow,wide,-1.);}
 if(fon>.5){q=eye(q,vec2(712.,353.),blink,g);q=eye(q,vec2(838.,339.),blink,g);}
 vec2 mq=rot(q-vec2(781.,425.),.11);float mm=ss(46.,14.,length(mq*vec2(1.,1.2)));
 q.y+=smile*(mq.x*mq.x*.0075)*mm*fon;
 vec2 uv=q/vec2(1536.,2752.);vec4 o=vec4(0.);
 float ins=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);{vec4 A=TEX(t,uv),B=TEX(t2,uv);float line=wipe*3150.-200.+sin(q.x*.013+tm*7.)*26.;float k=max(ss(line+60.,line-60.,q.y),pf);o=mix(A,B,k)*ins;}
 if(o.a>.001&&o.a<.85){vec3 c=o.rgb/o.a;float f=ss(.70,.88,min(c.r,min(c.g,c.b)))*ss(.85,.35,o.a);o*=1.-f;}
 if(skin>0.){vec3 top=vec3(1.,.953,.941);/* 눈꺼풀 피부: 눈 아래(볼 쪽)와 콧등 쪽 밝은 피부를 섞는다 */vec4 b1=TEX(t,(skc+vec2(0.,40.))/vec2(1536.,2752.)),b2=TEX(t,(skc+vec2(sign(778.-skc.x)*58.,14.))/vec2(1536.,2752.));vec3 bot=mix(b1.rgb/max(b1.a,.01),b2.rgb/max(b2.a,.01),.55);bot=mix(top,bot,.9);top=mix(top,bot,.55);vec3 sc=mix(top,bot,ss(-.1,.75,gv));sc=mix(sc,sc*vec3(.86,.78,.80),sh*.5);o.rgb=mix(o.rgb,sc*o.a,skin);}
 /* 입: 원래 그림의 윗입선을 남기고 그 아래로 연다. 색은 그림의 입선 색에서 가져온다 */
 if(fon>.5&&mouth>.02){vec2 s=vec2(11.+3.*mouth,2.+10.*mouth);vec2 z=(mq-vec2(0.,s.y*.85))/s;float d=length(z*vec2(1.,z.y<0.?1.25:1.));
  vec4 lc=TEX(t,vec2(781.,425.)/vec2(1536.,2752.));vec3 ln=lc.rgb/max(lc.a,.01);ln=min(ln,vec3(.55,.36,.38));
  float in1=ss(1.06,.94,d);float ed=ss(1.14,1.02,d)*ss(-.2,.25,z.y);
  /* 입 안: 위는 그림 입선보다 조금 밝은 팥색, 아래는 혀 분홍. 가장자리 선은 얇게(진하면 번진 얼룩처럼 보였다) */vec3 col=mix(vec3(.64,.35,.39),vec3(.94,.64,.64),ss(-.1,.7,z.y));col=mix(col,ln,ss(-.3,-.85,z.y)*.5);
  o.rgb=mix(o.rgb,ln*o.a,ed*.5*o.a);o.rgb=mix(o.rgb,col*o.a,in1*.92);}
 float bl=ss(52.,6.,length((q-vec2(690.,398.))*vec2(1.,1.5)))+ss(52.,6.,length((q-vec2(862.,380.))*vec2(1.,1.5)));
 o.rgb=mix(o.rgb,vec3(.98,.52,.53)*o.a,bl*blush*.5*fon);
 /* 상반신: 허리띠 가운데 아래로 부드럽게 사라진다 */if(fade>.001)o*=mix(1.,pow(ss(1300.,1010.,p.y),1.4),fade);
 gl_FragColor=o;}`;
let c,gl,u={},tex={},vw,vh,dpr,S,raf=0,last=0,say,opt={},ready;
const spring=(k,d,x=0)=>({x,v:0,t:x,k,d,step(h){this.v+=((this.t-this.x)*this.k-this.v*this.d)*h;this.x+=this.v*h},set(x){this.x=this.t=x;this.v=0}});
const pos={x:spring(130,16),y:spring(150,16)},fd=spring(60,14),lx=spring(60,12),ly=spring(60,12),bx=spring(80,15),by=spring(90,9),sw=spring(38,8),sq=spring(260,13),ti=spring(50,9),sm=spring(60,12),bl=spring(30,9),cl=spring(120,20),scale=spring(90,16,1),brs=spring(70,12),wds=spring(90,12);
const m={x:0,y:0,seen:0},L={};let pose={at:'',to:'',k:0,face:{},hold:0,want:''},POSES={},bust=null,fall=null,drag=null,grab=400,pet=0,cur='yukata',nxt=null,wipe=0,mode='own',forced=null,face={smile:.35,blush:0,closed:0,brow:0,wide:0,mouth:0,arc:-1},nextBlink=1,bt=-1,idle=0,full='',typed=0,sayMode='own',sayDone=null,hold=0,sayA=0,home={x:.5,y:.5,h:.82},reduce=false,glance=null,alive=true,opacity=1;
const emit=(n,d)=>(L[n]||[]).forEach(f=>f(d));
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x}
let bw,bh;function size(){dpr=Math.min(devicePixelRatio||1,2)*(window.KANA_DPR_K||1);if(vh&&vh!==innerHeight&&!big){/* 화면이 바뀌어도 바닥에서의 높이는 그대로 */const gap=(1-home.y)*vh;home.y=1-Math.max(60,Math.min(innerHeight-60,gap))/innerHeight}vw=innerWidth;vh=innerHeight;if(vw)home.x=Math.max(Math.min(.5,70/vw),Math.min(1-Math.min(.5,70/vw),home.x));S=(home.px||vh*home.h)/H*(bust?BZ:1);bw=Math.ceil((W+500)*S);bh=Math.ceil((H+300)*S);c.width=bw*dpr;c.height=bh*dpr;c.style.width=bw+'px';c.style.height=bh+'px';place()}
function bustY(){return vh*home.y+(FEET-H/2)*S/BZ-(CUT-60-H/2)*S}
function place(){if(!drag){pos.x.t=vw*home.x;pos.y.t=bust?(bust.y??bustY()):vh*home.y}}
function load(k,src){return new Promise((r,j)=>{const i=new Image;i.onload=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,i);if(typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext){try{gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)}catch(e){}}else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);tex[k]=t;r()};i.onerror=j;i.src=src})}
const loc=(x,y)=>({x:(x-pos.x.x)/(S*scale.x)+CX,y:(y-pos.y.x)/(S*scale.x)+H/2});
function hit(x,y){const l=loc(x,y);if(l.y<40||l.y>(bust?CUT-40:2730))return null;const w=l.y<560?235:l.y<1250?300:l.y<2300?290:170;if(Math.abs(l.x-CX)>w)return null;return l.y<300?'head':'body'}
function down(e){if(e.button||e.ctrlKey)return;m.x=e.clientX;m.y=e.clientY;m.seen=performance.now();const h=hit(m.x,m.y);if(!h||!alive)return;c.setPointerCapture(e.pointerId);drag={pet:h==='head',dx:pos.x.x-m.x,dy:pos.y.x-m.y,moved:0,part:h};grab=loc(m.x,m.y).y;if(h==='body')sq.v-=.3;idle=0}
function move(e){const d=Math.hypot(e.clientX-m.x,e.clientY-m.y);m.x=e.clientX;m.y=e.clientY;m.seen=performance.now();idle=0;if(!drag)return;drag.moved+=d;if(drag.pet){const was=pet;pet=Math.min(1,pet+d*.0045);if(was<.2&&pet>=.2)emit('pet',{})}else{if(big)return;if(drag.moved>6&&!drag.on){drag.on=1;fall=null;sq.v+=.55;emit('drag',{})}pos.x.t=Math.max(60,Math.min(vw-60,m.x+drag.dx));pos.y.t=Math.max(H*S*.32,Math.min(bust?vh-(CUT-200-H/2)*S:vh-H*S*.42,m.y+drag.dy))}}
function up(){if(!drag)return;/* 먼저 놓는다. 누른 일로 자리가 바뀔 수 있다 */const d=drag;drag=null;if(d.moved<7){sq.v+=.85;bt=0;emit('poke',{part:d.part})}else if(d.on){const fl=vh*home.y;home.x=pos.x.t/vw;if(bust){bust.y=pos.y.t;sq.v-=.5;emit('drop',{x:pos.x.t/vw});return}/* 허공에 놓으면 바닥까지 떨어진다. 바닥 높이는 그대로 */if(pos.y.t<fl-12&&!big){fall={v:pos.y.v>0?pos.y.v*.5:0,to:fl}}else{home.y=pos.y.t/vh;sq.v-=.7}emit('drop',{x:pos.x.t/vw})}}
const tkey=(o,p)=>p?o+':'+p:o;
function paint(rect,res,o){gl.uniform4f(u.rect,...rect);gl.uniform2f(u.res,...res);gl.uniform4f(u.pad,420,200,o.grab,120);gl.uniform2f(u.look,o.lx,o.ly);gl.uniform2f(u.bend,o.bx,o.by);for(const k of['tm','blink','mouth','smile','smile2','blush','tilt','breath','squash','sway','script','wipe','brow','wide','fade'])gl.uniform1f(u[k],o[k]||0);
/* 작게 줄일 때 밉맵이 원본 축소보다 흐려 속눈썹이 뭉개지고 눈이 졸려 보였다: 한 단계 덜 흐린 쪽으로 당긴다 */gl.uniform1f(u.lod,Math.max(0,Math.log2(1/(rect[2]/(W+840)))-.6));const A=tex[tkey(cur,pose.at)]||tex[cur],Bt=nxt?tex[nxt]:pose.to!==pose.at?(tex[tkey(cur,pose.to)]||tex[cur]):A;gl.uniform1f(u.pf,nxt?0:pose.to!==pose.at?pose.k:0);gl.uniform1f(u.fon,o.fon??1);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,Bt);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,A);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
function step(dt,tm){const sc=mode==='script',N=Math.max(2,Math.ceil(dt/.009)),h=dt/N;
 const hx=pos.x.x,hy=pos.y.x+(350-H/2)*S;let dx,dy;if(forced){dx=forced.x;dy=forced.y}else if(sc){dx=dy=0}else if(glance&&tm<glance.until){dx=glance.x;dy=glance.y}else{dx=(m.x-hx)/(vw*.34);dy=(m.y-hy)/(vh*.36);const q=Math.max(1,Math.hypot(dx,dy));dx/=q;dy/=q;if(performance.now()-m.seen>6000){dx*=.2;dy*=.2}}
 lx.t=dx;ly.t=dy;ti.t=sc?0:pet>0?.05*Math.sin(tm*5)+.03:lx.x*.05+(face.tilt||0);sm.t=pet>.2?1:sc?Math.min(.2,face.smile):face.smile;bl.t=Math.max(face.blush,pet>.15&&!sc?1:0);cl.t=Math.max(face.closed,pet>.2&&!sc?Math.min(1,pet*2.2-.4):0);brs.t=sc?0:face.brow||0;wds.t=sc?0:face.wide||0;
 if(!(drag&&drag.pet))pet=Math.max(0,pet-dt*.6);
 bx.t=Math.max(-460,Math.min(460,-pos.x.v*(sc?.015:.28)));by.t=Math.max(-200,Math.min(200,-pos.y.v*(sc?.01:.1)));sw.t=Math.max(-3,Math.min(3,-pos.x.v*(sc?.0004:.0035)-bx.v*.002));
 if(fall){fall.v+=3200*dt;pos.y.x+=fall.v*dt;pos.y.t=pos.y.x;pos.y.v=0;if(pos.y.x>=fall.to){pos.y.set(fall.to);sq.v-=Math.min(1.6,.5+fall.v/1400);by.v+=fall.v*.05;fall=null}}
 for(let i=0;i<N;i++)[pos.x,pos.y,lx,ly,bx,by,sw,sq,ti,sm,bl,cl,scale,brs,wds,fd].forEach(s=>s.step(h));
 if(drag&&drag.on&&sc){pos.x.set(pos.x.t);pos.y.set(pos.y.t)}
 if(tm>nextBlink&&!sc){bt=0;nextBlink=tm+1.6+Math.random()*3.6}
 let b=cl.x;if(bt>=0){bt+=dt;b=Math.max(b,bt<.07?bt/.07:bt<.11?1:Math.max(0,1-(bt-.11)/.12));if(bt>.24)bt=-1}
 idle+=dt;if(idle>9){idle=0;if(!sc)glance={x:Math.random()*2-1,y:Math.random()*.8-.5,until:tm+1.3};emit('idle',{})}
 if(pose.to!==pose.at){pose.k+=dt/(reduce?.01:.22);if(pose.k>=1){pose.at=pose.to;pose.k=0}}
 if(pose.hold>0){pose.hold-=dt;if(pose.hold<=0)api.pose('')}
 if(nxt){wipe+=dt/(reduce?.01:.62);if(wipe>=1){const old=cur;cur=nxt;nxt=null;wipe=0;if(old!==cur&&tex[old]){gl.deleteTexture(tex[old]);delete tex[old];for(const k in tex)if(k.startsWith(old+':')){gl.deleteTexture(tex[k]);delete tex[k]}}emit('worn',{id:cur})}}
 let mo=mode==='script'?0:face.mouth||0;if(typed<full.length){const ch=full[Math.floor(typed)];typed+=dt*(sayMode==='script'?14:/[,.…?!]/.test(ch)?7:23);mo=sayMode==='script'?(Math.floor(tm*8)%2)*.55:/[\s,.…]/.test(ch)?0:[0,.3,.55][Math.floor(Math.abs(Math.sin(tm*11)*Math.sin(tm*4.3+1))*2.99)];if(typed>=full.length)hold=opt.hold}
 else if(hold>0){hold-=dt;if(hold<=0&&sayDone){const f=sayDone;sayDone=null;f()}}
 const qt=sc?Math.floor(tm*8)/8:tm;return{lx:lx.x,ly:ly.x,bx:bx.x,by:by.x,grab:drag&&drag.on?grab:400,tm:qt,blink:Math.min(1,b),mouth:mo,smile:sm.x,smile2:pet>.2&&!sc?1:face.arc>=0?face.arc:face.closed>.5&&face.smile>.6?1:0,blush:bl.x,tilt:ti.x,brow:Math.max(-1,Math.min(1,brs.x)),wide:Math.max(0,Math.min(1,wds.x)),breath:sc||reduce?0:Math.sin(tm*1.7),squash:Math.max(-.12,Math.min(.12,sq.x)),sway:sw.x,script:sc?1:0,wipe,fade:fd.x,fon:(pose.at===pose.to?(pose.face[pose.at]??1):Math.min(pose.face[pose.at]??1,pose.face[pose.to]??1))}}
function bubble(){if(!say)return;const n=Math.ceil(typed);if(say.dataset.n!==String(n)+full){say.textContent=full.slice(0,n);say.dataset.n=String(n)+full}sayA+=((full?1:0)-sayA)*.3;say.style.opacity=sayA.toFixed(2);const h=api.headAt(),w=say.offsetWidth,hh=say.offsetHeight;let right=h.x+h.r*1.28+w<vw-16||h.x<vw*.5;let x=right?h.x+h.r*1.28:h.x-h.r*1.28-w,y=h.y-hh*.5;if(vw<700){x=h.x-w/2;y=h.y-h.r*1.35-hh}x=Math.max(16,Math.min(vw-w-16,x));y=Math.max(16,y);say.dataset.side=vw<700?'top':right?'right':'left';say.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`}
let want='',loading={};let big=null,back=null,lastO=null;function redraw(){if(!lastO||!tex[cur])return;gl.viewport(0,0,c.width,c.height);gl.clear(gl.COLOR_BUFFER_BIT);const s=S*scale.x;c.style.transform=c._tf=`translate(${(pos.x.x-bw/2).toFixed(2)}px,${(pos.y.x-bh/2).toFixed(2)}px)`;paint([(bw/2-(CX+420)*s)*dpr,(bh/2-(H/2+200)*s)*dpr,(W+840)*s*dpr,(H+320)*s*dpr],[c.width,c.height],lastO)}
function rescale(px){const was=S*scale.x;home.px=px;size();scale.x=was/S;redraw()}
let alone=0;function next(){const busy=drag||fall||pose.to!==pose.at||Math.abs(fd.t-fd.x)>.003||nxt||typed<full.length||pet>0||bt>=0||Math.abs(pos.x.v)+Math.abs(pos.y.v)>2||Math.abs(bx.v)>12||Math.abs(sq.v)>.12||Math.abs(scale.t-scale.x)>.002||performance.now()-m.seen<(near()?900:0);const ms=busy?0:mode==='script'?125:83;if(ms)setTimeout(()=>requestAnimationFrame(frame),ms-16);else requestAnimationFrame(frame)}
function near(){const l=loc(m.x,m.y);return Math.abs(l.x-CX)<1500&&l.y>-700&&l.y<3400}
function frame(now){if(document.hidden||api.paused){setTimeout(()=>requestAnimationFrame(frame),500);return}next();const dt=Math.min(.14,(now-last)/1000||.016);last=now;const o=lastO=step(dt,now/1000);/* 깜빡임 도중 프레임이 멈추면(창이 가려졌다고 여겨 rAF 가 늦어질 때) 반쯤 감은 눈이 남는다: 끝난 뒤 눈 뜬 프레임을 한 번 더 그린다 */if(o.blink>.01){clearTimeout(api._bf);api._bf=setTimeout(()=>{if(bt<0&&lastO&&lastO.blink>.01){lastO=Object.assign({},lastO,{blink:Math.min(1,cl.x)});redraw()}},400)}gl.viewport(0,0,c.width,c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);const s=S*scale.x;const tf=`translate(${(pos.x.x-bw/2).toFixed(2)}px,${(pos.y.x-bh/2).toFixed(2)}px)`;if(tf!==c._tf){c._tf=tf;c.style.transform=tf}if(tex[cur])paint([(bw/2-(CX+420)*s)*dpr,(bh/2-(H/2+200)*s)*dpr,(W+840)*s*dpr,(H+320)*s*dpr],[c.width,c.height],o);bubble();c.style.cursor=drag?'grabbing':hit(m.x,m.y)?'grab':'';emit('frame',{x:pos.x.x,y:pos.y.x,feet:pos.y.x+(FEET-H/2)*s,floor:vh*home.y+(FEET-H/2)*s,s,bend:bx.x,bust:!!bust})}
const api={ids:OUT,
 async init(o){opt=Object.assign({hold:1.1,src:k=>'옷/'+k+'.webp'},o);c=o.canvas;if(o.outfit)cur=o.outfit;say=o.say||document.getElementById('say');reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;gl=c.getContext('webgl2',{premultipliedAlpha:true,alpha:true,preserveDrawingBuffer:false})||c.getContext('webgl',{premultipliedAlpha:true,alpha:true,preserveDrawingBuffer:false});if(!gl)throw new Error('webgl');
 const P=gl.createProgram();const two=typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext;const vs=two?'#version 300 es\n'+VS.replace('attribute','in').replace('varying','out'):VS;const fs=two?'#version 300 es\n#define TEX(a,b) textureLod(a,b,lod)\n'+FS.replace('varying','in').replace('precision highp float;','precision highp float;out vec4 outc;').replace('gl_FragColor','outc'):'#define TEX(a,b) texture2D(a,b)\n'+FS;gl.attachShader(P,sh(gl.VERTEX_SHADER,vs));gl.attachShader(P,sh(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(P,0,'a');gl.linkProgram(P);gl.useProgram(P);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 ['rect','res','look','bend','tm','blink','mouth','smile','smile2','blush','tilt','breath','squash','sway','script','wipe','brow','wide','fade','pf','fon','pad','t','t2','lod'].forEach(n=>u[n]=gl.getUniformLocation(P,n));gl.uniform1i(u.t,0);gl.uniform1i(u.t2,1);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
 size();pos.x.set(vw*home.x);pos.y.set(vh*home.y);m.x=vw*.5;m.y=vh*.3;addEventListener('resize',size);c.addEventListener('pointerdown',down);addEventListener('pointermove',move);addEventListener('pointerup',up);addEventListener('pointercancel',up);
 await load(cur,opt.src(cur));raf=requestAnimationFrame(frame);ready=Promise.resolve();return api},
 ready:()=>ready,
 home(h){Object.assign(home,h);if(c)size()},
 /* 바닥 높이만 바꾼다(독 위 ↔ 화면 바닥). 더 낮으면 떨어지고, 높으면 올라선다 */
 land(y){if(bust||big||Math.abs(y-home.y)*vh<1)return;home.y=y;if(drag)return;const to=vh*y;if(fall)fall.to=to;else if(to>pos.y.x+12)fall={v:0,to};else place()},get homeY(){return home.y},
 async wear(id){if(!OUT.includes(id))return;pose.at=pose.to='';pose.k=0;pose.hold=0;want=id;if(!tex[id])await(loading[id]=loading[id]||load(id,opt.src(id)).finally(()=>delete loading[id]));if(want!==id)return;if(id===cur&&!nxt)return;if(nxt)cur=nxt;nxt=id;wipe=0;sq.v+=.9;sw.v+=3;return new Promise(r=>{const f=()=>{L.worn=L.worn.filter(x=>x!==f);r()};(L.worn=L.worn||[]).push(f)})},
 mode(x){if(x===mode)return;mode=x;if(x==='own'){sq.v-=.9;sw.v-=3;bt=0}else{lx.t=ly.t=0}emit('mode',{mode:x})},
 get state(){return{mode,outfit:nxt||cur,dragging:!!(drag&&drag.on)}},
 say(t,o={}){if(sayDone){const f=sayDone;sayDone=null;f()}full=t;typed=reduce?t.length:0;sayMode=o.mode||mode;opt.hold=o.hold??Math.max(.9,t.length*.045);if(reduce)hold=opt.hold;if(say)say.className=sayMode;return new Promise(r=>sayDone=r)},
 hush(){full='';typed=0;hold=0;if(sayDone){const f=sayDone;sayDone=null;f()}},skip(){if(typed<full.length){typed=full.length;hold=opt.hold}else hold=.001},
 get speaking(){return typed<full.length},
 face(f){Object.assign(face,f)},look(x,y){forced=x===null||x===undefined?null:{x,y}},hop(v=1){sq.v+=v},
 on(n,f){(L[n]=L[n]||[]).push(f);return()=>L[n]=L[n].filter(x=>x!==f)},
 headAt(){const s=S*scale.x,m=POSES[cur]&&POSES[cur][pose.to]||{},hy=m.head||0;return{x:pos.x.x+bx.x*-0.02*s+(m.hx||0)*s,y:pos.y.x+(330+hy-H/2)*s,r:210*s}},
 /* 크게 다가오기. 발은 화면 밖으로 */
 grow(px,up=610,side=360){if(big)return;/* 작아지는 중이면 원래 크기는 home.px 가 아니라 back 에 있다 */big={x:home.x,y:home.y,px:back?back.px:home.px};if(back){clearTimeout(back.t);back=null}rescale(px);scale.t=1;home.x=Math.max(side/vw,Math.min(1-side/vw,home.x));home.y=(vh-Math.min(up,vh*.62)+(H/2-330)*S)/vh;place()},
 shrink(){if(!big)return;const b=big;big=null;home.x=b.x;home.y=b.y;scale.t=b.px/home.px;place();back={px:b.px,t:setTimeout(()=>{back=null;rescale(b.px);scale.t=1},900)}},get big(){return!!big},
 /* 상반신 모드: 1.3배로 키우고 허리 아래를 번지게. 높이는 전신과 따로 기억한다 */
 bust(on,y){on=!!on;if(on===!!bust)return;const was=S*scale.x;bust=on?{y:y??null}:null;fd.t=on?1:0;fall=null;size();scale.x=was/S;scale.t=1;place()},get bustOn(){return!!bust},get bustAt(){return bust?bust.y:null},
 /* 포즈: 옷마다 따로 그린 그림(옷/포즈/옷_포즈.webp). poses({yukata:{think:{face:1}}}) 로 있는 것을 알리고, pose('think',초) 로 바꾼다. ''이면 기본.
    face:0 인 포즈는 눈·입·홍조 셰이더를 끈다(얼굴 자리가 기본 그림과 다를 때). 없는 포즈는 조용히 기본으로 남는다 */
 poses(m){POSES=m||{}},
 async pose(p,sec){p=p||'';const meta=POSES[cur]&&POSES[cur][p];if(p&&!meta)p='';pose.want=p;pose.hold=p&&sec?sec:0;if(p){pose.face[p]=meta.face??1;const k=tkey(cur,p);if(!tex[k]){try{await(loading[k]=loading[k]||load(k,opt.poseSrc?opt.poseSrc(cur,p):'옷/포즈/'+cur+'_'+p+'.webp').finally(()=>delete loading[k]))}catch(e){delete POSES[cur][p];return}}if(pose.want!==p)return}
  if(p===pose.to)return;if(pose.to!==pose.at)pose.at=pose.to;pose.to=p;pose.k=0;sq.v+=.25},
 get poseNow(){return pose.to},
 touchable(x){alive=x},mouse(x,y){m.x=x;m.y=y;m.seen=performance.now()},hit(x,y){return !!(drag||hit(x,y))},near,kick(){m.seen=performance.now()},scale(x){scale.t=x},
 snapshot(h=1500){const k=h/(H+60),w=Math.round(W*k),ow=c.width,oh=c.height;c.width=w;c.height=h;gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT);paint([-420*k,(30-200)*k,(W+840)*k,(H+320)*k],[w,h],{lx:0,ly:0,bx:0,by:0,grab:400,smile:.8,blush:.35,tm:0});const d=c.toDataURL('image/png');c.width=ow;c.height=oh;return d}};
window.Haru=api;})();
