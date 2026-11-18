import numpy as np, cv2
from PIL import Image
y0, y1 = 470, 930
im = np.array(Image.open("/home/claude/hud-t20/arte-original/temas/tempestade-moldura.png").convert('RGB'))[y0:y1]
f = im.astype(float); R, G, B = f[..., 0], f[..., 1], f[..., 2]
h, w = R.shape
a = np.clip(np.maximum((G - 21) / 14, (R - 118) / 75), 0, 1)
gc = np.array(Image.open("/tmp/t/tempestade-alpha.png")).astype(float) / 255
m = np.maximum(a, gc)
bin_ = (m > 0.2).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(bin_, connectivity=8)
areas = st[1:, cv2.CC_STAT_AREA]
print('comps', n, sorted(areas)[-5:])
keep = np.isin(lab, 1 + np.where(areas > 3000)[0]).astype(np.uint8)
reg = cv2.dilate(keep, np.ones((7, 7), np.uint8))
# contornos escuros das garras (sky nunca fica tão escuro)
dark = ((R < 40) & (reg > 0)).astype(float)
alpha = np.maximum(m * reg, dark)
# fecha furinhos pequenos dentro das garras
solid = cv2.morphologyEx((alpha > 0.5).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)).astype(float)
alpha = np.maximum(alpha, cv2.GaussianBlur(solid, (0, 0), 1.2))
ends = np.zeros((h, w), np.uint8); ends[:, :175] = 1; ends[:, 1495:] = 1
sb = (alpha > 0.45).astype(np.uint8)
cl = cv2.morphologyEx(sb, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (23, 23)))
inv = 1 - cl; n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv)
for i in range(1, n2):
    x, y, ww, hh, ar = st2[i]
    if ar < 2500: cl[lab2 == i] = 1
cl = cv2.GaussianBlur((cl * ends).astype(float), (0, 0), 1.5)
alpha = np.maximum(alpha, cl)
pol = np.array([(152,12),(120,30),(70,50),(30,80),(8,120),(0,170),(0,330),(12,370),(45,400),(92,440),(102,425),(95,385),(70,362),(62,300),(62,120),(90,98),(140,84),(212,86),(216,74),(172,60),(150,38)], np.int32)
pm = np.zeros((h, w), np.uint8); cv2.fillPoly(pm, [pol], 1)
alpha = np.maximum(alpha, cv2.GaussianBlur(pm.astype(float), (0, 0), 1.5))
ramp = np.ones(h); ramp[:12] = np.linspace(0, 1, 12); ramp[-12:] = np.linspace(1, 0, 12)
alpha = np.clip(alpha, 0, 1) * ramp[:, None]
A = (alpha * 255).astype(np.uint8)
Image.fromarray(A).save("/tmp/t/tempestade-alpha2.png")
out = Image.fromarray(np.dstack([im, A]), 'RGBA'); out.save("/tmp/t/tempestade-band-rgba.png")
c = Image.new('RGBA', (w, h), (70, 80, 90, 255)); c.alpha_composite(out); c.convert('RGB').save("/tmp/t/tempestade-check-cinza.jpg", quality=85)
