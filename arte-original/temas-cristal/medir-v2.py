"""Mede as aberturas escuras da moldura v2 e gera a máscara do retrato.

Uso: python3 medir-v2.py <saida-do-recorte>
Lê <saida>/<tema>/moldura.png; grava <saida>/<tema>/mascara-retrato.png e <saida>/medidas.json
(tudo em % da moldura: x, y, largura, altura).
"""
import json
import sys

import cv2
import numpy as np
from PIL import Image

SAIDA = sys.argv[1]
pecas = json.load(open(f"{SAIDA}/pecas.json"))
medidas = {}
for tema in pecas:
    im = np.array(Image.open(f"{SAIDA}/{tema}/moldura.png")).astype(np.float32)
    H, W = im.shape[:2]
    lum = im[..., :3].mean(2)
    mu = cv2.GaussianBlur(lum, (9, 9), 0)
    sd = np.sqrt(np.maximum(cv2.GaussianBlur(lum ** 2, (9, 9), 0) - mu ** 2, 0))
    escuro = ((cv2.GaussianBlur(lum, (7, 7), 0) < 72) & (sd < 11) & (im[..., 3] > 230)).astype(np.uint8)
    escuro = cv2.morphologyEx(escuro, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(escuro, 8)
    cs = [(i, *map(int, st[i])) for i in range(1, n) if st[i][4] > 900]
    pc = lambda c: [round(c[1] / W * 100, 3), round(c[2] / H * 100, 3), round(c[3] / W * 100, 3), round(c[4] / H * 100, 3)]
    retrato = max(cs, key=lambda c: c[5])
    barras = sorted([c for c in cs if c[3] > 3.5 * c[4] and c[1] < 0.45 * W], key=lambda c: c[2])[:2]
    losangos = sorted([c for c in cs if 0.4 * W < c[1] < 0.75 * W and c[2] < 0.4 * H and 0.6 < c[3] / c[4] < 1.6], key=lambda c: c[1])
    direita = [c for c in cs if c[1] > 0.74 * W]
    # Atalhos: os 5 quadrados da fileira de baixo (os mais baixos entre os ~quadrados da direita).
    quad = [c for c in direita if 0.55 < c[3] / c[4] < 1.4 and c[5] > 1200]
    slots = sorted(sorted(quad, key=lambda c: -c[2])[:5], key=lambda c: c[1])
    vao = (slots[-1][1] + slots[-1][3]) - slots[0][1]
    topo_slots = min(c[2] for c in slots)
    # Placa: o miolo escuro entre as setas (largo, acima dos atalhos e mais estreito que a fileira toda;
    # o fundo da caixa, quando é escuro, é mais largo e fica de fora).
    placa = max([c for c in direita if c[3] > 2.5 * c[4] and c[3] < 0.8 * vao and c[2] + c[4] <= topo_slots + 4], key=lambda c: c[5])
    print(tema, "barras", len(barras), "losangos", len(losangos), "slots", len(slots))
    # Máscara do retrato: a abertura escura preenchida (sem furos), 2 px para dentro da borda dourada.
    i, x, y, w, h, _ = retrato
    m = (lab[y:y + h, x:x + w] == i).astype(np.uint8) * 255
    cont, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cheia = np.zeros_like(m)
    cv2.drawContours(cheia, cont, -1, 255, -1)
    cheia = cv2.dilate(cheia, np.ones((5, 5), np.uint8))
    # mask-image usa o alfa: branco com alfa = abertura.
    rgba = np.dstack([np.full_like(cheia, 255)] * 3 + [cheia])
    Image.fromarray(rgba).save(f"{SAIDA}/{tema}/mascara-retrato.png")
    medidas[tema] = {
        "moldura_px": [W, H],
        "retrato": pc(retrato),
        "barras": {"pv": pc(barras[0]), "pm": pc(barras[1])},
        "losangos_abertura": [pc(c) for c in sorted(sorted(losangos, key=lambda c: c[2])[:3], key=lambda c: c[1])],
        "placa": pc(placa),
        "atalhos": [pc(c) for c in sorted(slots, key=lambda c: c[1])],
    }
json.dump(medidas, open(f"{SAIDA}/medidas.json", "w"), indent=1)
