#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ACCI — Générateur de site statique
Association des Créateurs de Contenu Ivoiriens

Génère un site web professionnel de 50 pages en français.
Aucune dépendance externe — Python 3 uniquement.

Usage:
    python3 build.py            # construit le site dans ./dist
    python3 build.py --serve    # construit puis lance un serveur local
"""

import os
import re
import sys
import math
import shutil
import html
import datetime
import http.server
import socketserver

from content.site import SITE, NAV, FOOTER, UTILITY, SOCIAL
from content import pages as PAGES_MODULE

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")
ASSETS = os.path.join(ROOT, "assets")
ADMIN = os.path.join(ROOT, "admin")

# Année de génération (utilisée dans le pied de page et le copyright)
YEAR = SITE.get("year", 2026)
BUILD_DATE = "24 juin 2026"


# ---------------------------------------------------------------------------
# Icônes SVG (jeu cohérent, trait fin, style « line »)
# ---------------------------------------------------------------------------
ICONS = {
    "shield":     '<path d="M12 3l7 3v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3z"/>',
    "alert":      '<path d="M12 3l9 16H3l9-16z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/>',
    "users":      '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3 3 0 0 1 0 5.8"/><path d="M21 20c0-2.4-1.4-4.5-3.5-5.4"/>',
    "scale":      '<path d="M12 4v16"/><path d="M6 8h12"/><path d="M6 8l-3 6h6l-3-6z"/><path d="M18 8l-3 6h6l-3-6z"/><path d="M8 20h8"/>',
    "book":       '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z"/><path d="M18 19H6"/>',
    "flag":       '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    "eye":        '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
    "lock":       '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    "heart":      '<path d="M12 20s-7-4.5-9.5-9C1 7.5 3 4.5 6 4.5c2 0 3.2 1.2 4 2.5.8-1.3 2-2.5 4-2.5 3 0 5 3 3.5 6.5C19 15.5 12 20 12 20z"/>',
    "graduation": '<path d="M2 8l10-4 10 4-10 4L2 8z"/><path d="M6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
    "megaphone":  '<path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1z"/><path d="M18 8a4 4 0 0 1 0 8"/>',
    "doc":        '<path d="M7 3h7l5 5v13H7V3z"/><path d="M14 3v5h5"/><line x1="10" y1="13" x2="16" y2="13"/><line x1="10" y1="16" x2="16" y2="16"/>',
    "check":      '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
    "x-circle":   '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    "phone":      '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    "mail":       '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    "map":        '<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
    "globe":      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    "search":     '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>',
    "calendar":   '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
    "camera":     '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-2h5L16 7"/>',
    "play":       '<circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/>',
    "handshake":  '<path d="M3 12l4-4 4 3 4-3 6 5"/><path d="M11 11l2 2 3-3"/><path d="M3 12v4h3M21 13v3h-3"/>',
    "gift":       '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M2 9h20v3H2zM12 9v11"/><path d="M12 9S9 3 7 5s5 4 5 4zM12 9s3-6 5-4-5 4-5 4z"/>',
    "star":       '<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.8L12 3z"/>',
    "lightbulb":  '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.3 1 2.5h6c0-1.2.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    "warning":    '<path d="M10.3 4.3l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-2.7l-8-14a2 2 0 0 0-3.4 0z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/>',
    "compass":    '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" fill="currentColor"/>',
    "key":        '<circle cx="8" cy="12" r="4"/><path d="M11.5 12H21l-2 2 2 2"/>',
    "child":      '<circle cx="12" cy="6" r="2.5"/><path d="M12 8.5v6M8 11l4 1 4-1M9 20l3-5 3 5"/>',
    "money":      '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v6M18 9v6"/>',
    "copyright":  '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5a3.5 3.5 0 1 0 0 5"/>',
    "fact":       '<path d="M9 11l2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
    "network":    '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v4M10.5 13l-4 3M13.5 13l4 3"/>',
    "quote":      '<path d="M7 7H4v6h3l-1 4h2l1-4V7zM17 7h-3v6h3l-1 4h2l1-4V7z" fill="currentColor"/>',
    "arrow":      '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "download":   '<path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 19h16"/>',
    "clock":      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "bullhorn":   '<path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1z"/><path d="M18 8a4 4 0 0 1 0 8"/>',
    "chat":       '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/>',
    "send":       '<path d="M4 12l16-8-6 16-3-6-7-2z"/>',
    "sparkle":    '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>',
}


def icon(name, size=24, cls="icon"):
    body = ICONS.get(name, ICONS["star"])
    return (
        f'<svg class="{cls}" viewBox="0 0 24 24" width="{size}" height="{size}" '
        f'fill="none" stroke="currentColor" stroke-width="1.6" '
        f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{body}</svg>'
    )


# Logos de marques (réseaux sociaux) — glyphes pleins, rendus avec fill
BRAND_ICONS = {
    "facebook": '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
    "x": '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
    "instagram": '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>',
    "tiktok": '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
    "youtube": '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
    "linkedin": '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>',
}


def brand_icon(name, size=18, cls="brandicon"):
    body = BRAND_ICONS.get(name, "")
    return (
        f'<svg class="{cls}" viewBox="0 0 24 24" width="{size}" height="{size}" '
        f'fill="currentColor" aria-hidden="true">{body}</svg>'
    )


def social_attrs(href):
    """Attributs pour un lien social (nouvel onglet si lien externe)."""
    return ' target="_blank" rel="noopener noreferrer"' if str(href).startswith("http") else ""


def ci_flag(h=14):
    """Drapeau de la Côte d'Ivoire (orange · blanc · vert)."""
    w = round(h * 1.5)
    return (
        f'<svg class="ci-flag" viewBox="0 0 9 6" width="{w}" height="{h}" '
        f'role="img" aria-label="Drapeau de la Côte d\'Ivoire">'
        f'<rect width="9" height="6" fill="#ffffff"/>'
        f'<rect width="3" height="6" x="0" fill="#F77F00"/>'
        f'<rect width="3" height="6" x="6" fill="#009A44"/>'
        f'</svg>'
    )


# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------
def e(text):
    """Échappe le HTML."""
    return html.escape(str(text), quote=True)


def rel_prefix(slug):
    """Préfixe relatif pour atteindre la racine depuis une page."""
    return ""  # toutes les pages sont à la racine de /dist


def url(slug):
    if slug in ("", "index", "/"):
        return "index.html"
    if slug.startswith("http") or slug.endswith(".html") or slug.startswith("#") or slug.startswith("mailto"):
        return slug
    return f"{slug}.html"


def para(text):
    """Transforme du texte simple en paragraphe, gère le gras **...**."""
    t = e(text)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    return t


# ---------------------------------------------------------------------------
# Rendu des blocs de contenu
# ---------------------------------------------------------------------------
def r_hero(b, page):
    variant = b.get("variant", "default")
    kicker = f'<span class="hero__kicker">{e(b["kicker"])}</span>' if b.get("kicker") else ""
    subtitle = f'<p class="hero__subtitle">{para(b["subtitle"])}</p>' if b.get("subtitle") else ""
    ctas = ""
    if b.get("cta"):
        btns = "".join(
            f'<a class="btn {c.get("style","btn--primary")}" href="{url(c["href"])}">{e(c["label"])}'
            f'{icon("arrow",18,"btn__icon") if c.get("arrow") else ""}</a>'
            for c in b["cta"]
        )
        ctas = f'<div class="hero__actions">{btns}</div>'
    badges = ""
    if b.get("badges"):
        items = "".join(f'<span class="hero__badge">{icon(x.get("icon","check"),16)}{e(x["label"])}</span>' for x in b["badges"])
        badges = f'<div class="hero__badges">{items}</div>'
    has_img = " hero--has-image" if b.get("image") else ""
    media = ""
    if b.get("image"):
        media = (f'<div class="hero__media" aria-hidden="true">'
                 f'<img src="assets/img/{e(b["image"])}" alt="" loading="eager" fetchpriority="high">'
                 f'<span class="hero__scrim"></span></div>')
    return f"""
    <section class="hero hero--{variant}{has_img}">
      {media}
      <div class="hero__pattern" aria-hidden="true"></div>
      <div class="container hero__inner reveal">
        {kicker}
        <h1 class="hero__title">{para(b["title"])}</h1>
        {subtitle}
        {ctas}
        {badges}
      </div>
    </section>"""


def r_section(b, page):
    sid = f' id="{b["id"]}"' if b.get("id") else ""
    kicker = f'<span class="section__kicker">{e(b["kicker"])}</span>' if b.get("kicker") else ""
    title = f'<h2 class="section__title">{para(b["title"])}</h2>' if b.get("title") else ""
    lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
    body = "".join(f"<p>{para(p)}</p>" for p in b.get("body", []))
    align = b.get("align", "left")
    head = f'<div class="section__head section__head--{align} reveal">{kicker}{title}{lead}</div>' if (kicker or title or lead) else ""
    body_html = f'<div class="prose reveal">{body}</div>' if body else ""
    return f'<section class="section"{sid}><div class="container">{head}{body_html}</div></section>'


def r_cards(b, page):
    cols = b.get("columns", 3)
    head = ""
    if b.get("title") or b.get("lead"):
        kicker = f'<span class="section__kicker">{e(b["kicker"])}</span>' if b.get("kicker") else ""
        title = f'<h2 class="section__title">{para(b["title"])}</h2>' if b.get("title") else ""
        lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal">{kicker}{title}{lead}</div>'
    items = ""
    for c in b["items"]:
        ic = f'<span class="card__icon">{icon(c.get("icon","star"),26)}</span>' if c.get("icon") else ""
        tag = f'<span class="card__tag">{e(c["tag"])}</span>' if c.get("tag") else ""
        text = f'<p class="card__text">{para(c["text"])}</p>' if c.get("text") else ""
        link = ""
        clickable_open = clickable_close = ""
        if c.get("href"):
            link = f'<span class="card__link">{e(c.get("link_label","En savoir plus"))} {icon("arrow",16,"card__arrow")}</span>'
            clickable_open = f'<a class="card card--link" href="{url(c["href"])}">'
            clickable_close = "</a>"
        else:
            clickable_open = '<div class="card">'
            clickable_close = "</div>"
        items += f'{clickable_open}{ic}{tag}<h3 class="card__title">{para(c["title"])}</h3>{text}{link}{clickable_close}'
    return f'<section class="section"><div class="container">{head}<div class="grid grid--{cols} reveal">{items}</div></div></section>'


def r_stats(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head section__head--center reveal"><h2 class="section__title">{para(b["title"])}</h2></div>'
    items = ""
    for s in b["items"]:
        suffix = f'<span class="stat__suffix">{e(s.get("suffix",""))}</span>' if s.get("suffix") else ""
        items += (
            f'<div class="stat"><div class="stat__value" data-count="{e(s.get("value",""))}">'
            f'{e(s["value"])}</div>{suffix}<div class="stat__label">{e(s["label"])}</div></div>'
        )
    variant = b.get("variant", "")
    return f'<section class="section section--stats {variant}"><div class="container"><div class="stats reveal">{items}</div></div></section>'


def r_accordion(b, page):
    head = ""
    if b.get("title") or b.get("lead"):
        kicker = f'<span class="section__kicker">{e(b["kicker"])}</span>' if b.get("kicker") else ""
        title = f'<h2 class="section__title">{para(b["title"])}</h2>' if b.get("title") else ""
        lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal">{kicker}{title}{lead}</div>'
    items = ""
    for i, it in enumerate(b["items"]):
        ans = it["a"] if isinstance(it["a"], list) else [it["a"]]
        ans_html = "".join(f"<p>{para(p)}</p>" for p in ans)
        items += f"""
        <div class="accordion__item">
          <button class="accordion__trigger" aria-expanded="false">
            <span>{para(it["q"])}</span>
            <span class="accordion__icon" aria-hidden="true"></span>
          </button>
          <div class="accordion__panel"><div class="accordion__content">{ans_html}</div></div>
        </div>"""
    return f'<section class="section"><div class="container container--narrow">{head}<div class="accordion reveal">{items}</div></div></section>'


def r_steps(b, page):
    head = ""
    if b.get("title"):
        lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2>{lead}</div>'
    items = ""
    for i, s in enumerate(b["items"], 1):
        items += (
            f'<li class="step reveal"><span class="step__num">{i:02d}</span>'
            f'<div class="step__body"><h3 class="step__title">{para(s["title"])}</h3>'
            f'<p>{para(s["text"])}</p></div></li>'
        )
    return f'<section class="section"><div class="container container--narrow">{head}<ol class="steps">{items}</ol></div></section>'


def r_split(b, page):
    reverse = "split--reverse" if b.get("reverse") else ""
    text = "".join(f"<p>{para(p)}</p>" for p in b.get("text", []))
    kicker = f'<span class="section__kicker">{e(b["kicker"])}</span>' if b.get("kicker") else ""
    title = f'<h2 class="section__title">{para(b["title"])}</h2>' if b.get("title") else ""
    bullets = ""
    if b.get("bullets"):
        lis = "".join(f'<li>{icon("check",18,"li-icon")}<span>{para(x)}</span></li>' for x in b["bullets"])
        bullets = f'<ul class="ticklist">{lis}</ul>'
    cta = ""
    if b.get("cta"):
        c = b["cta"]
        cta = f'<a class="btn btn--primary" href="{url(c["href"])}">{e(c["label"])}{icon("arrow",18,"btn__icon")}</a>'
    if b.get("image"):
        cap = f'<figcaption class="split__cap">{para(b["caption"])}</figcaption>' if b.get("caption") else ""
        media = (f'<figure class="split__media split__media--photo reveal">'
                 f'<img src="assets/img/{e(b["image"])}" alt="{e(b.get("alt",""))}" loading="lazy">{cap}</figure>')
    else:
        media_icon = b.get("icon", "shield")
        media = f'<div class="split__media reveal"><div class="split__visual">{icon(media_icon,120,"split__bigicon")}</div></div>'
    body = f'<div class="split__body reveal">{kicker}{title}{text}{bullets}{cta}</div>'
    return f'<section class="section"><div class="container"><div class="split {reverse}">{body}{media}</div></div></section>'


def r_callout(b, page):
    variant = b.get("variant", "info")
    ico = {"info": "lightbulb", "warning": "warning", "danger": "alert", "success": "check"}.get(variant, "lightbulb")
    title = f'<h3 class="callout__title">{para(b["title"])}</h3>' if b.get("title") else ""
    text = "".join(f"<p>{para(p)}</p>" for p in (b["text"] if isinstance(b.get("text"), list) else [b.get("text","")]))
    return f"""<section class="section section--tight"><div class="container container--narrow">
      <div class="callout callout--{variant} reveal"><span class="callout__icon">{icon(ico,24)}</span>
      <div class="callout__body">{title}{text}</div></div></div></section>"""


def r_checklist(b, page):
    head = ""
    if b.get("title"):
        lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2>{lead}</div>'
    cols = b.get("columns", 2)
    good = b.get("variant", "good")
    ic = "check" if good == "good" else "x-circle"
    items = "".join(f'<li class="reveal">{icon(ic,20,"li-icon li-icon--"+good)}<span>{para(x)}</span></li>' for x in b["items"])
    return f'<section class="section"><div class="container">{head}<ul class="checklist checklist--{cols} checklist--{good}">{items}</ul></div></section>'


def r_quote(b, page):
    author = f'<cite class="quote__author">{e(b["author"])}</cite>' if b.get("author") else ""
    role = f'<span class="quote__role">{e(b["role"])}</span>' if b.get("role") else ""
    return f"""<section class="section"><div class="container container--narrow">
      <figure class="quote reveal"><span class="quote__mark">{icon("quote",40)}</span>
      <blockquote>{para(b["text"])}</blockquote>
      <figcaption>{author}{role}</figcaption></figure></div></section>"""


def r_cta(b, page):
    btns = ""
    for c in b.get("buttons", []):
        btns += f'<a class="btn {c.get("style","btn--light")}" href="{url(c["href"])}">{e(c["label"])}{icon("arrow",18,"btn__icon") if c.get("arrow") else ""}</a>'
    text = f'<p class="ctaband__text">{para(b["text"])}</p>' if b.get("text") else ""
    return f"""<section class="ctaband reveal"><div class="ctaband__pattern" aria-hidden="true"></div>
      <div class="container ctaband__inner"><div><h2 class="ctaband__title">{para(b["title"])}</h2>{text}</div>
      <div class="ctaband__actions">{btns}</div></div></section>"""


def r_table(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2></div>'
    ths = "".join(f"<th>{para(h)}</th>" for h in b["headers"])
    rows = ""
    for row in b["rows"]:
        tds = "".join(f"<td>{para(c)}</td>" for c in row)
        rows += f"<tr>{tds}</tr>"
    return f"""<section class="section"><div class="container">{head}
      <div class="table-wrap reveal"><table class="table"><thead><tr>{ths}</tr></thead><tbody>{rows}</tbody></table></div></div></section>"""


def r_timeline(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2></div>'
    items = ""
    for it in b["items"]:
        items += (
            f'<li class="tl__item reveal"><span class="tl__dot"></span>'
            f'<span class="tl__year">{e(it["year"])}</span>'
            f'<div class="tl__card"><h3>{para(it["title"])}</h3><p>{para(it["text"])}</p></div></li>'
        )
    return f'<section class="section"><div class="container container--narrow">{head}<ul class="timeline">{items}</ul></div></section>'


def r_team(b, page):
    head = ""
    if b.get("title"):
        lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2>{lead}</div>'
    items = ""
    for m in b["items"]:
        initials = "".join(w[0] for w in m["name"].split()[:2]).upper()
        bio = f'<p class="member__bio">{para(m["bio"])}</p>' if m.get("bio") else ""
        items += (
            f'<div class="member reveal"><div class="member__avatar">{e(initials)}</div>'
            f'<h3 class="member__name">{e(m["name"])}</h3>'
            f'<span class="member__role">{e(m["role"])}</span>{bio}</div>'
        )
    return f'<section class="section"><div class="container">{head}<div class="grid grid--3">{items}</div></div></section>'


def r_posts(b, page):
    head = ""
    if b.get("title"):
        lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2>{lead}</div>'
    items = ""
    for p in b["items"]:
        cat = f'<span class="post__cat">{e(p["category"])}</span>' if p.get("category") else ""
        date = f'<span class="post__date">{icon("calendar",15)}{e(p["date"])}</span>' if p.get("date") else ""
        href = url(p.get("href", "#"))
        items += f"""<article class="post reveal">
          <div class="post__thumb post__thumb--{p.get('color','orange')}">{icon(p.get('icon','doc'),40)}</div>
          <div class="post__body">{cat}<h3 class="post__title"><a href="{href}">{para(p["title"])}</a></h3>
          <p class="post__excerpt">{para(p.get("excerpt",""))}</p>
          <div class="post__meta">{date}</div></div></article>"""
    return f'<section class="section"><div class="container">{head}<div class="grid grid--3">{items}</div></div></section>'


def r_downloads(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2></div>'
    items = ""
    for d in b["items"]:
        items += f"""<div class="download reveal"><span class="download__icon">{icon("doc",26)}</span>
          <div class="download__body"><h3>{para(d["title"])}</h3><p>{para(d.get("text",""))}</p></div>
          <span class="download__meta">{e(d.get("meta","PDF"))}{icon("download",18,"download__dl")}</span></div>"""
    return f'<section class="section"><div class="container container--narrow">{head}<div class="downloads">{items}</div></div></section>'


def r_definitions(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2></div>'
    items = ""
    for d in b["items"]:
        items += f'<div class="defn reveal"><dt>{para(d["term"])}</dt><dd>{para(d["def"])}</dd></div>'
    return f'<section class="section"><div class="container container--narrow">{head}<dl class="defns">{items}</dl></div></section>'


def r_contact(b, page):
    info = ""
    for it in b.get("info", []):
        info += (
            f'<div class="cinfo"><span class="cinfo__icon">{icon(it.get("icon","map"),22)}</span>'
            f'<div><span class="cinfo__label">{e(it["label"])}</span>'
            f'<span class="cinfo__value">{para(it["value"])}</span></div></div>'
        )
    form = """
      <form class="cform" id="contact-form" novalidate>
        <div class="cform__row">
          <label>Nom complet <span class="req">*</span>
            <input type="text" name="name" required minlength="2" placeholder="Votre nom" autocomplete="name">
            <span class="cform__err" data-err="name"></span>
          </label>
          <label>Adresse e-mail <span class="req">*</span>
            <input type="email" name="email" required placeholder="vous@exemple.ci" autocomplete="email">
            <span class="cform__err" data-err="email"></span>
          </label>
        </div>
        <div class="cform__row">
          <label>Téléphone
            <input type="tel" name="phone" placeholder="+225 ..." autocomplete="tel">
          </label>
          <label>Objet
            <select name="subject">
              <option>Demande d'information</option>
              <option>Adhésion</option>
              <option>Signaler un abus</option>
              <option>Partenariat</option>
              <option>Presse / Médias</option>
              <option>Autre</option>
            </select>
          </label>
        </div>
        <label>Message <span class="req">*</span>
          <textarea name="message" rows="6" required minlength="10" placeholder="Votre message..."></textarea>
          <span class="cform__err" data-err="message"></span>
        </label>
        <label class="cform__check"><input type="checkbox" name="consent" required> J'accepte la politique de confidentialité de l'ACCI. <span class="cform__err" data-err="consent"></span></label>
        <input type="text" name="_hp" class="cform__hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" class="btn btn--primary" id="contact-submit">Envoyer le message</button>
        <p class="cform__note" id="cform-note" role="status" hidden></p>
      </form>"""
    return f"""<section class="section"><div class="container"><div class="contact-grid reveal">
      <div class="contact-info"><h2 class="section__title">{para(b.get("title","Nos coordonnées"))}</h2>
        <p class="section__lead">{para(b.get("lead",""))}</p>{info}</div>
      <div class="contact-form-wrap">{form}</div></div></div></section>"""


def r_richtext(b, page):
    return f'<section class="section"><div class="container container--narrow"><div class="prose reveal">{b["html"]}</div></div></section>'


def r_image(b, page):
    """Image pleine largeur (bannière) avec légende optionnelle."""
    cap = f'<figcaption class="figbanner__cap">{para(b["caption"])}</figcaption>' if b.get("caption") else ""
    narrow = " container--narrow" if b.get("narrow") else ""
    return f"""<section class="section"><div class="container{narrow}">
      <figure class="figbanner reveal"><img src="assets/img/{e(b["image"])}" alt="{e(b.get("alt",""))}" loading="lazy">{cap}</figure>
    </div></section>"""


def r_gallery(b, page):
    head = ""
    if b.get("title"):
        lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title">{para(b["title"])}</h2>{lead}</div>'
    cols = b.get("columns", 3)
    items = ""
    for g in b["items"]:
        cap = f'<span class="gphoto__cap">{para(g["caption"])}</span>' if g.get("caption") else ""
        items += (f'<figure class="gphoto reveal"><img src="assets/img/{e(g["image"])}" '
                  f'alt="{e(g.get("alt",""))}" loading="lazy">{cap}</figure>')
    return f'<section class="section"><div class="container">{head}<div class="gallery grid--{cols}">{items}</div></div></section>'


def _chart_palette(i):
    colors = ["#F77F00", "#0B7A3B", "#0B3D2E", "#E16500", "#1b6ec2", "#c87f0a", "#7a8c83"]
    return colors[i % len(colors)]


def r_chart(b, page):
    kind = b.get("kind", "bar")
    head = ""
    if b.get("title") or b.get("lead"):
        kicker = f'<span class="section__kicker">{e(b["kicker"])}</span>' if b.get("kicker") else ""
        title = f'<h2 class="section__title">{para(b["title"])}</h2>' if b.get("title") else ""
        lead = f'<p class="section__lead">{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal">{kicker}{title}{lead}</div>'
    source = f'<p class="chart__source">{para(b["source"])}</p>' if b.get("source") else ""

    if kind == "bar":
        max_v = max(it["value"] for it in b["items"]) or 1
        rows = ""
        for i, it in enumerate(b["items"]):
            pct = round(it["value"] / max_v * 100)
            color = it.get("color") or _chart_palette(i)
            val = f'{it["value"]}{e(it.get("suffix",""))}'
            rows += (
                f'<div class="cbar reveal"><span class="cbar__label">{para(it["label"])}</span>'
                f'<span class="cbar__track"><span class="cbar__fill" style="--w:{pct}%;--c:{color}">'
                f'<span class="cbar__val">{val}</span></span></span></div>'
            )
        body = f'<div class="chart chart--bar">{rows}</div>'

    elif kind == "donut":
        total = sum(it["value"] for it in b["items"]) or 1
        r = 70.0
        C = 2 * math.pi * r
        acc = 0.0
        segs = ""
        legend = ""
        for i, it in enumerate(b["items"]):
            frac = it["value"] / total
            seg_len = frac * C
            color = it.get("color") or _chart_palette(i)
            segs += (
                f'<circle class="donut__seg" cx="100" cy="100" r="{r}" fill="none" '
                f'stroke="{color}" stroke-width="26" '
                f'stroke-dasharray="{seg_len:.2f} {C - seg_len:.2f}" '
                f'stroke-dashoffset="{-acc:.2f}" transform="rotate(-90 100 100)" '
                f'stroke-linecap="butt"></circle>'
            )
            acc += seg_len
            pct = round(frac * 100)
            legend += (
                f'<li class="donut__legitem"><span class="donut__swatch" style="background:{color}"></span>'
                f'<span class="donut__legtext">{para(it["label"])}</span>'
                f'<span class="donut__legval">{pct} %</span></li>'
            )
        center = b.get("center", "")
        centre_html = (f'<div class="donut__center"><span class="donut__big">{e(center)}</span>'
                       f'<span class="donut__small">{e(b.get("center_label",""))}</span></div>') if center else ""
        body = f"""<div class="chart chart--donut reveal">
          <div class="donut"><svg viewBox="0 0 200 200" role="img" aria-label="{e(b.get('title',''))}">
            <circle cx="100" cy="100" r="{r}" fill="none" stroke="#eef2f0" stroke-width="26"></circle>
            {segs}</svg>{centre_html}</div>
          <ul class="donut__legend">{legend}</ul></div>"""
    else:
        body = ""

    narrow = " container--narrow" if b.get("narrow") else ""
    return f'<section class="section"><div class="container{narrow}">{head}<div class="chart-card reveal">{body}{source}</div></div></section>'


RENDERERS = {
    "hero": r_hero, "section": r_section, "cards": r_cards, "stats": r_stats,
    "accordion": r_accordion, "steps": r_steps, "split": r_split, "callout": r_callout,
    "checklist": r_checklist, "quote": r_quote, "cta": r_cta, "table": r_table,
    "timeline": r_timeline, "team": r_team, "posts": r_posts, "downloads": r_downloads,
    "definitions": r_definitions, "contact": r_contact, "richtext": r_richtext,
    "image": r_image, "gallery": r_gallery, "chart": r_chart,
}


def render_blocks(blocks, page):
    out = []
    for b in blocks:
        fn = RENDERERS.get(b["type"])
        if not fn:
            raise ValueError(f"Type de bloc inconnu: {b['type']} (page {page['slug']})")
        out.append(fn(b, page))
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Navigation, en-tête, pied de page
# ---------------------------------------------------------------------------
def render_nav(active_slug):
    items = ""
    for n in NAV:
        if n.get("children"):
            sub = ""
            for c in n["children"]:
                desc = f'<span class="megamenu__desc">{e(c["desc"])}</span>' if c.get("desc") else ""
                ic = icon(c.get("icon", "arrow"), 20, "megamenu__icon")
                sub += (
                    f'<a class="megamenu__link" href="{url(c["slug"])}">{ic}'
                    f'<span class="megamenu__text"><span class="megamenu__label">{e(c["label"])}</span>{desc}</span></a>'
                )
            items += f"""
            <li class="nav__item nav__item--has-children">
              <button class="nav__link nav__toggle" aria-expanded="false">{e(n["label"])}
                <span class="nav__caret" aria-hidden="true"></span></button>
              <div class="megamenu"><div class="megamenu__inner">{sub}</div></div>
            </li>"""
        else:
            active = " is-active" if n.get("slug") == active_slug else ""
            items += f'<li class="nav__item"><a class="nav__link{active}" href="{url(n["slug"])}">{e(n["label"])}</a></li>'
    return items


def render_header(page):
    nav = render_nav(page.get("slug"))
    util = ""
    for u in UTILITY:
        util += f'<a href="{url(u["href"])}" class="util__link">{icon(u.get("icon","arrow"),15)}{e(u["label"])}</a>'
    socials = "".join(
        f'<a href="{s["href"]}" class="util__social"{social_attrs(s["href"])} aria-label="{e(s["label"])}" title="{e(s["label"])}">{brand_icon(s["icon"],15)}</a>'
        for s in SOCIAL
    )
    return f"""
  <a class="skip-link" href="#main">Aller au contenu principal</a>
  <div class="topbar">
    <div class="container topbar__inner">
      <span class="topbar__tag">{ci_flag(14)} République de Côte d'Ivoire — Initiative citoyenne</span>
      <div class="topbar__right">
        <div class="util">{util}</div>
        <div class="util__socials">{socials}</div>
      </div>
    </div>
  </div>
  <header class="header" id="header">
    <div class="container header__inner">
      <a class="brand" href="index.html" aria-label="Accueil — {e(SITE['long_name'])}">
        <img class="brand__logo" src="assets/img/logo-wordmark.png" alt="ACCI" width="118" height="72">
        <span class="brand__full">{e(SITE['long_name'])}</span>
      </a>
      <nav class="nav" aria-label="Navigation principale">
        <ul class="nav__list">{nav}</ul>
      </nav>
      <div class="header__actions">
        <button class="iconbtn search-toggle" aria-label="Rechercher">{icon("search",20)}</button>
        <a class="btn btn--primary btn--sm header__cta" href="adhesion.html">Adhérer</a>
        <button class="burger" aria-label="Ouvrir le menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="searchbar" hidden>
      <div class="container searchbar__inner">
        <span class="searchbar__icon">{icon("search",20)}</span>
        <input type="search" id="site-search" placeholder="Rechercher une page, un thème, un service..." autocomplete="off">
        <button class="searchbar__close" aria-label="Fermer la recherche">&times;</button>
        <div class="searchbar__results" id="search-results"></div>
      </div>
    </div>
  </header>
  <div class="mobile-nav" id="mobile-nav" hidden>
    <div class="mobile-nav__inner">{render_mobile_nav(page.get('slug'))}</div>
  </div>
  <div class="overlay" id="overlay" hidden></div>"""


def render_mobile_nav(active_slug):
    out = ""
    for n in NAV:
        if n.get("children"):
            sub = "".join(f'<a href="{url(c["slug"])}">{e(c["label"])}</a>' for c in n["children"])
            out += f"""<div class="mnav__group">
              <button class="mnav__toggle" aria-expanded="false">{e(n["label"])}<span class="mnav__caret"></span></button>
              <div class="mnav__sub">{sub}</div></div>"""
        else:
            out += f'<a class="mnav__link" href="{url(n["slug"])}">{e(n["label"])}</a>'
    out += '<a class="btn btn--primary mnav__cta" href="adhesion.html">Devenir membre</a>'
    return out


def render_breadcrumb(page):
    if page.get("slug") == "index":
        return ""
    crumbs = ['<a href="index.html">Accueil</a>']
    if page.get("section"):
        crumbs.append(f'<span>{e(page["section"])}</span>')
    crumbs.append(f'<span class="crumb--current" aria-current="page">{e(page["title"])}</span>')
    sep = f'<span class="crumb__sep" aria-hidden="true">{icon("arrow",13)}</span>'
    return f'<nav class="breadcrumb" aria-label="Fil d\'Ariane"><div class="container">{sep.join(crumbs)}</div></nav>'


def render_footer(page):
    cols = ""
    for col in FOOTER["columns"]:
        links = "".join(f'<li><a href="{url(l["slug"])}">{e(l["label"])}</a></li>' for l in col["links"])
        cols += f'<div class="footer__col"><h3 class="footer__title">{e(col["title"])}</h3><ul>{links}</ul></div>'
    socials = "".join(
        f'<a href="{s["href"]}" class="footer__social"{social_attrs(s["href"])} aria-label="{e(s["label"])}" title="{e(s["label"])}">{brand_icon(s["icon"],18)}</a>'
        for s in SOCIAL
    )
    legal = "".join(f'<a href="{url(l["slug"])}">{e(l["label"])}</a>' for l in FOOTER["legal"])
    return f"""
  <section class="newsletter">
    <div class="container newsletter__inner reveal">
      <div><h2 class="newsletter__title">Restez informé(e)</h2>
      <p>Recevez nos campagnes de sensibilisation, guides et actualités sur les bonnes pratiques numériques.</p></div>
      <form class="newsletter__form" id="newsletter-form" novalidate>
        <input type="email" name="email" placeholder="Votre adresse e-mail" required aria-label="Adresse e-mail">
        <button class="btn btn--light" type="submit">S'abonner</button>
        <p class="newsletter__note" id="newsletter-note" role="status" hidden></p>
      </form>
    </div>
  </section>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <a class="brand brand--footer" href="index.html" aria-label="Accueil — {e(SITE['long_name'])}">
            <img class="brand__logo brand__logo--footer" src="assets/img/logo-wordmark-light.png" alt="ACCI">
          </a>
          <p class="footer__about">{e(SITE['long_name'])}. {e(FOOTER['about'])}</p>
          <div class="footer__socials">{socials}</div>
        </div>
        <div class="footer__cols">{cols}</div>
      </div>
      <div class="footer__bottom">
        <p>© {YEAR} ACCI — {e(SITE['long_name'])}. Tous droits réservés.</p>
        <nav class="footer__legal" aria-label="Liens légaux">{legal}</nav>
      </div>
    </div>
  </footer>
  <button class="to-top" id="to-top" aria-label="Revenir en haut">{icon("arrow",20)}</button>"""


def render_chat():
    return f"""
  <div class="chat" id="chat">
    <button class="chat__fab" id="chat-fab" aria-expanded="false" aria-label="Ouvrir l'assistant ACCI">
      <span class="chat__fab-ic chat__fab-ic--open">{icon("chat",24)}</span>
      <span class="chat__fab-ic chat__fab-ic--close">{icon("x-circle",24)}</span>
      <span class="chat__fab-label">Besoin d'aide&nbsp;?</span>
    </button>
    <section class="chat__panel" id="chat-panel" aria-label="Assistant ACCI" hidden>
      <header class="chat__header">
        <img class="chat__logo" src="assets/img/logo-wordmark-light.png" alt="ACCI">
        <div class="chat__id">
          <span class="chat__name">Assistant ACCI {icon("sparkle",15,"chat__spark")}</span>
          <span class="chat__status"><span class="chat__dot"></span>En ligne · réponse immédiate</span>
        </div>
        <button class="chat__close" id="chat-close" aria-label="Fermer l'assistant">&times;</button>
      </header>
      <div class="chat__body" id="chat-body" aria-live="polite"></div>
      <div class="chat__quick" id="chat-quick"></div>
      <form class="chat__form" id="chat-form" autocomplete="off">
        <input id="chat-input" type="text" placeholder="Posez votre question…" aria-label="Votre message">
        <button type="submit" class="chat__send" aria-label="Envoyer">{icon("send",20)}</button>
      </form>
      <p class="chat__legal">Assistant automatique · pour une urgence, voir <a href="cellule-ecoute.html">la cellule d'écoute</a>.</p>
    </section>
  </div>"""


def logo_svg():
    # Emblème : bouclier aux couleurs nationales (orange/blanc/vert) + signal réseau
    return """<svg viewBox="0 0 48 48" width="40" height="40" role="img" aria-hidden="true">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F77F00"/><stop offset="1" stop-color="#009A44"/></linearGradient></defs>
      <path d="M24 3l16 6v11c0 10-6.8 17.6-16 20-9.2-2.4-16-10-16-20V9l16-6z" fill="url(#lg)"/>
      <path d="M24 7l12 4.5V20c0 7.7-5 13.6-12 15.6V7z" fill="#ffffff" opacity="0.12"/>
      <circle cx="24" cy="26" r="2.4" fill="#fff"/>
      <path d="M19 21a7 7 0 0 1 10 0M16 17.5a12 12 0 0 1 16 0" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/>
    </svg>"""


# ---------------------------------------------------------------------------
# Page complète
# ---------------------------------------------------------------------------
PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — ACCI</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#0b3d2e">
  <meta name="author" content="Association des Créateurs de Contenu Ivoiriens">
  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title} — ACCI">
  <meta property="og:description" content="{description}">
  <meta property="og:locale" content="fr_CI">
  <meta property="og:site_name" content="ACCI">
  <link rel="icon" type="image/png" href="assets/img/favicon.png">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body data-page="{slug}">
{header}
  <main id="main">
{breadcrumb}
{content}
  </main>
{footer}
{chat}
  <script src="assets/js/search-index.js"></script>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/chat.js"></script>
</body>
</html>
"""


def render_page(page):
    content = render_blocks(page["blocks"], page)
    return PAGE_TEMPLATE.format(
        title=e(page["title"]),
        description=e(page.get("description", SITE["tagline"])),
        canonical=SITE["url"] + "/" + url(page["slug"]),
        slug=e(page["slug"]),
        header=render_header(page),
        breadcrumb=render_breadcrumb(page),
        content=content,
        footer=render_footer(page),
        chat=render_chat(),
    )


# ---------------------------------------------------------------------------
# Recherche, sitemap, robots
# ---------------------------------------------------------------------------
def build_search_index(pages):
    entries = []
    for p in pages:
        entries.append({
            "t": p["title"],
            "u": url(p["slug"]),
            "d": p.get("description", ""),
            "s": p.get("section", ""),
        })
    import json
    return "window.SEARCH_INDEX = " + json.dumps(entries, ensure_ascii=False) + ";"


def build_sitemap(pages):
    urls = ""
    for p in pages:
        urls += f"  <url><loc>{SITE['url']}/{url(p['slug'])}</loc><changefreq>monthly</changefreq></url>\n"
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}</urlset>
"""


# ---------------------------------------------------------------------------
# Construction
# ---------------------------------------------------------------------------
def build():
    pages = PAGES_MODULE.all_pages()

    # Validation : slugs uniques
    slugs = [p["slug"] for p in pages]
    dupes = {s for s in slugs if slugs.count(s) > 1}
    if dupes:
        raise SystemExit(f"ERREUR : slugs en double : {dupes}")

    # Validation : liens de navigation pointent vers des pages existantes
    slugset = set(slugs)
    for n in NAV:
        targets = [c["slug"] for c in n.get("children", [])] + ([n["slug"]] if n.get("slug") else [])
        for t in targets:
            if t not in slugset:
                print(f"  ⚠ lien de nav vers une page absente : {t}")

    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)

    # Copie des assets
    shutil.copytree(ASSETS, os.path.join(DIST, "assets"))

    # Copie de l'espace d'administration (CRM)
    if os.path.isdir(ADMIN):
        shutil.copytree(ADMIN, os.path.join(DIST, "admin"))

    # Index de recherche
    with open(os.path.join(DIST, "assets", "js", "search-index.js"), "w", encoding="utf-8") as f:
        f.write(build_search_index(pages))

    # Pages
    for p in pages:
        out = render_page(p)
        with open(os.path.join(DIST, url(p["slug"])), "w", encoding="utf-8") as f:
            f.write(out)

    # Sitemap + robots
    with open(os.path.join(DIST, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(build_sitemap(pages))
    with open(os.path.join(DIST, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(f"User-agent: *\nAllow: /\nSitemap: {SITE['url']}/sitemap.xml\n")

    print(f"✓ {len(pages)} pages générées dans ./dist")
    print(f"✓ Index de recherche, sitemap.xml et robots.txt créés")
    return pages


def serve(port=8000):
    os.chdir(DIST)
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"➜ Serveur local : http://localhost:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    pages = build()
    if "--serve" in sys.argv:
        serve()
