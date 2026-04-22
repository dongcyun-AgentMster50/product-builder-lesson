"""
Downscale each scenario's depth_1 screenshot to a web-friendly size.
No cropping — the full original layout (3 story rows with image + script)
must remain intact and visible.
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

MAX_WIDTH = 1080  # Downscale to keep file size reasonable while preserving legibility
JPEG_QUALITY = 85


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
        if w > MAX_WIDTH:
            new_w = MAX_WIDTH
            new_h = int(h * MAX_WIDTH / w)
            im = im.resize((new_w, new_h), Image.LANCZOS)
        out_path = OUT / f"scenario_{scenario_no:03d}.jpg"
        im.convert("RGB").save(out_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
        return f"[OK]   {folder_name} -> {out_path.name} (src {w}x{h} -> {im.size[0]}x{im.size[1]})"


if __name__ == "__main__":
    for folder_name, scenario_no in FOLDER_MAP.items():
        print(process(folder_name, scenario_no))
