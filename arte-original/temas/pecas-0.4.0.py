import numpy as np, os
from PIL import Image
T = "/home/claude/hud-t20/arte-original/temas"
def chave(path):
    src = np.array(Image.open(path).convert('RGB')).astype(float)
    r, g, b = src[..., 0], src[..., 1], src[..., 2]
    d = g - np.maximum(r, b)
    a = np.clip((90 - d) / 50, 0, 1)
    g2 = np.minimum(g, np.maximum(r, b) + 10)
    return Image.fromarray(np.dstack([r, g2, b, a * 255]).astype(np.uint8), 'RGBA')
os.makedirs('/tmp/t/p', exist_ok=True)
tp = chave(f"{T}/tempestade-pecas-verde.png"); av = chave(f"{T}/aventureiro-pecas-verde.png")
tp.crop((60, 75, 822, 175)).save('/tmp/t/p/tp-barra-pv.png'); tp.crop((848, 75, 1610, 175)).save('/tmp/t/p/tp-barra-pm.png')
av.crop((110, 35, 1340, 170)).save('/tmp/t/p/av-barra-pv.png'); av.crop((110, 205, 1340, 340)).save('/tmp/t/p/av-barra-pm.png')

A = "/home/claude/hud-t20/assets/temas"
for n in ("tempestade", "aventureiro"): os.makedirs(f"{A}/{n}", exist_ok=True)
def salvar(img, path, maxlado=None):
    if img.mode == 'RGBA':
        bb = img.getbbox(); img = img.crop(bb)
    if maxlado: img.thumbnail((maxlado, maxlado), Image.LANCZOS)
    img.save(path, 'WEBP', quality=86, method=6); return img.size
# Tempestade (folha 1672×941)
tpc = {'ic-coracao': (90, 235, 322, 442), 'ic-gota': (380, 230, 540, 442), 'ic-defesa': (615, 230, 805, 442),
       'ic-desloc': (845, 230, 1075, 435), 'ic-iniciativa': (1140, 230, 1290, 442), 'ic-cd': (1355, 230, 1575, 438),
       'acao-padrao': (170, 480, 555, 870), 'acao-reacao': (640, 480, 1030, 870), 'acao-movimento': (1110, 480, 1500, 870)}
avc = {'ic-coracao': (80, 390, 275, 572), 'ic-gota': (300, 380, 450, 575), 'ic-defesa': (525, 370, 710, 580),
       'ic-desloc': (730, 365, 935, 572), 'ic-iniciativa': (970, 360, 1130, 575), 'ic-cd': (1160, 365, 1375, 575),
       'acao-padrao': (60, 590, 500, 1035), 'acao-reacao': (505, 590, 945, 1035), 'acao-movimento': (950, 590, 1390, 1035)}
for nome, folha, cortes, barras in [("tempestade", tp, tpc, {'barra-pv': (110, 89, 772, 157), 'barra-pm': (898, 89, 1560, 157)}),
                                     ("aventureiro", av, avc, {'barra-pv': (155, 57, 1295, 147), 'barra-pm': (155, 227, 1295, 317)})]:
    for n, box in cortes.items():
        print(nome, n, salvar(folha.crop(box), f"{A}/{nome}/{n}.webp", 180 if n.startswith('acao') else 72))
    for n, box in barras.items():
        c = folha.crop(box).convert('RGB').resize((708, 36), Image.LANCZOS)
        c.save(f"{A}/{nome}/{n}.webp", 'WEBP', quality=86); print(nome, n, c.size)
