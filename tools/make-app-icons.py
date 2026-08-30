#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fabrique les icônes de l'application installable (CRM ACCI).

    python3 tools/make-app-icons.py

Produit dans assets/img/ :
    app-icon-192.png            icône Android / bureau
    app-icon-512.png            icône haute définition, écrans de démarrage
    app-icon-maskable-512.png   variante « maskable » (voir plus bas)

POURQUOI UNE ICÔNE À PART DE LA FAVICON
La favicon est transparente à dessein : elle doit tenir sur un onglet clair
comme sur un onglet sombre. Une icône d'application est posée sur le fond
d'écran du téléphone — Android la composite sur du blanc, iOS sur du noir.
Transparente, la marque verte disparaissait sur l'un et sur l'autre. Ces
icônes portent donc un fond opaque.

POURQUOI LE C EXTÉRIEUR EST BLANC ET NON VERT
Sur le fond vert sombre de la marque, un C vert n'a plus de contraste — la
remarque est déjà consignée dans assets/img/favicon.svg. Le C extérieur
reprend donc la variante claire du logotype, celle du pied de page ; le C
intérieur garde l'orange, qui ressort sur les deux.

POURQUOI UNE VARIANTE « MASKABLE »
Android découpe l'icône à la forme choisie par le constructeur : cercle,
goutte, carré arrondi. Une icône dessinée bord à bord y perd ses extrémités.
La variante maskable garde tout le dessin dans la « zone sûre » — le cercle
de 80 % centré — et ne laisse aux angles que du fond.

AUCUNE DÉPENDANCE
Ni Pillow ni ImageMagick ne sont installés ici, et Chrome — employé par
tools/make-og-card.py — se révèle peu fiable en mode headless quand une
session de navigation est déjà ouverte. Le dessin ne comporte que des arcs
de cercle : il est donc rastérisé directement, et le PNG écrit avec zlib,
tous deux dans la bibliothèque standard. Le rendu est ainsi reproductible et
ne dépend d'aucun logiciel installé sur le poste.
"""
import math
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")

# Couleurs relevées sur le logotype (voir assets/img/favicon.svg).
BG = (0x07, 0x30, 0x1F)        # vert profond du pied de page
OUTER = (0xFF, 0xFF, 0xFF)     # C extérieur, variante claire
INNER = (0xFF, 0x71, 0x05)     # C intérieur, orange de marque

# Géométrie reprise du viewBox 48×48 de la favicon, centre (24, 24).
# Les deux arcs s'ouvrent à droite : ils couvrent tout SAUF le secteur
# [-GAP, +GAP] mesuré depuis l'axe horizontal droit.
GAP = math.radians(52.0)
ARCS = [
    # (rayon, demi-épaisseur, couleur)
    (16.5, 3.0, OUTER),
    (6.4,  2.5, INNER),
]

# Demi-ouverture de l'arc, mesurée depuis le milieu de la matière. Le logotype
# laisse un jour de 2 × 52° à droite ; l'arc couvre donc le reste.
APERTURE = math.pi - math.radians(52.0)
SC = (math.sin(APERTURE), math.cos(APERTURE))


def _sd_arc(px, py, ra, rb):
    """Distance signée à un arc à bouts ronds (négative à l'intérieur).

    Formule analytique plutôt qu'un suréchantillonnage : rendre le 512 en
    échantillonnant 4×4 sous-pixels demandait plus de huit millions d'appels
    trigonométriques et prenait plusieurs minutes. Ici chaque pixel coûte une
    racine carrée, et le lissage se déduit de la distance elle-même.

    L'arc de référence est symétrique autour de l'axe +y ; le logotype ouvre le
    sien à droite. Les coordonnées sont donc pivotées d'un quart de tour par
    l'appelant, ce qui évite de réécrire la formule.
    """
    px = abs(px)
    if SC[1] * px > SC[0] * py:
        # Au-delà de l'extrémité : distance au bout rond.
        return math.hypot(px - SC[0] * ra, py - SC[1] * ra) - rb
    # Sur le corps de l'arc : distance à la couronne.
    return abs(math.hypot(px, py) - ra) - rb


def render(size, scale):
    """Rend l'icône à `size` pixels de côté. `scale` réduit le dessin (maskable)."""
    unit = size * scale / 48.0          # 48 unités de viewBox -> pixels
    cx = cy = size / 2.0
    # Un pixel vaut cette fraction d'unité : c'est la largeur sur laquelle le
    # bord est fondu, donc la finesse du lissage.
    aa = 0.5 / unit
    rows = []
    for y in range(size):
        row = bytearray()
        uy = (y + 0.5 - cy) / unit
        for x in range(size):
            ux = (x + 0.5 - cx) / unit
            # Quart de tour : la direction -x du logotype devient +y.
            qx, qy = uy, -ux
            r, g, b = BG
            for radius, half, colour in ARCS:
                sd = _sd_arc(qx, qy, radius, half)
                if sd >= aa:
                    continue                      # nettement dehors
                cov = 1.0 if sd <= -aa else (aa - sd) / (2.0 * aa)
                r = int(r + (colour[0] - r) * cov + 0.5)
                g = int(g + (colour[1] - g) * cov + 0.5)
                b = int(b + (colour[2] - b) * cov + 0.5)
            row += bytes((r, g, b))
        rows.append(row)
    return rows


def write_png(path, size, rows):
    """PNG 8 bits RVB sans transparence — le fond est opaque par construction."""
    raw = b"".join(b"\x00" + bytes(r) for r in rows)   # filtre 0 par ligne

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    png = (b"\x89PNG\r\n\x1a\n" +
           chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)) +
           chunk(b"IDAT", zlib.compress(raw, 9)) +
           chunk(b"IEND", b""))
    with open(path, "wb") as fh:
        fh.write(png)
    return len(png)


def main():
    print("Icônes de l'application ACCI")
    # 0.66 : la marque respire, comme sur les icônes système. 0.52 pour la
    # variante maskable — le cercle sûr fait 80 % du côté, et le dessin doit y
    # tenir entièrement, pas seulement le déborder de peu.
    for size, scale, name in (
        (192, 0.66, "app-icon-192.png"),
        (512, 0.66, "app-icon-512.png"),
        (512, 0.52, "app-icon-maskable-512.png"),
    ):
        out = os.path.join(IMG, name)
        n = write_png(out, size, render(size, scale))
        print("  ✓ %-28s %d×%d  %.1f Ko" % (name, size, size, n / 1024.0))
    print("Terminé.")


if __name__ == "__main__":
    main()
