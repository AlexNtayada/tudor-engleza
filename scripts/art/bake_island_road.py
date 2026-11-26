"""Paint the level road into the Castelul island picture (same look as the painted roads:
light sand with a thin brown edge). Usage: python3 bake_island_road.py <island.png> <out.png>
The road points are in island-road.json, in 2048x1152 picture pixels, one list per level."""
import json, sys, os
from PIL import Image, ImageDraw, ImageFilter

S = 3  # draw bigger, then shrink, for smooth edges


def smooth(pts, steps=16):
    out = []
    for i in range(len(pts) - 1):
        p0, p1, p2 = pts[max(0, i - 1)], pts[i], pts[i + 1]
        p3 = pts[min(len(pts) - 1, i + 2)]
        for t in range(steps):
            t /= steps
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2
                                    + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in (0, 1)))
    out.append(tuple(pts[-1]))
    return out


src, dst = sys.argv[1], sys.argv[2]
road = json.load(open(os.path.join(os.path.dirname(__file__), 'island-road.json')))
im = Image.open(src).convert('RGB')
W, H = im.size
layer = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
d = ImageDraw.Draw(layer)
lines = [[(x * S, y * S) for x, y in smooth(seg)] for seg in road]
for pts in lines:  # brown edge under everything
    d.line(pts, fill=(150, 118, 74, 255), width=26 * S, joint='curve')
    for x, y in (pts[0], pts[-1]):
        d.ellipse([x - 13 * S, y - 13 * S, x + 13 * S, y + 13 * S], fill=(150, 118, 74, 255))
for pts in lines:  # sand on top
    d.line(pts, fill=(249, 224, 178, 255), width=20 * S, joint='curve')
    for x, y in (pts[0], pts[-1]):
        d.ellipse([x - 10 * S, y - 10 * S, x + 10 * S, y + 10 * S], fill=(249, 224, 178, 255))
layer = layer.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.4))
out = im.convert('RGBA')
out.alpha_composite(layer)
out.convert('RGB').save(dst)
