from PIL import Image
import numpy as np
src=np.array(Image.open('aventureiro-pecas-verde.png').convert('RGB')).astype(float)
r,g,b=src[...,0],src[...,1],src[...,2]
d=g-np.maximum(r,b)
a=np.clip((90-d)/50,0,1)
g2=np.minimum(g,np.maximum(r,b)+10)
img=Image.fromarray(np.dstack([r,g2,b,a*255]).astype(np.uint8),'RGBA')
crops={'coracao':(80,390,275,572),'gota':(300,380,450,575),'escudo':(525,370,710,580),
'bota':(730,365,935,572),'ampulheta':(970,360,1130,575),'estrela':(1160,365,1375,575),
'acao-espada':(60,590,500,1035),'acao-explosao':(505,590,945,1035),'acao-bandeira':(950,590,1390,1035)}
for n,box in crops.items():
    c=img.crop(box); c=c.crop(c.getbbox()); c.thumbnail((160,160),Image.LANCZOS)
    c.save(f'av2/{n}.png',optimize=True); print(n,c.size)
# inner fills of bars (no gold frame)
for n,box in {'fill-pv':(175,66,1280,142),'fill-pm':(175,234,1280,310)}.items():
    c=img.crop(box).convert('RGB').resize((700,48),Image.LANCZOS); c.save(f'av2/{n}.jpg',quality=88); print(n,c.size)
Image.open('aventureiro-moldura.png').convert('RGB').save('av2/moldura-aventureiro.jpg',quality=86)
bg=Image.new('RGBA',(1100,420),(60,40,30,255)); x=10;y=10
for n in crops:
    im=Image.open(f'av2/{n}.png'); 
    if x+im.width>1090: x=10;y+=170
    bg.alpha_composite(im,(x,y)); x+=im.width+10
for i,n in enumerate(['fill-pv','fill-pm']):
    bg.paste(Image.open(f'av2/{n}.jpg'),(10,350+i*0)) if i==0 else bg.paste(Image.open(f'av2/{n}.jpg'),(10,300))
bg.save('/tmp/check2.png')
