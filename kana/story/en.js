/* 영어판(index.en.html)만: 영어 글은 한국어보다 길이가 달라, 오른쪽이나 가운데에 붙어 있던 글을 그 자리에 다시 맞춘다.
   Figma 「A 최종 EN」에서 한 규칙과 같다: 가운데 정렬은 가운데를, 오른쪽 절반에서 오른쪽 끝에 붙은 글은 오른쪽 끝을 지킨다 */
(() => {
  const go = () => {
    document.querySelectorAll('.art .t[data-ow]').forEach(t => {
      const ow = +t.dataset.ow, x = parseFloat(t.style.left), w = t.offsetWidth, P = t.parentElement.offsetWidth || 1920;
      if (!w || isNaN(x) || Math.abs(w - ow) < 1) return;
      if (t.style.textAlign === 'center') t.style.left = (x + ow / 2 - w / 2) + 'px';
      else if (t.style.textAlign === 'right' || (P >= 600 && x > P * .5 && w > ow && x + ow > P - 80)
               || (x > P * .4 && Math.abs(x + ow - P) <= 2)) t.style.left = (x + ow - w) + 'px';  // 유리 표 값 칸처럼 줄 오른쪽 끝에 붙은 글(줄 폭이 600 아래여도)
    });
    /* 글이 길어져 틀(말풍선·표·태그) 밖으로 나가면 틀을 넓힌다. 따옴 줄(data-anchor=r)은 오른쪽 끝을 지키고 왼쪽으로 넓힌다 */
    document.querySelectorAll('.art .f').forEach(f => {
      const ts = [...f.children].filter(c => c.classList.contains('t'));
      if (!ts.length) return;
      const pad = Math.min(...ts.map(t => t.offsetLeft));
      const need = Math.max(...ts.map(t => t.offsetLeft + t.offsetWidth)) + pad;
      const w = f.offsetWidth;
      if (need <= w + 1) return;
      f.style.width = need + 'px';
      ts.forEach(t => { if (t.style.textAlign === 'right') t.style.left = (parseFloat(t.style.left) + need - w) + 'px'; });
      if (f.dataset.anchor === 'r' && f.style.right === '') f.style.left = (parseFloat(f.style.left) - (need - w)) + 'px';
    });
  };
  document.fonts ? document.fonts.ready.then(go) : go();
})();
