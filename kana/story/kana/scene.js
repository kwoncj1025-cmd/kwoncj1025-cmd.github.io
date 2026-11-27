/* 하루 대사창. window.Scene 하나. 대본일 때는 8fps, 깨진 뒤는 60fps. */
(()=>{
const NS='http://www.w3.org/2000/svg',FR=125,CPS=14,BOX=164,PAD=46;
let root,box,tx,nm,bg,go,ch,skin='',W=560,at={x:0,bottom:22,w:560,s:1,snap:18},shown=false,px=null,py=0,run=0,pend=null,full=[],vis=0,breaking=false,wantX=null;
const 덜=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const el=(n,a={},p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
const div=(c,p)=>{const e=document.createElement('div');e.className=c;p&&p.appendChild(e);return e};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
/* ── 옷마다 다른 상자. 글 자리(l,t,r)와 ▼ 모양까지 ── */
const 옷={
 goth:{l:46,t:54,r:52,ink:['#fff','#0c0710'],edge:'rgba(255,255,255,.5)',draw(g,w,h){
   const C='#211927',n=Math.round((w-28)/17),s=(w-28)/n;/* 레이스: 부채꼴 줄과 뚫린 구멍 */
   const lace=(y,dir)=>{let d='';for(let i=0;i<n;i++){const x=14+i*s;d+=`M${x} ${y}A${s/2} ${s/2+1.5} 0 0 ${dir>0?0:1} ${x+s} ${y}Z`;const cx=x+s/2,cy=y+dir*4.6,r=1.9;d+=`M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`}el('path',{d,fill:C,'fill-rule':'evenodd'},g);
     let p='';for(let i=0;i<=n;i++){const x=14+i*s;p+=`M${x-1.3} ${y+dir*5}a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z`}el('path',{d:p,fill:C},g)};
   lace(h,1);lace(0,-1);
   const notch=(m,r)=>`M${m+r} ${m}H${w-m-r}A${r} ${r} 0 0 0 ${w-m} ${m+r}V${h-m-r}A${r} ${r} 0 0 0 ${w-m-r} ${h-m}H${m+r}A${r} ${r} 0 0 0 ${m} ${h-m-r}V${m+r}A${r} ${r} 0 0 0 ${m+r} ${m}Z`;
   el('path',{d:notch(0,9),fill:C},g);el('path',{d:notch(7,13),fill:'none',stroke:'#cbb8c6','stroke-width':1.3},g);el('path',{d:notch(11,13),fill:'none',stroke:'#8d7a8c','stroke-width':.7},g);
   [[7,7],[w-7,7],[7,h-7],[w-7,h-7]].forEach(([x,y])=>el('circle',{cx:x+(x<20?4:-4),cy:y+(y<20?4:-4),r:2,fill:'#cbb8c6'},g));
   const a=38,b=-17,ww=84,hh=36,r=7;el('path',{d:`M${a+r} ${b}H${a+ww-r}A${r} ${r} 0 0 0 ${a+ww} ${b+r}V${b+hh-r}A${r} ${r} 0 0 0 ${a+ww-r} ${b+hh}H${a+r}A${r} ${r} 0 0 0 ${a} ${b+hh-r}V${b+r}A${r} ${r} 0 0 0 ${a+r} ${b}Z`,fill:'#f6eee9',stroke:C,'stroke-width':2},g);el('rect',{x:a+4.5,y:b+4.5,width:ww-9,height:hh-9,fill:'none',stroke:'#8d7a8c','stroke-width':.7},g)},
   go(s){el('path',{d:'M9 1L14 8L9 15L4 8Z',fill:'none',stroke:'#e9dde2','stroke-width':1.2,'stroke-linejoin':'round'},s);el('path',{d:'M9 5L11.400 8L9 11L6.600 8Z',fill:'#e9dde2'},s);el('circle',{cx:9,cy:18.4,r:1.3,fill:'#e9dde2'},s)}},
 miko:{l:96,t:54,r:64,ink:['#fff','#5b4636'],edge:'rgba(120,96,74,.6)',draw(g,w,h){
   const c=17,R=rng(3);/* 종이: 접은 귀와 결 */
   el('path',{d:`M0 0H${w}V${h-c}L${w-c} ${h}H0Z`,fill:'#fdfaf3',stroke:'#cdbfa6','stroke-width':1,'stroke-linejoin':'round'},g);
   let d='';for(let i=0;i<58;i++){const x=12+R()*(w-30),y=26+R()*(h-40),L=4+R()*12,t=(R()-.5)*.7;d+=`M${x} ${y}q${L/2} ${(R()-.5)*4} ${L*Math.cos(t)} ${L*Math.sin(t)}`}el('path',{d,fill:'none',stroke:'#e9dfcb','stroke-width':.8},g);
   el('path',{d:`M${w-c} ${h}L${w-c} ${h-c}L${w} ${h-c}Z`,fill:'#efe5d1',stroke:'#cdbfa6','stroke-width':.8,'stroke-linejoin':'round'},g);
   const A='#b3301f',B='#8d2015';/* 끈: 두 가닥이 종이를 감고 오른쪽에서 묶인다 */
   [13.5,18.5].forEach((y,i)=>{el('path',{d:`M-2 ${y}C${w*.3} ${y+.8} ${w*.6} ${y-.8} ${w+2} ${y}`,stroke:A,'stroke-width':3.4,fill:'none','stroke-linecap':'round'},g);el('path',{d:`M-1 ${y+1}C${w*.3} ${y+1.8} ${w*.6} ${y+.2} ${w+1} ${y+1}`,stroke:B,'stroke-width':.7,fill:'none'},g)});
   const k=el('g',{transform:`translate(${w-58} 16)`},g);
   const tail=el('g',{class:'sway'},k);[['M-2 3C-6 18 -11 30 -9 52',-9,52],['M2 3C5 20 12 28 9 44',9,44]].forEach(([p,x,y])=>{el('path',{d:p,stroke:A,'stroke-width':3.2,fill:'none','stroke-linecap':'round'},tail);el('path',{d:`M${x-3.4} ${y-1}H${x+3.4}L${x+4.6} ${y+15}L${x+1.5} ${y+13.4}L${x} ${y+15.6}L${x-1.6} ${y+13.4}L${x-4.6} ${y+15}Z`,fill:A},tail);el('path',{d:`M${x-3.6} ${y+1.6}H${x+3.6}`,stroke:'#e6b65a','stroke-width':2},tail)});
   ['M0 0C-10 -17 -32 -17 -31 -4C-30 9 -11 9 0 0','M0 0C10 -17 32 -17 31 -4C30 9 11 9 0 0'].forEach(p=>{el('path',{d:p,fill:'none',stroke:B,'stroke-width':4.6,'stroke-linejoin':'round'},k);el('path',{d:p,fill:'none',stroke:A,'stroke-width':3.4},k)});
   el('rect',{x:-6,y:-6,width:12,height:12,rx:4,fill:A,stroke:B,'stroke-width':1},k);
   /* 이름표: 끈에 꽂은 종이 */
   el('path',{d:`M31 -20L51 -24L71 -20V72H31Z`,fill:'#fffdf8',stroke:'#cdbfa6','stroke-width':1,'stroke-linejoin':'round'},g);el('path',{d:`M35 -15.500L51 -18.800L67 -15.500V68H35Z`,fill:'none',stroke:A,'stroke-width':1.1},g);},
   go(s){el('path',{d:'M9 0V3',stroke:'#b3301f','stroke-width':2,'stroke-linecap':'round'},s);el('circle',{cx:9,cy:10,r:7.2,fill:'#e6b65a',stroke:'#8a5a1c','stroke-width':1.1},s);el('path',{d:'M2 9.400H16M9 11.500V17M7.400 11.600a1.600 1.600 0 1 0 3.200 0',fill:'none',stroke:'#8a5a1c','stroke-width':1.2},s)}},
 maid:{l:46,t:52,r:56,ink:['#fff','#4a3d44'],edge:'rgba(58,47,53,.55)',draw(g,w,h){
   const D='#3a2f35',nx=Math.round(w/30),ny=Math.round(h/30),sx=w/nx,sy=h/ny,a=7.5;let d;/* 앞치마 물결단 */
   const wave=(x0,y0,x1,y1,n)=>{let s='';const dx=(x1-x0)/n,dy=(y1-y0)/n,L=Math.hypot(dx,dy),ox=dy/L,oy=-dx/L;for(let i=0;i<n;i++){s+=`c${dx*.02+ox*a*1.25} ${dy*.02+oy*a*1.25} ${dx*.98+ox*a*1.25} ${dy*.98+oy*a*1.25} ${dx} ${dy}`}return s};
   d='M0 0'+wave(0,0,w,0,nx)+wave(w,0,w,h,ny)+wave(w,h,0,h,nx)+wave(0,h,0,0,ny)+'Z';
   el('path',{d,fill:'#fff',stroke:D,'stroke-width':1.4,'stroke-linejoin':'round'},g);
   let c='';for(let i=0;i<=nx;i++){const x=i*sx;if(i&&i<nx){c+=`M${x} 2q${i%2?1:-1} 5 ${i%2?-.5:.5} ${6+i%3}M${x} ${h-2}q${i%2?-1:1} -5 ${i%2?.5:-.5} ${-6-i%3}`}}for(let j=1;j<ny;j++){const y=j*sy;c+=`M2 ${y}q5 ${j%2?1:-1} ${6+j%2} 0M${w-2} ${y}q-5 ${j%2?-1:1} ${-6-j%2} 0`}el('path',{d:c,fill:'none',stroke:'#a3979c','stroke-width':.9,'stroke-linecap':'round'},g);
   el('rect',{x:14,y:14,width:w-28,height:h-28,rx:10,fill:'none',stroke:D,'stroke-width':1.1,'stroke-dasharray':'5 4','stroke-linecap':'round'},g);
   /* 이름표: 검은 리본 */
   const x=40,y=-19,ww=104,hh=38;el('path',{d:`M${x+6} ${y+8}L${x-13} ${y+12}L${x-5} ${y+25}L${x-13} ${y+hh+3}L${x+12} ${y+hh-3}Z`,fill:'#241c21'},g);el('path',{d:`M${x+ww-6} ${y+8}L${x+ww+13} ${y+12}L${x+ww+5} ${y+25}L${x+ww+13} ${y+hh+3}L${x+ww-12} ${y+hh-3}Z`,fill:'#241c21'},g);el('rect',{x,y,width:ww,height:hh,rx:3,fill:D},g);el('path',{d:`M${x+4} ${y+4.500}H${x+ww-4}M${x+4} ${y+hh-4.500}H${x+ww-4}`,stroke:'#fff','stroke-width':.9,'stroke-dasharray':'3 2.600',opacity:.75},g)},
   go(s){el('circle',{cx:9,cy:9,r:8,fill:'#fff',stroke:'#3a2f35','stroke-width':1.4},s);el('circle',{cx:9,cy:9,r:5.4,fill:'none',stroke:'#b7adb1','stroke-width':.8},s);[[7.2,7.2],[10.8,7.2],[7.2,10.8],[10.8,10.8]].forEach(([x,y])=>el('circle',{cx:x,cy:y,r:1,fill:'#3a2f35'},s))}}
};
/* ── 줄과 화면 나누기: 문장마다 줄을 열고, 한 화면에 두 줄 ── */
const ctx=document.createElement('canvas').getContext('2d');
function pages(text,o){const cs=getComputedStyle(tx),ls=parseFloat(cs.letterSpacing)||0;ctx.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;const max=W-o.l-o.r,ww=s=>ctx.measureText(s).width+ls*[...s].length;
 const glue=s=>s.replace(/(\d) (만|원|시|분|번|개|회|일|월|곳|건)/g,'$1 $2').replace(/(만) 원/g,'$1 원').replace(/(한|두|세|네|몇|열) (번|개|장|곳|건|줄|시)/g,'$1 $2');
 const wrap=s=>{const w=s.split(' ').filter(Boolean);const greedy=m=>{const L=[];let c='';for(const x of w){const t=c?c+' '+x:x;if(ww(t)<=m||!c)c=t;else{L.push(c);c=x}}if(c)L.push(c);return L};const base=greedy(max);if(base.length<2)return base;if(base.length===2){const c=s.split(/(?<=[,，]) /);if(c.length===2&&c.every(x=>ww(x)<=max)&&Math.min(ww(c[0]),ww(c[1]))>max*.3)return c}let lo=max*.5,hi=max;for(let i=0;i<9;i++){const m=(lo+hi)/2;if(greedy(m).length<=base.length)hi=m;else lo=m}return greedy(hi)};
 const P=[];String(text).split('\n').forEach(par=>{let S=(glue(par).match(/[^.!?…]+[.!?…]*["」』)]*\s*|[.!?…]+\s*/g)||[par]).map(s=>s.trim()).filter(Boolean);const M=[];for(const s of S){const l=M.at(-1);if(l&&([...l].length<=5||/^[.…]+$/.test(l))&&ww(l+' '+s)<=max)M[M.length-1]=l+' '+s;else M.push(s)}
   for(const s of M){const L=wrap(s);let last=P.at(-1);if(last&&last.length===1&&L.length===1)last.push(L[0]);else for(let i=0;i<L.length;i+=2)P.push(L.slice(i,i+2))}});
 return P.length?P:[['']]}
/* ── 자리 ── */
/* 크기(at.s)는 root 를 통째로 줄인다. 안쪽은 줄이기 전 좌표로 센다 */
function layout(force){if(!root)return;const k=at.s,VW=innerWidth/k,VH=innerHeight/k,w=Math.round(Math.min(at.w||560,VW-32));let x=Math.max(16,Math.min(VW-w-16,at.x/k-w/2)),y=Math.round(VH-at.bottom/k-BOX);root.style.transformOrigin='0 0';root.style.transform=k===1?'':'scale('+k+')';if(w!==W||force){W=w;paint()}
 if(px===null||Math.abs(x-px)>at.snap||force)px=Math.round(x);py=y;if(box&&!breaking){box.style.translate=px+'px '+py+'px'}if(ch)ch.style.translate=`${px+W-ch.offsetWidth}px ${py-ch.offsetHeight-(skin==='goth'?22:18)}px`}
function paint(){if(!box||!skin)return;const o=옷[skin];box.className='sc '+skin+(box.classList.contains('done')?' done':'');box.style.width=W+'px';box.style.height=BOX+'px';bg.innerHTML='';bg.setAttribute('width',W);bg.setAttribute('height',BOX);o.draw(bg,W,BOX);go.innerHTML='';o.go(go);Object.assign(go.style,{left:W-o.r+(skin==='miko'?14:8)-18+'px',top:BOX-44+'px'});Object.assign(tx.style,{left:o.l+'px',top:o.t+'px'})}
/* 나타나고 사라지기: 8fps 세 장 */
async function frames(list){for(const f of list){Object.assign(box.style,f);await wait(FR)}}
async function appear(me){shown=true;box.hidden=false;if(덜())return;await frames([{transform:'scale(1,.06)'},{transform:'scale(1,1.05)'},{transform:'none'}]);}
function settle(v){const p=pend;pend=null;if(p){clearTimeout(p.t);p.res(v)}}
const put=n=>{vis=n;tx.querySelectorAll('s').forEach((s,i)=>s.classList.toggle('v',i<n))};
function setPage(L){tx.innerHTML='';L.forEach((l,i)=>{if(i)tx.appendChild(document.createElement('br'));for(const c of l){const s=document.createElement('s');s.textContent=c;tx.appendChild(s)}});vis=0;box.classList.remove('done')}
let skip=null;/* 지금 누르면 할 일 */
const step=(ms)=>new Promise(r=>{const t=setTimeout(()=>{skip=null;r('t')},ms);skip=()=>{clearTimeout(t);skip=null;r('c')}});
async function type(L,me){setPage(L);const N=tx.querySelectorAll('s').length,chars=L.join('');if(덜()){put(N);return}let acc=0;while(vis<N){const r=await step(FR);if(me!==run||breaking)return;if(r==='c'){put(N);break}acc+=CPS*FR/1000;const n=Math.min(N,Math.floor(acc));put(n);if(n<N&&/[.…!?]/.test(chars[n-1]||'')&&!/[.…!?]/.test(chars[n]||'')){const q=await step(FR*2);if(me!==run||breaking)return;if(q==='c'){put(N);break}}}}
function clearChoices(){if(ch){ch.remove();ch=null}}
function say(text,o={}){if(!root)return Promise.resolve();const me=++run;settle();skip=null;clearChoices();const want=옷[o.outfit]?o.outfit:(skin||'goth');
 if(breaking)endBreak();
 const fresh=!shown;if(want!==skin||fresh){skin=want;box.classList.remove('done');px=null;layout(true)}else layout();
 box.classList.remove('still');box.style.opacity='';box.style.transform='';nm.textContent=o.role||nm.textContent;
 return new Promise(res=>{pend={res,t:0};(async()=>{
  const P=pages(text,옷[skin]);full=P;setPage(['']);if(fresh)await appear(me);else box.hidden=false;if(me!==run)return;
  for(let i=0;i<P.length;i++){await type(P[i],me);if(me!==run||breaking)return;const last=i===P.length-1;
   if(last&&o.choices&&o.choices.length){choices(o,me);return}
   box.classList.add('done');await step(last?(o.hold??1.6)*1000:1500+P[i].join('').length*45);if(me!==run||breaking)return;box.classList.remove('done')}
  box.classList.add('done');settle()})()})}
function choices(o,me){ch=div('sc-ch '+skin,root);o.choices.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.style.visibility='hidden';b.addEventListener('click',()=>{if(me!==run)return;b.classList.add('on');setTimeout(()=>{if(me!==run)return;clearChoices();o.onPick&&o.onPick(i,t);settle({i,t})},덜()?0:FR)});ch.appendChild(b);setTimeout(()=>b.style.visibility='',덜()?0:FR*i)});layout()}
async function hush(){const me=++run;settle();skip=null;clearChoices();if(!shown||breaking)return;box.classList.remove('done');if(!덜())await frames([{transform:'scale(1,1.03)'},{transform:'scale(1,.3)'}]);if(me!==run)return;shown=false;box.hidden=true;box.style.transform=''}
/* ── 깨짐 ── */
function clip(P,x0,y0,x1,y1){const cut=(P,f,g)=>{const O=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],fa=f(a),fb=f(b);if(fa>=0)O.push(a);if(fa>=0!==fb>=0){const t=fa/(fa-fb);O.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}return O};return[p=>p[0]-x0,p=>x1-p[0],p=>p[1]-y0,p=>y1-p[1]].reduce((P,f)=>P.length?cut(P,f):P,P)}
const areaC=P=>{let a=0,x=0,y=0;P.forEach((p,i)=>{const q=P[(i+1)%P.length],k=p[0]*q[1]-q[0]*p[1];a+=k;x+=(p[0]+q[0])*k;y+=(p[1]+q[1])*k});return{a:Math.abs(a/2),x:x/(3*a),y:y/(3*a)}};
/* 한 점에서 퍼진 금: 부챗살과 고리. 바깥 칸은 더 크게 */
function crackCells(cx,cy,w,h,m,seed){const R=rng(seed),K=7,A=[];let t=R()*.6-.3;for(let i=0;i<K;i++){A.push(t);t+=Math.PI*2/K*(.7+R()*.6)}const span=t-A[0];for(let i=0;i<K;i++)A[i]=A[0]+(A[i]-A[0])*Math.PI*2/span;
 const rad=[30,104,232,1400],pt=A.map(a=>rad.map((r,j)=>{const jr=j===3?r:r*(.78+R()*.44),ja=a+(j===3?0:(R()-.5)*[.5,.26,.16][j]),e=1+.62*Math.abs(Math.cos(ja));return[cx+Math.cos(ja)*jr*e,cy+Math.sin(ja)*jr*(j<2?.8:.72)]}));
 /* 두 점 사이는 살짝 꺾인다. 같은 변은 어느 쪽에서 봐도 같은 꺾임 */
 const E=(p,q)=>{const L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<22||L>700)return[];const k=Math.sin((p[0]+q[0])*12.9+(p[1]+q[1])*78.2)*43758.5,f=k-Math.floor(k),s=Math.sign((q[0]-p[0])||(q[1]-p[1])),o=(f-.5)*Math.min(12,L*.11)*s,u=s>0?.35+f*.3:.65-f*.3;return[[p[0]+(q[0]-p[0])*u-(q[1]-p[1])/L*o,p[1]+(q[1]-p[1])*u+(q[0]-p[0])/L*o]]},ring=V=>V.flatMap((p,i)=>[p,...E(p,V[(i+1)%V.length])]),path=V=>V.flatMap((p,i)=>i?[...E(V[i-1],p),p]:[p]);
 const cells=[],lines=[],C=[cx,cy];const add=V=>{const P=clip(ring(V),-m,-m,w+m,h+m);if(P.length<3)return;const q=clip(P,-8,-8,w+8,h+8);if(q.length>2&&areaC(q).a>110)cells.push(P)};
 const far=(p)=>p[0]>0&&p[0]<w&&p[1]>0&&p[1]<h;
 for(let i=0;i<K;i++){const n=(i+1)%K,a=pt[i],b=pt[n];if(i%3){add([C,a[0],a[1],b[1],b[0]])}else{add([C,a[0],b[0]]);add([a[0],a[1],b[1],b[0]]);lines.push({P:path([a[0],b[0]]),o:1})}
  add([a[1],a[2],b[2],b[1]]);add([a[2],a[3],b[3],b[2]]);lines.push({P:path([C,a[0],a[1],a[2],a[3]]),o:0,first:i%3===0});lines.push({P:path([a[1],b[1]]),o:1});if(far(a[2])||far(b[2]))lines.push({P:path([a[2],b[2]]),o:2})}
 /* 멀리 남은 큰 판은 한 번 더 세로로 쪼갠다 */
 const big=cells.map((P,i)=>({i,k:areaC(clip(P,0,0,w,h))})).filter(o=>o.k.a>12000).sort((x,y)=>y.k.a-x.k.a).slice(0,Math.max(0,22-cells.length));
 for(const o of big){const P=cells[o.i],dx=(R()-.5)*70,x0=o.k.x+dx,x1=o.k.x-dx,f=p=>(p[0]-x0)*(h+2*m)-(p[1]+m)*(x1-x0),cut=sg=>{const O=[];P.forEach((p,i)=>{const q=P[(i+1)%P.length],a=sg*f(p),b=sg*f(q);if(a>=0)O.push(p);if(a>=0!==b>=0){const t=a/(a-b);O.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}});return O},A1=cut(1),B1=cut(-1);if(A1.length>2&&B1.length>2){cells[o.i]=A1;cells.push(B1);const on=A1.filter(p=>Math.abs(f(p))<1e-3*(h+2*m)*10);if(on.length>1)lines.push({P:[on[0],on.at(-1)],o:2})}}
 return{cells,lines}}
let shardBox=null,endBreak=()=>{};
async function shatter(o={}){if(!root||breaking)return;const me=++run;settle();skip=null;
 if(!shown){if(!o.text)return;skin=skin||'goth';px=null;layout(true);shown=true;box.hidden=false;box.style.transform='';const P=pages(o.text,옷[skin]);setPage(P[0]);put(Math.ceil(P[0].join('').length*.6))}
 breaking=true;let dead=false;box.classList.remove('done');box.classList.add('still');/* 말이 끊긴다 */
 const cho=ch;if(cho){cho.style.pointerEvents='none'}
 const fin=()=>{if(dead)return;dead=true;shardBox&&shardBox.remove();shardBox=null;clearChoices();box.querySelector('.crack')?.remove();box.hidden=true;box.style.transform='';box.style.opacity='';box.classList.remove('still');shown=false;breaking=false};endBreak=fin;
 if(덜()){await box.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards'}).finished.then(a=>{fin();a.cancel()});return}
 await wait(200);if(dead)return;/* 짧은 정적 */
 const S=옷[skin],sh=[...tx.querySelectorAll('s.v')].at(-1),br=box.getBoundingClientRect();let cx=W*.55,cy=BOX*.55;if(sh){const r=sh.getBoundingClientRect();cx=(r.right-br.left)/at.s+3;cy=(r.top+r.height/2-br.top)/at.s}if(o.at){cx=(o.at.x-br.left)/at.s;cy=(o.at.y-br.top)/at.s}cx=Math.max(60,Math.min(W-60,cx));cy=Math.max(40,Math.min(BOX-36,cy));
 const{cells,lines}=crackCells(cx,cy,W,BOX,PAD,o.seed||Math.floor(Math.random()*9e5)+1);
 /* 금이 간다 */
 const sv=el('svg',{class:'crack',width:W,height:BOX});sv.style.overflow='hidden';box.appendChild(sv);const draw=(l,d)=>{const s='M'+l.P.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join('L');S.ink.forEach((c,i)=>{const p=el('path',{d:s,fill:'none',stroke:c,'stroke-width':i?1.1:1.2,opacity:i?.85:.9,'stroke-linejoin':'bevel',pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1,transform:i?'':'translate(.9 .9)'},sv);p.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:l.o?60:110,delay:d,easing:'cubic-bezier(.1,.8,.3,1)',fill:'forwards'})})};
 box.style.transformOrigin=`${cx}px ${cy}px`;box.animate([{transform:'none'},{transform:'scale(.985)',offset:.35},{transform:'scale(.996)'}],{duration:110,fill:'forwards',easing:'ease-out'});
 lines.filter(l=>l.first).forEach(l=>draw({...l,P:l.P.slice(0,3)},0));await wait(120);if(dead)return;
 lines.filter(l=>!l.o).forEach(l=>draw(l,0));lines.filter(l=>l.o).forEach(l=>draw(l,20+l.o*28));await wait(150);if(dead)return;
 /* 조각: 상자를 통째로 본떠 칸마다 잘라 쓴다. 글자도 함께 잘린다 */
 sv.remove();box.getAnimations().forEach(a=>a.cancel());const sb=shardBox=div('sc-sh',root);sb.style.translate=px+'px '+py+'px';sb.style.width=W+'px';sb.style.height=BOX+'px';sb.style.perspectiveOrigin=`${cx}px ${cy}px`;
 const R=rng(77),src=box.cloneNode(true);src.className='sc '+skin+' still';src.style.translate='none';src.style.transform='none';src.style.pointerEvents='none';src.classList.add('in');
 const G=2100,DUR=980,far=Math.max(...cells.map(c=>{const k=areaC(c);return Math.hypot(k.x-cx,k.y-cy)}));
 const anims=cells.map((P,i)=>{const k=areaC(P),d=div('',sb);d.style.width=W+'px';d.style.height=BOX+'px';const c=src.cloneNode(true);c.style.clipPath='polygon('+P.map(p=>`${p[0].toFixed(2)}px ${p[1].toFixed(2)}px`).join(',')+')';d.appendChild(c);
  const e=el('svg',{class:'e',width:W,height:BOX},d),q=clip(P,0,0,W,BOX);let ed='';q.forEach((p,i)=>{const r=q[(i+1)%q.length],on=(v,j)=>Math.abs(p[j]-v)<.2&&Math.abs(r[j]-v)<.2;if(!on(0,0)&&!on(W,0)&&!on(0,1)&&!on(BOX,1))ed+=`M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${r[0].toFixed(1)} ${r[1].toFixed(1)}`});el('path',{d:ed,fill:'none',stroke:S.edge,'stroke-width':.9},e);
  d.style.transformOrigin=`${k.x}px ${k.y}px`;const dx=k.x-cx,dy=k.y-cy,D=Math.hypot(dx,dy)||1,n=Math.min(1,D/far),small=Math.max(0,1-k.a/5200),sp=120+210*(1-n)+120*small*R(),vx=dx/D*sp+(R()-.5)*60,vy=dy/D*sp*.75-150-210*R()-120*small,vz=(R()-.35)*260,rx=(R()-.5)*(260+340*small),ry=(R()-.5)*(260+340*small),rz=(R()-.5)*(150+260*small)+dx/W*60,del=60+n*150+R()*30,F=[],M=26;
  for(let j=0;j<=M;j++){const t=j/M*DUR/1000,tt=Math.max(0,t-del/1000),pre=Math.min(1,t/.05)*1.4,x=dx/D*pre+vx*(1-Math.exp(-1.1*tt))/1.1,y=dy/D*pre+vy*tt+G*tt*tt/2,z=vz*tt;F.push({transform:`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateX(${(rx*tt).toFixed(1)}deg) rotateY(${(ry*tt).toFixed(1)}deg) rotateZ(${(rz*tt).toFixed(1)}deg)`,opacity:j>M-4?(M-j)/4:1})}
  return d.animate(F,{duration:DUR,easing:'linear',fill:'both'})});
 box.hidden=true;Scene.조각=cells.length;
 if(cho){cho.animate([{transform:'none',opacity:1},{transform:'translateY(60px)',opacity:0}],{duration:260,easing:'ease-in',fill:'forwards'})}
 await Promise.all(anims.map(a=>a.finished.catch(()=>{})));fin()}
/* ── 바깥 ── */
function rects(){const O=[];if(shown&&!breaking&&box&&!box.hidden){const k=at.s;O.push({x:(px-(skin==='maid'?10:4))*k,y:(py-26)*k,w:(W+(skin==='maid'?20:8))*k,h:(BOX+36)*k})}if(ch&&!breaking){const r=ch.getBoundingClientRect();O.push({x:r.x,y:r.y,w:r.width,h:r.height})}return O}
window.Scene={
 init(r){root=r;box=div('sc',r);box.hidden=true;bg=el('svg',{},box);tx=div('tx',box);nm=div('nm',box);go=el('svg',{class:'go',width:18,height:20},box);box.addEventListener('pointerdown',e=>{e.stopPropagation();skip&&skip()});addEventListener('resize',()=>layout(true));at.x=innerWidth/2;return Scene},
 place(o={}){const n={x:o.x??at.x,bottom:o.bottom??at.bottom,w:o.w??at.w,s:o.s??at.s,snap:o.snap??at.snap};if(Object.keys(n).every(k=>n[k]===at[k])&&px!==null)return;at=n;if(!breaking)layout()},
 say,hush,shatter,
 get on(){return shown},
 hit(x,y){return rects().some(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)},
 rect(){const L=rects();if(!L.length)return{x:0,y:0,w:0,h:0};const x=Math.min(...L.map(r=>r.x)),y=Math.min(...L.map(r=>r.y)),X=Math.max(...L.map(r=>r.x+r.w)),Y=Math.max(...L.map(r=>r.y+r.h));return{x,y,w:X-x,h:Y-y}}
};
})();
