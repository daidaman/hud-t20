import numpy as np, cv2, json, os
from PIL import Image
K={'dragao':'d7b96010','tempestade':'7a33526c','ossario':'970ac395','corsario':'5d0415e3','fenix':'8fe93ef0','ursal':'8b28446d','forja':'cc9b9073'}
os.makedirs('out',exist_ok=True)
meta={}
for name,f in K.items():
    src=np.array(Image.open(f'/mnt/user-data/uploads/{f}-image.png').convert('RGB')).astype(np.float32)
    r,g,b=src[...,0],src[...,1],src[...,2]
    gx=g-np.maximum(r,b)
    if name in ('forja','ursal'):
        t=np.clip((g-150)/70,0,1)*np.clip(1-(np.maximum(r,b)-20)/40,0,1)
        a=1-t
        edge=cv2.dilate((a<0.5).astype(np.uint8),np.ones((5,5),np.uint8))>0
        spill=np.maximum(gx,0)*edge
        g2=g-spill
    else:
        a=np.clip(1-(gx-30)/(140-30),0,1)
        spill=np.maximum(gx,0)
        g2=g-spill*np.clip((gx-5)/40,0,1)
    out=np.dstack([r,g2,b,a*255])
    m=(a>0.5).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(m,8)
    comps=[(i,*st[i]) for i in range(1,n) if st[i][4]>150]
    comps.sort(key=lambda c:-c[5])
    fr=comps[0]; fx,fy,fw,fh=fr[1:5]
    # glow unmix in frame top-center
    H,W=r.shape; yy,xx=np.mgrid[0:H,0:W]
    reg=(xx>fx+fw*0.42)&(xx<fx+fw*0.76)&(yy<fy+fh*0.5)
    cond=reg&(g>r)&(r>70)&(b<g*0.65)&(g>120)
    al=np.clip(r/255,0,1)
    Fg=np.clip((g-(1-al)*255)/np.maximum(al,1e-3),0,230)
    out[cond,0]=255; out[cond,1]=Fg[cond]; out[cond,2]=np.minimum(b[cond]/np.maximum(al[cond],1e-3),120); out[cond,3]=al[cond]*255
    out=out.clip(0,255).astype(np.uint8)
    rest=[c for c in comps[1:] if c[1]>fx+fw-20]
    rest.sort(key=lambda c:(c[2],c[1]))
    bars=sorted([c for c in rest if c[3]>4*c[4]],key=lambda c:c[2])[:2]
    if len(bars)<2:
        bb=[c for c in rest if c[3]>350 and c[4]<160][0]
        _,x,y,w,h,_a=bb; prof=m[y:y+h,x:x+w].sum(1); cy=int(h*0.3)+int(np.argmin(prof[int(h*0.3):int(h*0.7)]))
        bars=[(0,x,y,w,cy,0),(0,x,y+cy,w,h-cy,0)]
        rest=[c for c in rest if c is not bb]
    others=[c for c in rest if c not in bars]
    dias=sorted([c for c in others if 100<c[4]<200 and 100<c[3]<200],key=lambda c:c[1])[:3]
    dbot=max(d[2]+d[4] for d in dias)
    low=[c for c in others if c[2]>dbot-5]
    X0=min(c[1] for c in low); Y0=min(c[2] for c in low); X1=max(c[1]+c[3] for c in low); Y1=max(c[2]+c[4] for c in low)
    sub=m[Y0:Y1,X0:X1]; prof=sub.sum(0); w=X1-X0
    cut=int(w*0.3)+int(np.argmin(prof[int(w*0.3):int(w*0.7)]))
    crys=[]
    for xa,xb in ((0,cut),(cut,w)):
        part=sub[:,xa:xb]; ys=np.where(part.any(1))[0]; xs=np.where(part.any(0))[0]
        crys.append((0,X0+xa+xs[0],Y0+ys[0],xs[-1]-xs[0]+1,ys[-1]-ys[0]+1,0))
    pieces={'frame':fr,'hp':bars[0],'mp':bars[1],'act1':dias[0],'act2':dias[1],'act3':dias[2],'crystal':crys[0],'facets':crys[1]}
    d=f'out/{name}'; os.makedirs(d,exist_ok=True)
    for pn,c in pieces.items():
        x,y,w,h=c[1:5]; idx=c[0]
        crop=out[y:y+h,x:x+w].copy()
        Image.fromarray(crop).save(f'{d}/{pn}.png')
    meta[name]={pn:list(map(int,c[1:5])) for pn,c in pieces.items()}
    print(name,{k:v[2:] for k,v in meta[name].items()})
json.dump(meta,open('out/meta.json','w'))
