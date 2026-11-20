"""Monta os assets da v2 dos temas de cristal a partir do recorte (recorte-v2.py + medir-v2.py).

Uso: python3 montar-v2.py <saida-do-recorte> <pasta-v2> <raiz-do-modulo>
- assets/temas/cristal-<tema>/: moldura, losangos de status, setas (normal/acesa), cristal, facetas (.webp) e mascara-retrato.png
- assets/temas/liquido/: pv, pm, pv-temp, pm-temp (.webp, 128 px de altura, sem emenda na horizontal)
- assets/temas/cristal-medidas.json (v2): posições em % da moldura
"""
import json
import os
import shutil
import sys

import numpy as np
from PIL import Image

REC, V2, RAIZ = sys.argv[1:4]
TEMAS = json.load(open(f"{REC}/pecas.json"))
MED = json.load(open(f"{REC}/medidas.json"))
PECAS = ["moldura", "losango-defesa", "losango-iniciativa", "losango-desloc", "seta-esq", "seta-dir",
         "seta-esq-acesa", "seta-dir-acesa", "cristal", "facetas"]

saida_json = {"_versao": 2, "_nota": "Posições em % da moldura (x, y, largura, altura). Gerado por arte-original/temas-cristal/montar-v2.py."}
for tema, caixas in TEMAS.items():
    dest = f"{RAIZ}/assets/temas/cristal-{tema}"
    if os.path.isdir(dest):
        shutil.rmtree(dest)
    os.makedirs(dest)
    for p in PECAS:
        Image.open(f"{REC}/{tema}/{p}.png").save(f"{dest}/{p}.webp", "WEBP", quality=90, method=6)
    shutil.copy(f"{REC}/{tema}/mascara-retrato.png", f"{dest}/mascara-retrato.png")
    m = MED[tema]
    W, H = m["moldura_px"]
    tam = lambda p: [round(caixas[p][2] / W * 100, 3), round(caixas[p][3] / H * 100, 3)]
    # Losangos de status: centrados na abertura; tamanho = abertura × (peça / miolo da peça), para a borda da
    # peça solta cobrir a borda desenhada na moldura.
    ab = m["losangos_abertura"]
    escala = 1.42  # borda do losango solto em relação ao miolo (medido no Dragão)
    losangos = {}
    for chave, (x, y, w, h) in zip(["iniciativa", "defesa", "desloc"], ab):
        lw, lh = w * escala, h * escala
        losangos[chave] = [round(x + w / 2 - lw / 2, 3), round(y + h / 2 - lh / 2, 3), round(lw, 3), round(lh, 3)]
    # Setas: por cima das setas desenhadas nas pontas da placa (mesma escala da folha).
    px, py, pw, ph = m["placa"]
    sw, sh = tam("seta-esq")
    cy = py + ph / 2
    setas = {"esq": [round(px - sw * 1.02, 3), round(cy - sh / 2, 3), sw, sh],
             "dir": [round(px + pw + sw * 0.02, 3), round(cy - sh / 2, 3), sw, sh]}
    saida_json[f"cristal-{tema}"] = {**m, "losangos": losangos, "setas": setas}
json.dump(saida_json, open(f"{RAIZ}/assets/temas/cristal-medidas.json", "w"), ensure_ascii=False, indent=1)

# Líquidos: faixa do meio, 128 px de altura; as pontas são cruzadas para repetir sem emenda.
liq = f"{RAIZ}/assets/temas/liquido"
os.makedirs(liq, exist_ok=True)
for nome, arq in [("pv", "liquido-pv.png"), ("pm", "liquido-pm.png"), ("pv-temp", "liquido-pv-temp.png"), ("pm-temp", "liquido-pm-temp.png")]:
    im = Image.open(f"{V2}/{arq}").convert("RGB")
    if im.height > 200:
        im = im.crop((0, im.height // 4, im.width, im.height * 3 // 4))
    im = im.resize((round(im.width * 128 / im.height), 128), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    n = a.shape[1] // 8
    t = np.linspace(0, 1, n)[None, :, None]
    corpo = a[:, : a.shape[1] - n].copy()
    corpo[:, :n] = a[:, :n] * t + a[:, -n:] * (1 - t)
    Image.fromarray(corpo.clip(0, 255).astype(np.uint8)).save(f"{liq}/{nome}.webp", "WEBP", quality=88, method=6)
    print(nome, corpo.shape[1], "x 128")
