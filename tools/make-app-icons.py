#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fabrique les icônes de l'application installable (CRM ACCI).

    python3 tools/make-app-icons.py

Produit dans assets/img/ :
    app-icon-180.png            icône iOS (« Sur l'écran d'accueil »)
    app-icon-192.png            icône Android / bureau
    app-icon-512.png            icône haute définition, écrans de démarrage
    app-icon-maskable-512.png   variante « maskable » (voir plus bas)

LE LOGO, SUR FOND ORANGE — ET LA DIFFICULTÉ QUE CELA POSE
L'icône reprend le vrai logotype ACCI, celui du site, et non un dessin
approchant. Sur fond orange, une difficulté apparaît pourtant : le « A » et le
« C » intérieur du logotype SONT orange. Posés directement sur un aplat de la
même couleur, ils disparaissent, et il ne reste que le C vert et la barre du
I — un logo amputé de moitié.

Le logotype est donc posé sur une pastille blanche, comme le font la plupart
des marques dont le logo est polychrome. Le fond de l'icône reste orange,
le logotype reste exactement lui-même, et les quatre lettres se lisent.

POURQUOI UNE VARIANTE « MASKABLE »
Android découpe l'icône à la forme choisie par le constructeur : cercle,
goutte, carré arrondi. Une icône dessinée bord à bord y perd ses extrémités.
La variante maskable garde tout le dessin dans la « zone sûre » — le cercle
de 80 % centré — et ne laisse aux angles que du fond.

AUCUNE DÉPENDANCE
Ni Pillow ni ImageMagick ne sont installés ici, et Chrome en mode headless
se révèle peu fiable quand une session de navigation est déjà ouverte. Le
PNG source est donc décodé, réduit et composité par ce fichier, avec zlib
seul. Le rendu est reproductible et ne dépend d'aucun logiciel du poste.
"""
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")

SOURCE = os.path.join(IMG, "logo-wordmark-480.png")

ORANGE = (0xF7, 0x7F, 0x00)     # --orange du site
TILE = (0xFF, 0xFF, 0xFF)       # pastille sous le logotype


# ---------------------------------------------------------------- décodage --
def decode_png(path):
    """Décode un PNG 8 bits à palette (avec tRNS) en lignes RVBA.

    Le logotype du site est enregistré sous cette forme ; les autres formats
    ne sont pas gérés, et l'erreur le dit plutôt que de rendre une image
    fausse en silence.
    """
    with open(path, "rb") as fh:
        data = fh.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(path + " n'est pas un PNG")

    w = h = None
    palette, trns, idat = b"", b"", b""
    i = 8
    while i < len(data):
        ln = struct.unpack(">I", data[i:i + 4])[0]
        tag = data[i + 4:i + 8]
        body = data[i + 8:i + 8 + ln]
        if tag == b"IHDR":
            w, h, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", body)
            if depth != 8 or ctype != 3 or interlace:
                raise ValueError("format non géré : profondeur=%d type=%d entrelacé=%d"
                                 % (depth, ctype, interlace))
        elif tag == b"PLTE":
            palette = body
        elif tag == b"tRNS":
            trns = body
        elif tag == b"IDAT":
            idat += body
        elif tag == b"IEND":
            break
        i += 12 + ln

    raw = zlib.decompress(idat)

    # Défiltrage. Un octet par pixel (index de palette), donc bpp = 1.
    out, prev, pos = [], bytearray(w), 0
    for _ in range(h):
        ftype = raw[pos]; pos += 1
        line = bytearray(raw[pos:pos + w]); pos += w
        if ftype == 1:
            for x in range(1, w):
                line[x] = (line[x] + line[x - 1]) & 0xFF
        elif ftype == 2:
            for x in range(w):
                line[x] = (line[x] + prev[x]) & 0xFF
        elif ftype == 3:
            for x in range(w):
                left = line[x - 1] if x else 0
                line[x] = (line[x] + ((left + prev[x]) >> 1)) & 0xFF
        elif ftype == 4:
            for x in range(w):
                a = line[x - 1] if x else 0
                b = prev[x]
                c = prev[x - 1] if x else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 0xFF
        elif ftype != 0:
            raise ValueError("filtre PNG inconnu : %d" % ftype)
        out.append(line)
        prev = line

    # Indices -> RVBA.
    rgba = []
    for line in out:
        row = []
        for idx in line:
            o = idx * 3
            a = trns[idx] if idx < len(trns) else 255
            row.append((palette[o], palette[o + 1], palette[o + 2], a))
        rgba.append(row)
    return w, h, rgba


# ---------------------------------------------------------------- échelle --
def scale(src, sw, sh, dw, dh):
    """Réduction par moyenne de zone.

    Un simple prélèvement du plus proche voisin hacherait les diagonales du
    « A » et les arcs des « C » — c'est précisément ce qui se voit sur une
    icône de 192 pixels. La moyenne sur la zone couverte donne le lissage.
    L'alpha est prémultiplié pendant le calcul, sans quoi les pixels
    transparents (noirs par convention dans la palette) assombriraient le
    pourtour du logotype.
    """
    dst = []
    for dy in range(dh):
        y0, y1 = dy * sh // dh, max(dy * sh // dh + 1, (dy + 1) * sh // dh)
        row = []
        for dx in range(dw):
            x0, x1 = dx * sw // dw, max(dx * sw // dw + 1, (dx + 1) * sw // dw)
            r = g = b = a = n = 0
            for y in range(y0, y1):
                line = src[y]
                for x in range(x0, x1):
                    pr, pg, pb, pa = line[x]
                    r += pr * pa; g += pg * pa; b += pb * pa; a += pa; n += 1
            if a:
                row.append((r // a, g // a, b // a, a // n))
            else:
                row.append((0, 0, 0, 0))
        dst.append(row)
    return dst


# ------------------------------------------------------------- composition --
def rounded_mask(size, box, radius):
    """Masque d'une pastille à coins arrondis, avec un bord lissé."""
    x0, y0, x1, y1 = box
    mask = [[0.0] * size for _ in range(size)]
    for y in range(size):
        for x in range(size):
            # Distance signée à un rectangle arrondi.
            cx = max(x0 + radius - (x + 0.5), (x + 0.5) - (x1 - radius), 0.0)
            cy = max(y0 + radius - (y + 0.5), (y + 0.5) - (y1 - radius), 0.0)
            d = (cx * cx + cy * cy) ** 0.5 - radius
            if x + 0.5 < x0 or x + 0.5 > x1 or y + 0.5 < y0 or y + 0.5 > y1:
                d = max(d, 0.5)
            mask[y][x] = 1.0 if d <= -0.5 else (0.0 if d >= 0.5 else 0.5 - d)
    return mask


def build(size, logo_frac, tile):
    """Compose une icône : fond orange, pastille blanche, logotype centré."""
    sw, sh, src = decode_png(SOURCE)

    # Largeur visée pour le logotype, hauteur déduite du rapport d'origine.
    lw = max(1, int(round(size * logo_frac)))
    lh = max(1, int(round(lw * sh / sw)))
    logo = scale(src, sw, sh, lw, lh)

    ox, oy = (size - lw) // 2, (size - lh) // 2

    px = [[ORANGE] * size for _ in range(size)]

    if tile:
        # La pastille est CARRÉE, et non ajustée au logotype. Le logotype est
        # un rectangle large (480 × 293) : une pastille à ses proportions
        # donnait une bande posée au milieu d'un carré orange, avec deux
        # grandes zones mortes au-dessus et au-dessous. Un carré arrondi se
        # lit comme une icône ; une bande se lit comme une bannière rognée.
        pad_x = int(round(lw * 0.14))
        side = lw + 2 * pad_x
        t0 = (size - side) // 2
        box = (t0, t0, t0 + side, t0 + side)
        mask = rounded_mask(size, box, side * 0.22)
        for y in range(size):
            for x in range(size):
                m = mask[y][x]
                if m <= 0:
                    continue
                r, g, b = px[y][x]
                px[y][x] = (int(r + (TILE[0] - r) * m + .5),
                            int(g + (TILE[1] - g) * m + .5),
                            int(b + (TILE[2] - b) * m + .5))

    for y in range(lh):
        ty = oy + y
        if not (0 <= ty < size):
            continue
        for x in range(lw):
            tx = ox + x
            if not (0 <= tx < size):
                continue
            r, g, b, a = logo[y][x]
            if not a:
                continue
            br, bg, bb = px[ty][tx]
            k = a / 255.0
            px[ty][tx] = (int(br + (r - br) * k + .5),
                          int(bg + (g - bg) * k + .5),
                          int(bb + (b - bb) * k + .5))
    return px


def write_png(path, size, px):
    raw = b"".join(b"\x00" + b"".join(bytes(p) for p in row) for row in px)

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    blob = (b"\x89PNG\r\n\x1a\n" +
            chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)) +
            chunk(b"IDAT", zlib.compress(raw, 9)) +
            chunk(b"IEND", b""))
    with open(path, "wb") as fh:
        fh.write(blob)
    return len(blob)


def main():
    print("Icônes de l'application ACCI — logotype sur fond orange")
    # 0.62 : le logotype occupe l'icône sans toucher les bords.
    # 0.46 pour la maskable : tout doit tenir dans le cercle de 80 %.
    # 180 : iOS ignore les icônes du manifeste pour « Sur l'écran d'accueil »
    # et ne lit que apple-touch-icon. Sans ce fichier, l'application installée
    # depuis un iPhone gardait l'ancienne icône, et le manifeste n'y pouvait
    # rien. Il est distinct de assets/img/apple-touch-icon.png, qui appartient
    # au site public : l'application a son icône, le site garde la sienne.
    for size, frac, name in (
        (180, 0.62, "app-icon-180.png"),
        (192, 0.62, "app-icon-192.png"),
        (512, 0.62, "app-icon-512.png"),
        (512, 0.46, "app-icon-maskable-512.png"),
    ):
        out = os.path.join(IMG, name)
        n = write_png(out, size, build(size, frac, True))
        print("  ✓ %-28s %d×%d  %.1f Ko" % (name, size, size, n / 1024.0))
    print("Terminé.")


if __name__ == "__main__":
    main()
