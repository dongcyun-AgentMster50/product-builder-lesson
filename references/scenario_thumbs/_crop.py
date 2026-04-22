"""
Crop the first lifestyle thumbnail from each scenario's depth_1 screenshot.
Maps folder name -> scenario_XXX.jpg.
"""
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
RAW = ROOT / "_raw"
OUT = ROOT
OUT.mkdir(exist_ok=True)

# Folder name -> scenario number
FOLDER_MAP = {
    "1": 1, "2_": 2, "3": 3, "4 (1)": 4, "5_": 5,
    "6": 6, "7": 7, "8_": 8, "9": 9, "10": 10,
    "11": 11, "12": 12, "13": 13, "14": 14, "15": 15,
    "16": 16, "17": 17, "18": 18, "19": 19, "20": 20,
    "21": 21, "22": 22, "23": 23, "24": 24, "25": 25,
    "26ai": 26, "27": 27,
}

# depth_1 layout is a 2184px-wide tablet capture with a roughly fixed-height
# header (title + meta + desc + device icons ≈ 540-600px).
# First lifestyle image occupies a fixed pixel band from the top, NOT a ratio.
# x is ratio-based (story card spans ~5% to ~50% of width).
CROP_X = (0.065, 0.475)                # ratio of image width (narrower to avoid right-side text)
CROP_Y_PX_AT_W2184 = (640, 1400)       # pixel band at 2184px-wide reference
# For images at a different width, scale y pixel band proportionally.
REF_W = 2184

# Output thumbnail size (2x for retina, aspect ~16:10)
THUMB_W, THUMB_H = 1200, 750


def first_image(folder: Path) -> Path | None:
    """Pick the numerically smallest .jpg file (the depth_1 full screenshot)."""
    jpgs = sorted(folder.glob("*.jpg"), key=lambda p: int(re.sub(r"\D", "", p.stem) or 0))
    return jpgs[0] if jpgs else None


def process(folder_name: str, scenario_no: int) -> str:
    folder = RAW / folder_name
    src = first_image(folder)
    if not src:
        return f"[SKIP] {folder_name}: no image"
    with Image.open(src) as im:
        w, h = im.size
        # Scale pixel band by image width (2184 reference)
        scale_y = w / REF_W
        y0 = int(CROP_Y_PX_AT_W2184[0] * scale_y)
        y1 = int(CROP_Y_PX_AT_W2184[1] * scale_y)
        # Clamp to image height
        y1 = min(y1, h - 1)
        box = (
            int(w * CROP_X[0]),
            y0,
            int(w * CROP_X[1]),
            y1,
        )
        cropped = im.crop(box)
        # Fit into THUMB_W x THUMB_H preserving aspect (cover)
        tw, th = THUMB_W, THUMB_H
        cw, ch = cropped.size
        scale = max(tw / cw, th / ch)
        new_size = (int(cw * scale), int(ch * scale))
        resized = cropped.resize(new_size, Image.LANCZOS)
        # Center crop to final size
        left = (new_size[0] - tw) // 2
        top = (new_size[1] - th) // 2
        final = resized.crop((left, top, left + tw, top + th))
        out_path = OUT / f"scenario_{scenario_no:03d}.jpg"
        final.convert("RGB").save(out_path, "JPEG", quality=86, optimize=True)
        return f"[OK]   {folder_name} -> {out_path.name} (from {src.name}, src {w}x{h})"


if __name__ == "__main__":
    for folder_name, scenario_no in FOLDER_MAP.items():
        print(process(folder_name, scenario_no))
