"""Transforme la maquette Site web (page.html) en bloc Systeme.io (HTML brut).
- CSS limité à #ldr-sw (rien ne déborde sur le menu maître)
- menu de la maquette retiré (le menu maître du site s'affiche)
- images servies depuis agenceldr.github.io/demos-ldr/images-ldr/site-web-v2/
Usage : python3 fabriquer_bloc.py page.html bloc.html
"""
import re, sys
BASE = 'https://agenceldr.github.io/demos-ldr/images-ldr/site-web-v2/'
SC = '#ldr-sw'

def split_sel(s):
    out, d, cur = [], 0, ''
    for ch in s:
        if ch == '(':
            d += 1
        elif ch == ')':
            d -= 1
        if ch == ',' and d == 0:
            out.append(cur); cur = ''
        else:
            cur += ch
    out.append(cur)
    return [x.strip() for x in out if x.strip()]

def scope_sel(sel):
    s = sel.strip()
    if s in ('*',):
        return [SC, SC + ' *']
    if s in ('html', 'body', ':root', 'html body'):
        return [SC]
    s = re.sub(r'^(html\s+)?body\s*', '', s)
    s = re.sub(r'^:root\s*', '', s)
    if not s:
        return [SC]
    return [SC + ' ' + s]

def scope_css(css):
    i, n, out = 0, len(css), []
    while i < n:
        j = css.find('{', i)
        if j < 0:
            out.append(css[i:]); break
        head = css[i:j].strip()
        # trouver l'accolade fermante correspondante
        d, k = 1, j + 1
        while k < n and d:
            if css[k] == '{': d += 1
            elif css[k] == '}': d -= 1
            k += 1
        body = css[j + 1:k - 1]
        if head.startswith('@media') or head.startswith('@supports'):
            out.append(head + '{' + scope_css(body) + '}')
        elif head.startswith('@'):
            out.append(head + '{' + body + '}')
        else:
            sels = []
            for s in split_sel(head):
                if s.startswith('/*'):
                    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S).strip()
                    if not s: continue
                sels += scope_sel(s)
            if 'scroll-behavior' in body and head.strip() == 'html':
                i = k; continue
            out.append(','.join(dict.fromkeys(sels)) + '{' + body + '}')
        i = k
    return '\n'.join(out)

src = open(sys.argv[1], encoding='utf-8').read()
# on part du 2e document (la maquette), pas de l'enveloppe d'aperçu
doc = src[src.find('<!doctype html>', 10):] if src.count('<!doctype html>') > 1 else src
head, body = doc.split('</head>', 1)
css = '\n'.join(re.findall(r'<style>(.*?)</style>', head, flags=re.S))
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
body = body.split('<body>', 1)[1].rsplit('</body>', 1)[0]
body = re.sub(r'</?(body|html)>', '', body)
body = re.sub(r'<div class="menu">.*?</div></div>\n', '', body, count=1, flags=re.S)
scr = re.findall(r'<script>(.*?)</script>', body, flags=re.S)
body = re.sub(r'<script>.*?</script>', '', body, flags=re.S)
js = '\n'.join(scr).replace('document.documentElement.style', "document.getElementById('ldr-sw').style")
# images
def absol(m):
    return m.group(1) + BASE + m.group(2)
body = re.sub(r'(src=")([\w-]+\.webp)', absol, body)
js = re.sub(r"(')([\w-]*\.webp')", lambda m: m.group(1) + m.group(2), js)
js = js.replace("i.src=FS[n]+'-'", "i.src=B+FS[n]+'-'").replace("vi.src='monde-'", "vi.src=B+'monde-'")
js = re.sub(r"([=(,:]\s*)'([a-z][\w-]*\.webp)'", lambda m: m.group(1) + "B+'" + m.group(2) + "'", js)
js = re.sub(r"\.src=s\+'", ".src=B+s+'", js)
js = "var B='" + BASE + "';\n" + js
css = re.sub(r'url\((["\']?)([\w-]+\.webp)\1\)', lambda m: 'url(' + BASE + m.group(2) + ')', css)
fonts = re.findall(r'<link[^>]+fonts[^>]+>', head)
bloc = ('<!-- Agence LDR · page Site web v2 (26/11/2026) · bloc à coller tel quel (HTML brut) -->\n'
        + '\n'.join(fonts) + '\n<style id="ldr-sw-css">\n' + scope_css(css) + '\n</style>\n'
        + '<div id="ldr-sw">' + body + '</div>\n<script id="ldr-sw-js">(function(){\n' + js + '\n})();</script>\n')
import os
mc=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'menu-correctif.js'),encoding='utf-8').read()
bloc += '<script id="ldr-sw-menu">' + mc + '</script>\n<!-- FIN DU BLOC SYSTEME.IO -->\n'
open(sys.argv[2], 'w', encoding='utf-8').write(bloc)
print(len(bloc))
