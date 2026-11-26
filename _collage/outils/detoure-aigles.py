import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw
def _im(m): return Image.fromarray((m*255).astype(np.uint8))
def detoure(im, T=42, r=7, feather=1.2):
    """Fond noir enlevé, corps de l'aigle 100 % opaque (couleurs d'origine), lueurs en fondu."""
    im=im.convert('RGB'); a=np.asarray(im).astype(np.float32)
    v=a.max(axis=2); H,W=v.shape; s=W/560.0
    bright=_im(v>T)
    # fermeture arrondie : dilatation puis érosion par flou + seuil
    d=_im(np.asarray(bright.filter(ImageFilter.GaussianBlur(r*s)))>0.10*255)
    e=np.asarray(d.filter(ImageFilter.GaussianBlur(r*s)))>0.90*255
    m=_im(e|(v>T))
    # trous bouchés : on inonde l'extérieur depuis un bord noir de 1 px
    pad=Image.new('L',(W+2,H+2),0); pad.paste(m,(1,1)); ImageDraw.floodfill(pad,(0,0),128)
    body=np.asarray(pad)[1:-1,1:-1]!=128
    # on ne garde que le grand morceau (l'aigle) ; les petites flammes isolées restent en lueur
    ys,xs=np.nonzero(body); cy,cx=H/2,W/2; i=np.argmin((ys-cy)**2+(xs-cx)**2)
    b=_im(body).point(lambda p:200 if p else 0); ImageDraw.floodfill(b,(int(xs[i]),int(ys[i])),255)
    main=np.asarray(b)==255
    Ab=np.asarray(_im(main).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(feather*s))).astype(np.float32)/255
    Ag=np.clip(v/255*1.15,0,1)
    A=np.maximum(Ab,Ag)
    rgb=np.where(A[...,None]>0.004, a/np.maximum(A[...,None],0.004), 0)
    return Image.fromarray(np.dstack([np.clip(rgb,0,255),A*255]).astype(np.uint8),'RGBA'), Ab
