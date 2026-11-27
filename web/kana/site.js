/* 카나 판매·정책 페이지 공통. 바꿀 값은 여기 KANA 한 곳뿐 */
const KANA = {
  BUY_URL: 'https://buy.polar.sh/polar_cl_nJqAJnexhrIO4zSXpmHUu9UHBG79uT67iyAqO4Axqsh',        // Polar 체크아웃 링크. 비면 「사기」 단추가 「곧 열려요」로 바뀐다
  CONTACT_EMAIL: 'kwoncj1025@gmail.com',  // 문의 메일. 비면 「곧 적어 둘게요」
  DISCOUNT_CODE: '',  // 출시 할인 코드(LAUNCH)는 체크아웃 링크에 이미 걸려 있어 비워 둔다(비면 줄이 숨는다)
};

(() => {
  const root = document.documentElement;
  /* 언어: 주소 ?lang= > 고른 적 있는 값 > 브라우저 언어 */
  const q = new URLSearchParams(location.search).get('lang');
  let saved = null;
  try { saved = localStorage.getItem('kana-lang'); } catch (e) {}
  const guess = (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  const pick = l => (l === 'ko' || l === 'en' ? l : null);

  function setLang(l, remember) {
    root.dataset.lang = l; root.lang = l;
    const t = document.querySelector(`meta[name="title-${l}"]`); if (t) document.title = t.content;
    const d = document.querySelector('meta[name="description"]'), dl = document.querySelector(`meta[name="description-${l}"]`);
    if (d && dl) d.content = dl.content;
    document.querySelectorAll('[data-setlang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setlang === l)));
    document.querySelectorAll('a[data-keeplang]').forEach(a => { const u = new URL(a.getAttribute('href'), location.href); u.searchParams.set('lang', l); a.href = u.pathname.split('/').pop() + u.search + u.hash; });
    if (remember) {
      try { localStorage.setItem('kana-lang', l); } catch (e) {}
      const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u);
    }
  }
  /* 정적 한 언어 페이지(ko.html·en.html, seo/seo.py 가 만듦)는 그 언어로 고정, 언어 단추는 다른 쪽 파일로 간다 */
  const fixed = pick(root.dataset.static);
  setLang(fixed || pick(q) || pick(saved) || guess, false);
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-setlang]'); if (!b) return;
    const l = b.dataset.setlang;
    if (fixed && l !== fixed) { try { localStorage.setItem('kana-lang', l); } catch (err) {} location.href = l + '.html' + location.hash; return; }
    setLang(l, true);
  });

  /* 사기 단추 */
  document.querySelectorAll('[data-buy]').forEach(a => {
    if (KANA.BUY_URL) { a.href = KANA.BUY_URL; a.rel = 'noopener'; return; }
    a.classList.add('soon'); a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true');
    a.innerHTML = '<span lang="ko">곧 열려요</span><span lang="en">Opening soon</span>';
  });
  /* 할인 코드 줄 */
  document.querySelectorAll('[data-code]').forEach(el => { if (KANA.DISCOUNT_CODE) el.querySelectorAll('b.code').forEach(b => b.textContent = KANA.DISCOUNT_CODE); else el.hidden = true; });
  /* 문의 메일 */
  document.querySelectorAll('[data-mail]').forEach(el => {
    if (KANA.CONTACT_EMAIL) { const a = document.createElement('a'); a.href = 'mailto:' + KANA.CONTACT_EMAIL; a.textContent = KANA.CONTACT_EMAIL; el.replaceChildren(a); }
    else el.innerHTML = '<span lang="ko">(문의 메일은 곧 적어 둘게요)</span><span lang="en">(contact email coming soon)</span>';
  });
})();
