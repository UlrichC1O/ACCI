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
import json
import html
import hashlib
import datetime
import http.server
import socketserver

from content.site import SITE, NAV, FOOTER, UTILITY, SOCIAL, CREDITS
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
    # Jeu d'icônes tracé sur une grille de 24 × 24 : trait unique de 1,5 px,
    # extrémités et jonctions arrondies, contenu inscrit entre 3 et 21 pour une
    # marge optique constante. Registre institutionnel : formes calmes, lisibles
    # dès 20 px, sans dramatisation.
    "alert":      '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.6v5"/><circle cx="12" cy="16" r="1"/>',
    "arrow":      '<path d="M4.6 12h14"/><path d="M13.2 6.6L18.6 12l-5.4 5.4"/>',
    "book":       '<path d="M5 5.2a2 2 0 0 1 2-2h11.2v15.6H7a2 2 0 0 0-2 2V5.2z"/><path d="M18.2 18.8H7"/>',
    "bullhorn":   '<path d="M4 12.6V11a1.6 1.6 0 0 1 1.6-1.6h2.8l6.8-3.8v12.8L8.4 14.6H5.6A1.6 1.6 0 0 1 4 13z"/><path d="M18 9.6a4 4 0 0 1 0 4.8"/><path d="M20.4 7.4a7.2 7.2 0 0 1 0 9.2"/>',
    "calendar":   '<rect x="3.8" y="5.6" width="16.4" height="14.6" rx="2.2"/><path d="M3.8 9.8h16.4"/><path d="M8.4 3.8v3.6M15.6 3.8v3.6"/>',
    "camera":     '<rect x="3.4" y="7" width="17.2" height="12.6" rx="2.4"/><circle cx="12" cy="13.3" r="3.4"/><path d="M8.4 7l1.4-2.2h4.4L15.6 7"/>',
    "chat":       '<path d="M4 6.2a1.6 1.6 0 0 1 1.6-1.6h12.8A1.6 1.6 0 0 1 20 6.2v8.4a1.6 1.6 0 0 1-1.6 1.6H9.6L5.4 20v-3.8a1.6 1.6 0 0 1-1.4-1.6z"/><path d="M8 9.2h8M8 12.2h5"/>',
    "check":      '<circle cx="12" cy="12" r="8.6"/><path d="M8.4 12.2l2.6 2.6 4.6-5"/>',
    "child":      '<circle cx="8" cy="6.2" r="2.4"/><path d="M4.6 20.2v-5a3.4 3.4 0 0 1 6.8 0v5"/><circle cx="16.8" cy="10.4" r="1.9"/><path d="M14.2 20.2v-3.6a2.6 2.6 0 0 1 5.2 0v3.6"/>',
    "clock":      '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.2 1.9"/>',
    "compass":    '<circle cx="12" cy="12" r="8.6"/><path d="M15.8 8.2l-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4z"/><circle cx="12" cy="12" r=".9"/>',
    "copyright":  '<circle cx="12" cy="12" r="8.6"/><path d="M14.6 9.6a3.4 3.4 0 1 0 0 4.8"/>',
    "doc":        '<path d="M6.6 3.4h7L18.4 8v12.6H6.6z"/><path d="M13.4 3.4V8h5"/><path d="M9.4 13h5.6M9.4 16.2h5.6"/>',
    "download":   '<path d="M12 3.8v10.4"/><path d="M8.2 10.6l3.8 3.8 3.8-3.8"/><path d="M4.4 18.6h15.2"/>',
    "eye":        '<path d="M2.6 12S6.2 6.4 12 6.4 21.4 12 21.4 12 17.8 17.6 12 17.6 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="2.6"/>',
    "fact":       '<path d="M12 3.4l7 2.7v5.1c0 4-2.8 7.2-7 8.4-4.2-1.2-7-4.4-7-8.4V6.1l7-2.7z"/><path d="M9.2 11.9l2.1 2.1 3.6-3.9"/>',
    "flag":       '<path d="M5.6 20.4V4.2"/><path d="M5.6 4.6h11.8l-2.2 3.9 2.2 3.9H5.6"/>',
    "gift":       '<path d="M4.6 11.4v7.2a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-7.2"/><rect x="3.2" y="7.8" width="17.6" height="3.6" rx="1.2"/><path d="M12 7.8v12.4"/><path d="M12 7.8H8.8a2 2 0 1 1 2-2c.8.8 1.2 2 1.2 2zM12 7.8h3.2a2 2 0 1 0-2-2c-.8.8-1.2 2-1.2 2z"/>',
    "globe":      '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8"/><path d="M12 3.4a13 13 0 0 1 0 17.2 13 13 0 0 1 0-17.2z"/>',
    "graduation": '<path d="M2.8 8.6L12 4.4l9.2 4.2L12 12.8 2.8 8.6z"/><path d="M6.4 10.6v4.6c0 1.5 2.5 2.8 5.6 2.8s5.6-1.3 5.6-2.8v-4.6"/><path d="M20.4 9v4.6"/>',
    "handshake":  '<path d="M2.8 10.6l3-3 3.4 1.4"/><path d="M21.2 10.6l-3-3-3.4 1.4"/><path d="M9.2 9l-3 3a1.7 1.7 0 0 0 2.4 2.4l1.2-1.2 3 3a1.6 1.6 0 0 0 2.3-2.3"/><path d="M14.8 9l3 3a1.7 1.7 0 0 1-2.4 2.4"/><path d="M12.8 12.9l1.6 1.6"/>',
    "heart":      '<path d="M12 20.2C7 17.4 3.6 14 3.6 10.4A4 4 0 0 1 12 8a4 4 0 0 1 8.4 2.4c0 3.6-3.4 7-8.4 9.8z"/>',
    "key":        '<circle cx="8.2" cy="12" r="3.7"/><path d="M11.9 12H20"/><path d="M17.4 12v2.8"/><path d="M20 12v2"/>',
    "lightbulb":  '<path d="M12 3.6a5.6 5.6 0 0 0-3.4 10.1c.7.6 1 1.4 1 2.3h4.8c0-.9.3-1.7 1-2.3A5.6 5.6 0 0 0 12 3.6z"/><path d="M9.8 18.4h4.4M10.6 20.6h2.8"/>',
    "lock":       '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><circle cx="12" cy="15.2" r="1.1"/>',
    "mail":       '<rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2.2"/><path d="M3.8 8.2l7.3 4.6a1.7 1.7 0 0 0 1.8 0l7.3-4.6"/>',
    "map":        '<path d="M12 20.6s-6.2-5.2-6.2-9.6a6.2 6.2 0 1 1 12.4 0c0 4.4-6.2 9.6-6.2 9.6z"/><circle cx="12" cy="11" r="2.3"/>',
    "megaphone":  '<path d="M4.4 10.4v3.2a1.4 1.4 0 0 0 1.4 1.4h1.6l8.4 4.4V4.6L7.4 9H5.8a1.4 1.4 0 0 0-1.4 1.4z"/><path d="M7.4 15v4.4h2.6V16.4"/><path d="M18.6 9.4a3.6 3.6 0 0 1 0 5.2"/>',
    "money":      '<rect x="3.4" y="6.4" width="17.2" height="11.2" rx="2.2"/><circle cx="12" cy="12" r="2.8"/><path d="M6.6 9.6v4.8M17.4 9.6v4.8"/>',
    "network":    '<circle cx="12" cy="5.4" r="2.2"/><circle cx="5.4" cy="18" r="2.2"/><circle cx="18.6" cy="18" r="2.2"/><path d="M12 7.6v3.6M10.4 12.6L7 16.4M13.6 12.6l3.4 3.8"/>',
    "phone":      '<path d="M5.4 4.6h3.4l1.8 4.4-2.2 1.4a10.6 10.6 0 0 0 5.2 5.2l1.4-2.2 4.4 1.8v3.4a1.8 1.8 0 0 1-1.9 1.8A15.4 15.4 0 0 1 3.6 6.5a1.8 1.8 0 0 1 1.8-1.9z"/>',
    "play":       '<circle cx="12" cy="12" r="8.6"/><path d="M10.2 8.8l5.4 3.2-5.4 3.2V8.8z"/>',
    "quote":      '<path d="M9.6 6.8C7 8 5.6 10 5.6 12.6v4.6h4.8v-5H8.2c0-1.6.5-2.8 1.4-3.6z"/><path d="M18 6.8c-2.6 1.2-4 3.2-4 5.8v4.6h4.8v-5h-2.2c0-1.6.5-2.8 1.4-3.6z"/>',
    "scale":      '<path d="M12 4.6v15"/><path d="M7.4 19.6h9.2"/><path d="M5 7.8h14"/><circle cx="12" cy="6.4" r="1.5"/><path d="M5 7.8L2.6 13.4h4.8L5 7.8z"/><path d="M19 7.8l-2.4 5.6h4.8L19 7.8z"/>',
    "search":     '<circle cx="10.8" cy="10.8" r="6.4"/><path d="M15.4 15.4l5 5"/>',
    "send":       '<path d="M20.6 4.4L3.6 11.2l6.6 2.4 2.4 6.6 8-15.8z"/><path d="M10.2 13.6l3.6-3.6"/>',
    "shield":     '<path d="M12 3.5l7 2.8v5c0 4.1-2.8 7.3-7 8.4-4.2-1.1-7-4.3-7-8.4v-5l7-2.8z"/>',
    "sparkle":    '<path d="M12 3.6l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7 1.7-5z"/><path d="M18.6 16.4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"/>',
    "star":       '<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8z"/>',
    "users":      '<circle cx="9.4" cy="8.4" r="3.1"/><path d="M3.6 19.8c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4"/><path d="M16.4 6.2a3.1 3.1 0 0 1 0 5.9"/><path d="M20.4 19.8c0-2.4-1.2-4.1-3.2-5"/>',
    "warning":    '<path d="M12 4.2l8.2 14.2a1.4 1.4 0 0 1-1.2 2.1H5a1.4 1.4 0 0 1-1.2-2.1L12 4.2z"/><path d="M12 9.6v4.2"/><circle cx="12" cy="17" r="1"/>',
    "x-circle":   '<circle cx="12" cy="12" r="8.6"/><path d="M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2"/>',
}


def icon(name, size=24, cls="icon"):
    body = ICONS.get(name, ICONS["star"])
    return (
        f'<svg class="{cls}" viewBox="0 0 24 24" width="{size}" height="{size}" '
        f'fill="none" stroke="currentColor" stroke-width="1.5" '
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


def render_socials(family, size):
    """Emplacements des réseaux sociaux (barre supérieure ou pied de page).

    Les adresses ne sont pas connues à la compilation : elles sont renseignées
    dans l'administration. Chaque réseau est donc compilé comme un emplacement
    masqué et sans href — donc ni cliquable ni atteignable au clavier — que
    assets/js/site-settings.js révèle si, et seulement si, une adresse existe.

    Compiler l'icône déjà masquée plutôt que de la masquer après coup évite
    qu'elle apparaisse brièvement au chargement : les scripts sont différés.

    target et rel sont posés dès ici. Ils sont sans effet sur une ancre sans
    href, et évitent au script d'avoir à les rétablir : un compte de réseau
    social est toujours sur un autre domaine.
    """
    links = "".join(
        f'<a class="{family}__social" data-site-social="{e(s["icon"])}" hidden '
        f'target="_blank" rel="noopener noreferrer" '
        f'aria-label="{e(s["label"])}" title="{e(s["label"])}">'
        f'{brand_icon(s["icon"], size)}</a>'
        for s in SOCIAL
    )
    # Le conteneur est masqué lui aussi : vide, il laisserait un espace mort
    # dans la barre supérieure et sous le logo du pied de page.
    return f'<div class="{family}__socials" data-site-socials hidden>{links}</div>'


def render_credits():
    """Crédits du pied de page : réalisation du site, puis partenaires.

    Même principe que les réseaux sociaux, et pour la même raison : une
    attribution engage l'association vis-à-vis d'un tiers, donc rien n'est
    affiché tant que rien n'est renseigné. Les deux blocs sont compilés
    masqués et sans href, et assets/js/site-settings.js les révèle si — et
    seulement si — l'administration a renseigné un nom.

    Compiler l'emplacement plutôt que de le faire créer par le script garde
    au pied de page une structure stable : le crédit n'apparaît pas d'un coup
    au milieu d'une page déjà lue, et le site reste lisible sans JavaScript
    dès que les valeurs sont figées dans content/site.py.

    L'ancre n'est posée que si un lien existe : un partenaire peut être
    crédité sans site web, et un <a> sans href n'est ni cliquable ni
    atteignable au clavier — il ne doit donc pas rester en place.
    """
    dev = CREDITS.get("developer") or {}
    dev_label, dev_href = (dev.get("label") or "").strip(), (dev.get("href") or "").strip()
    prefix = CREDITS.get("developer_prefix") or "Conception & développement"

    # Le nom vit dans un <span> à l'intérieur de l'ancre : le script doit
    # pouvoir corriger le nom sans lien, et poser le lien sans toucher au nom.
    # L'ancre est toujours émise — sans href elle n'est qu'un texte en ligne,
    # ni cliquable ni tabulable — pour que l'ajout d'un lien depuis
    # l'administration n'ait pas à reconstruire le balisage.
    href_attr = f' href="{e(dev_href)}"' if dev_href else ""
    developer = (
        f'<span class="footer__credit" data-site-credit="dev"{"" if dev_label else " hidden"}>'
        f'<span data-site-credit="dev-prefix">{e(prefix)}</span>&nbsp;: '
        f'<a data-site-credit="dev-link" target="_blank" rel="noopener noreferrer"{href_attr}>'
        f'<span data-site-credit="dev-name">{e(dev_label)}</span></a>'
        f'</span>'
    )

    partners = CREDITS.get("partners") or []
    items = "".join(
        f'<li>'
        + (f'<a href="{e((p.get("href") or "").strip())}" target="_blank" rel="noopener noreferrer">'
           f'{e(p.get("label") or "")}</a>'
           if (p.get("href") or "").strip() else f'<span>{e(p.get("label") or "")}</span>')
        + f'</li>'
        for p in partners if (p.get("label") or "").strip()
    )
    ptitle = CREDITS.get("partners_title") or "Avec le soutien de"
    partners_html = (
        f'<div class="footer__partners" data-site-partners{"" if items else " hidden"}>'
        f'<span class="footer__partners-title" data-site-partners-title>{e(ptitle)}</span>'
        f'<ul data-site-partners-list>{items}</ul></div>'
    )

    # Le conteneur est masqué lui aussi tant qu'il n'a rien à montrer : vide,
    # il ne laisserait pas un espace mort mais un filet horizontal (border-top)
    # juste au-dessus du copyright, qui se lit comme une erreur de mise en page.
    shown = " " if (dev_label or items) else " hidden "
    return f'<div class="footer__credits"{shown.rstrip()}>{partners_html}{developer}</div>'


def ci_flag(h=14):
    """Drapeau de la Côte d'Ivoire (orange · blanc · vert)."""
    w = round(h * 1.5)
    return (
        # Décoratif : le texte voisin nomme déjà le pays. Annoncé, le drapeau
        # faisait lire « Drapeau de la Côte d'Ivoire République de Côte
        # d'Ivoire — Initiative citoyenne » sur chacune des 50 pages.
        f'<svg class="ci-flag" viewBox="0 0 9 6" width="{w}" height="{h}" '
        f'aria-hidden="true" focusable="false">'
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


# ---------------------------------------------------------------------------
# Images responsives
# ---------------------------------------------------------------------------
# assets/img/manifest.json est produit par tools/optimize-images.sh : il décrit,
# pour chaque photo, les largeurs WebP disponibles, le fichier de repli et les
# dimensions intrinsèques (indispensables pour éviter les sauts de mise en page).
def _load_img_manifest():
    path = os.path.join(ASSETS, "img", "manifest.json")
    if not os.path.exists(path):
        print("  ⚠ assets/img/manifest.json absent — images non optimisées "
              "(lancez tools/optimize-images.sh)")
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


IMG_MANIFEST = _load_img_manifest()
MISSING_IMAGES = set()


def _load_card_images():
    """Table carte → photo, produite par tools/map-card-images.py.

    Clés acceptées, de la plus précise à la plus générale :
      "page::titre"  (lève une ambiguïté quand un même intitulé sert ailleurs)
      "titre"
    """
    path = os.path.join(ROOT, "content", "card_images.json")
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


CARD_IMAGES = _load_card_images()
CARDS_WITHOUT_IMAGE = []


def card_image(item, page):
    """Photo d'une carte : valeur explicite, puis table, puis rien."""
    if item.get("image"):
        return item["image"]
    title = item.get("title", "")
    for key in (f"{page['slug']}::{title}", title):
        if key in CARD_IMAGES:
            return CARD_IMAGES[key]
    if title:
        CARDS_WITHOUT_IMAGE.append(f"{page['slug']} · {title}")
    return None


# Inventaire des emplacements d'images, exporté au build pour l'espace
# d'administration : il lui indique quelles photos existent et où chacune est
# employée, sans avoir à analyser le HTML produit.
IMG_PLACEMENTS = []


def _block_index(page, block):
    """Rang du bloc dans sa page — rend l'identifiant d'emplacement unique.

    Sans lui, deux blocs `split` (ou `image`) sur une même page partageraient
    la même clé, et une surcharge appliquée à l'un s'appliquerait aux deux.
    """
    for i, b in enumerate(page["blocks"]):
        if b is block:
            return i
    return 0


def picture(name, alt="", cls="", sizes="100vw", eager=False, decorative=False,
            slot=None, page=None):
    """<picture> responsive (WebP + repli) avec dimensions intrinsèques.

    `name` est le nom de fichier d'origine (ex. "hero-creators.jpg").
    `slot` identifie l'emplacement de façon stable (ex. "hero:desinformation") :
    il permet à l'administration de réaffecter, recadrer ou décrire cette image
    précise, et au navigateur de retrouver la balise à mettre à jour.
    Retombe proprement sur une balise <img> simple si la photo n'est pas
    décrite dans le manifeste.
    """
    info = IMG_MANIFEST.get(name)
    a = f' alt="{e(alt)}"' if not decorative else ' alt=""'
    c = f' class="{e(cls)}"' if cls else ""
    load = ' loading="eager" fetchpriority="high"' if eager else ' loading="lazy"'
    load += ' decoding="async"' if not eager else ""
    # Repères pour l'application des surcharges côté navigateur.
    data = f' data-img="{e(name)}"'
    if slot:
        data += f' data-slot="{e(slot)}"'
        IMG_PLACEMENTS.append({
            "slot": slot, "image": name, "page": page,
            "alt": "" if decorative else alt, "sizes": sizes,
        })

    if not info:
        MISSING_IMAGES.add(name)
        return f'<img src="assets/img/{e(name)}"{a}{c}{load}{data}>'

    stem = name.rsplit(".", 1)[0]
    srcset = ", ".join(f"assets/img/{stem}-{w}.webp {w}w" for w in info["widths"])
    return (
        f'<picture{data}>'
        f'<source type="image/webp" srcset="{srcset}" sizes="{e(sizes)}">'
        f'<img src="assets/img/{e(info["fallback"])}"{a}{c}'
        f' width="{info["w"]}" height="{info["h"]}"{load} data-sizes="{e(sizes)}">'
        f'</picture>'
    )


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
    kicker = f'<span class="hero__kicker"{ck(b,"kicker",b["kicker"])}>{e(b["kicker"])}</span>' if b.get("kicker") else ""
    subtitle = f'<p class="hero__subtitle"{ck(b,"subtitle",b["subtitle"])}>{para(b["subtitle"])}</p>' if b.get("subtitle") else ""
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
        media = ('<div class="hero__media" aria-hidden="true">'
                 + picture(b["image"], decorative=True, sizes="100vw", eager=True,
                           slot=f"hero:{page['slug']}", page=page['slug'])
                 + '<span class="hero__scrim"></span></div>')
    return f"""
    <section class="hero hero--{variant}{has_img}">
      {media}
      <div class="hero__pattern" aria-hidden="true"></div>
      <div class="container hero__inner reveal">
        {kicker}
        <h1 class="hero__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h1>
        {subtitle}
        {ctas}
        {badges}
      </div>
    </section>"""


def r_section(b, page):
    sid = f' id="{b["id"]}"' if b.get("id") else ""
    kicker = f'<span class="section__kicker"{ck(b,"kicker",b["kicker"])}>{e(b["kicker"])}</span>' if b.get("kicker") else ""
    title = f'<h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>' if b.get("title") else ""
    lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
    body = "".join(f'<p{ck(b,f"body.{i}",p)}>{para(p)}</p>'
                   for i, p in enumerate(b.get("body", [])))
    align = b.get("align", "left")
    head = f'<div class="section__head section__head--{align} reveal">{kicker}{title}{lead}</div>' if (kicker or title or lead) else ""
    body_html = f'<div class="prose reveal">{body}</div>' if body else ""
    return f'<section class="section"{sid}><div class="container">{head}{body_html}</div></section>'


def r_cards(b, page):
    cols = b.get("columns", 3)
    head = ""
    if b.get("title") or b.get("lead"):
        kicker = f'<span class="section__kicker"{ck(b,"kicker",b["kicker"])}>{e(b["kicker"])}</span>' if b.get("kicker") else ""
        title = f'<h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>' if b.get("title") else ""
        lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal">{kicker}{title}{lead}</div>'
    sizes = f"(min-width: 900px) {round(100 / max(cols, 1))}vw, (min-width: 560px) 50vw, 100vw"
    items = ""
    for ci, c in enumerate(b["items"]):
        img = card_image(c, page)
        # Quand la carte porte une photo, celle-ci occupe la fonction visuelle de
        # l'icône : les cumuler alourdirait la carte sans rien ajouter.
        # Identifiant d'emplacement calculé à part : imbriquer des guillemets
        # doubles dans une f-string n'est pas valide avant Python 3.12.
        slot = "card:" + page["slug"] + "::" + c.get("title", "")
        media = ('<span class="card__media">'
                 + picture(img, alt="", sizes=sizes, decorative=True,
                           slot=slot, page=page["slug"])
                 + '</span>') if img else ""
        ic = ("" if img else
              f'<span class="card__icon" data-icon{ck(b,f"items.{ci}.icon",c.get("icon","star"))}>'
              f'{icon(c.get("icon","star"),26)}</span>' if c.get("icon") else "")
        tag = f'<span class="card__tag">{e(c["tag"])}</span>' if c.get("tag") else ""
        text = f'<p class="card__text"{ck(b,f"items.{ci}.text",c["text"])}>{para(c["text"])}</p>' if c.get("text") else ""
        link = ""
        if c.get("href"):
            link = f'<span class="card__link">{e(c.get("link_label","En savoir plus"))} {icon("arrow",16,"card__arrow")}</span>'
            cls = "card card--link" + (" card--media" if img else "")
            clickable_open = f'<a class="{cls}" href="{url(c["href"])}">'
            clickable_close = "</a>"
        else:
            cls = "card" + (" card--media" if img else "")
            clickable_open = f'<div class="{cls}">'
            clickable_close = "</div>"
        body = f'<span class="card__body">{ic}{tag}<h3 class="card__title"{ck(b,f"items.{ci}.title",c["title"])}>{para(c["title"])}</h3>{text}{link}</span>'
        items += f'{clickable_open}{media}{body}{clickable_close}'
    return f'<section class="section"><div class="container">{head}<div class="grid grid--{cols} reveal">{items}</div></div></section>'


def r_stats(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head section__head--center reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2></div>'
    items = ""
    for s in b["items"]:
        suffix = f'<span class="stat__suffix">{e(s.get("suffix",""))}</span>' if s.get("suffix") else ""
        items += (
            f'<div class="stat"><div class="stat__value" data-count="{e(s.get("value",""))}">'
            f'{e(s["value"])}</div>{suffix}<div class="stat__label">{e(s["label"])}</div></div>'
        )
    variant = b.get("variant", "")
    return f'<section class="section section--stats {variant}"><div class="container">{head}<div class="stats reveal">{items}</div></div></section>'


_ACC_SEQ = [0]


def r_accordion(b, page):
    _ACC_SEQ[0] += 1
    head = ""
    if b.get("title") or b.get("lead"):
        kicker = f'<span class="section__kicker"{ck(b,"kicker",b["kicker"])}>{e(b["kicker"])}</span>' if b.get("kicker") else ""
        title = f'<h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>' if b.get("title") else ""
        lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal">{kicker}{title}{lead}</div>'
    items = ""
    for i, it in enumerate(b["items"]):
        ans = it["a"] if isinstance(it["a"], list) else [it["a"]]
        ans_html = "".join(f'<p{ck(b,f"items.{i}.a.{ai}",p)}>{para(p)}</p>'
                            for ai, p in enumerate(ans))
        # Identifiants stables : ils relient le bouton à son panneau
        # (aria-controls / aria-labelledby) et permettent de retirer réellement
        # un panneau replié de l'arbre d'accessibilité grâce à `hidden`.
        aid = f"acc-{page['slug']}-{_ACC_SEQ[0]}-{i}"
        items += f"""
        <div class="accordion__item">
          <h3 class="accordion__h">
            <button class="accordion__trigger" type="button" id="{aid}-btn"
                    aria-expanded="false" aria-controls="{aid}-panel">
              <span{ck(b,f"items.{i}.q",it["q"])}>{para(it["q"])}</span>
              <span class="accordion__icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="accordion__panel" id="{aid}-panel" role="region"
               aria-labelledby="{aid}-btn" hidden><div class="accordion__content">{ans_html}</div></div>
        </div>"""
    return f'<section class="section"><div class="container container--narrow">{head}<div class="accordion reveal">{items}</div></div></section>'


def r_steps(b, page):
    head = ""
    if b.get("title"):
        lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>{lead}</div>'
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
    kicker = f'<span class="section__kicker"{ck(b,"kicker",b["kicker"])}>{e(b["kicker"])}</span>' if b.get("kicker") else ""
    title = f'<h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>' if b.get("title") else ""
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
        media = ('<figure class="split__media split__media--photo reveal">'
                 + picture(b["image"], alt=b.get("alt", ""),
                           sizes="(min-width: 900px) 50vw, 100vw",
                           slot=f"split:{page['slug']}:{_block_index(page, b)}", page=page['slug'])
                 + f'{cap}</figure>')
    else:
        media_icon = b.get("icon", "shield")
        media = f'<div class="split__media reveal"><div class="split__visual">{icon(media_icon,120,"split__bigicon")}</div></div>'
    body = f'<div class="split__body reveal">{kicker}{title}{text}{bullets}{cta}</div>'
    return f'<section class="section"><div class="container"><div class="split {reverse}">{body}{media}</div></div></section>'


def r_callout(b, page):
    variant = b.get("variant", "info")
    ico = {"info": "lightbulb", "warning": "warning", "danger": "alert", "success": "check"}.get(variant, "lightbulb")
    title = f'<h3 class="callout__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h3>' if b.get("title") else ""
    text = "".join(f'<p{ck(b,f"text.{i}",p)}>{para(p)}</p>'
                   for i, p in enumerate(b["text"] if isinstance(b.get("text"), list) else [b.get("text","")]))
    return f"""<section class="section section--tight"><div class="container container--narrow">
      <div class="callout callout--{variant} reveal"><span class="callout__icon">{icon(ico,24)}</span>
      <div class="callout__body">{title}{text}</div></div></div></section>"""


def r_checklist(b, page):
    head = ""
    if b.get("title"):
        lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>{lead}</div>'
    cols = b.get("columns", 2)
    good = b.get("variant", "good")
    ic = "check" if good == "good" else "x-circle"
    items = "".join(f'<li class="reveal">{icon(ic,20,"li-icon li-icon--"+good)}<span>{para(x)}</span></li>' for x in b["items"])
    return f'<section class="section"><div class="container">{head}<ul class="checklist checklist--{cols} checklist--{good}">{items}</ul></div></section>'


def r_quote(b, page):
    author = f'<cite class="quote__author"{ck(b,"author",b["author"])}>{e(b["author"])}</cite>' if b.get("author") else ""
    role = f'<span class="quote__role"{ck(b,"role",b["role"])}>{e(b["role"])}</span>' if b.get("role") else ""
    return f"""<section class="section"><div class="container container--narrow">
      <figure class="quote reveal"><span class="quote__mark">{icon("quote",40)}</span>
      <blockquote{ck(b,"text",b["text"])}>{para(b["text"])}</blockquote>
      <figcaption>{author}{role}</figcaption></figure></div></section>"""


def r_cta(b, page):
    btns = ""
    for ci, c in enumerate(b.get("buttons", [])):
        btns += (f'<a class="btn {c.get("style","btn--light")}" href="{url(c["href"])}"'
                 f'{ck(b,f"buttons.{ci}.label",c["label"])}>{e(c["label"])}'
                 f'{icon("arrow",18,"btn__icon") if c.get("arrow") else ""}</a>')
    text = f'<p class="ctaband__text"{ck(b,"text",b["text"])}>{para(b["text"])}</p>' if b.get("text") else ""
    return f"""<section class="ctaband reveal"><div class="ctaband__pattern" aria-hidden="true"></div>
      <div class="container ctaband__inner"><div><h2 class="ctaband__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>{text}</div>
      <div class="ctaband__actions">{btns}</div></div></section>"""


def r_table(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2></div>'
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
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2></div>'
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
        lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>{lead}</div>'
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
        lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>{lead}</div>'
    items = ""
    for p in b["items"]:
        cat = f'<span class="post__cat">{e(p["category"])}</span>' if p.get("category") else ""
        date = f'<span class="post__date">{icon("calendar",15)}{e(p["date"])}</span>' if p.get("date") else ""
        href = url(p.get("href", "#"))
        img = card_image(p, page)
        if img:
            post_slot = "card:" + page["slug"] + "::" + p.get("title", "")
            thumb = ('<div class="post__thumb">'
                     + picture(img, alt="",
                               sizes="(min-width: 900px) 33vw, (min-width: 560px) 50vw, 100vw",
                               decorative=True, slot=post_slot, page=page["slug"])
                     + '</div>')
        else:
            # Repli : aplat de marque, uniquement si aucune photo n'est associée.
            thumb = (f'<div class="post__thumb post__thumb--fallback post__thumb--{p.get("color","orange")}">'
                     f'{icon(p.get("icon","doc"),40)}</div>')
        items += f"""<article class="post reveal">
          {thumb}
          <div class="post__body">{cat}<h3 class="post__title"><a href="{href}">{para(p["title"])}</a></h3>
          <p class="post__excerpt">{para(p.get("excerpt",""))}</p>
          <div class="post__meta">{date}</div></div></article>"""
    return f'<section class="section"><div class="container">{head}<div class="grid grid--3">{items}</div></div></section>'


def r_downloads(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2></div>'
    items = ""
    for d in b["items"]:
        items += f"""<div class="download reveal"><span class="download__icon">{icon("doc",26)}</span>
          <div class="download__body"><h3>{para(d["title"])}</h3><p>{para(d.get("text",""))}</p></div>
          <span class="download__meta">{e(d.get("meta","PDF"))}{icon("download",18,"download__dl")}</span></div>"""
    return f'<section class="section"><div class="container container--narrow">{head}<div class="downloads">{items}</div></div></section>'


def r_definitions(b, page):
    head = ""
    if b.get("title"):
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2></div>'
    items = ""
    for d in b["items"]:
        items += f'<div class="defn reveal"><dt>{para(d["term"])}</dt><dd>{para(d["def"])}</dd></div>'
    return f'<section class="section"><div class="container container--narrow">{head}<dl class="defns">{items}</dl></div></section>'


def r_contact(b, page):
    info = ""
    for it in b.get("info", []):
        # « field » rattache la ligne à un réglage d'identité (email, phone,
        # address…). Le repère permet à site-settings.js de corriger la valeur
        # chez le visiteur sans recompiler ; sans lui la coordonnée resterait
        # figée à ce qui a été écrit dans content/.
        marker = f' data-site="{e(it["field"])}"' if it.get("field") else ""
        info += (
            f'<div class="cinfo"><span class="cinfo__icon">{icon(it.get("icon","map"),22)}</span>'
            f'<div><span class="cinfo__label"{ck(b,f"info.{len(info)}.label",it["label"])}>{e(it["label"])}</span>'
            f'<span class="cinfo__value"{marker}>{para(it["value"])}</span></div></div>'
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
    # Le contenu est du HTML rédigé : il est modifiable d'un bloc, pas champ à
    # champ, sans quoi la structure des mentions légales serait à recomposer.
    return (f'<section class="section"><div class="container container--narrow">'
            f'<div class="prose reveal"{ck(b,"html",b["html"])}>{b["html"]}</div></div></section>')


def r_image(b, page):
    """Image pleine largeur (bannière) avec légende optionnelle."""
    cap = f'<figcaption class="figbanner__cap">{para(b["caption"])}</figcaption>' if b.get("caption") else ""
    narrow = " container--narrow" if b.get("narrow") else ""
    banner = picture(b["image"], alt=b.get("alt", ""),
                     sizes="(min-width: 1200px) 1120px, 100vw",
                     slot=f"image:{page['slug']}:{_block_index(page, b)}", page=page['slug'])
    return f"""<section class="section"><div class="container{narrow}">
      <figure class="figbanner reveal">{banner}{cap}</figure>
    </div></section>"""


def r_gallery(b, page):
    head = ""
    if b.get("title"):
        lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
        head = f'<div class="section__head reveal"><h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>{lead}</div>'
    cols = b.get("columns", 3)
    items = ""
    for gi, g in enumerate(b["items"]):
        cap = f'<span class="gphoto__cap">{para(g["caption"])}</span>' if g.get("caption") else ""
        items += ('<figure class="gphoto reveal">'
                  + picture(g["image"], alt=g.get("alt", ""),
                            sizes=f"(min-width: 900px) {round(100/cols)}vw, 50vw",
                            slot=f"gallery:{page['slug']}:{gi}", page=page['slug'])
                  + f'{cap}</figure>')
    return f'<section class="section"><div class="container">{head}<div class="gallery grid--{cols}">{items}</div></div></section>'


def _chart_palette(i):
    colors = ["#F77F00", "#0B7A3B", "#0B3D2E", "#E16500", "#1b6ec2", "#c87f0a", "#7a8c83"]
    return colors[i % len(colors)]


def r_chart(b, page):
    kind = b.get("kind", "bar")
    head = ""
    if b.get("title") or b.get("lead"):
        kicker = f'<span class="section__kicker"{ck(b,"kicker",b["kicker"])}>{e(b["kicker"])}</span>' if b.get("kicker") else ""
        title = f'<h2 class="section__title"{ck(b,"title",b["title"])}>{para(b["title"])}</h2>' if b.get("title") else ""
        lead = f'<p class="section__lead"{ck(b,"lead",b["lead"])}>{para(b["lead"])}</p>' if b.get("lead") else ""
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


# ---------------------------------------------------------------------------
# Repères d'édition du contenu
# ---------------------------------------------------------------------------
# Le site est statique : son texte est figé à la compilation. Chaque chaîne
# affichée reçoit un identifiant stable « slug#bloc.champ », posé en attribut
# data-ck. assets/js/site-settings.js s'en sert pour appliquer, chez le
# visiteur, le texte corrigé depuis l'administration.
#
# L'inventaire est alimenté par ck() lui-même, au moment du rendu : impossible
# qu'il annonce une chaîne que le HTML ne porte pas, ou qu'il en oublie une.
CONTENT_INDEX = []


def ck(b, field, value=""):
    root = b.get("_ck") if isinstance(b, dict) else None
    if not root:
        return ""
    key = f"{root}.{field}"
    pg = b.get("_pg") or {}
    CONTENT_INDEX.append({
        "k": key,
        "v": value if isinstance(value, str) else str(value),
        "slug": pg.get("slug", ""),
        "page": pg.get("title", ""),
        "type": b.get("type", ""),
        "f": field,
    })
    return f' data-ck="{key}"'


def render_blocks(blocks, page):
    out = []
    for bi, b in enumerate(blocks):
        # Position du bloc dans la page : elle donne son identifiant stable aux
        # textes qu'il contient. Un bloc inséré plus haut décale les suivants —
        # les corrections enregistrées suivent alors l'ancien emplacement, ce
        # qui reste préférable à des identifiants tirés du texte lui-même, qui
        # se perdraient dès la première correction.
        b["_ck"] = f'{page["slug"]}#{bi}'
        b["_pg"] = page
        fn = RENDERERS.get(b["type"])
        if not fn:
            raise ValueError(f"Type de bloc inconnu: {b['type']} (page {page['slug']})")
        out.append(fn(b, page))
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Navigation, en-tête, pied de page
# ---------------------------------------------------------------------------
def render_nav(active_slug):
    """Barre de navigation principale.

    Une entrée est signalée « courante » aussi quand c'est l'une de ses pages
    filles qui est ouverte : sans cela, naviguer dans un méga-menu n'allumait
    aucun repère, et 44 des 50 pages du site s'affichaient sans indiquer où
    l'on se trouvait.
    """
    items = ""
    for n in NAV:
        if n.get("children"):
            sub = ""
            for c in n["children"]:
                desc = f'<span class="megamenu__desc">{e(c["desc"])}</span>' if c.get("desc") else ""
                ic = icon(c.get("icon", "arrow"), 20, "megamenu__icon")
                cur = ' aria-current="page"' if c.get("slug") == active_slug else ""
                sub += (
                    f'<a class="megamenu__link" href="{url(c["slug"])}"{cur}>{ic}'
                    f'<span class="megamenu__text"><span class="megamenu__label">{e(c["label"])}</span>{desc}</span></a>'
                )
            here = " is-current" if any(c.get("slug") == active_slug for c in n["children"]) else ""
            items += f"""
            <li class="nav__item nav__item--has-children">
              <button class="nav__link nav__toggle{here}" type="button" aria-expanded="false">{e(n["label"])}
                <span class="nav__caret" aria-hidden="true"></span></button>
              <div class="megamenu"><div class="megamenu__inner">{sub}</div></div>
            </li>"""
        else:
            is_here = n.get("slug") == active_slug
            active = " is-current" if is_here else ""
            cur = ' aria-current="page"' if is_here else ""
            items += f'<li class="nav__item"><a class="nav__link{active}" href="{url(n["slug"])}"{cur}>{e(n["label"])}</a></li>'
    return items


def render_header(page):
    nav = render_nav(page.get("slug"))
    util = ""
    for u in UTILITY:
        util += f'<a href="{url(u["href"])}" class="util__link">{icon(u.get("icon","arrow"),15)}{e(u["label"])}</a>'
    socials = render_socials("util", 15)
    return f"""
  <a class="skip-link" href="#main">Aller au contenu principal</a>
  <div class="topbar">
    <div class="container topbar__inner">
      <span class="topbar__tag">{ci_flag(14)} République de Côte d'Ivoire — Initiative citoyenne</span>
      <div class="topbar__right">
        <div class="util">{util}</div>
        {socials}
      </div>
    </div>
  </div>
  <header class="header" id="header">
    <div class="header__bar">
      <div class="container header__bar-inner">
        <a class="brand" href="index.html" aria-label="Accueil — {e(SITE['long_name'])}">
          <img class="brand__logo" data-site-logo="header" src="assets/img/logo-wordmark-240.webp" alt="ACCI" width="118" height="72" fetchpriority="high">
          <span class="brand__full">{e(SITE['long_name'])}</span>
        </a>
        <div class="header__actions">
          <button class="iconbtn search-toggle" type="button" aria-label="Rechercher" aria-expanded="false" aria-controls="searchbar">{icon("search",20)}</button>
          <a class="btn btn--primary btn--sm header__cta" href="adhesion.html">Adhérer</a>
          <button class="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-nav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>
    <div class="header__navrow">
      <div class="container">
        <nav class="nav" aria-label="Navigation principale">
          <ul class="nav__list">{nav}</ul>
        </nav>
      </div>
    </div>
    <div class="searchbar" id="searchbar" hidden>
      <div class="container searchbar__inner">
        <span class="searchbar__icon" aria-hidden="true">{icon("search",20)}</span>
        <label class="visually-hidden" for="site-search">Rechercher sur le site</label>
        <input type="search" id="site-search" role="combobox" aria-expanded="false"
               aria-controls="search-results" aria-autocomplete="list"
               placeholder="Rechercher une page, un thème, un service…" autocomplete="off">
        <button class="searchbar__close" type="button" aria-label="Fermer la recherche">&times;</button>
        <div class="searchbar__results" id="search-results" role="listbox" aria-label="Résultats de recherche"></div>
        <p class="visually-hidden" id="search-status" role="status" aria-live="polite"></p>
      </div>
    </div>
  </header>
  <div class="mobile-nav" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu principal" hidden>
    <div class="mobile-nav__inner">
      <nav aria-label="Navigation principale">{render_mobile_nav(page.get('slug'))}</nav>
    </div>
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
    socials = render_socials("footer", 18)
    legal = "".join(f'<a href="{url(l["slug"])}">{e(l["label"])}</a>' for l in FOOTER["legal"])
    # Coordonnées de l'association. Elles existaient déjà dans SITE mais
    # n'étaient rendues que pour les moteurs (JSON-LD) et sur la page Contact :
    # aucun visiteur ne pouvait joindre l'ACCI depuis le pied de page.
    # Les repères data-site et les href mailto:/tel: sont ceux que
    # assets/js/site-settings.js réécrit depuis l'administration.
    tel_href = "".join(ch for ch in SITE["phone"] if ch.isdigit() or ch == "+")
    contact = f'''<div class="footer__contact">
            <h3 class="footer__title">Nous joindre</h3>
            <address>
              <span class="fcontact">{icon("map", 17, "fcontact__ic")}<span data-site="address">{e(SITE["address"])}</span></span>
              <a class="fcontact" href="mailto:{e(SITE["email"])}">{icon("mail", 17, "fcontact__ic")}<span data-site="email">{e(SITE["email"])}</span></a>
              <a class="fcontact" href="tel:{e(tel_href)}">{icon("phone", 17, "fcontact__ic")}<span data-site="phone">{e(SITE["phone"])}</span></a>
            </address>
          </div>'''
    return f"""
  <section class="newsletter">
    <div class="container newsletter__inner reveal">
      <div><h2 class="newsletter__title">Restez informé(e)</h2>
      <p>Recevez nos campagnes de sensibilisation, guides et actualités sur les bonnes pratiques numériques.</p></div>
      <form class="newsletter__form" id="newsletter-form" novalidate>
        <input type="email" name="email" placeholder="Votre adresse e-mail" required aria-label="Adresse e-mail">
        <button class="btn btn--light" type="submit">S'abonner</button>
        <p class="newsletter__note" id="newsletter-note" role="status" hidden></p>
        <p class="newsletter__legal">Vos données servent uniquement à l'envoi de notre lettre d'information.
          Désabonnement possible à tout moment. <a href="confidentialite.html">Politique de confidentialité</a>.</p>
      </form>
    </div>
  </section>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <a class="brand brand--footer" href="index.html" aria-label="Accueil — {e(SITE['long_name'])}">
            <img class="brand__logo brand__logo--footer" data-site-logo="footer" src="assets/img/logo-wordmark-light-240.webp" alt="ACCI" width="118" height="72" loading="lazy" decoding="async">
          </a>
          <p class="footer__about"><span data-site="long_name">{e(SITE['long_name'])}</span>. {e(FOOTER['about'])}</p>
          {contact}
          {socials}
        </div>
        <nav class="footer__cols" aria-label="Plan du site">{cols}</nav>
      </div>
      {render_credits()}
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
        <img class="chat__logo" data-site-logo="chat" src="assets/img/logo-wordmark-light-240.webp" alt="ACCI" width="88" height="54" loading="lazy" decoding="async">
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
  <script>document.documentElement.className+=" js";</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — ACCI</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#0b3d2e">
  <meta name="author" content="Association des Créateurs de Contenu Ivoiriens">
  <link rel="canonical" href="{canonical}">
{robots_meta}
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title} — ACCI">
  <meta property="og:description" content="{description}">
  <meta property="og:locale" content="fr_CI">
  <meta property="og:site_name" content="ACCI">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{og_image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="ACCI — Association des Créateurs de Contenu Ivoiriens">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title} — ACCI">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{og_image}">
  <link rel="icon" type="image/png" href="assets/img/favicon.png" data-site-icon="png">
  <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg" data-site-icon="svg">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png" data-site-icon="apple">
  <link rel="preconnect" href="https://durwoqjfjhdersuwxxwg.supabase.co" crossorigin>
  <link rel="preload" href="assets/fonts/inter-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/sora-700-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{css_fonts}">
  <link rel="stylesheet" href="{css_main}">
{jsonld}
</head>
<body data-page="{slug}">
{header}
  <main id="main">
{breadcrumb}
{content}
  </main>
{footer}
{chat}
  <script src="{js_index}" defer></script>
  <script src="{js_main}" defer></script>
  <script src="{js_chat}" defer></script>
  <script src="{js_images}" defer></script>
  <script src="{js_settings}" defer></script>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Données structurées (schema.org / JSON-LD)
# ---------------------------------------------------------------------------
def _abs(path):
    return SITE["url"] + "/" + path.lstrip("/")


def render_jsonld(page):
    """Balises JSON-LD : identité de l'organisation, site, fil d'Ariane, FAQ.

    Permet aux moteurs de recherche d'afficher le nom, le logo et les contacts
    de l'ACCI, et de comprendre l'arborescence du site.
    """
    graph = []

    org = {
        "@type": "NGO",
        "@id": _abs("#organisation"),
        "name": SITE["long_name"],
        "alternateName": SITE["name"],
        "url": SITE["url"],
        "logo": _abs("assets/img/logo-wordmark-480.png"),
        "image": _abs("assets/img/og-card.png"),
        "description": SITE["tagline"],
        "email": SITE["email"],
        "telephone": SITE["phone"],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Cocody, Riviera Golf",
            "addressLocality": "Abidjan",
            "addressCountry": "CI",
        },
        "areaServed": {"@type": "Country", "name": "Côte d'Ivoire"},
        # Pas de "sameAs" : les comptes sociaux sont renseignés dans
        # l'administration, que la compilation ne consulte pas. Annoncer aux
        # moteurs des comptes inventés serait pire que ne rien annoncer.
        "contactPoint": [{
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": SITE["email"],
            "telephone": SITE["phone"],
            "availableLanguage": ["fr"],
        }],
    }
    graph.append(org)

    graph.append({
        "@type": "WebSite",
        "@id": _abs("#site"),
        "url": SITE["url"],
        "name": SITE["name"],
        "inLanguage": "fr-CI",
        "publisher": {"@id": _abs("#organisation")},
    })

    # Fil d'Ariane : Accueil › Rubrique › Page
    crumbs = [{"name": "Accueil", "item": _abs("index.html")}]
    if page["slug"] != "index":
        crumbs.append({"name": page["title"], "item": _abs(url(page["slug"]))})
    if len(crumbs) > 1:
        graph.append({
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": i + 1,
                 "name": c["name"], "item": c["item"]}
                for i, c in enumerate(crumbs)
            ],
        })

    # FAQPage : dérivée d'un bloc accordéon si la page en contient un
    faq = next((b for b in page["blocks"]
                if b.get("type") == "accordion" and b.get("items")), None)
    if faq:
        graph.append({
            "@type": "FAQPage",
            "mainEntity": [{
                "@type": "Question",
                "name": it["q"],
                "acceptedAnswer": {"@type": "Answer", "text": it["a"]},
            } for it in faq["items"] if it.get("q") and it.get("a")],
        })

    payload = {"@context": "https://schema.org", "@graph": graph}
    # </script> ne peut pas apparaître dans un bloc script : on neutralise.
    body = json.dumps(payload, ensure_ascii=False, indent=None).replace("</", "<\\/")
    return f'  <script type="application/ld+json">{body}</script>'


# Empreintes de contenu des fichiers CSS/JS, renseignées par build().
# Elles permettent de servir ces fichiers avec un cache « immutable » d'un an :
# toute modification change le nom du fichier, donc l'URL.
ASSET_URLS = {
    "css_fonts": "assets/css/fonts.css",
    "css_main":  "assets/css/styles.css",
    "js_index":  "assets/js/search-index.js",
    "js_main":   "assets/js/main.js",
    "js_chat":   "assets/js/chat.js",
    "js_images": "assets/js/site-images.js",
    "js_settings": "assets/js/site-settings.js",
}


def render_page(page):
    content = render_blocks(page["blocks"], page)
    return PAGE_TEMPLATE.format(
        **ASSET_URLS,
        title=e(page["title"]),
        description=e(page.get("description", SITE["tagline"])),
        canonical=SITE["url"] + "/" + url(page["slug"]),
        robots_meta=('  <meta name="robots" content="noindex, follow">'
                     if page["slug"] in NOINDEX else ""),
        og_image=_abs("assets/img/og-card.png"),
        jsonld=render_jsonld(page),
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
    return "window.SEARCH_INDEX = " + json.dumps(entries, ensure_ascii=False) + ";"


# Pages exclues du sitemap ET marquées noindex : une page d'erreur indexée
# apparaît dans les résultats de recherche et dilue le référencement du site.
SITEMAP_EXCLUDE = {"404"}
NOINDEX = {"404"}

# Priorité et fréquence de mise à jour par rubrique (indications pour les moteurs).
SITEMAP_RULES = {
    "Actualités & événements": ("weekly", "0.7"),
    "Services & ressources":   ("monthly", "0.8"),
}


def build_sitemap(pages):
    today = datetime.date.today().isoformat()
    urls = ""
    for p in pages:
        if p["slug"] in SITEMAP_EXCLUDE:
            continue
        if p["slug"] == "index":
            freq, prio = "weekly", "1.0"
        else:
            freq, prio = SITEMAP_RULES.get(p.get("section", ""), ("monthly", "0.6"))
        urls += (f"  <url><loc>{SITE['url']}/{url(p['slug'])}</loc>"
                 f"<lastmod>{today}</lastmod>"
                 f"<changefreq>{freq}</changefreq>"
                 f"<priority>{prio}</priority></url>\n")
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

    # Copie des assets (les photos sources pleine résolution ne sont pas publiées)
    shutil.copytree(ASSETS, os.path.join(DIST, "assets"),
                    ignore=shutil.ignore_patterns("_originals", ".DS_Store", "manifest.json"))

    # Copie de l'espace d'administration (CRM)
    if os.path.isdir(ADMIN):
        shutil.copytree(ADMIN, os.path.join(DIST, "admin"))

    # Index de recherche
    with open(os.path.join(DIST, "assets", "js", "search-index.js"), "w", encoding="utf-8") as f:
        f.write(build_search_index(pages))

    # Empreintes de contenu : styles.<hash>.css, main.<hash>.js, etc.
    fingerprint_assets()

    # L'espace d'administration référence la feuille de polices par son nom
    # simple ; l'empreinte n'étant connue qu'ici, on la substitue après coup.
    admin_index = os.path.join(DIST, "admin", "index.html")
    if os.path.exists(admin_index):
        with open(admin_index, encoding="utf-8") as f:
            html = f.read()
        html = html.replace("/assets/css/fonts.css", "/" + ASSET_URLS["css_fonts"])
        with open(admin_index, "w", encoding="utf-8") as f:
            f.write(html)

    # Pages
    for p in pages:
        out = render_page(p)
        with open(os.path.join(DIST, url(p["slug"])), "w", encoding="utf-8") as f:
            f.write(out)

    # Inventaire des images : lu par l'espace d'administration pour proposer
    # la photothèque et la liste des emplacements réaffectables.
    inventory = {
        "images": [
            {"key": k, "widths": v["widths"], "fallback": v["fallback"],
             "w": v["w"], "h": v["h"]}
            for k, v in sorted(IMG_MANIFEST.items())
        ],
        "placements": sorted(IMG_PLACEMENTS, key=lambda x: x["slot"]),
    }
    with open(os.path.join(DIST, "assets", "img", "inventory.json"), "w",
              encoding="utf-8") as f:
        json.dump(inventory, f, ensure_ascii=False, separators=(",", ":"))

    # Sitemap + robots
    with open(os.path.join(DIST, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(build_sitemap(pages))
    with open(os.path.join(DIST, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(
            "User-agent: *\n"
            "Allow: /\n"
            "# Espace d'administration : jamais indexé\n"
            "Disallow: /admin/\n"
            "\n"
            f"Sitemap: {SITE['url']}/sitemap.xml\n"
        )

    if CARDS_WITHOUT_IMAGE:
        print(f"  ⚠ {len(CARDS_WITHOUT_IMAGE)} carte(s) sans photo :")
        for c in CARDS_WITHOUT_IMAGE[:8]:
            print(f"      {c}")
        if len(CARDS_WITHOUT_IMAGE) > 8:
            print(f"      … et {len(CARDS_WITHOUT_IMAGE) - 8} autre(s)")
    if MISSING_IMAGES:
        print(f"  ⚠ {len(MISSING_IMAGES)} photo(s) absente(s) du manifeste : "
              f"{', '.join(sorted(MISSING_IMAGES)[:6])}")
    print(f"✓ {len(pages)} pages générées dans ./dist")
    print(f"✓ Inventaire images : {len(IMG_MANIFEST)} photos, "
          f"{len(IMG_PLACEMENTS)} emplacements")
    # Inventaire des textes éditables, consommé par l'administration.
    with open(os.path.join(DIST, "assets", "content-index.json"), "w", encoding="utf-8") as f:
        json.dump(CONTENT_INDEX, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(DIST, "assets", "icons.json"), "w", encoding="utf-8") as f:
        json.dump(ICONS, f, ensure_ascii=False, separators=(",", ":"))
    print(f"✓ Inventaire de contenu : {len(CONTENT_INDEX)} textes éditables")
    print(f"✓ Index de recherche, sitemap.xml et robots.txt créés")
    return pages


def fingerprint_assets():
    """Renomme CSS/JS en <nom>.<empreinte>.<ext> et met à jour ASSET_URLS.

    Sans empreinte, l'en-tête « Cache-Control: immutable, max-age=1 an » de
    vercel.json ferait servir aux visiteurs de retour une feuille de style
    périmée pendant un an après chaque mise à jour.
    """
    for key, rel in list(ASSET_URLS.items()):
        src = os.path.join(DIST, *rel.split("/"))
        if not os.path.exists(src):
            print(f"  ⚠ actif introuvable : {rel}")
            continue
        with open(src, "rb") as f:
            digest = hashlib.sha1(f.read()).hexdigest()[:10]
        stem, ext = os.path.splitext(os.path.basename(rel))
        new_name = f"{stem}.{digest}{ext}"
        os.rename(src, os.path.join(os.path.dirname(src), new_name))
        ASSET_URLS[key] = os.path.dirname(rel) + "/" + new_name


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
