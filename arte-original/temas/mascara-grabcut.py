import sys, numpy as np, cv2
from PIL import Image
nome, y0, y1 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
src = f"/home/claude/hud-t20/arte-original/temas/{nome}-moldura.png"
im = np.array(Image.open(src).convert('RGB'))[y0:y1]
h, w = im.shape[:2]
m = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
# provável frente: o retângulo central da HUD
fg = dict(tempestade=(30, 80, 1640, 400), aventureiro=(20, 30, 1650, 400))[nome]
m[fg[1]:fg[3], fg[0]:fg[2]] = cv2.GC_PR_FGD
core = dict(tempestade=(70, 110, 1610, 340), aventureiro=(60, 70, 1600, 350))[nome]
m[core[1]:core[3], core[0]:core[2]] = cv2.GC_FGD
m[:4, :] = cv2.GC_BGD; m[-4:, :] = cv2.GC_BGD
bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
cv2.grabCut(cv2.cvtColor(im, cv2.COLOR_RGB2BGR), m, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
a = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
# mantém só o maior componente
n, lab, st, _ = cv2.connectedComponentsWithStats(a)
big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); a = np.where(lab == big, 255, 0).astype(np.uint8)
a = cv2.morphologyEx(a, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
# preenche buracos
inv = 255 - a; n, lab, st, _ = cv2.connectedComponentsWithStats(inv)
for i in range(1, n):
    x, y, ww, hh, ar = st[i]
    if x > 0 and y > 0 and x + ww < w and y + hh < h: a[lab == i] = 255
a = cv2.GaussianBlur(a, (0, 0), 1.6)
Image.fromarray(a).save(f"/tmp/t/{nome}-alpha.png")
out = np.dstack([im, a])
Image.fromarray(out, 'RGBA').save(f"/tmp/t/{nome}-band-rgba.png")
chk = Image.new('RGBA', (w, h), (40, 200, 60, 255)); chk.alpha_composite(Image.fromarray(out, 'RGBA'))
chk.convert('RGB').save(f"/tmp/t/{nome}-check.jpg", quality=85)
