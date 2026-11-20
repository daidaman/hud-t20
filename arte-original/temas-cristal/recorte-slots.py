import numpy as np, cv2, json, sys
from PIL import Image
meta=json.load(open('out/meta.json'))
res={}
for name in meta:
    im=np.array(Image.open(f'out/{name}/frame.png')).astype(np.float32)
    H,W=im.shape[:2]
    rgb=cv2.GaussianBlur(im[...,:3],(7,7),0)
    lum=rgb.mean(2)
    sq=cv2.GaussianBlur(im[...,:3].mean(2)**2,(9,9),0); mu=cv2.GaussianBlur(im[...,:3].mean(2),(9,9),0)
    sd=np.sqrt(np.maximum(sq-mu**2,0))
    m=((lum<70)&(sd<10)&(im[...,3]>230)).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(m,8)
    comps=[tuple(map(int,st[i])) for i in range(1,n) if st[i][4]>800]
    res[name]={'W':W,'H':H,'comps':[[x/W,y/H,w/W,h/H,a] for x,y,w,h,a in comps]}
    print(name,W,H,len(comps))
    for c in sorted(comps,key=lambda c:(c[0])): print('  ',c)
json.dump(res,open('out/slots_raw.json','w'))
