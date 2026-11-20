import json
raw=json.load(open('out/slots_raw.json')); meta=json.load(open('out/meta.json'))
L={}
for n,d in raw.items():
    W,H=d['W'],d['H']; cs=[[c[0]*W,c[1]*H,c[2]*W,c[3]*H,c[4]] for c in d['comps']]
    por=max(cs,key=lambda c:c[4])
    bars=sorted([c for c in cs if c[2]>6*c[3] and c[0]<0.45*W],key=lambda c:c[1])[:2]
    bb=bars[1][1]+bars[1][3]
    boxes=[c for c in cs if c[0]<0.45*W and c[0]>por[0]+por[2] and c[1]>bb and 0.7<c[2]/c[3]<1.4]
    boxes=sorted(sorted(boxes,key=lambda c:c[1])[:4],key=lambda c:c[0])
    dia=sorted([c for c in cs if 0.4*W<c[0]<0.75*W and c[1]<0.35*H and c[4]>3000],key=lambda c:c[0])
    slots=[c for c in cs if c[0]>0.74*W and 0.6<c[2]/c[3]<1.2 and c[4]>1500]
    slots=sorted(slots,key=lambda c:(round(c[1]/40),c[0]))
    print(n,len(bars),len(boxes),len(dia),len(slots))
    r=lambda c:[round(c[0]/W*100,2),round(c[1]/H*100,2),round(c[2]/W*100,2),round(c[3]/H*100,2)]
    L[n]={'W':W,'H':H,'portrait':r(por),'bars':[r(c) for c in bars],'boxes':[r(c) for c in boxes],'dia':[r(c) for c in dia],'slots':[r(c) for c in slots]}
json.dump(L,open('out/layout.json','w'),indent=0)
