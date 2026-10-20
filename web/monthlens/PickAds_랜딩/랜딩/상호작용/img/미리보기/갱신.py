#!/usr/bin/env python3
"""사이트 미리보기 목록 갱신 — 폴더의 미리보기_NN.jpg 를 훑어 목록.json 을 만들고, 목록.md 표에 없는 번호는 빈 줄로 덧붙인다.

사용법
  python3 갱신.py            폴더를 다시 읽어 목록.json 재생성 + 목록.md 빈 줄 보강
  python3 갱신.py --dry-run  변경 없이 결과만 출력

목록.json: [{file, n, type, tone, w, h}]
  type: 목록.md 표의 「업종」 열에서 낱말로 판정(외식·호스피탈리티·카페·호텔·식당 → franchise / 스튜디오·브랜드·디자인·브랜딩 → brand / SaaS·스타트업·서비스·AI·도구 → startup / 글로벌·포트폴리오·에이전시 → global).
        표에 없거나 판정이 안 되면 번호 범위(01~03 franchise · 04~06 brand · 07~09 startup · 10~12 global, 13 이상은 (n-1)%4 순환)로 정한다.
        유형.json({"13":"startup"} 꼴)이 있으면 그 값이 가장 우선.
  tone: 목록.md 표에 「톤」 열이 있으면 그 값, 없으면 ''.
페이지는 이 json 을 no-store 로 fetch 해 유형 안에서 무작위 한 장을 고르고, 실패하면 12장 폴백.
"""
import json, re, subprocess, sys, unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
MD, JS, OV = HERE / '목록.md', HERE / '목록.json', HERE / '유형.json'
NUM = re.compile(r'^미리보기_(\d{2,})\.jpg$')
KW = [('franchise', ['외식', '호스피탈리티', '카페', '호텔', '식당', '레스토랑', '프랜차이즈']),
      ('brand', ['스튜디오', '브랜드', '디자인', '브랜딩', '매장', '숍']),
      ('startup', ['saas', '스타트업', '서비스', 'ai', '도구', '앱']),
      ('global', ['글로벌', '포트폴리오', '에이전시', '해외'])]
RANGE = ['franchise', 'brand', 'startup', 'global']
nfc = lambda s: unicodedata.normalize('NFC', s)


def size_of(p):
    r = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(p)], capture_output=True, text=True)
    w = h = 0
    for line in r.stdout.splitlines():
        if 'pixelWidth' in line: w = int(line.split()[-1])
        if 'pixelHeight' in line: h = int(line.split()[-1])
    return w, h


def read_md():
    """목록.md 표 → {번호: {'업종':..., '톤':...}} 와 (헤더 열 목록, 표 마지막 줄 인덱스, 전체 줄)"""
    if not MD.exists():
        return {}, [], -1, []
    lines = MD.read_text(encoding='utf-8').split('\n')
    head, rows, last = None, {}, -1
    for i, l in enumerate(lines):
        if not l.startswith('|'):
            if head is not None and last >= 0: break
            continue
        cells = [c.strip() for c in l.strip().strip('|').split('|')]
        if head is None:
            head = cells; continue
        if all(set(c) <= set('-: ') for c in cells): continue
        last = i
        m = re.match(r'^(\d+)$', cells[0])
        if m and len(cells) == len(head):
            rows[int(m.group(1))] = dict(zip(head, cells))
    return rows, head or [], last, lines


def type_of(n, row, ov):
    if str(n) in ov and ov[str(n)] in RANGE: return ov[str(n)]
    text = (row.get('업종', '') + ' ' + row.get('템플릿', '')).lower() if row else ''
    for t, kws in KW:
        if any(k.lower() in text for k in kws): return t
    return RANGE[(n - 1) % 4] if n > 12 else RANGE[(n - 1) // 3]


def main():
    dry = '--dry-run' in sys.argv
    ov = json.loads(OV.read_text(encoding='utf-8')) if OV.exists() else {}
    rows, head, last, lines = read_md()
    files = sorted((int(NUM.match(nfc(p.name)).group(1)), nfc(p.name)) for p in HERE.iterdir() if NUM.match(nfc(p.name)))
    out = []
    for n, name in files:
        row = rows.get(n, {})
        w, h = size_of(HERE / name)
        out.append({'file': name, 'n': n, 'type': type_of(n, row, ov), 'tone': row.get('톤', ''), 'w': w, 'h': h})
    cnt = {t: sum(o['type'] == t for o in out) for t in RANGE}
    missing = [n for n, _ in files if n not in rows]
    if dry:
        print(f'[dry-run] 목록.json {len(out)}장 {cnt}; 목록.md 에 없는 번호 {missing}')
        return
    JS.write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
    if missing and head and last >= 0:
        add = ['| ' + ' | '.join([f'{n:02d}'] + [''] * (len(head) - 1)) + ' |' for n in missing]
        lines[last + 1:last + 1] = add
        MD.write_text('\n'.join(lines), encoding='utf-8')
    print(f'목록.json 재생성: {len(out)}장 {cnt}; 목록.md 빈 줄 추가 {len(missing)}')


if __name__ == '__main__':
    main()
