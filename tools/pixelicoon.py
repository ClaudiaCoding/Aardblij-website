#!/usr/bin/env python3
"""
Aardblij Workshops · pixelart-iconen

Maakt kleine pixelart-iconen (SVG) van de rasters in tools/pixel-iconen.txt.

Gebruik (vanuit de hoofdmap van de site):
    python3 tools/pixelicoon.py             maakt images/iconen/*.svg en tools/pixel-iconen-overzicht.html
    python3 tools/pixelicoon.py --vervang   doet hetzelfde én vervangt in alle pagina's de emoji's
                                            die in pixel-iconen.txt staan door het pixelart-icoon

Nieuw icoon? Zet in pixel-iconen.txt een blok:
    == naam 🎨          (naam van het bestand, met eventueel de emoji die het vervangt)
    ....rrrr....        (één regel per rij pixels, alle rijen even lang;
    ...rrrrrr...         een punt is doorzichtig, een letter is een kleur uit de kleurenlijst)
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BRON = ROOT / 'tools' / 'pixel-iconen.txt'
UIT = ROOT / 'images' / 'iconen'
OVERZICHT = ROOT / 'tools' / 'pixel-iconen-overzicht.html'


def lees():
    kleuren, iconen, huidig = {}, [], None
    deel = None
    for nr, regel in enumerate(BRON.read_text(encoding='utf-8').splitlines(), 1):
        if not regel.strip() or regel.startswith('#'):
            continue
        if regel.strip() == 'kleuren:':
            deel = 'kleuren'
            continue
        if regel.startswith('=='):
            deel = 'icoon'
            woorden = regel[2:].split()
            huidig = {'naam': woorden[0], 'emoji': woorden[1:], 'rijen': [], 'regel': nr}
            iconen.append(huidig)
            continue
        if deel == 'kleuren':
            letter, kleur = regel.split()[:2]
            kleuren[letter] = kleur
        elif deel == 'icoon':
            huidig['rijen'].append(regel.rstrip())
    # controle
    fouten = []
    for ic in iconen:
        breedtes = {len(r) for r in ic['rijen']}
        if len(breedtes) != 1:
            fouten.append(f"{ic['naam']} (regel {ic['regel']}): rijen zijn niet even lang {sorted(breedtes)}")
        for r in ic['rijen']:
            for t in r:
                if t != '.' and t not in kleuren:
                    fouten.append(f"{ic['naam']}: onbekende kleur '{t}'")
    if fouten:
        sys.exit('Fouten in pixel-iconen.txt:\n  ' + '\n  '.join(dict.fromkeys(fouten)))
    return kleuren, iconen


def svg(ic, kleuren):
    h, w = len(ic['rijen']), len(ic['rijen'][0])
    delen = []
    for y, rij in enumerate(ic['rijen']):
        x = 0
        while x < w:
            t = rij[x]
            if t == '.':
                x += 1
                continue
            lengte = 1
            while x + lengte < w and rij[x + lengte] == t:
                lengte += 1
            delen.append(f'<rect x="{x}" y="{y}" width="{lengte}" height="1" fill="{kleuren[t]}"/>')
            x += lengte
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'shape-rendering="crispEdges">' + ''.join(delen) + '</svg>\n')


def img(naam):
    return (f'<img class="pixel-icoon" src="images/iconen/{naam}.svg" alt="" '
            f'width="12" height="12">')


def maak(kleuren, iconen):
    UIT.mkdir(parents=True, exist_ok=True)
    for ic in iconen:
        (UIT / f"{ic['naam']}.svg").write_text(svg(ic, kleuren), encoding='utf-8')
    tegels = ''.join(
        f'<figure><img src="../images/iconen/{ic["naam"]}.svg" alt="">'
        f'<figcaption>{ic["naam"]} {" ".join(ic["emoji"])}</figcaption></figure>'
        for ic in iconen)
    OVERZICHT.write_text(f'''<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8"><meta name="robots" content="noindex">
<title>Pixel-iconen · Aardblij Workshops</title>
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 32px; background: #fff; }}
h1 {{ font-size: 28px; }}
.raster {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; }}
figure {{ margin: 0; padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center; }}
figure img {{ width: 72px; height: 72px; image-rendering: pixelated; }}
figcaption {{ font-size: 13px; color: #555; margin-top: 8px; }}
</style></head><body>
<h1>Pixel-iconen ({len(iconen)})</h1>
<div class="raster">{tegels}</div>
</body></html>
''', encoding='utf-8')
    print(f'{len(iconen)} iconen gemaakt in images/iconen/, overzicht in tools/pixel-iconen-overzicht.html')


def vervang(iconen):
    paren = [(e, ic['naam']) for ic in iconen for e in ic['emoji']]
    # langste eerst, zodat samengestelde emoji's voorgaan; optionele FE0F erachter
    paren.sort(key=lambda p: -len(p[0]))
    totaal = 0
    for pagina in sorted(ROOT.glob('*.html')):
        tekst = pagina.read_text(encoding='utf-8')
        nieuw = tekst
        for emoji, naam in paren:
            basis = emoji.replace('️', '')
            patroon = re.compile(re.escape(basis) + '️?')
            nieuw, n = patroon.subn(img(naam), nieuw)
            totaal += n
        if nieuw != tekst:
            pagina.write_text(nieuw, encoding='utf-8')
            print(f'  {pagina.name}')
    print(f'{totaal} emoji\'s vervangen door pixel-iconen')


if __name__ == '__main__':
    kleuren, iconen = lees()
    maak(kleuren, iconen)
    if '--vervang' in sys.argv:
        vervang(iconen)
