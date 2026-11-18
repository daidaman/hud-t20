from PIL import Image
import numpy as np
src=np.array(Image.open('tempestade-pecas-verde.png').convert('RGB')).astype(float)
r,g,b=src[...,0],src[...,1],src[...,2]
d=g-np.maximum(r,b)
a=np.clip((90-d)/50,0,1)          # d>=90 -> transparent, d<=40 -> opaque
g2=np.minimum(g,np.maximum(r,b)+10)  # despill
out=np.dstack([r,g2,b,a*255]).astype(np.uint8)
img=Image.fromarray(out,'RGBA')
crops={'barra-pv':(60,75,822,175),'barra-pm':(848,75,1610,175),'coracao':(90,235,322,442),
'gota':(380,230,540,442),'escudo':(615,230,805,442),'bota':(845,230,1075,435),
'ampulheta':(1140,230,1290,442),'estrela':(1355,230,1575,438),
'acao-espada':(170,480,555,870),'acao-explosao':(640,480,1030,870),'acao-bandeira':(1110,480,1500,870)}
for n,box in crops.items():
    c=img.crop(box); bb=c.getbbox(); c=c.crop(bb)
    if n.startswith('acao') or n in('coracao','gota','escudo','bota','ampulheta','estrela'):
        c.thumbnail((180,180),Image.LANCZOS)
    c.save(f'assets/{n}.png',optimize=True); print(n,c.size)
f=Image.open('tempestade-moldura.png').convert('RGB')
f.save('assets/moldura-tempestade.jpg',quality=86)
