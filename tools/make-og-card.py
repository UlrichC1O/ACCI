#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fabrique assets/img/og-card.png — la vignette des aperçus de lien.

C'est l'image que WhatsApp, Facebook, LinkedIn ou X affichent quand quelqu'un
partage une adresse du site. Elle est unique pour tout le site : build.py la
déclare en og:image et twitter:image sur chacune des pages.

Pourquoi un script plutôt qu'un fichier dessiné à la main : la vignette porte le
nom de domaine en toutes lettres. Une adresse qui change — et celle-ci a déjà
changé une fois — laisse sinon une image obsolète que rien ne signale, puisque
le texte est en pixels et qu'aucune recherche dans le code ne le trouve.

    python3 tools/make-og-card.py

Dépendance : Google Chrome, déjà nécessaire à personne d'autre dans ce dépôt,
mais c'est le seul moyen d'obtenir un rendu typographique correct sans
bibliothèque tierce. Le script s'arrête avec un message clair s'il est absent.
"""
import base64
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
FONTS = os.path.join(ROOT, "assets", "fonts")
OUT = os.path.join(IMG, "og-card.png")

# Reprises de assets/css/styles.css : la vignette doit être reconnaissable comme
# appartenant au même site que la page qu'elle annonce.
GREEN_DEEP = "#07301F"
GREEN_D = "#0B3D2E"
GREEN = "#0B7A3B"
ORANGE = "#FF7105"

DOMAIN = "www.ivoiriens.ac.ci"
LONG_NAME = "Association des Créateurs<br>de Contenu Ivoiriens"
TAGLINE = ("Pour un usage responsable, sûr et éthique<br>"
           "des réseaux sociaux en Côte d’Ivoire.")

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
]


def _b64(path):
    with open(path, "rb") as fh:
        return base64.b64encode(fh.read()).decode("ascii")


def _chrome():
    for c in CHROME_CANDIDATES:
        if os.path.exists(c):
            return c
    found = subprocess.run(["which", "google-chrome"], capture_output=True,
                           text=True).stdout.strip()
    if found:
        return found
    sys.exit("Google Chrome est introuvable : impossible de rendre la vignette.\n"
             "Installez-le, ou ajoutez son chemin à CHROME_CANDIDATES.")


def build_html():
    # Le logo clair est un PNG palettisé avec transparence (tRNS) : posé sur le
    # fond vert, il n'apporte pas de rectangle blanc. C'est la variante « light »
    # qu'il faut ici — dans l'autre, la barre du « I » est sombre et disparaît.
    logo = _b64(os.path.join(IMG, "logo-wordmark-light-480.png"))
    sora = _b64(os.path.join(FONTS, "sora-600-latin.woff2"))
    inter = _b64(os.path.join(FONTS, "inter-400-latin.woff2"))
    inter6 = _b64(os.path.join(FONTS, "inter-600-latin.woff2"))
    return f"""<!doctype html><meta charset="utf-8"><style>
@font-face{{font-family:Sora;src:url(data:font/woff2;base64,{sora})format('woff2');font-weight:600}}
@font-face{{font-family:Inter;src:url(data:font/woff2;base64,{inter})format('woff2');font-weight:400}}
@font-face{{font-family:Inter;src:url(data:font/woff2;base64,{inter6})format('woff2');font-weight:600}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1200px;height:630px}}
/* Dégradé vertical, et non diagonal : le PNG filtre ligne par ligne, donc un
   dégradé dont chaque ligne est unie se compresse presque entièrement. Le même
   dessin en diagonale pesait 289 Ko contre 83 Ko ici, pour une différence
   invisible — et WhatsApp, par où passe l'essentiel des partages, renonce à
   l'aperçu au-delà de quelques centaines de kilo-octets. */
.card{{position:relative;width:1200px;height:630px;overflow:hidden;
  background:linear-gradient(180deg,{GREEN_DEEP} 0%,{GREEN_D} 62%,#0d4a33 100%)}}
/* Bandeau ivoirien : orange, blanc, vert. */
.flag{{position:absolute;inset:0 0 auto 0;height:10px;display:flex}}
.flag i{{flex:1}} .flag i:nth-child(1){{background:{ORANGE}}}
.flag i:nth-child(2){{background:#fff}} .flag i:nth-child(3){{background:{GREEN}}}
/* Deux disques très peu contrastés : ils donnent de la profondeur sans
   concurrencer le texte, comme sur les bandeaux du site. */
.orb{{position:absolute;border-radius:50%;background:rgba(255,255,255,.035)}}
.orb--a{{width:520px;height:520px;right:-130px;top:-150px}}
.orb--b{{width:330px;height:330px;left:-120px;bottom:-140px}}
.inner{{position:absolute;left:88px;top:96px;right:88px}}
.logo{{height:120px;width:auto;display:block}}
.name{{font-family:Sora,sans-serif;font-weight:600;font-size:41px;line-height:1.24;
  color:#F7A867;margin-top:38px;letter-spacing:-.4px}}
.tag{{font-family:Inter,sans-serif;font-weight:400;font-size:27px;line-height:1.45;
  color:rgba(255,255,255,.90);margin-top:26px}}
.domain{{position:absolute;left:88px;bottom:64px;font-family:Inter,sans-serif;
  font-weight:600;font-size:23px;letter-spacing:.3px;color:#7FC9A3}}
</style>
<div class="card">
  <div class="flag"><i></i><i></i><i></i></div>
  <div class="orb orb--a"></div><div class="orb orb--b"></div>
  <div class="inner">
    <img class="logo" src="data:image/png;base64,{logo}" alt="">
    <div class="name">{LONG_NAME}</div>
    <div class="tag">{TAGLINE}</div>
  </div>
  <div class="domain">{DOMAIN}</div>
</div>"""


def main():
    chrome = _chrome()
    with tempfile.TemporaryDirectory() as tmp:
        html = os.path.join(tmp, "card.html")
        with open(html, "w", encoding="utf-8") as fh:
            fh.write(build_html())
        subprocess.run([
            chrome, "--headless", "--disable-gpu", "--hide-scrollbars",
            "--force-device-scale-factor=1", "--default-background-color=00000000",
            f"--screenshot={OUT}", "--window-size=1200,630",
            "--virtual-time-budget=4000", html,
        ], check=True, capture_output=True)
    size = os.path.getsize(OUT)
    print(f"✓ {os.path.relpath(OUT, ROOT)} — 1200×630, {size // 1024} Ko, domaine {DOMAIN}")


if __name__ == "__main__":
    main()
