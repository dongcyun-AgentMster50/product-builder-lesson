"""
Per-story auto-crop for SmartThings scenario screenshots.

Each scenario_NNN.jpg (already downscaled to 1080px wide by _crop.py) is split
into N story sections by detecting the story image-thumbnail blocks on the
left column and the white separator bands between them. Output goes to
references/scenario_thumbs/per_story/scenario_NNN_story_M.jpg.

Algorithm
---------
1. Find "image blocks" — vertical runs where the left ~6%~38% of width has
   substantial dark content (>15% pixels < 200). These mark each story's
   thumbnail. Min run length 50 px to filter noise.
2. Find "white gaps" — vertical runs where ≥98% of pixels in the row are
   bright (≥230). Min run length 25 px.
3. Merge image blocks: if more than expected_stories detected (icon-style
   images can split), iteratively merge the pair separated by the smallest
   gap until count matches expected.
4. Derive N+1 boundary y-coordinates:
   - top: latest gap before first image
   - between i and i+1: latest gap between image[i].bottom and image[i+1].top
     (handles Type B layouts where CTA button sits below the image)
   - bottom: first gap after last image
5. Crop each story between consecutive boundaries.

If detected blocks < expected_stories, the scenario is skipped and reported
as needing manual review.
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).parent
SRC_DIR = ROOT
OUT_DIR = ROOT / "per_story"
DB_DIR = ROOT.parent.parent / "scenarios" / "db"

JPEG_QUALITY = 85
DARK_THR = 200
DARK_PCT_THR = 15
BLOCK_MIN_LEN = 50
LEFT_X0_FRAC = 0.06
LEFT_X1_FRAC = 0.38
BRIGHT_THR = 230
WHITE_PCT_THR = 98
GAP_MIN_LEN = 25


def detect_image_blocks(arr: np.ndarray) -> list[list[int]]:
    h, w = arr.shape
    L0, L1 = int(w * LEFT_X0_FRAC), int(w * LEFT_X1_FRAC)
    left = arr[:, L0:L1]
    dark_pct = (left < DARK_THR).mean(axis=1) * 100
    is_image = dark_pct > DARK_PCT_THR
    runs: list[list[int]] = []
    i = 0
    while i < h:
        if is_image[i]:
            j = i
            while j < h and is_image[j]:
                j += 1
            if j - i >= BLOCK_MIN_LEN:
                runs.append([i, j - 1])
            i = j
        else:
            i += 1
    return runs


def find_white_gaps(arr: np.ndarray) -> list[tuple[int, int]]:
    h, _ = arr.shape
    bright_pct = (arr >= BRIGHT_THR).mean(axis=1) * 100
    is_white = bright_pct >= WHITE_PCT_THR
    runs: list[tuple[int, int]] = []
    i = 0
    while i < h:
        if is_white[i]:
            j = i
            while j < h and is_white[j]:
                j += 1
            if j - i >= GAP_MIN_LEN:
                runs.append((i, j - 1))
            i = j
        else:
            i += 1
    return runs


def merge_blocks(blocks: list[list[int]], target: int) -> list[list[int]]:
    blocks = [list(b) for b in blocks]
    while len(blocks) > target:
        gaps = [(blocks[i + 1][0] - blocks[i][1], i) for i in range(len(blocks) - 1)]
        gaps.sort()
        _, idx = gaps[0]
        blocks[idx] = [blocks[idx][0], blocks[idx + 1][1]]
        del blocks[idx + 1]
    return blocks


def derive_boundaries(blocks: list[list[int]], gaps: list[tuple[int, int]], h: int) -> list[int]:
    n = len(blocks)
    bounds: list[int] = []
    cands = [g for g in gaps if g[1] <= blocks[0][0]]
    if cands:
        g = cands[-1]
        bounds.append((g[0] + g[1]) // 2)
    else:
        bounds.append(max(0, blocks[0][0] - 20))
    for i in range(1, n):
        lo, hi = blocks[i - 1][1], blocks[i][0]
        cands = [g for g in gaps if g[0] >= lo and g[1] <= hi]
        if cands:
            g = cands[-1]
            bounds.append((g[0] + g[1]) // 2)
        else:
            bounds.append((lo + hi) // 2)
    cands = [g for g in gaps if g[0] >= blocks[n - 1][1]]
    if cands:
        g = cands[0]
        bounds.append((g[0] + g[1]) // 2)
    else:
        bounds.append(min(h - 1, blocks[n - 1][1] + 30))
    return bounds


def expected_stories(scenario_no: int) -> int | None:
    f = DB_DIR / f"scenario_{scenario_no:03d}.json"
    if not f.exists():
        return None
    data = json.loads(f.read_text(encoding="utf-8"))
    s = data["scenarios"][0] if "scenarios" in data else data
    return len(s.get("depth_1", {}).get("stories", []))


def process_scenario(scenario_no: int) -> dict:
    src = SRC_DIR / f"scenario_{scenario_no:03d}.jpg"
    if not src.exists():
        return {"no": scenario_no, "status": "skip-no-src"}
    expected = expected_stories(scenario_no)
    if expected is None:
        return {"no": scenario_no, "status": "skip-no-db"}

    with Image.open(src) as im_color:
        gray = np.asarray(im_color.convert("L"), dtype=np.uint8)
        h, w = gray.shape
        blocks = detect_image_blocks(gray)
        gaps = find_white_gaps(gray)
        if len(blocks) < expected:
            return {
                "no": scenario_no,
                "status": "fail",
                "expected": expected,
                "found_blocks": len(blocks),
                "raw_blocks": blocks,
            }
        merged = merge_blocks(blocks, expected)
        bounds = derive_boundaries(merged, gaps, h)
        outputs: list[str] = []
        for i in range(expected):
            t, b = bounds[i], bounds[i + 1]
            crop = im_color.crop((0, t, w, b + 1))
            out_path = OUT_DIR / f"scenario_{scenario_no:03d}_story_{i + 1}.jpg"
            crop.convert("RGB").save(out_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
            outputs.append(out_path.name)
        return {
            "no": scenario_no,
            "status": "ok",
            "expected": expected,
            "raw_blocks": len(blocks),
            "merged": merged,
            "bounds": bounds,
            "outputs": outputs,
        }


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    for f in OUT_DIR.glob("*.jpg"):
        f.unlink()

    results: list[dict] = []
    for n in range(1, 28):
        r = process_scenario(n)
        results.append(r)
        if r["status"] == "ok":
            print(f"[OK]   scenario_{n:03d} expected={r['expected']} raw={r['raw_blocks']} -> {len(r['outputs'])} crops")
        elif r["status"] == "fail":
            print(f"[FAIL] scenario_{n:03d} expected={r['expected']} found_blocks={r['found_blocks']}")
        else:
            print(f"[SKIP] scenario_{n:03d} ({r['status']})")

    ok = [r for r in results if r["status"] == "ok"]
    fail = [r for r in results if r["status"] == "fail"]
    skip = [r for r in results if r["status"].startswith("skip")]
    total_stories = sum(r["expected"] for r in ok)

    print("\n" + "=" * 60)
    print(f"Auto success: {len(ok)}/27 scenarios ({total_stories} stories cropped)")
    if fail:
        print(f"Manual review needed: {len(fail)} scenarios")
        for r in fail:
            print(f"  scenario_{r['no']:03d}: expected {r['expected']} blocks, found {r['found_blocks']}")
    if skip:
        print(f"Skipped: {len(skip)}")
        for r in skip:
            print(f"  scenario_{r['no']:03d}: {r['status']}")


if __name__ == "__main__":
    main()
