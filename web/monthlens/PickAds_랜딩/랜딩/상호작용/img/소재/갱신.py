#!/usr/bin/env python3
"""소재 풀 갱신 — 새 사진을 소재_NN.jpg 로 넣고 목록.json 을 다시 만든다.

사용법
  python3 갱신.py <파일 또는 폴더>... [--mmin N] [--dry-run]
    파일: avif · heic · png · jpg · jpeg · webp
    폴더: 안의 위 확장자 파일 전부, --mmin N 이면 최근 N분 안에 바뀐 파일만
    --dry-run: 변환·저장·목록 재생성 없이 무엇이 추가될지 출력만

동작
  - sips 로(실패하면 ffmpeg) jpg 긴 변 1600 · 품질 88 로 변환, 원본은 손대지 않음
  - 번호는 지금 폴더의 가장 큰 소재_NN 다음부터(기존 파일을 덮어쓰지 않음)
  - 같은 원본(경로 + 크기 + 수정 시각)은 추가기록.json 에 기록해 두 번 넣지 않음
  - 끝에 폴더 전체를 훑어 목록.json([{file,w,h,ratio,portrait}], portrait = ratio<=0.85, 파일명 NFC) 재생성
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile, time, unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
EXT = {'.avif', '.heic', '.heif', '.png', '.jpg', '.jpeg', '.webp'}
LOG = HERE / '추가기록.json'
LIST = HERE / '목록.json'
NUM = re.compile(r'^소재_(\d{2,})\.jpg$')


def nfc(s):
    return unicodedata.normalize('NFC', s)


def gather(args, mmin):
    out = []
    cutoff = time.time() - mmin * 60 if mmin else None
    for a in args:
        p = Path(a).expanduser()
        if p.is_dir():
            files = sorted(x for x in p.iterdir() if x.is_file() and x.suffix.lower() in EXT)
            if cutoff is not None:
                files = [x for x in files if x.stat().st_mtime >= cutoff]
            out += files
        elif p.is_file() and p.suffix.lower() in EXT:
            out.append(p)
        else:
            print(f'건너뜀(지원 안 함): {p}', file=sys.stderr)
    return out


def key_of(p):
    st = p.stat()
    return f'{p.resolve()}|{st.st_size}|{int(st.st_mtime)}'


def next_num():
    nums = [int(NUM.match(nfc(x.name)).group(1)) for x in HERE.iterdir() if NUM.match(nfc(x.name))]
    return (max(nums) if nums else 0) + 1


def size_of(p):
    r = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(p)], capture_output=True, text=True)
    w = h = None
    for line in r.stdout.splitlines():
        if 'pixelWidth' in line:
            w = int(line.split()[-1])
        if 'pixelHeight' in line:
            h = int(line.split()[-1])
    if not (w and h):
        r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', str(p)], capture_output=True, text=True)
        try:
            w, h = (int(x) for x in r.stdout.strip().split(',')[:2])
        except Exception:
            return None
    return w, h


def convert(src, dst):
    # 1) sips: 긴 변 1600, jpeg q88
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td) / 'out.jpg'
        r = subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '88', '-Z', '1600', str(src), '--out', str(tmp)], capture_output=True, text=True)
        if r.returncode == 0 and tmp.exists() and tmp.stat().st_size > 0:
            shutil.move(str(tmp), str(dst))
            return 'sips'
        # 2) ffmpeg: 긴 변 1600(확대 없음), q 3 ≈ 88
        r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-vf', "scale='if(gt(iw,ih),min(1600,iw),-2)':'if(gt(iw,ih),-2,min(1600,ih))'", '-q:v', '3', str(tmp)], capture_output=True, text=True)
        if r.returncode == 0 and tmp.exists() and tmp.stat().st_size > 0:
            shutil.move(str(tmp), str(dst))
            return 'ffmpeg'
    raise RuntimeError(f'변환 실패: {src}\n{r.stderr.strip()}')


def rebuild_list(dry):
    rows = []
    for x in sorted(HERE.iterdir(), key=lambda p: nfc(p.name)):
        name = nfc(x.name)
        if not NUM.match(name):
            continue
        wh = size_of(x)
        if not wh:
            print(f'크기 못 읽음: {name}', file=sys.stderr)
            continue
        w, h = wh
        ratio = round(w / h, 3)
        rows.append({'file': name, 'w': w, 'h': h, 'ratio': ratio, 'portrait': ratio <= 0.85})
    if dry:
        print(f'[dry-run] 목록.json 재생성 예정: {len(rows)}장(세로 {sum(r["portrait"] for r in rows)})')
    else:
        LIST.write_text(json.dumps(rows, ensure_ascii=False), encoding='utf-8')
        print(f'목록.json 재생성: {len(rows)}장(세로 {sum(r["portrait"] for r in rows)})')
    return rows


def main():
    ap = argparse.ArgumentParser(description='소재 풀 갱신')
    ap.add_argument('paths', nargs='*', help='파일 또는 폴더')
    ap.add_argument('--mmin', type=int, default=None, help='폴더일 때 최근 N분 파일만')
    ap.add_argument('--dry-run', action='store_true', help='변경 없이 계획만 출력')
    a = ap.parse_args()

    log = json.loads(LOG.read_text(encoding='utf-8')) if LOG.exists() else {}
    srcs = gather(a.paths, a.mmin)
    n = next_num()
    added = 0
    for src in srcs:
        k = key_of(src)
        if k in log:
            print(f'이미 있음({log[k]}): {src.name}')
            continue
        dst = HERE / f'소재_{n:02d}.jpg'
        if dst.exists():  # 번호 충돌은 없어야 하지만, 있으면 절대 덮어쓰지 않는다
            print(f'건너뜀(이미 존재): {dst.name}', file=sys.stderr)
            n += 1
            continue
        if a.dry_run:
            print(f'[dry-run] {src} → {dst.name}')
        else:
            how = convert(src, dst)
            log[k] = dst.name
            print(f'{src.name} → {dst.name} ({how})')
        n += 1
        added += 1
    if not a.dry_run and added:
        LOG.write_text(json.dumps(log, ensure_ascii=False, indent=0), encoding='utf-8')
    rebuild_list(a.dry_run)
    print(f'추가 {added}장, 다음 번호 {n:02d}')


if __name__ == '__main__':
    main()
