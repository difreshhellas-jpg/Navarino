"""Key the hand-lettered «Ναυαρίνο» out of its watercolour paper (logo-art/113).

The output is the client's real strokes as an alpha mask in their own grey:
nothing is redrawn or retouched. The threshold comes from the paper's own
grain, measured at the crop border, so only lettering survives.

    python scripts/wordmark_key.py   ->  public/brand/wordmark-key.png
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / "assets/raw/navarino-facebook/logo-art/113.jpg").convert("RGB").crop((110, 60, 1020, 310))
a = np.asarray(src).astype(float)
lum = a @ [0.299, 0.587, 0.114]
border = np.concatenate([lum[:10].ravel(), lum[-10:].ravel(), lum[:, :10].ravel(), lum[:, -10:].ravel()])
ground, noise = np.median(border), border.std()
ink = np.percentile(lum, 1.0)
# The paper is a gradient, so compare each pixel with its local paper level.
bg = np.asarray(src.convert("L").filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(25))).astype(float)
alpha = np.clip((bg - lum - 3.5 * noise) / (ground - ink - 3.5 * noise), 0, 1) ** 0.9
col = a[alpha > 0.8].mean(0)
out = np.dstack([np.broadcast_to(col, a.shape), alpha * 255]).astype(np.uint8)
Image.fromarray(out, "RGBA").save(ROOT / "public/brand/wordmark-key.png", optimize=True)
print("public/brand/wordmark-key.png")
