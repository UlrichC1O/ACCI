# -*- coding: utf-8 -*-
"""Agrège l’ensemble des pages du site et génère les pages utilitaires."""

import importlib
import pkgutil

import content
from content import presentation, combat, chartes, services, actualites, engagement

# Ordre de lecture du site. Il ne se déduit d’aucune règle — c’est le plan
# voulu par l’association — et reste donc écrit ici.
_ORDRE = ["presentation", "combat", "chartes", "services", "actualites", "engagement"]

# Modules du paquet qui ne portent pas de pages.
_HORS_PLAN = {"pages", "site"}


def _modules_de_contenu():
    """Tous les modules de content/ qui déclarent une liste PAGES.

    Cette liste était écrite à la main. Un module ajouté sans y être inscrit
    était donc ignoré en silence : sa page n’était pas construite, n’entrait
    pas dans le plan du site ni dans le sitemap, et rien ne le signalait —
    la page semblait simplement ne pas exister. Elle est maintenant découverte,
    et tout module hors de l’ordre convenu est annoncé à la compilation pour
    qu’on décide où le placer plutôt que de le voir apparaître à la fin.
    """
    trouves = {}
    for info in pkgutil.iter_modules(content.__path__):
        if info.name in _HORS_PLAN:
            continue
        mod = importlib.import_module("content." + info.name)
        pages = getattr(mod, "PAGES", None)
        if isinstance(pages, list) and pages:
            trouves[info.name] = pages

    noms = [n for n in _ORDRE if n in trouves]
    extras = sorted(n for n in trouves if n not in _ORDRE)
    if extras:
        print("  ⚠ module(s) de contenu hors de l’ordre du plan, ajouté(s) à la fin : "
              + ", ".join(extras) + " — inscrivez-les dans _ORDRE (content/pages.py)")
    manquants = [n for n in _ORDRE if n not in trouves]
    if manquants:
        print("  ⚠ module(s) attendu(s) mais sans pages : " + ", ".join(manquants))
    return [(n, trouves[n]) for n in noms + extras]


def _content_pages():
    """Les pages de contenu, dans l’ordre du plan."""
    pages = []
    for _, liste in _modules_de_contenu():
        pages += liste
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
         "subtitle": "Toutes les pages du site de l’ACCI, regroupées par thématique."},
    ]
    def _extrait(texte, limite=90):
        """Résumé court, coupé sur une frontière de mot.

        La version précédente concaténait « … » sans condition et tranchait à
        90 caractères exactement : les descriptions courtes se terminaient par
        « .… » et les autres au milieu d’un mot (« …et agit pour prév… »).
        """
        texte = (texte or "").strip()
        if len(texte) <= limite:
            return texte
        coupe = texte[:limite].rsplit(" ", 1)[0].rstrip(" ,;:.")
        return coupe + "…"

    for sec in order:
        items = [{"title": pg["title"], "href": pg["slug"],
                  "text": _extrait(pg.get("description", "")),
                  "icon": "arrow"}
                 for pg in by_section[sec]]
        blocks.append({"type": "cards", "columns": 3, "title": sec, "items": items})
    return {
        "slug": "plan-du-site",
        "title": "Plan du site",
        "section": "Informations légales",
        "description": "Plan complet du site de l’ACCI : toutes les pages regroupées par thématique.",
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
             "title": "Cette page est **introuvable**",
             "subtitle": "La page que vous recherchez n’existe pas ou a été déplacée. Les liens ci-dessous vous aideront à retrouver l’information souhaitée.",
             "cta": [
                 {"label": "Retour à l’accueil", "href": "index", "style": "btn--primary", "arrow": True},
                 {"label": "Plan du site", "href": "plan-du-site", "style": "btn--outline-light"},
             ]},
            {"type": "cards", "columns": 3, "title": "Accès rapides",
             "items": [
                 {"icon": "flag", "title": "Nos champs d’action", "href": "notre-combat", "text": "Vue d’ensemble de nos priorités."},
                 {"icon": "doc", "title": "La charte", "href": "charte", "text": "Nos engagements communs."},
                 {"icon": "users", "title": "Adhésion", "href": "adhesion", "text": "Rejoignez l’ACCI."},
                 {"icon": "alert", "title": "Signaler un abus", "href": "signaler-abus", "text": "La marche à suivre pour un signalement."},
                 {"icon": "heart", "title": "Cellule d’écoute", "href": "cellule-ecoute", "text": "Demander de l’aide."},
                 {"icon": "mail", "title": "Contact", "href": "contact", "text": "Écrivez-nous."},
             ]},
        ],
    }


# Images d’en-tête appliquées automatiquement (1 image réaliste par page)
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
    # Services & ressources
    "signaler-abus": "protection-enfants.jpg",
    "cellule-ecoute": "ecoute.jpg",
    "espace-presse": "communaute.jpg",
    "ressources": "formation.jpg",
    "faq": "guide-debutant.jpg",
    "glossaire": "securite-numerique.jpg",
    # Actualités & événements
    "actualites": "hero-creators.jpg",
    "evenements": "formations-hero.jpg",
    "campagnes": "usage-responsable.jpg",
    "communiques": "communaute.jpg",
    "galerie": "hero-creators.jpg",
    "videos": "formation.jpg",
    # Engagement
    "annuaire": "communaute.jpg",
    "temoignages": "solidarite.jpg",
    "contact": "solidarite.jpg",
    # Légal
    "mentions-legales": "charte.jpg",
    "confidentialite": "securite-numerique.jpg",
}


def _apply_hero_images(pages):
    """Place une image d’en-tête sur les pages référencées (si absente)."""
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
