# -*- coding: utf-8 -*-
"""Agrège l'ensemble des pages du site et génère les pages utilitaires."""

from content import presentation, combat, chartes, services, actualites, engagement


def _content_pages():
    """Les 50 pages de contenu, dans l'ordre du plan."""
    pages = []
    pages += presentation.PAGES   # 1-8
    pages += combat.PAGES         # 9-20
    pages += chartes.PAGES        # 21-28
    pages += services.PAGES       # 29-38
    pages += actualites.PAGES     # 39-44
    pages += engagement.PAGES     # 45-50
    return pages


def _plan_du_site(pages):
    """Génère dynamiquement le plan du site, regroupé par section."""
    groups = []
    order = []
    by_section = {}
    for p in pages:
        sec = p.get("section") or "Accueil"
        if sec not in by_section:
            by_section[sec] = []
            order.append(sec)
        by_section[sec].append(p)

    blocks = [
        {"type": "hero", "variant": "compact",
         "kicker": "Navigation",
         "title": "Plan du site",
         "subtitle": "Toutes les pages du site de l'ACCI, regroupées par thématique."},
    ]
    for sec in order:
        items = [{"title": pg["title"], "href": pg["slug"],
                  "text": pg.get("description", "")[:90] + "…" if pg.get("description") else "",
                  "icon": "arrow"}
                 for pg in by_section[sec]]
        blocks.append({"type": "cards", "columns": 3, "title": sec, "items": items})
    return {
        "slug": "plan-du-site",
        "title": "Plan du site",
        "section": "Informations légales",
        "description": "Plan complet du site de l'ACCI : toutes les pages regroupées par thématique.",
        "blocks": blocks,
    }


def _not_found():
    return {
        "slug": "404",
        "title": "Page introuvable",
        "description": "La page demandée est introuvable.",
        "blocks": [
            {"type": "hero", "variant": "default",
             "kicker": "Erreur 404",
             "title": "Oups, cette page est **introuvable**",
             "subtitle": "La page que vous cherchez n'existe pas ou a été déplacée. Pas d'inquiétude, nous vous remettons sur la bonne voie.",
             "cta": [
                 {"label": "Retour à l'accueil", "href": "index", "style": "btn--primary", "arrow": True},
                 {"label": "Plan du site", "href": "plan-du-site", "style": "btn--outline-light"},
             ]},
            {"type": "cards", "columns": 3, "title": "Pages les plus consultées",
             "items": [
                 {"icon": "flag", "title": "Notre combat", "href": "notre-combat", "text": "Découvrez nos actions."},
                 {"icon": "doc", "title": "La charte", "href": "charte", "text": "Nos engagements communs."},
                 {"icon": "users", "title": "Adhésion", "href": "adhesion", "text": "Rejoignez l'ACCI."},
                 {"icon": "alert", "title": "Signaler un abus", "href": "signaler-abus", "text": "Agir contre les dérives."},
                 {"icon": "heart", "title": "Cellule d'écoute", "href": "cellule-ecoute", "text": "Demander de l'aide."},
                 {"icon": "mail", "title": "Contact", "href": "contact", "text": "Écrivez-nous."},
             ]},
        ],
    }


# Images d'en-tête appliquées automatiquement (1 image réaliste par page)
HERO_IMAGES = {
    "a-propos": "a-propos.jpg",
    "mission-vision": "mission-vision.jpg",
    "histoire": "histoire.jpg",
    "valeurs": "valeurs.jpg",
    "bureau-executif": "bureau-executif.jpg",
    "statuts": "statuts.jpg",
    "partenaires": "partenaires.jpg",
    "mauvaises-pratiques": "mauvaises-pratiques.jpg",
    "desinformation": "desinformation.jpg",
    "cyberharcelement": "cyberharcelement.jpg",
    "cyber-escroquerie": "cyber-escroquerie.jpg",
    "diffamation": "diffamation.jpg",
    "discours-haine": "discours-haine.jpg",
    "protection-mineurs": "protection-mineurs.jpg",
    "contenus-explicites": "contenus-explicites.jpg",
    "sextorsion": "sextorsion.jpg",
    "vie-privee": "vie-privee.jpg",
    "defis-dangereux": "defis-dangereux.jpg",
    "charte": "charte.jpg",
    "bonnes-pratiques": "bonnes-pratiques.jpg",
    "deontologie": "deontologie.jpg",
    "guide-debutant": "guide-debutant.jpg",
    "monetisation-ethique": "monetisation-ethique.jpg",
    "droits-auteur": "droits-auteur.jpg",
    "verification-information": "verification-information.jpg",
    "securite-numerique": "securite-numerique.jpg",
    "services": "services.jpg",
    "adhesion": "adhesion.jpg",
    "formations": "formations-hero.jpg",
    "accompagnement-juridique": "accompagnement-juridique.jpg",
}


def _apply_hero_images(pages):
    """Place une image d'en-tête sur les pages référencées (si absente)."""
    for p in pages:
        img = HERO_IMAGES.get(p["slug"])
        if not img:
            continue
        blocks = p.get("blocks", [])
        if blocks and blocks[0].get("type") == "hero" and not blocks[0].get("image"):
            blocks[0]["image"] = img


def all_pages():
    pages = _content_pages()
    _apply_hero_images(pages)
    pages.append(_plan_du_site(pages))
    pages.append(_not_found())
    return pages
