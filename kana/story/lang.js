/* 한·영 전환: index.html(ko) ↔ index.en.html(en).
   처음엔 보는 사람의 브라우저 언어로 고르고, 직접 고르면 기억한다(저장소가 막힌 iframe 에서도 ?pick 으로 되튀지 않게).
   전환할 땐 보던 장과 그 안의 위치(#k12:0.350)를 들고 간다. head 에서 바로 읽혀 첫 화면 전에 옮긴다. */
(function () {
  var KEY = 'kana-portfolio-lang';
  var here = document.documentElement.lang === 'en' ? 'en' : 'ko';
  var FILE = { ko: 'index.html', en: 'index.en.html' };
  var q = new URLSearchParams(location.search);

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }
  function urlFor(l, hash) {
    var p = new URLSearchParams(location.search); p.set('pick', '1');
    return FILE[l] + '?' + p.toString().replace(/=(?=&|$)/g, '') + (hash || '');
  }

  // 1) 언어 고르기: 직접 고른 적이 있으면 그 언어, 없으면 브라우저 언어(ko 아니면 영어)
  if (!q.has('pick')) {
    var want = saved() || (/^ko\b/i.test(navigator.language || '') ? 'ko' : 'en');
    if (want !== here && (want === 'ko' || want === 'en')) {
      var p = new URLSearchParams(location.search); p.set('pick', '1');
      location.replace(FILE[want] + '?' + p.toString().replace(/=(?=&|$)/g, '') + location.hash);
      return;
    }
  }

  // 2) 지금 보던 장과 장 안의 위치
  function spot() {
    var secs = document.querySelectorAll('section.s'), mid = innerHeight * 0.3;
    for (var i = 0; i < secs.length; i++) {
      var r = secs[i].getBoundingClientRect();
      if (r.bottom > mid) return '#' + secs[i].id + ':' + Math.max(0, Math.min(1, (mid - r.top) / r.height)).toFixed(3);
    }
    return '';
  }
  function restore() {
    var m = /^#(k\d+):([\d.]+)$/.exec(location.hash); if (!m) return;
    var s = document.getElementById(m[1]); if (!s) return;
    var y = s.getBoundingClientRect().top + scrollY + s.offsetHeight * +m[2] - innerHeight * 0.3;
    scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  // 3) KO / EN 단추
  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.createElement('nav');
    nav.className = 'lang'; nav.setAttribute('aria-label', here === 'en' ? 'Language' : '언어');
    ['ko', 'en'].forEach(function (l, i) {
      if (i) { var sep = document.createElement('span'); sep.className = 'sep'; sep.textContent = '/'; sep.setAttribute('aria-hidden', 'true'); nav.appendChild(sep); }
      var a = document.createElement('a');
      a.textContent = l.toUpperCase(); a.lang = l; a.href = urlFor(l);
      a.title = l === 'ko' ? '한국어' : 'English';
      if (l === here) a.setAttribute('aria-current', 'true');
      a.addEventListener('click', function (e) {
        save(l);
        if (l === here) { e.preventDefault(); return; }
        e.preventDefault(); location.href = urlFor(l, spot());
      });
      nav.appendChild(a);
    });
    document.body.appendChild(nav);

    // 휴대폰 안내: 폭 900 미만이면 첫 화면에 한 줄. 닫으면 이번 방문 동안 다시 안 뜬다
    var NOTE = 'kana-portfolio-note';
    var closed = false; try { closed = sessionStorage.getItem(NOTE) === '1'; } catch (e) {}
    if (innerWidth < 900 && !closed) {
      var box = document.createElement('div');
      box.className = 'narrow-note'; box.setAttribute('role', 'note');
      var msg = document.createElement('span');
      msg.textContent = here === 'en' ? 'Best viewed on a larger screen' : '큰 화면에서 보면 더 좋아요';
      var x = document.createElement('button');
      x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', here === 'en' ? 'Close' : '닫기');
      x.addEventListener('click', function () { box.remove(); try { sessionStorage.setItem(NOTE, '1'); } catch (e) {} });
      box.appendChild(msg); box.appendChild(x); document.body.appendChild(box);
    }
  });
  addEventListener('load', function () { requestAnimationFrame(function () { requestAnimationFrame(restore); }); });
})();
