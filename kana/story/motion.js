/* 카나 사례 모션. 장마다 그 장의 장치로 움직인다(먹 번짐·막 카드·4컷·VS·편성표·견본첩·커튼·깨짐·지시선·필름·설계도·封·대본·빨간 펜·콘티·카드 덱·엔딩 크레디트).
   화면에 들어올 때 한 번. 와장창만 다시 들어오면 다시 깨진다. 움직임 줄이기(또는 ?static)면 끝 모습만 */
(() => {
const EN = document.documentElement.lang === 'en';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static/.test(location.search);
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const id = i => $(`[data-id="${i}"]`), ids = (...a) => a.map(id).filter(Boolean);
const sec = n => $(`#k${String(n).padStart(2, '0')}`);
const nm = (s, n) => $$(`[data-n="${n}"]`, s);

/* 1920 폭 좌표를 화면 폭으로 */
let K = 1;
/* 살아 있는 카나 엔진은 화면 폭 안으로 자리를 묶는다. 판(1920 폭)은 창 폭과 상관없이 같은 비율로 줄어들므로 엔진도 늘 1920 판 좌표로 세게 한다 */
window.KANA_VW = 1920; window.KANA_VH = 4000;
/* 캔버스 해상도도 판 배율만큼만(휴대폰은 판이 1/5로 줄어 1920 해상도로 그리면 메모리만 먹는다) */
const fit = () => { K = document.documentElement.clientWidth / 1920; document.documentElement.style.setProperty('--k', K); window.KANA_DPR_K = Math.max(.25, K); };
fit();

/* ── 명장면: Figma의 멈춘 대사창·깨짐 사진 대신 앱 대사창(scene.js)을 그 자리에 세운다 ── */
const c1 = id('16:4049'), c4 = id('16:4120');
ids('16:4052', '16:4066', '16:4067').forEach(e => e.style.visibility = 'hidden');
const shot = id('16:4193');
if (shot) { shot.style.background = 'url(img/8f930f89f7.webp) center top/540px auto no-repeat'; Object.assign(shot.style, { left: '620px', top: '40px', width: '540px', height: '1413px' }); }
const cap = id('16:4195'); if (cap) cap.textContent = EN ? 'Breaks with the same code as the app' : '앱과 같은 코드로 깨져요';
const mk = p => { const d = document.createElement('div'); d.className = 'stage'; p.appendChild(d); return d; };
const st1 = mk(c1), st2 = mk(c4);
st2.style.zIndex = 2; const boom = id('16:4194'); if (boom) boom.style.zIndex = 3;
/* init 은 전역 Scene(두 번째 것)을 돌려주므로 돌려받은 값을 쓰지 않는다 */
const S1 = window.Scene1, S2 = window.Scene2; S1.init(st1); S2.init(st2);
/* Scene 은 화면(innerWidth/Height) 기준으로 자리를 잡으므로, 칸 안의 원하는 자리(X,Y: 칸 좌표, s: 배율)가 되게 거꾸로 넣는다 */
const put = (S, X, Y, s, w = 590) => S.place({ s, w, x: X + s * w / 2, bottom: innerHeight - Y - s * 164, snap: 0 });
const placeAll = () => { put(S1, 48, 560, 1.2); put(S2, 210, 690, 1.3); };
placeAll();
addEventListener('resize', () => { fit(); placeAll(); window.ScrollTrigger && ScrollTrigger.refresh(); });
/* 고딕 옷으로 대신 쓰는 독촉 메일 초안(11-27 사용자 승인 글) */
const LINE1 = EN ? 'Payment is three days overdue. Please confirm by Friday. After that, I will not wait.' : '입금일이 사흘 지났습니다. 금요일까지 확인 부탁드립니다. 그 뒤로는 기다리지 않겠습니다.';
const LINE2 = LINE1;

if (reduce) { S1.say(LINE1, { outfit: 'goth', role: EN ? 'Gothic' : '고딕', hold: 1e6 }); return; }

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });
/* 장(또는 그 안의 칸)이 화면에 들어오면 한 번 */
const when = (el, build, start = 'top 72%') => { if (!el) return; const tl = gsap.timeline({ paused: true }); build(tl); ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tl.play() }); return tl; };
const rise = { y: 40, opacity: 0, duration: .7 };
const band = s => $$('[data-n="머리띠"] .t, [data-n="머리띠"] .r', s);
/* 앱 대사창처럼 8fps 세 장으로 열린다 */
const pop8 = (tl, el, at) => tl.fromTo(el, { scaleY: .06, transformOrigin: '50% 100%' }, { keyframes: [{ scaleY: .06, duration: 0 }, { scaleY: 1.05, duration: .125 }, { scaleY: 1, duration: .125 }], ease: 'steps(1)' }, at);
/* 선 그리기(svg 경로) */
const draw = (tl, svgs, at, dur = .6, stagger = .08) => {
  const ps = svgs.filter(Boolean).flatMap(s => $$('path,line,polyline,ellipse,circle,rect', s)).filter(p => p.getAttribute('stroke') && p.getAttribute('stroke') !== 'none');
  ps.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 1000; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  tl.to(ps, { strokeDashoffset: 0, duration: dur, stagger, ease: 'power2.inOut' }, at);
};
const count = (tl, el, to, at, dur = 1, fmt = v => Math.round(v)) => { if (!el) return; const o = { v: 0 }, keep = el.textContent; tl.to(o, { v: to, duration: dur, ease: 'power2.out', onStart: () => el.textContent = fmt(0), onUpdate: () => el.textContent = fmt(o.v), onComplete: () => el.textContent = keep }, at); };

/* ── 살아 있는 카나: 앱 캐릭터 엔진(kana/engine.js 사본)을 그 장의 그림 자리에 세운다 ──
   엔진은 한 화면에 하나만 도는 구조라 사본 다섯 벌을 읽어 두고, 화면 가까이 온 장에 빌려준다(멀어진 장에서 거둬 온다).
   보이는 장만 그리고 화면 밖이면 쉰다. 캔버스는 Figma 그림 칸 안에 넣으므로 그 칸의 등장·흔들림 모션을 그대로 탄다.
   눈깜빡임·숨·시선(커서)·입·몸 휨은 엔진 그대로. 엔진이 못 뜨면(WebGL 없음) Figma 그림이 그대로 남는다 */
/* 휴대폰·태블릿(터치)은 움직이는 카나를 한 벌만 돌려 보이는 장으로 옮겨 다닌다: 다섯 벌을 한꺼번에 돌리면 아이폰이 메모리 부족으로 페이지를 끊었다(11-27) */
const TOUCH = matchMedia('(pointer: coarse)').matches || /iPhone|iPad|Android/i.test(navigator.userAgent);
const ENG = (TOUCH ? [window.Haru1] : [window.Haru1, window.Haru2, window.Haru3, window.Haru4, window.Haru5]).filter(Boolean).map(H => ({ H, slot: null, canvas: null, busy: null }));
window.KANA_DPR_K = Math.max(.25, K);
const P4 = { think: { face: 1 }, work: { face: 1 }, drag: { face: 0 }, rest: { face: 0 } };
const POSES = Object.fromEntries(['yukata', 'knit', 'cardigan', 'skirt', 'rose', 'office', 'sport', 'pink', 'ribbon', 'uniform', 'miko', 'goth', 'maid'].map(o => [o, { ...P4 }]));
Object.assign(POSES.yukata, { rest: { face: 0, head: 954, hx: -2 } }); Object.assign(POSES.sport, { rest: { face: 0, head: 945, hx: 16 } }); Object.assign(POSES.cardigan, { rest: { face: 0, head: 1022, hx: 60 } });
const FACE0 = { smile: .35, blush: 0, closed: 0, brow: 0, wide: 0, mouth: 0, arc: -1, tilt: 0 };
const NOOP = new Proxy({}, { get: () => () => {} });
/* 입: 앱의 say() 는 글자가 찍히는 내내 뻐끔거리고(3단계 0/.3/.55) 큰 화면에서 과해 보인다.
   페이지에서는 입은 움직이지 않고 미소만 짓는다(11-27 사용자 B안). ?mouth=pulse 면 짧게 한두 번만 조금 열었다 닫는 A안 */
const MOUTH = new URLSearchParams(location.search).get('mouth') === 'pulse' ? 'pulse' : 'none';
function talk(H, n = 2, smile = .55) {
  if (MOUTH === 'none') { H.face({ smile }); return; }
  const seq = [[.2, 120], [0, 110], [.15, 110], [0, 0]].slice(n === 1 ? 2 : 0);
  let t = 0; seq.forEach(([m, d]) => { setTimeout(() => H.face({ mouth: m }), t); t += d; });
  setTimeout(() => H.face({ mouth: 0, smile }), t + 60);
}
let mx = innerWidth / 2, my = innerHeight * .3;
const feed = () => ENG.forEach(e => { if (!e.slot || !e.slot.shown) return; const r = e.slot.wrap.getBoundingClientRect(); e.H.mouse((mx - r.left) / K, (my - r.top) / K); });
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; feed(); }, { passive: true });
addEventListener('scroll', feed, { passive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
const SLOTS = [];
/* 그림 칸 안에서 원본(1536×2752)의 자리: Figma 칸은 알파 테두리 box 를 cover 로 채운다 */
function homeOf(sl, H, ox = 0, oy = 0) {
  const { img, opt: { box } } = sl, bw = box[2] - box[0], bh = box[3] - box[1], w = img.offsetWidth, h = img.offsetHeight;
  const sc = Math.max(w / bw, h / bh), offx = (w - bw * sc) / 2, offy = (h - bh * sc) / 2;
  /* 엔진은 자기 좌표를 화면 폭 안으로 묶으므로, 판(wrap)을 그림 칸 왼쪽 300 바깥에 두고 그 안에서 센다 */
  H.home({ x: (300 + offx + (778 - box[0]) * sc + ox) / window.KANA_VW, y: (offy + (1376 - box[1]) * sc + oy) / window.KANA_VH, px: 2752 * sc });
}
async function attach(sl) {
  if (sl.e || !ENG.length) return;
  /* 빈 엔진, 없으면 화면에서 가장 먼 장의 엔진을 거둔다 */
  const dist = s => { const r = s.img.getBoundingClientRect(); return r.bottom < 0 ? -r.bottom : r.top > innerHeight ? r.top - innerHeight : 0; };
  /* 보이는 장이 부르면, 가깝기만 하고 안 보이는 장의 엔진도 거둔다 */
  const far = ENG.filter(x => x.slot && (sl.vis ? !x.slot.vis : !x.slot.near)).sort((a, b) => dist(b.slot) - dist(a.slot));
  let e = ENG.find(x => !x.slot) || far[0];
  if (!e) return;
  if (e.slot) detach(e.slot);
  e.slot = sl; sl.e = e; const H = e.H, g = ++sl.gen;
  await e.busy; if (sl.e !== e || sl.gen !== g) return;
  let done; e.busy = new Promise(r => done = r);
  try {
    H.paused = false;
    if (!e.canvas) {
      e.canvas = document.createElement('canvas'); e.canvas.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
      sl.wrap.appendChild(e.canvas); homeOf(sl, H, ...(sl.placed ? [] : sl.off));
      await H.init({ canvas: e.canvas, say: document.createElement('div'), outfit: sl.opt.outfit, src: k => `kana/옷/${k}.webp`, poseSrc: (a, p) => `kana/옷/포즈/${a}_${p}.webp` });
      H.poses(POSES); H.touchable(false);
      addEventListener('resize', () => { if (e.slot) homeOf(e.slot, H); });
    } else {
      sl.wrap.appendChild(e.canvas); H.hush(); H.mode('own'); H.look(null); H.face(FACE0);
      homeOf(sl, H, ...(sl.placed ? [] : sl.off));
      await Promise.race([H.wear(sl.opt.outfit), wait(4000)]);
    }
    await H.pose(sl.opt.pose || '');
    await wait(e.used ? 700 : 260); e.used = true;
    if (sl.e !== e) return;
    sl.wrap.style.visibility = ''; sl.img.style.backgroundImage = sl.opt.bgLive || 'none'; sl.shown = true;
    if (sl.opt.face) H.face(sl.opt.face);
    sl.opt.enter && sl.opt.enter(H);
    feed(); H.paused = !sl.vis; sl.res();
  } catch (err) { /* WebGL 없음 등: 그림 그대로 */ sl.e = null; e.slot = null; }
  finally { done(); }
}
function detach(sl) {
  const e = sl.e; if (!e) return;
  sl.e = null; e.slot = null; sl.shown = false; sl.gen++;
  sl.wrap.style.visibility = 'hidden'; sl.img.style.backgroundImage = sl.bgi;
  sl.opt.leave && sl.opt.leave(e.H);
}
const ioNear = new IntersectionObserver(es => es.forEach(x => { const sl = x.target._slot; sl.near = x.isIntersecting; if (sl.near) attach(sl); }), { rootMargin: '35% 0px' });
const ioVis = new IntersectionObserver(es => es.forEach(x => { const sl = x.target._slot; sl.vis = x.isIntersecting; if (sl.e && sl.shown) sl.e.H.paused = !sl.vis; if (sl.vis && !sl.e) attach(sl); }));
/* img: Figma 그림 칸. box: 그 그림이 잘라 온 원본 안의 알파 테두리 [x0,y0,x1,y1]. dx,dy: 처음 자리를 비켜 두면 at() 때 엔진 용수철로 들어온다 */
function live(s, img, opt) {
  if (!ENG.length || !img) return null;
  const wrap = document.createElement('div'); wrap.className = 'live';
  wrap.style.cssText = 'position:absolute;left:-300px;top:0;width:0;height:0;visibility:hidden';
  img.appendChild(wrap);
  let res; const sl = { s, img, opt, wrap, e: null, near: false, vis: false, shown: false, gen: 0, placed: !(opt.dx || opt.dy), off: [opt.dx || 0, opt.dy || 0], ready: new Promise(r => res = r) };
  sl.res = res; sl.bgi = img.style.backgroundImage;
  sl.at = () => { sl.placed = true; if (sl.e) homeOf(sl, sl.e.H); };
  Object.defineProperty(sl, 'H', { get: () => (sl.e && sl.shown ? sl.e.H : NOOP) });
  img._slot = sl; ioNear.observe(img); ioVis.observe(img); SLOTS.push(sl);
  return sl;
}

/* 장마다 세울 카나. box 는 원본 안 알파 테두리(Figma 그림이 잘라 온 자리) */
const FULL = [0, 0, 1536, 2752], B = { goth: [258, 53, 1277, 2720], miko: [341, 26, 1202, 2710], maid: [350, 51, 1180, 2718], yukata: [382, 64, 1160, 2715] };
const LV = {
  act3: live(sec(3), id('16:4699'), { outfit: 'pink', box: FULL }), act7: live(sec(7), id('16:4714'), { outfit: 'knit', box: FULL }),
  act13: live(sec(13), id('16:4729'), { outfit: 'uniform', box: FULL }), act20: live(sec(20), id('16:4744'), { outfit: 'rose', box: FULL }),
  /* 4컷 끝: 허둥대는 자세로 자꾸 들썩인다 */
  prob: live(sec(4), id('16:3747'), { outfit: 'pink', pose: 'drag', box: [203, 64, 1444, 2715], face: { wide: .5, brow: .6 },
    enter: H => { LV.prob.t = setInterval(() => { if (!LV.prob.vis) return; H.hop(.45 + Math.random() * .3); H.look(Math.random() * 2 - 1, Math.random() * .6 - .4); }, 1700); }, leave: () => clearInterval(LV.prob.t) }),
  why: live(sec(6), id('16:3821'), { outfit: 'cardigan', pose: 'rest', box: [184, 1085, 1371, 2727] }),
  miko: live(sec(11), id('16:3975'), { outfit: 'miko', box: B.miko }), goth: live(sec(11), id('16:4006'), { outfit: 'goth', box: B.goth }), maid: live(sec(11), id('16:4028'), { outfit: 'maid', box: B.maid }),
  c1: live(sec(12), id('16:4051'), { outfit: 'goth', box: B.goth }),
  /* 「……」 칸: 들켜서 볼이 붉고 눈을 내리깐다 */
  c3: live(sec(12), id('16:4118'), { outfit: 'goth', box: B.goth, face: { blush: .9, smile: .15, brow: -.4 }, enter: H => H.look(.15, .9) }),
  c4: live(sec(12), id('16:4193'), { outfit: 'goth', box: B.goth }),
  big: live(sec(14), id('16:4219'), { outfit: 'yukata', box: B.yukata }),
  arch: live(sec(15), id('16:4405'), { outfit: 'uniform', pose: 'work', box: [442, 64, 1119, 2715] }),
  fence: live(sec(16), id('16:4463'), { outfit: 'goth', pose: 'think', box: FULL }),
  voice: live(sec(17), id('16:4469'), { outfit: 'ribbon', pose: 'think', box: [428, 64, 1125, 2715] }),
  next: live(sec(22), $('.i', id('16:4680')), { outfit: 'maid', pose: 'work', box: [366, 63, 1191, 2717] }),
};
const nop = { H: NOOP }, lv = k => LV[k] || nop;

/* ── 01 표지: 仮名이 먹처럼 번져 서고, 카나가 숨 쉬며 커서를 보고, 말풍선이 뜰 때 입이 움직인다 ── */
{
  const s = sec(1), kan = [...nm(s, '仮'), ...nm(s, '名')], kana = nm(s, 'yukata_full')[0], bub = [...nm(s, '내 말 따옴'), ...nm(s, '말풍선'), ...nm(s, '표 말풍선')];
  const L = live(s, kana, { outfit: 'yukata', box: [382, 64, 1160, 2715] });
  const who = [kana];
  const tl = gsap.timeline({ delay: .15 });
  tl.fromTo(kan, { clipPath: 'inset(100% 0 0 0)', y: 120, filter: 'blur(18px)' }, { clipPath: 'inset(0% 0 0 0)', y: 0, filter: 'blur(0px)', duration: 1.25, stagger: .22, ease: 'expo.out' })
    .from($$('.dots', s), { opacity: 0, duration: 1.2 }, 0)
    .from([...nm(s, 'KANA'), ...nm(s, 'macOS character agent'), ...nm(s, '2026'), ...nm(s, '권찬준  Chanjun Kwon'), ...nm(s, '면')], { opacity: 0, y: -12, duration: .6, stagger: .05 }, .2)
    .from(kana, { y: 160, opacity: 0, duration: 1.1, ease: 'expo.out' }, .35)
    .from(nm(s, '카나'), { yPercent: 40, opacity: 0, duration: .7, ease: 'back.out(1.6)' }, .8)
    .add(() => L && L.H.hop(.7), .95)
    .from(nm(s, '입은 옷의 말투로 말하다가 들키면 자기 말을'), { opacity: 0, y: 20, duration: .6 }, 1.05);
  bub.forEach((b, i) => tl.from(b, { opacity: 0, y: 16, scale: .93, transformOrigin: i ? '0% 0%' : '100% 100%', duration: .45, ease: 'back.out(1.8)' }, 1.6 + [0, .75, 1.25][i]));
  /* 내 말에는 고개를 돌려 보고, 답할 때 입이 움직인다 */
  tl.add(() => L && L.H.look(.9, .25), 1.6).add(() => { if (!L) return; L.H.look(null); talk(L.H, 2, .6); }, 2.35)
    .add(() => L && L.H.face({ smile: .6 }), 2.9);
  tl.from(nm(s, '실제 앱 화면과 같은 말풍선'), { opacity: 0, duration: .5 }, 3.3);
  gsap.to(kan, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: s, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to(who, { yPercent: -7, ease: 'none', scrollTrigger: { trigger: s, start: 'top top', end: 'bottom top', scrub: true } });
}

/* ── 02 이름: 한자가 박히고, 후리가나 밑줄이 그어진다 ── */
{
  const s = sec(2);
  when(s, tl => tl.from(band(s), { opacity: 0, duration: .5 })
    .fromTo(ids('16:3687', '16:3688'), { scale: 1.35, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .6, stagger: .25, ease: 'power4.in' }, .1)
    .from(ids('16:3691', '16:3692'), { scaleX: 0, transformOrigin: '0 50%', duration: .5, stagger: .25 }, .7)
    .from(ids('16:3689', '16:3690'), { y: 24, opacity: 0, duration: .5, stagger: .25 }, .8)
    .from(ids('16:3693', '16:3694'), { opacity: 0, letterSpacing: '1em', duration: .6, stagger: .25 }, 1)
    .from(ids('16:3695', '16:3696', '16:3697'), { ...rise, stagger: .15 }, 1.3));
}

/* ── 막 카드: 가로줄이 흐르고, 막 이름이 한 글자씩 내려앉는다 ── */
const act = (n, ttl, big, sub, img) => {
  const s = sec(n), T = id(ttl);
  if (T) T.innerHTML = [...T.textContent].map(c => `<span style="display:inline-block">${c}</span>`).join('');
  when(s, tl => tl.from($$('.r', s).filter(r => r.style.height === '1px'), { scaleX: 0, transformOrigin: '0 50%', duration: .9, stagger: .05, ease: 'power2.inOut' }, 0)
    .from(id(img), { opacity: 0, x: 120, duration: 1.2, ease: 'expo.out' }, .1)
    /* 세로 제목: 붓으로 쓰듯 한 자씩 위에서 아래로 번져 선다 */
    .from(T ? $$('span', T) : [], { clipPath: 'inset(0 0 100% 0)', filter: 'blur(10px)', opacity: 0, y: -18, duration: .6, stagger: .28, ease: 'power2.out' }, .35)
    .from($$('.r', s).filter(r => r.style.width === '1px'), { scaleY: 0, transformOrigin: '50% 0', duration: .8, ease: 'power2.inOut' }, .3)
    .from(id(big), { clipPath: 'inset(0 100% 0 0)', duration: .7, ease: 'power3.inOut' }, .9)
    .from(id(sub), { opacity: 0, y: 16, duration: .5 }, 1.3)
    .from($$('.t', s).filter(t => /^(ACT|FIN)/.test(t.textContent)), { opacity: 0, letterSpacing: '.6em', duration: .6 }, .2), 'top 65%');
  gsap.fromTo(id(img), { scale: 1.06 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
};
act(3, '16:4710', '16:4711', '16:4712', '16:4699');
act(7, '16:4725', '16:4726', '16:4727', '16:4714');
act(13, '16:4740', '16:4741', '16:4742', '16:4729');
act(20, '16:4755', '16:4756', '16:4757', '16:4744');

/* ── 03 문제: 네 컷이 차례로 넘어가고, 컷마다 효과음 ── */
{
  const s = sec(4);
  when(s, tl => tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('16:3704', '16:3705', '16:3706'), { ...rise, stagger: .12 }, .1), 'top 70%');
  const P = ['16:3707', '16:3718', '16:3728', '16:3740'].map(id);
  when(P[0], tl => tl.from(P[0], { clipPath: 'inset(0 100% 0 0)', duration: .5, ease: 'power3.inOut' })
    .from($$('.r', P[0]).slice(1), { scaleX: 0, transformOrigin: '0 50%', duration: .25, stagger: .07 }, .3)
    .from(id('16:3716'), { scale: 0, rotate: -20, duration: .3, ease: 'back.out(3)' }, .6)
    .add(() => gsap.to(id('16:3716'), { x: 'random(-4,4)', y: 'random(-3,3)', duration: .06, repeat: 24, yoyo: true, repeatRefresh: true, ease: 'none' })), 'top 78%');
  when(P[1], tl => tl.from(P[1], { clipPath: 'inset(0 100% 0 0)', duration: .5, ease: 'power3.inOut' })
    .from(ids('16:3722', '16:3723', '16:3724', '16:3725'), { x: 120, opacity: 0, duration: .45, ease: 'back.out(1.4)' }, .45)
    .fromTo(id('16:3726'), { scale: 3, opacity: 0 }, { scale: 1, opacity: 1, duration: .25, ease: 'power4.in' }, .55)
    .to(P[1], { keyframes: { x: [0, -8, 7, -4, 0] }, duration: .25, ease: 'none' }, .8), 'top 78%');
  when(P[2], tl => {
    tl.from(P[2], { clipPath: 'inset(0 100% 0 0)', duration: .5, ease: 'power3.inOut' });
    const w = $$('.r', P[2]).slice(1); w.forEach((e, i) => tl.from(e, { x: 330 - 180 * i, y: 40, duration: .35, ease: 'back.out(1.6)' }, .4 + i * .12));
    tl.from($$('.t', P[2]).filter(t => /메일|캘린더|예약|엑셀/.test(t.textContent)), { opacity: 0, duration: .2, stagger: .12 }, .5)
      .from(id('16:3738'), { x: -60, opacity: 0, duration: .4 }, .9);
  }, 'top 78%');
  when(P[3], tl => tl.from(P[3], { clipPath: 'inset(0 100% 0 0)', duration: .5, ease: 'power3.inOut' })
    .from(id('16:3742'), { scaleX: 0, transformOrigin: '0 50%', duration: .6 }, .4)
    .add(() => gsap.to(id('16:3743'), { opacity: 0, duration: .5, repeat: -1, yoyo: true, ease: 'steps(1)' }), .9)
    .from(id('16:3744'), { opacity: 0, x: 30, duration: .6 }, 1.1), 'top 78%');
  when(id('16:3746'), tl => tl.from(id('16:3746'), { scaleY: 0, transformOrigin: '50% 100%', duration: .6, ease: 'power4.out' })
    .from(id('16:3747'), { y: 200, duration: .9, ease: 'expo.out' }, .1)
    .from(ids('16:3748', '16:3749'), { ...rise, stagger: .15 }, .4), 'top 85%');
}

/* ── 04 VS: 두 판이 양쪽에서 부딪히고 VS가 박힌다 ── */
{
  const s = sec(5), art = $('.art', s);
  const lines = $$(':scope > .art > .r', s).filter(r => r.style.height === '3px');
  const pink = $(':scope > .art > svg.v', s), vs = nm(s, 'VS')[0];
  const kana = $$(':scope > .art > .i', s).at(-1);
  const L = live(s, kana, { outfit: 'sport', pose: 'drag', box: [514, 63, 1073, 2715], dx: 560 });
  const bars = $$(':scope > .art > .r', s).filter(r => r.style.height === '18px' && /255,\s?255,\s?255/.test(r.style.background));
  const left = [...nm(s, 'CHALLENGERS'), ...$$(':scope > .art > .f', s).filter(f => f.dataset.n === 'Frame'), ...['마스코트', '귀엽지만 일은 가볍다', '채팅 비서', '열어야 보인다', '화면 조작', '내 손을 가져간다'].flatMap(n => nm(s, n))];
  const flash = document.createElement('div'); Object.assign(flash.style, { position: 'absolute', inset: 0, background: '#fff', opacity: 0, pointerEvents: 'none' }); art.appendChild(flash);
  when(s, tl => tl.from(lines, { scaleX: 0, transformOrigin: '0 50%', duration: .5, stagger: .018, ease: 'power4.out' }, 0)
    .from(pink, { xPercent: 100, duration: .5, ease: 'power4.in' }, 0)
    .from(L ? L.wrap : kana, { opacity: 0, duration: .25 }, .1)
    .add(() => L ? L.at() : gsap.from(kana, { x: 420, duration: .5, ease: 'power4.in' }), .1)
    .from(left, { x: -120, opacity: 0, duration: .45, ease: 'power4.in', stagger: .02 }, 0)
    .fromTo(vs, { scale: 5, opacity: 0 }, { scale: 1, opacity: 1, duration: .22, ease: 'power4.in' }, .5)
    .fromTo(flash, { opacity: .25 }, { opacity: 0, duration: .25, ease: 'power2.out' }, .72)
    .to(art, { keyframes: { x: [0, -22, 18, -12, 8, -4, 0], y: [0, 10, -8, 6, -3, 0, 0] }, duration: .42, ease: 'none' }, .72)
    /* 끌려 들어오던 카나가 부딪히는 순간 놀랐다가, 생각하는 자세로 선다 */
    .add(() => { if (!L) return; L.H.face({ wide: .9, brow: .7 }); L.H.hop(1.1); }, .72)
    .add(() => { if (!L) return; L.H.pose('think'); L.H.face({ wide: 0, brow: 0, smile: .45 }); L.opt.pose = 'think'; L.opt.face = { smile: .45 }; }, 1.25)
    .from([...nm(s, 'PLAYER'), ...nm(s, '카나')], { y: 50, opacity: 0, duration: .5, stagger: .08 }, .85)
    .from(['보인다', '일한다', '내 손은 그대로', '좋아서 켜 둔다'].flatMap(n => nm(s, n)), { opacity: 0, x: -16, duration: .35, stagger: .12 }, 1)
    .from(bars, { scaleX: 0, transformOrigin: '0 50%', duration: .7, stagger: .12, ease: 'power2.inOut' }, 1.05)
    .from([...nm(s, '2026년 가을, 전부 귀여웠다.'), ...nm(s, '카나는 반대로 갔다.')], { ...rise, stagger: .15 }, 1.3), 'top 55%');
}

/* ── 05 왜 이 컨셉: 壱弐参이 도장처럼 찍히고 큰 말이 따라 열린다 ── */
{
  const s = sec(6);
  when(s, tl => tl.from(band(s), { opacity: 0, duration: .4 }).from(id('16:3822'), rise, 0).from(id('16:3821'), { x: 160, opacity: 0, duration: 1.2, ease: 'expo.out' }, .2), 'top 70%');
  [['16:3823', '16:3824', '16:3825'], ['16:3826', '16:3827', '16:3828'], ['16:3829', '16:3830', '16:3831']].forEach(([n, b, c]) =>
    when(id(n), tl => tl.fromTo(id(n), { scale: 2.6, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, duration: .3, ease: 'power4.in' })
      .from(id(b), { clipPath: 'inset(0 0 100% 0)', y: 30, duration: .7, ease: 'expo.out' }, .25)
      .from(id(c), { opacity: 0, x: -20, duration: .5 }, .6), 'top 80%'));
}

/* ── 06 오늘의 편성: ON AIR가 깜빡이고, 시각이 넘김판처럼 넘어간다 ── */
{
  const s = sec(8), on = id('16:3836');
  when(s, tl => tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('16:3834', '16:3835'), { ...rise, stagger: .12 }, 0)
    .from(on, { scale: 0, rotate: -90, duration: .6, ease: 'back.out(2)' }, .3)
    .add(() => gsap.to(on, { opacity: .35, duration: .55, repeat: -1, yoyo: true, ease: 'steps(1)', repeatDelay: .4 }), 1)
    .from(id('16:3838'), { scaleX: 0, transformOrigin: '0 50%', duration: .8 }, .4), 'top 70%');
  [['16:3839', '16:3840', '16:3841', '16:3842', '16:3843', '16:3845', '16:3847'], ['16:3848', '16:3849', '16:3850', '16:3851', '16:3852', '16:3854', '16:3856'],
   ['16:3857', '16:3858', '16:3859', '16:3860', '16:3861', '16:3863', '16:3865'], ['16:3866', '16:3867', '16:3868', '16:3869', '16:3870', '16:3872', '16:3874']].forEach(([t, v, ep, ti, th, bb, ln]) =>
    when(id(t), tl => tl.fromTo(id(t), { rotateX: 90, transformPerspective: 600, transformOrigin: '50% 50%' }, { rotateX: 0, duration: .5, ease: 'back.out(2)' })
      .from(id(v), { scaleY: 0, transformOrigin: '50% 0', duration: .4 }, .1)
      .from(ids(ep, ti), { x: -30, opacity: 0, duration: .5, stagger: .1 }, .2)
      .from(id(th), { clipPath: 'inset(0 0 0 100%)', duration: .6, ease: 'power3.inOut' }, .25)
      .from(id(bb), { opacity: 0, y: 14, scale: .92, transformOrigin: '100% 100%', duration: .45, ease: 'back.out(2)' }, .7)
      .from(id(ln), { scaleX: 0, transformOrigin: '0 50%', duration: .7 }, .3), 'top 82%'));
  when(id('16:3875'), tl => tl.from(id('16:3875'), { opacity: 0, duration: .5 }), 'top 92%');
}

/* ── 07 실제 화면: 검은 화면에서 바탕화면이 떠오르고 자막이 든다 ── */
{
  const s = sec(9), img = id('16:4802');
  when(s, tl => tl.from(img, { opacity: 0, duration: 1.2, ease: 'power2.out' })
    .from(ids('16:4803', '16:4804'), { opacity: 0, y: -10, duration: .6, stagger: .15 }, .4)
    .from(id('16:4805'), { opacity: 0, duration: .5, ease: 'steps(3)' }, 1.3)
    .from(id('16:4806'), { opacity: 0, duration: .5 }, 1.6), 'top 60%');
  gsap.fromTo(img, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ── 08 화면 규칙(見本帳): 견본 판이 넘겨지고, 판마다 그 창이 앱처럼 열린다 ── */
{
  const s = sec(10);
  when(s, tl => tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('16:3896', '16:3897'), { ...rise, stagger: .12 }, 0), 'top 70%');
  const A = ['16:3898', '16:3899', '16:3902'], B = ['16:3903', '16:3904', '16:3907'], C = ['16:3908', '16:3909', '16:3912'], D = ['16:3913', '16:3914', '16:3917'];
  const flip = (tl, L) => tl.fromTo(ids(...L), { rotateY: -70, transformPerspective: 1400, transformOrigin: '0 50%', opacity: 0 }, { rotateY: 0, opacity: 1, duration: .7, ease: 'expo.out' });
  when(id(A[0]), tl => { flip(tl, A); tl.from($$(':scope > .f', id('16:3918')), { opacity: 0, y: 16, scale: .94, duration: .4, stagger: .45, ease: 'back.out(1.8)' }, .5); }, 'top 78%');
  when(id(B[0]), tl => { flip(tl, B); pop8(tl, id('16:3934'), .7); }, 'top 78%');
  when(id(C[0]), tl => { flip(tl, C);
    tl.from($$(':scope > .f', id('16:3951')), { opacity: 0, y: 16, duration: .4, stagger: .3 }, .5)
      .fromTo(id('16:3966'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 1.4, ease: 'none', repeat: -1, repeatDelay: .8 }, 1.2); }, 'top 78%');
  when(id(D[0]), tl => { flip(tl, D); tl.from(id('16:3970'), { y: 80, opacity: 0, duration: .8, ease: 'expo.out' }, .4); }, 'top 78%');
}

/* ── 09 역할 옷: 세 칸이 막처럼 내려오고, 대사창이 8fps로 열린다 ── */
{
  const s = sec(11), P = ['16:3972', '16:4003', '16:4025'].map(id), V = ['16:3974', '16:4005', '16:4027'].map(id);
  V.forEach(v => { if (v) v.innerHTML = v.textContent.split('\n').map(c => `<span style="display:inline-block">${c}</span>`).join('\n'); });
  when(s, tl => {
    tl.from(band(s), { opacity: 0, duration: .4 });
    P.forEach((p, i) => {
      const at = .15 + i * .3;
      tl.from(p, { clipPath: 'inset(0 0 100% 0)', duration: .8, ease: 'power4.inOut' }, at)
        .from($$(':scope > .i', p), { y: -60, duration: 1, ease: 'expo.out' }, at + .2)
        .from($$('span', V[i]), { y: -60, opacity: 0, duration: .4, stagger: .1, ease: 'back.out(2)' }, at + .45);
      pop8(tl, $(':scope > .f', p), at + .9);
      tl.from($$(':scope > .t', p).slice(1), { opacity: 0, duration: .01, stagger: .125 }, at + 1.15);
    });
    tl.from(id('16:4041'), rise, 1.9);
  }, 'top 65%');
}

/* ── 10 명장면: 칸이 읽는 순서로 열리고, 큰 칸에서 대사창이 깨진다 ── */
{
  const s = sec(12);
  /* 제목이 캐붕한다: 처음엔 「캐릭터붕괴」가 한 줄로 이어져 있다가, 「릭터」「괴」가 금 가며 떨어져 나간다 */
  const FG = ids('25:5036', '25:5040', 'en-frag3');
  when(s, tl => tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('25:5035', '25:5039', 'en-c', '16:4048'), { ...rise, stagger: .1 }, 0)
    .from(FG[0], { rotation: 0, x: 4, y: -36, opacity: 1, filter: 'blur(0px)', duration: .42, ease: 'power3.in' }, 1.5)
    .from(FG[1], { rotation: 0, x: 4, y: -54, opacity: 1, filter: 'blur(0px)', duration: .42, ease: 'power3.in' }, 1.58)
    .to(ids('25:5035', '25:5039', 'en-c'), { keyframes: { x: [0, -5, 4, -2, 0] }, duration: .25, ease: 'none' }, 1.9), 'top 70%');
  const open = (el, extra, start = 'top 78%') => when(el, tl => { tl.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .55, ease: 'power3.inOut' }); extra && extra(tl); }, start);
  open(c1, tl => tl.from(id('16:4051'), { scale: 1.08, transformOrigin: '50% 20%', duration: 1.2 }, 0).add(() => { S1.say(LINE1, { outfit: 'goth', role: EN ? 'Gothic' : '고딕', hold: 1e6 }); talk(lv('c1').H, 2, .3); }, .5).from(id('k10-draft'), { opacity: 0, duration: .3 }, .8));
  const c2 = id('16:4068');
  open(c2, tl => tl.from($$(':scope > svg.v', c2), { opacity: 0, scale: 1.3, transformOrigin: '300px 200px', duration: .5, stagger: .004 }, .2)
    .from(id('21:4813'), { scale: .4, opacity: 0, rotate: -6, duration: .55, ease: 'back.out(2.4)' }, .35));
  const c3 = id('16:4117'), dd = id('16:4119'); dd.innerHTML = '<span>…</span><span>…</span>';
  open(c3, tl => tl.from(id('16:4118'), { scale: 1.12, x: 30, duration: 1.4, ease: 'power2.out' }, 0).from($$('span', dd), { opacity: 0, duration: .01, stagger: .45 }, .6));
  /* 큰 칸: 말하는 도중에 깨진다. 다시 들어오면 다시 */
  const ln = $$(':scope > svg.v', c4);
  gsap.set(boom, { opacity: 0 }); gsap.set(ln, { opacity: .25 });
  let busy = false;
  const breakIt = async () => {
    if (busy) return; busy = true;
    gsap.set(boom, { opacity: 0 }); gsap.set(ln, { opacity: .25, scale: 1 });
    S2.say(LINE2, { outfit: 'goth', role: EN ? 'Gothic' : '고딕', hold: 1e6 });
    const K4 = lv('c4').H; K4.face({ wide: 0, brow: 0, blush: 0, smile: .2 }); talk(K4, 2, .2);
    await new Promise(r => setTimeout(r, 2300));
    /* 금은 마지막 글자 옆에서 시작한다(Scene 은 바깥 배율을 모르니 화면 배율 K 로 되돌려 넘긴다) */
    const box = $('.sc', st2), last = [...box.querySelectorAll('.tx s.v')].at(-1), br = box.getBoundingClientRect();
    const at = last ? (r => ({ x: br.left + (r.right - br.left) / K + 4, y: br.top + (r.top + r.height / 2 - br.top) / K }))(last.getBoundingClientRect()) : undefined;
    const done = S2.shatter({ at, seed: 4242 });
    /* 깨지는 순간 놀라고, 이어서 자기 얼굴로 돌아온다 */
    setTimeout(() => { K4.hush(); K4.mode('own'); K4.face({ wide: 1, brow: .8, smile: 0 }); K4.hop(1.3); }, 420);
    setTimeout(() => { K4.face({ wide: 0, brow: 0, blush: .7, smile: .55 }); }, 1700);
    gsap.timeline({ delay: .42 })
      .to(ln, { opacity: 1, duration: .08 }, 0)
      .fromTo(ln, { scale: 1.25, transformOrigin: '860px 520px' }, { scale: 1, duration: .5, ease: 'power3.out' }, 0)
      .fromTo(boom, { scale: 3, opacity: 0 }, { scale: 1, opacity: 1, duration: .26, ease: 'back.out(3)' }, .02)
      .to(c4, { keyframes: { x: [0, -16, 14, -9, 6, -2, 0], y: [0, 9, -7, 4, -2, 0, 0] }, duration: .45, ease: 'none' }, .02);
    await done; busy = false;
  };
  open(c4, tl => tl.from(shot, { y: 60, opacity: 0, duration: .8 }, .1));
  ScrollTrigger.create({ trigger: c4, start: 'top 45%', end: 'bottom top', onEnter: breakIt, onEnterBack: breakIt });
  const c5 = id('16:4196'), c6 = id('16:4202');
  open(c5, tl => tl.from(id('16:4197'), { scale: .55, y: 120, transformOrigin: '50% 100%', duration: .6, ease: 'back.out(1.6)' }, .15)
    .from(id('16:4198'), { scale: .8, opacity: 0, y: 14, transformOrigin: '100% 100%', duration: .45, ease: 'back.out(2)' }, .6)
    .from(id('16:4201'), { opacity: 0, duration: .4 }, .9));
  open(c6, tl => tl.from(ids('16:4203', '16:4204'), { ...rise, stagger: .15 }, .25));
}

/* ── 11 움직임: 설정화 지시선이 그어지고, 아래 필름이 흐른다 ── */
{
  const s = sec(14);
  when(s, tl => {
    tl.from(band(s), { opacity: 0, duration: .4 }).from(id('16:4211'), rise, 0).from(id('16:4219'), { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out' }, .1);
    const marks = [['16:4220', '16:4221', '16:4222', '16:4223'], ['16:4234', '16:4235', '16:4236', '16:4237'], ['16:4224', '16:4225', '16:4226', '16:4227'], ['16:4228', '16:4229', '16:4230', '16:4231'], ['16:4241', '16:4242', '16:4232', '16:4233'], ['16:4238', '16:4267', '16:4239', '16:4240']];
    marks.forEach(([ln, dot, a, b], i) => { const at = .7 + i * .22; tl.from(id(dot), { scale: 0, duration: .3, ease: 'back.out(3)' }, at); draw(tl, [id(ln)], at + .05, .45, 0); tl.from(ids(a, b), { opacity: 0, x: 10, duration: .35, stagger: .06 }, at + .35); });
    tl.from(ids('16:4212', '16:4215'), { scaleX: 0, transformOrigin: '0 50%', duration: .6, stagger: .15, ease: 'power3.inOut' }, 1.2)
      .from(ids('16:4213', '16:4214'), { opacity: 0, x: -20, duration: .8, ease: 'power2.out' }, 1.6)
      .from(ids('16:4216', '16:4217'), { opacity: 0, x: -20, duration: .8, ease: 'steps(6)' }, 1.75);
  }, 'top 65%');
  /* 필름: 구멍이 흐르고 네 칸이 한 칸씩 들어온다 */
  const holes = $$(':scope > .art > .r', s).filter(r => r.style.width === '30px');
  const film = id('16:4250');
  when(film, tl => {
    tl.from(ids('16:4247', '16:4248', '16:4249'), { opacity: 0, y: 20, duration: .5, stagger: .1 })
      .from(film, { scaleY: 0, duration: .5, ease: 'power3.inOut' }, .1)
      .from(holes, { opacity: 0, duration: .3 }, .5)
      .add(() => gsap.fromTo(holes, { x: 0 }, { x: -56, duration: .5, ease: 'none', repeat: -1 }), .5);
    ['16:4251', '16:4255', '16:4259', '16:4263'].forEach((f, i) => tl.from(id(f), { x: 300, opacity: 0, duration: .5, ease: 'steps(4)' }, .7 + i * .35));
    tl.from(ids('16:4253', '16:4254', '16:4257', '16:4258', '16:4261', '16:4262', '16:4265', '16:4266'), { opacity: 0, y: 10, duration: .3, stagger: .08 }, 1.4);
  }, 'top 75%');
}

/* ── 12 구조: 모눈이 깔리고, 설계도 선이 그어지고, 숫자가 센다 ── */
{
  const s = sec(15), grid = $$(':scope > .art > .r', s).filter(r => (r.style.width === '1px' && r.style.height === '1700px') || (r.style.height === '1px' && r.style.width === '1920px'));
  when(s, tl => {
    tl.from(grid, { opacity: 0, duration: .6, stagger: { each: .012, from: 'center' } })
      .from(band(s), { opacity: 0, duration: .4 }, .2)
      .from(ids('16:4403', '16:4404'), { ...rise, stagger: .12 }, .3)
      .from(id('16:4406'), { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'power2.inOut' }, .4)
      .from(id('16:4405'), { opacity: 0, filter: 'brightness(3) saturate(0)', duration: 1 }, .6);
    [['16:4417', '16:4418', '16:4419', '16:4420', '16:4421'], ['16:4407', '16:4408', '16:4409', '16:4410', '16:4411'], ['16:4412', '16:4413', '16:4414', '16:4415', '16:4416'], ['16:4422', '16:4423', '16:4424', '16:4425', '16:4426']].forEach(([d, l, a, b, c], i) => {
      const at = 1.1 + i * .3; tl.from(id(d), { scale: 0, duration: .25, ease: 'back.out(3)' }, at); draw(tl, [id(l)], at + .05, .4, 0); tl.from(ids(a, b, c), { opacity: 0, duration: .3, stagger: .08 }, at + .35);
    });
    tl.from(ids('16:4427', '16:4430', '16:4433'), { scaleX: 0, transformOrigin: '0 50%', duration: .5, stagger: .1 }, 2.3)
      .from(ids('16:4428', '16:4431', '16:4434', '16:4435'), { opacity: 0, duration: .4, stagger: .08 }, 2.4);
    count(tl, id('16:4429'), 33, 2.4, 1.2); count(tl, id('16:4432'), 3, 2.4, .8);
  }, 'top 65%');
}

/* ── 13 울타리: 封 부적이 철썩 붙고, 막힌 길 표가 떨어진다 ── */
{
  const s = sec(16), seal = id('16:4443'), tags = ['16:4448', '16:4450', '16:4452', '16:4454', '16:4456', '16:4458'].map(id);
  when(s, tl => {
    tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('16:4441', '16:4442'), { ...rise, stagger: .12 }, 0)
      .fromTo(seal, { scale: 1.8, opacity: 0, y: -120 }, { scale: 1, opacity: 1, y: 0, duration: .35, ease: 'power4.in' }, .5)
      .to($('.art', s), { keyframes: { x: [0, -10, 8, -4, 0], y: [0, 6, -4, 2, 0] }, duration: .3, ease: 'none' }, .85)
      .from(ids('16:4446', '16:4447'), { opacity: 0, duration: .4, stagger: .2 }, 1);
    tags.forEach((t, i) => tl.from(t, { y: -200, opacity: 0, duration: .5, ease: 'bounce.out' }, 1.1 + i * .1));
    tl.from(ids('16:4460', '16:4461', '16:4462'), { opacity: 0, x: 20, duration: .5, stagger: .15 }, 1.6)
      .from(id('16:4463'), { x: 120, opacity: 0, duration: .8, ease: 'expo.out' }, 1.7);
  }, 'top 65%');
}

/* ── 14 말투(アフレコ台本): 대본 줄이 녹음 순서대로 켜지고, NG 도장이 찍힌다 ── */
{
  const s = sec(17);
  when(s, tl => tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('16:4470', '16:4471'), { ...rise, stagger: .12 }, 0)
    .from(id('16:4469'), { x: 120, opacity: 0, duration: 1, ease: 'expo.out' }, .2)
    .from(ids('16:4472', '16:4473'), { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'power3.inOut' }, .3)
    .from(ids('16:4474', '16:4475', '16:4476', '16:4477', '16:4478', '16:4479', '16:4480'), { opacity: 0, duration: .3, stagger: .04 }, .7), 'top 65%');
  const rows = [['16:4481', '16:4482', '16:4483', '16:4484', '16:4485'], ['16:4486', '16:4487', '16:4488', '16:4489', '16:4490'], ['16:4491', '16:4492', '16:4493', '16:4494', '16:4495'], ['16:4496', '16:4497', '16:4498', '16:4499', '16:4500'], ['16:4501', '16:4502', '16:4503', '16:4504']];
  when(id('16:4481'), tl => rows.forEach(([n, r, l, d, ln], i) => {
    const at = i * .45;
    tl.from(ids(n, r), { opacity: 0, duration: .2 }, at)
      .fromTo(id(l), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .45, ease: 'steps(9)' }, at + .05)
      .from(id(d), { opacity: 0, duration: .3 }, at + .3);
    if (ln) tl.from(id(ln), { scaleX: 0, transformOrigin: '0 50%', duration: .4 }, at + .2);
  }), 'top 75%');
  when(id('16:4505'), tl => tl.from(id('16:4505'), { scale: 2.2, rotation: '-=30', opacity: 0, duration: .28, ease: 'power4.in' })
    .from(ids('16:4508', '16:4509', '16:4510'), { clipPath: 'inset(0 100% 0 0)', duration: .4, stagger: .2, ease: 'power2.inOut' }, .3)
    .from(id('16:4511'), { opacity: 0, duration: .5 }, 1), 'top 85%');
}

/* ── 15 고친 기록: 틀린 값에 빨간 펜이 그어지고, 점수가 오른다 ── */
{
  const s = sec(18);
  when(s, tl => { tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('16:4513', '16:4514'), { ...rise, stagger: .12 }, 0)
    .from(id('16:4515'), { y: 60, opacity: 0, rotate: -2, duration: .7, ease: 'expo.out' }, .3)
    .from($$(':scope > .f, :scope > .t', id('16:4515')), { opacity: 0, duration: .3, stagger: .08 }, .6)
    .from(id('16:4526'), { y: 60, opacity: 0, rotate: 2, duration: .7, ease: 'expo.out' }, 1)
    .from($$(':scope > .f, :scope > .t', id('16:4526')), { opacity: 0, duration: .3, stagger: .08 }, 1.3);
    draw(tl, [id('16:4536')], 1.8, .7, 0);
    tl.from(id('16:4537'), { opacity: 0, duration: .5 }, 2.2); }, 'top 65%');
  when(id('16:4543'), tl => { tl.from(id('16:4542'), { opacity: 0, duration: .3 }).from(id('16:4543'), { opacity: 0, x: -30, duration: .5 }, .1);
    draw(tl, [id('16:4544')], .6, .4, 0);
    tl.from(id('16:4545'), { x: -40, opacity: 0, duration: .4 }, .9).from(id('16:4546'), { opacity: 0, duration: .2 }, 1.1);
    count(tl, id('16:4546'), 28, 1.1, 1.1);
    tl.fromTo(id('16:4548'), { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: .6, ease: 'power2.out' }, 2)
      .from(id('16:4547'), { opacity: 0, duration: .3 }, 2.1)
      .from(ids('16:4549', '16:4550', '16:4551'), { opacity: 0, y: 14, duration: .4, stagger: .12 }, 2.2); }, 'top 80%');
}

/* ── 16 제작 일지(絵コンテ): 콘티가 컷 순서로 채워지고, 担当에 도장이 찍힌다 ── */
{
  const s = sec(19);
  when(s, tl => tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('16:4557', '16:4558'), { ...rise, stagger: .12 }, 0)
    .from(id('16:4559'), { scaleX: 0, transformOrigin: '0 50%', duration: .6 }, .3)
    .from(ids('16:4560', '16:4561', '16:4562', '16:4563'), { opacity: 0, duration: .3, stagger: .05 }, .6), 'top 65%');
  [['16:4568', '16:4569', '16:4571', '16:4572', '16:4616'], ['16:4577', '16:4578', '16:4580', '16:4581', '16:4617'], ['16:4586', '16:4587', '16:4589', '16:4590', '16:4618'], ['16:4595', '16:4596', '16:4598', '16:4599', '16:4619'], ['16:4604', '16:4605', '16:4607', '16:4608', '16:4620']].forEach(([n, f, a, b, who]) =>
    when(id(f), tl => tl.from(id(n), { opacity: 0, scale: .5, duration: .3, ease: 'back.out(2)' })
      .from(id(f), { clipPath: 'inset(0 100% 0 0)', duration: .5, ease: 'power3.inOut' }, .1)
      .from(ids(a, b), { opacity: 0, x: -20, duration: .4, stagger: .1 }, .35)
      .fromTo(id(who), { scale: 2.4, opacity: 0, rotate: -15 }, { scale: 1, opacity: 1, rotate: 0, duration: .25, ease: 'power4.in' }, .7), 'top 82%'));
  when(id('16:4609'), tl => tl.from(id('16:4609'), { opacity: 0, duration: .3 })
    .from(ids('16:4610', '16:4612', '16:4614'), { opacity: 0, duration: .3, stagger: .12 }, .1)
    .from(ids('16:4611', '16:4613', '16:4615'), { clipPath: 'inset(0 100% 0 0)', duration: .5, stagger: .12, ease: 'power2.inOut' }, .5), 'top 85%');
  const ng = [['16:4763', '16:4765', '16:4766'], ['16:4767', '16:4769', '16:4770'], ['16:4771', '16:4773', '16:4774'], ['16:4775', '16:4777', '16:4778'], ['16:4779', '16:4781', '16:4782'], ['16:4783', '16:4785', '16:4786']];
  when(id('16:4761'), tl => { tl.from(ids('16:4761', '16:4762'), { opacity: 0, y: 20, duration: .4, stagger: .1 });
    ng.forEach(([f, x, c], i) => tl.from(id(f), { y: -60, opacity: 0, rotate: (i % 2 ? 4 : -4), duration: .4, ease: 'back.out(1.6)' }, .3 + i * .12)
      .fromTo(id(x), { scale: 2.5, opacity: 0 }, { scale: 1, opacity: 1, duration: .2, ease: 'power4.in' }, .9 + i * .12)
      .from(id(c), { opacity: 0, duration: .3 }, .6 + i * .12)); }, 'top 85%');
}

/* ── 17 옷장: 큰 세 장이 펼쳐지고, 열 벌이 카드 덱처럼 깔린다 ── */
{
  const s = sec(21), big = ['16:4625', '16:4630', '16:4635'].map(id);
  const small = ['16:4640', '16:4643', '16:4646', '16:4649', '16:4652', '16:4655', '16:4658', '16:4661', '16:4669', '16:4672'].map(id);
  const names = ['16:4642', '16:4645', '16:4648', '16:4651', '16:4654', '16:4657', '16:4660', '16:4663', '16:4671', '16:4674'].map(id);
  when(s, tl => { tl.from(band(s), { opacity: 0, duration: .4 }).from(ids('16:4623', '16:4624'), { ...rise, stagger: .12 }, 0);
    big.forEach((b, i) => tl.from(b, { x: 604 * (1 - i), rotate: (i - 1) * -8, y: 40, opacity: 0, duration: .8, ease: 'expo.out' }, .3 + (i === 1 ? 0 : .12))); }, 'top 65%');
  when(small[0], tl => { small.forEach((c, i) => tl.from(c, { x: 820 - 179 * i, y: -120, rotate: -10 + i * 2, opacity: 0, duration: .45, ease: 'power3.out' }, i * .07));
    tl.from(names, { opacity: 0, duration: .3, stagger: .05 }, .6).from(id('16:4664'), { opacity: 0, duration: .4 }, 1); }, 'top 80%');
  when(id('16:4676'), tl => tl.from(ids('16:4676', '16:4677'), { ...rise, stagger: .12 }).from(id('16:4678'), { x: 100, opacity: 0, duration: .8, ease: 'expo.out' }, .1), 'top 85%');
}

/* ── 18 차회예고: 예고 목록이 하나씩, 끝에 엔딩 크레디트가 올라온다 ── */
{
  const s = sec(22);
  when(s, tl => { tl.from(band(s), { opacity: 0, duration: .4 })
      .fromTo(id('16:4682'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .7, ease: 'power3.inOut' }, 0)
      .from(ids('16:4680', '16:4808'), { x: 160, opacity: 0, duration: 1.1, ease: 'expo.out' }, .2);
    [['16:4683', '16:4684'], ['16:4685', '16:4686'], ['16:4687', '16:4688'], ['16:4689', '16:4690'], ['16:4691', '16:4692']].forEach(([a, b], i) => tl.from(id(a), { opacity: 0, x: -30, duration: .45 }, .6 + i * .25).from(id(b), { opacity: 0, duration: .4 }, .75 + i * .25));
    tl.from(id('16:4693'), { opacity: 0, y: 14, scale: .9, transformOrigin: '100% 100%', duration: .45, ease: 'back.out(2)' }, 2); }, 'top 65%');
  const credits = ['16:4787', '16:4788', '16:4789', '16:4790', '16:4791', '16:4792', '16:4793', '16:4794', '16:4795', '16:4796', '16:4797', '16:4798', '16:4800', '16:4799'].map(id);
  when(id('16:4787'), tl => tl.from(credits, { y: 60, opacity: 0, duration: .8, stagger: .07, ease: 'power2.out' }), 'top 88%');
}

/* ── 살아 있는 카나: 장마다 그 장면에 맞는 몸짓 ── */
{
  /* 막 카드: 막 이름이 내려앉을 때 그쪽을 돌아보고 웃는다 */
  [[3, 'act3'], [7, 'act7'], [13, 'act13'], [20, 'act20']].forEach(([n, k]) => when(sec(n), tl => tl.add(() => lv(k).H.look(-1, -.25), .45).add(() => { lv(k).H.look(null); lv(k).H.face({ smile: .6 }); lv(k).H.hop(.5); }, 1.5), 'top 65%'));
  /* 4컷 끝 띠가 올라올 때 한 번 크게 들썩 */
  when(id('16:3746'), tl => tl.add(() => lv('prob').H.hop(1.2), .5), 'top 85%');
  /* 왜 이 컨셉: 壱弐参이 찍힐 때마다 움찔 */
  ['16:3823', '16:3826', '16:3829'].forEach(n => when(id(n), tl => tl.add(() => { lv('why').H.hop(.5); lv('why').H.look(-1, 0); }, .3).add(() => lv('why').H.look(null), 1.4), 'top 80%'));
  /* 역할 옷: 대사창이 열리면 그 옷의 말투로 8fps 입을 움직인다(앱에서 역할 옷이 대사창으로 말할 때와 같다) */
  when(sec(11), tl => [['miko', '16:4000'], ['goth', '16:4022'], ['maid', '16:4038']].forEach(([k, t], i) => tl.add(() => { talk(lv(k).H, 2, .3); }, 1.05 + i * .3)), 'top 65%');
  /* 움직임: 지시선이 그어질 때마다 그 부위가 실제로 움직인다 */
  const BIG = () => lv('big').H, nudge = (ox, ms) => { const sl = LV.big; if (!sl || !sl.e) return; homeOf(sl, sl.e.H, ox); setTimeout(() => sl.e && homeOf(sl, sl.e.H), ms); };
  when(sec(14), tl => {
    const at = i => .7 + i * .22 + .35;
    tl.add(() => { BIG().face({ closed: 1 }); setTimeout(() => BIG().face({ closed: 0 }), 260); }, at(0))
      .add(() => { BIG().look(1, -.5); setTimeout(() => BIG().look(-1, -.2), 650); setTimeout(() => BIG().look(null), 1300); }, at(1))
      .add(() => { BIG().face({ blush: 1, smile: .7 }); setTimeout(() => BIG().face({ blush: 0, smile: .35 }), 1600); }, at(2))
      .add(() => talk(BIG(), 2, .45), at(3) + .4)
      .add(() => nudge(90, 320), at(4) + .6)
      .add(() => BIG().hop(1), at(5) + .6)
      /* 대본 줄: 8fps 로 끊어 움직였다가 돌아온다 */
      .add(() => { BIG().mode('script'); setTimeout(() => BIG().mode('own'), 2200); }, 1.9);
  }, 'top 65%');
  /* 울타리: 封이 붙는 순간 놀란다 */
  when(sec(16), tl => tl.add(() => { lv('fence').H.face({ wide: 1, brow: .8 }); lv('fence').H.hop(1); }, .85).add(() => lv('fence').H.face({ wide: 0, brow: 0, smile: .5 }), 2), 'top 65%');
  /* 말투: 대본 줄이 켜질 때마다 그 대사를 말한다 */
  when(id('16:4481'), tl => ['16:4483', '16:4488', '16:4493', '16:4498', '16:4503'].forEach((t, i) => tl.add(() => talk(lv('voice').H, 1, .45), i * .45 + .05)), 'top 75%');
  /* 차회예고: 말풍선이 뜰 때 말하고 웃는다 */
  when(sec(22), tl => tl.add(() => { lv('next').H.face({ blush: .4 }); talk(lv('next').H, 2, .7); }, 2), 'top 65%');
  /* 엔진을 쓰지 않는 작은 카나(편성표 썸네일·필름·옷장·작아진 카나)는 숨만 쉰다 */
  const small = [...ids('16:3844', '16:3853', '16:3862', '16:3871', '16:4252', '16:4256', '16:4260', '16:4264', '16:4197'), ...$$('.i', sec(21)).filter(e => e.offsetHeight >= 500 && e.offsetHeight <= 900)];
  small.forEach((e, i) => { e.classList.add('breath'); e.style.animationDelay = (-(i * .53) % 3.6).toFixed(2) + 's'; });
}

/* 말풍선 꼬리 방울은 그 말풍선과 함께 나타난다(말풍선의 등장 투명도를 따라간다) */
{
  const pairs = $$('[data-n="꼬리 방울"]').map(d => { let b = d.previousElementSibling; while (b && !b.matches('.f')) b = b.previousElementSibling; return [d, b]; }).filter(([, b]) => b);
  gsap.ticker.add(() => pairs.forEach(([d, b]) => { const o = getComputedStyle(b).opacity; if (d._o !== o) { d._o = o; d.style.opacity = o; } }));
}
})();
