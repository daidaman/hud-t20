"""Ajustes de arte da 0.5.0 (rodar uma vez, a partir da raiz do módulo).

1. Forja Mecânica: apaga o pedacinho solto da arte na ponta direita da moldura
   (componente isolado em x 1638–1647, y 143–162; a imagem mantém o tamanho, então as medidas em % não mudam).
2. Tempestade Rubra (cristal): o PM vinha roxo. Decisão de 2026-11-19: PM azul fixo em todos os temas.
   Gira o matiz da barra para o azul das outras folhas (≈ 213°), mantendo a textura e o brilho.
   O original roxo fica salvo como barra-pm-roxo.webp (fora do uso).
"""
import colorsys
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

raiz = sys.argv[1] if len(sys.argv) > 1 else "."
temas = os.path.join(raiz, "assets", "temas")

# 1. Forja: só fica o maior pedaço da moldura.
caminho = os.path.join(temas, "cristal-forja", "moldura.webp")
img = np.array(Image.open(caminho).convert("RGBA"))
opaco = img[..., 3] > 20
rotulos, n = ndimage.label(opaco)
if n > 1:
    tamanhos = ndimage.sum(opaco, rotulos, range(1, n + 1))
    maior = int(np.argmax(tamanhos)) + 1
    soltos = (rotulos != maior) & (rotulos > 0)
    # Também a franja quase transparente em volta dos pedaços soltos.
    soltos = ndimage.binary_dilation(soltos, iterations=2) & (rotulos != maior)
    img[soltos] = 0
    Image.fromarray(img).save(caminho, "WEBP", quality=92, method=6)
    print(f"forja: {int(soltos.sum())} px apagados")

# 2. Tempestade: PM roxo → azul.
pasta = os.path.join(temas, "cristal-tempestade")
original = os.path.join(pasta, "barra-pm-roxo.webp")
if not os.path.exists(original):
    os.rename(os.path.join(pasta, "barra-pm.webp"), original)
rgba = np.array(Image.open(original).convert("RGBA")).astype(np.float32) / 255
rgb = rgba[..., :3]
hsv = np.array([colorsys.rgb_to_hsv(*p) for p in rgb.reshape(-1, 3)]).reshape(rgb.shape)
alvo = 213 / 360
# Só os pixels coloridos (roxos/violeta) giram; brilhos quase brancos ficam.
roxo = (hsv[..., 1] > 0.15)
desloc = alvo - 245 / 360
hsv[..., 0] = np.where(roxo, (hsv[..., 0] + desloc) % 1, hsv[..., 0])
hsv[..., 2] = np.where(roxo, np.clip(hsv[..., 2] * 1.22, 0, 1), hsv[..., 2])
novo = np.array([colorsys.hsv_to_rgb(*p) for p in hsv.reshape(-1, 3)]).reshape(rgb.shape)
saida = np.concatenate([novo, rgba[..., 3:]], axis=-1)
Image.fromarray((saida * 255).round().astype(np.uint8)).save(os.path.join(pasta, "barra-pm.webp"), "WEBP", quality=92, method=6)
print("tempestade: barra-pm azul")
