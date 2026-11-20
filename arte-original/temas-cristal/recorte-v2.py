"""Recorte da arte v2 dos temas de cristal (folhas de 2026-11-20).

Uso: python3 recorte-v2.py <pasta-v2> <saida>
Para cada <tema>-folha-verde.png gera em <saida>/<tema>/:
  moldura.png, losango-defesa.png, losango-iniciativa.png, losango-desloc.png,
  seta-esq.png, seta-dir.png, seta-esq-acesa.png, seta-dir-acesa.png, cristal.png, facetas.png
e <saida>/pecas.json com as caixas (px na folha) de cada peça.
A chave verde e a "desmistura" do brilho atrás dos losangos seguem recorte-cut.py (v1).
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image

PASTA, SAIDA = sys.argv[1], sys.argv[2]
TEMAS = ["dragao", "forja", "fenix", "ossario", "corsario", "ursal", "tempestade"]
os.makedirs(SAIDA, exist_ok=True)


def chave(src, tema):
    r, g, b = src[..., 0], src[..., 1], src[..., 2]
    gx = g - np.maximum(r, b)
    if tema in ("forja", "ursal"):  # preservam as esmeraldas
        t = np.clip((g - 150) / 70, 0, 1) * np.clip(1 - (np.maximum(r, b) - 20) / 40, 0, 1)
        a = 1 - t
        borda = cv2.dilate((a < 0.5).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        g2 = g - np.maximum(gx, 0) * borda
    else:
        a = np.clip(1 - (gx - 30) / (140 - 30), 0, 1)
        g2 = g - np.maximum(gx, 0) * np.clip((gx - 5) / 40, 0, 1)
    return np.dstack([r, g2, b, a * 255]), a


def desmistura_brilho(out, src, fr):
    """Brilho dourado atrás dos losangos: o verde que vazou vira transparência (canal vermelho = alfa)."""
    r, g, b = src[..., 0], src[..., 1], src[..., 2]
    fx, fy, fw, fh = fr
    H, W = r.shape
    yy, xx = np.mgrid[0:H, 0:W]
    reg = (xx > fx + fw * 0.42) & (xx < fx + fw * 0.76) & (yy < fy + fh * 0.5)
    cond = reg & (g > r) & (r > 70) & (b < g * 0.65) & (g > 120)
    al = np.clip(r / 255, 0, 1)
    fg = np.clip((g - (1 - al) * 255) / np.maximum(al, 1e-3), 0, 230)
    out[cond, 0] = 255
    out[cond, 1] = fg[cond]
    out[cond, 2] = np.minimum(b[cond] / np.maximum(al[cond], 1e-3), 120)
    out[cond, 3] = al[cond] * 255


def salvar(out, caixa, nome, pasta):
    x, y, w, h = caixa
    Image.fromarray(out[y:y + h, x:x + w].clip(0, 255).astype(np.uint8)).save(f"{pasta}/{nome}.png")


todas = {}
for tema in TEMAS:
    src = np.array(Image.open(f"{PASTA}/{tema}-folha-verde.png").convert("RGB")).astype(np.float32)
    out, a = chave(src, tema)
    m = (a > 0.5).astype(np.uint8)
    n, _, st, _ = cv2.connectedComponentsWithStats(m, 8)
    comps = sorted([tuple(int(v) for v in st[i]) for i in range(1, n) if st[i][4] > 300], key=lambda c: -c[4])
    fr = comps[0][:4]
    desmistura_brilho(out, src, fr)
    fx, fy, fw, fh = fr
    resto = [c for c in comps[1:] if c[0] > fx + fw - 30]
    # Peças soltas: barras (largas, não usadas), losangos (~quadrados médios), cristal/facetas (altos), setas (pequenas).
    losangos = [c for c in resto if 0.75 < c[2] / c[3] < 1.3 and 90 < c[2] < 200]
    altos = sorted([c for c in resto if c[3] > 200 and c[2] < 260], key=lambda c: c[0])
    setas = [c for c in resto if c[2] < 130 and c[3] < 90 and c[4] > 400]
    # Losangos encostados uns nos outros (Ursal: 3; Forja: 2) vêm num pedaço só: separa pelos vales da coluna de alfa.
    for c in [c for c in resto if 1.6 < c[2] / c[3] < 3.4 and 120 < c[3] < 200]:
        x, y, w, h = c[:4]
        k = round(w / (h * 0.95))
        prof = a[y:y + h, x:x + w].sum(0)
        jan = int(w * .08)
        cortes = [int(w * q / k) - jan + int(np.argmin(prof[int(w * q / k) - jan:int(w * q / k) + jan])) for q in range(1, k)]
        bordas = [0, *cortes, w]
        for q in range(k):
            xa, xb = bordas[q], bordas[q + 1]
            cols = np.where(a[y:y + h, x + xa:x + xb].max(0) > .5)[0]
            losangos.append((x + xa + int(cols[0]), y, int(cols[-1] - cols[0] + 1), h, 0))
    # A Forja traz também os losangos antigos (fileira de cima): ficam os 3 mais baixos.
    losangos = sorted(sorted(losangos, key=lambda c: -c[1])[:3], key=lambda c: c[0])
    pasta = f"{SAIDA}/{tema}"
    os.makedirs(pasta, exist_ok=True)
    pecas = {"moldura": fr}
    for nome, c in zip(["losango-defesa", "losango-iniciativa", "losango-desloc"], losangos):
        pecas[nome] = c[:4]
    if len(altos) >= 2:
        pecas["cristal"], pecas["facetas"] = altos[0][:4], altos[1][:4]
    # Setas: as 2 mais escuras são as normais e as 2 mais claras as acesas; em cada par, a da esquerda é ◀
    # (em todas as folhas o ◀ vem antes do ▶ no mesmo estado).
    if len(setas) == 4:
        lum = lambda c: src[c[1]:c[1] + c[3], c[0]:c[0] + c[2]].mean(2)[a[c[1]:c[1] + c[3], c[0]:c[0] + c[2]] > .5].mean()
        por_y = sorted(setas, key=lambda c: c[1])
        if por_y[2][1] - por_y[1][1] > 30:  # 2 × 2: fileira de cima = normal, de baixo = acesa
            pares = (por_y[:2], por_y[2:])
        else:  # uma fileira só: decide pela luz
            por_luz = sorted(setas, key=lum)
            pares = (por_luz[:2], por_luz[2:])
        for estado, par in (("", pares[0]), ("-acesa", pares[1])):
            esq, dir_ = sorted(par, key=lambda c: c[0])
            pecas[f"seta-esq{estado}"], pecas[f"seta-dir{estado}"] = esq[:4], dir_[:4]
    # Na moldura só fica o pedaço maior (peças vizinhas que entram na caixa dela saem).
    rot = cv2.connectedComponentsWithStats(m, 8)[1]
    x, y, w, h = fr
    moldura = out[y:y + h, x:x + w].copy()
    ids, cont = np.unique(rot[y:y + h, x:x + w], return_counts=True)
    maior = ids[1:][np.argmax(cont[1:])] if ids[0] == 0 else ids[np.argmax(cont)]
    r_ = rot[y:y + h, x:x + w]
    fora = (r_ != maior) & (r_ != 0)
    fora = (cv2.dilate(fora.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0) & (r_ != maior)
    # O brilho (alfa parcial, rótulo 0) só some quando encosta numa peça vizinha.
    moldura[fora, 3] = 0
    Image.fromarray(moldura.clip(0, 255).astype(np.uint8)).save(f"{pasta}/moldura.png")
    for nome, c in pecas.items():
        if nome != "moldura":
            salvar(out, c, nome, pasta)
    todas[tema] = {k: list(v) for k, v in pecas.items()}
    print(tema, "losangos", len(losangos), "altos", len(altos), "setas", len(setas), "->", sorted(pecas))
json.dump(todas, open(f"{SAIDA}/pecas.json", "w"), indent=1)
