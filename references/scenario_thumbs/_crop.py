"""
Crop each scenario's depth_1 screenshot to the LEFT illustration column only.
The right side of the original screenshot contains story scripts/CTA buttons,
which we now render as HTML text from the JSON DB to avoid duplication.

Output: vertical strip showing the 3 stacked illustration squares.
"""
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
RAW = ROOT / "_raw"
OUT = ROOT
OUT.mkdir(exist_ok=True)

FOLDER_MAP = {
    "1": 1, "2_": 2, "3": 3, "4 (1)": 4, "5_": 5,
    "6": 6, "7": 7, "8_": 8, "9": 9, "10": 10,
    "11": 11, "12": 12, "13": 13, "14": 14, "15": 15,
    "16": 16, "17": 17, "18": 18, "19": 19, "20": 20,
    "21": 21, "22": 22, "23": 23, "24": 24, "25": 25,
    "26ai": 26, "27": 27,
}

# Crop ratio: keep only the LEFT 42% of the original width.
# Samsung SmartThings app layout: illustration column ~38% + small padding.
LEFT_CROP_RATIO = 0.42

# Only crop horizontally if source is wider than this — single-column screenshots
# (already narrow, e.g. scenario_004 at 1092px) keep their full width.
MIN_WIDTH_FOR_CROP = 1500

# Output width (after downscaling) for the cropped strip.
TARGET_WIDTH = 480
JPEG_QUALITY = 85


def first_image(folder: Path) -> Path | None:
    jpgs = sorted(folder.glob("*.jpg"), key=lambda p: int(re.sub(r"\D", "", p.stem) or 0))
    return jpgs[0] if jpgs else None


def process(folder_name: str, scenario_no: int) -> str:
    folder = RAW / folder_name
    src = first_image(folder)
    if not src:
        return f"[SKIP] {folder_name}: no image"
    with Image.open(src) as im:
        w, h = im.size
        if w >= MIN_WIDTH_FOR_CROP:
            crop_w = int(w * LEFT_CROP_RATIO)
            im = im.crop((0, 0, crop_w, h))
        cw, ch = im.size
        if cw > TARGET_WIDTH:
            new_h = int(ch * TARGET_WIDTH / cw)
            im = im.resize((TARGET_WIDTH, new_h), Image.LANCZOS)
        out_path = OUT / f"scenario_{scenario_no:03d}.jpg"
        im.convert("RGB").save(out_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
        return f"[OK]   {folder_name} -> {out_path.name} (src {w}x{h} -> crop {cw}x{ch} -> out {im.size[0]}x{im.size[1]})"


if __name__ == "__main__":
    for folder_name, scenario_no in FOLDER_MAP.items():
        print(process(folder_name, scenario_no))
