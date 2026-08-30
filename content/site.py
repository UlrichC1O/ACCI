# -*- coding: utf-8 -*-
"""Configuration globale du site : identité, navigation, pied de page."""

import os

# URL canonique du site. Elle alimente les balises <link rel="canonical">,
# le sitemap, robots.txt et les données structurées : une valeur erronée les
# rend toutes inexploitables par les moteurs de recherche.
#
# ⚠️ acci.ci ne résout pas actuellement (NXDOMAIN). Renseignez le domaine qui
# servira réellement le site avant toute mise en ligne, ou définissez la
# variable d’environnement SITE_URL (Vercel : Settings → Environment Variables).
# À défaut, Vercel fournit VERCEL_PROJECT_PRODUCTION_URL sur les déploiements
# de production, ce qui évite de publier des canoniques pointant dans le vide.
def _site_url():
    explicit = os.environ.get("SITE_URL")
    if explicit:
        return explicit.rstrip("/")
    vercel = os.environ.get("VERCEL_PROJECT_PRODUCTION_URL")
    if vercel:
        return "https://" + vercel.rstrip("/")
    return "https://www.acci.ci"


SITE = {
    "name": "ACCI",
    "long_name": "Association des Créateurs de Contenu Ivoiriens",
    "tagline": "Pour un usage responsable, sûr et éthique des réseaux sociaux en Côte d’Ivoire.",
    "url": _site_url(),
    "email": "contact@acci.ci",
    "phone": "+225 27 22 00 00 00",
    "address": "Cocody, Riviera Golf — Abidjan, Côte d’Ivoire",
    "year": 2026,
}

# Réseaux sociaux (barre supérieure + pied de page).
# Cette liste déclare les réseaux que le site sait afficher, et dans quel ordre.
# Elle ne contient délibérément aucune adresse : les comptes se renseignent dans
# l’administration (« Identité du site » → « Réseaux sociaux »), et c’est
# assets/js/site-settings.js qui révèle chez le visiteur les seules icônes dont
# l’adresse a été renseignée.
#
# Un réseau sans adresse n’est pas affiché. C’est la seule rubrique du site où
# une valeur manquante fait disparaître quelque chose plutôt que de conserver ce
# qui a été compilé : une icône qui mène au compte d’un inconnu est plus
# dommageable pour l’association qu’une icône absente.
SOCIAL = [
    {"label": "Facebook", "icon": "facebook"},
    {"label": "X (Twitter)", "icon": "x"},
    {"label": "Instagram", "icon": "instagram"},
    {"label": "TikTok", "icon": "tiktok"},
    {"label": "YouTube", "icon": "youtube"},
    {"label": "LinkedIn", "icon": "linkedin"},
]

# Liens de la barre utilitaire (en haut)
UTILITY = [
    {"label": "Signaler un abus", "href": "signaler-abus", "icon": "alert"},
    {"label": "Cellule d’écoute", "href": "cellule-ecoute", "icon": "heart"},
    {"label": "FAQ", "href": "faq", "icon": "lightbulb"},
]

# Navigation principale (menus déroulants « méga-menu »)
NAV = [
    {
        "label": "L’ACCI",
        "children": [
            {"label": "Qui sommes-nous", "slug": "a-propos", "icon": "users", "desc": "Notre identité et notre raison d’être"},
            {"label": "Mission & vision", "slug": "mission-vision", "icon": "compass", "desc": "Ce que nous voulons construire"},
            {"label": "Notre histoire", "slug": "histoire", "icon": "book", "desc": "De l’idée à l’association"},
            {"label": "Nos valeurs", "slug": "valeurs", "icon": "heart", "desc": "Les principes qui nous guident"},
            {"label": "Bureau exécutif", "slug": "bureau-executif", "icon": "users", "desc": "L’équipe dirigeante"},
            {"label": "Statuts & règlement", "slug": "statuts", "icon": "doc", "desc": "Notre cadre juridique"},
            {"label": "Nos partenaires", "slug": "partenaires", "icon": "handshake", "desc": "Institutions et organisations partenaires"},
        ],
    },
    {
        "label": "Nos champs d’action",
        "children": [
            {"label": "Nos champs d’action", "slug": "notre-combat", "icon": "flag", "desc": "Ce que nous faisons et pourquoi"},
            {"label": "Les mauvaises pratiques", "slug": "mauvaises-pratiques", "icon": "alert", "desc": "Un panorama des risques"},
            {"label": "Désinformation", "slug": "desinformation", "icon": "fact", "desc": "Fausses nouvelles et rumeurs"},
            {"label": "Cyberharcèlement", "slug": "cyberharcelement", "icon": "shield", "desc": "Violences en ligne"},
            {"label": "Escroqueries en ligne", "slug": "cyber-escroquerie", "icon": "money", "desc": "Les fraudes numériques"},
            {"label": "Diffamation", "slug": "diffamation", "icon": "scale", "desc": "Atteinte à la dignité"},
            {"label": "Discours de haine", "slug": "discours-haine", "icon": "warning", "desc": "Propos haineux et incitation"},
            {"label": "Protection des mineurs", "slug": "protection-mineurs", "icon": "child", "desc": "Protéger les plus jeunes"},
            {"label": "Contenus explicites", "slug": "contenus-explicites", "icon": "eye", "desc": "Nudité et contenus sensibles"},
            {"label": "Chantage & sextorsion", "slug": "sextorsion", "icon": "lock", "desc": "Extorsion à caractère sexuel"},
            {"label": "Vie privée", "slug": "vie-privee", "icon": "key", "desc": "Données personnelles exposées"},
            {"label": "Défis à risque", "slug": "defis-dangereux", "icon": "alert", "desc": "Les challenges qui exposent les jeunes"},
        ],
    },
    {
        "label": "Chartes & guides",
        "children": [
            {"label": "Charte du créateur", "slug": "charte", "icon": "doc", "desc": "Nos engagements communs"},
            {"label": "Bonnes pratiques", "slug": "bonnes-pratiques", "icon": "check", "desc": "Créer de façon responsable"},
            {"label": "Code de déontologie", "slug": "deontologie", "icon": "scale", "desc": "Règles professionnelles"},
            {"label": "Guide du débutant", "slug": "guide-debutant", "icon": "lightbulb", "desc": "Bien démarrer en ligne"},
            {"label": "Monétisation éthique", "slug": "monetisation-ethique", "icon": "money", "desc": "Gagner sa vie durablement"},
            {"label": "Droits d’auteur", "slug": "droits-auteur", "icon": "copyright", "desc": "Propriété intellectuelle"},
            {"label": "Vérifier l’information", "slug": "verification-information", "icon": "fact", "desc": "Recouper une source, dater une image"},
            {"label": "Sécurité numérique", "slug": "securite-numerique", "icon": "lock", "desc": "Protéger ses comptes"},
        ],
    },
    {
        "label": "Services",
        "children": [
            {"label": "Nos services", "slug": "services", "icon": "star", "desc": "Tout l’accompagnement ACCI"},
            {"label": "Adhésion", "slug": "adhesion", "icon": "users", "desc": "Devenir membre"},
            {"label": "Formations", "slug": "formations", "icon": "graduation", "desc": "Se former au numérique"},
            {"label": "Accompagnement juridique", "slug": "accompagnement-juridique", "icon": "scale", "desc": "Aide et conseil juridiques"},
            {"label": "Signaler un abus", "slug": "signaler-abus", "icon": "alert", "desc": "Contenu ou comportement abusif"},
            {"label": "Cellule d’écoute", "slug": "cellule-ecoute", "icon": "heart", "desc": "Soutien confidentiel aux personnes touchées"},
            {"label": "Ressources", "slug": "ressources", "icon": "download", "desc": "Guides à télécharger"},
            {"label": "Espace presse", "slug": "espace-presse", "icon": "megaphone", "desc": "Médias et journalistes"},
        ],
    },
    {
        "label": "Actualités",
        "children": [
            {"label": "Actualités", "slug": "actualites", "icon": "doc", "desc": "Le fil de l’association"},
            {"label": "Événements", "slug": "evenements", "icon": "calendar", "desc": "Agenda et rendez-vous"},
            {"label": "Campagnes", "slug": "campagnes", "icon": "megaphone", "desc": "Nos actions de sensibilisation"},
            {"label": "Communiqués", "slug": "communiques", "icon": "bullhorn", "desc": "Prises de position"},
            {"label": "Galerie photos", "slug": "galerie", "icon": "camera", "desc": "Retour en images"},
            {"label": "Vidéothèque", "slug": "videos", "icon": "play", "desc": "Nos vidéos et capsules"},
        ],
    },
    {"label": "Contact", "slug": "contact"},
]

# Pied de page
FOOTER = {
    "about": "Une initiative citoyenne au service d’un espace numérique ivoirien plus sûr, plus respectueux et plus crédible.",
    "columns": [
        {
            "title": "L’association",
            "links": [
                {"label": "Qui sommes-nous", "slug": "a-propos"},
                {"label": "Mission & vision", "slug": "mission-vision"},
                {"label": "Notre histoire", "slug": "histoire"},
                {"label": "Bureau exécutif", "slug": "bureau-executif"},
                {"label": "Statuts & règlement", "slug": "statuts"},
                {"label": "Nos partenaires", "slug": "partenaires"},
            ],
        },
        {
            "title": "Nos champs d’action",
            "links": [
                {"label": "Les mauvaises pratiques", "slug": "mauvaises-pratiques"},
                {"label": "Désinformation", "slug": "desinformation"},
                {"label": "Cyberharcèlement", "slug": "cyberharcelement"},
                {"label": "Escroqueries en ligne", "slug": "cyber-escroquerie"},
                {"label": "Protection des mineurs", "slug": "protection-mineurs"},
                {"label": "Défis à risque", "slug": "defis-dangereux"},
            ],
        },
        {
            "title": "Ressources",
            "links": [
                {"label": "Charte du créateur", "slug": "charte"},
                {"label": "Bonnes pratiques", "slug": "bonnes-pratiques"},
                {"label": "Guide du débutant", "slug": "guide-debutant"},
                {"label": "Sécurité numérique", "slug": "securite-numerique"},
                {"label": "Glossaire", "slug": "glossaire"},
                {"label": "FAQ", "slug": "faq"},
            ],
        },
        {
            "title": "Agir avec nous",
            "links": [
                {"label": "Devenir membre", "slug": "adhesion"},
                {"label": "Signaler un abus", "slug": "signaler-abus"},
                {"label": "Faire un don", "slug": "faire-un-don"},
                {"label": "Annuaire des créateurs", "slug": "annuaire"},
                {"label": "Témoignages", "slug": "temoignages"},
                {"label": "Nous contacter", "slug": "contact"},
            ],
        },
    ],
    "legal": [
        {"label": "Mentions légales", "slug": "mentions-legales"},
        {"label": "Politique de confidentialité", "slug": "confidentialite"},
        {"label": "Plan du site", "slug": "plan-du-site"},
        {"label": "Espace administration", "slug": "admin/index"},
    ],
}

# Crédits du pied de page : la personne ou le studio qui a réalisé le site, et
# les partenaires que l’association souhaite créditer avec un lien.
#
# Comme pour les réseaux sociaux, rien n’est écrit ici par défaut, et pour la
# même raison : une attribution est un engagement public. Un nom inventé sur
# cinquante pages engage l’association vis-à-vis d’un tiers, et un lien
# approximatif envoie ses visiteurs chez quelqu’un d’autre. Tant que rien n’est
# renseigné, la ligne n’apparaît tout simplement pas.
#
# Ces valeurs se renseignent dans l’administration (« Identité du site » →
# « Crédits & partenaires ») et sont appliquées chez le visiteur par
# assets/js/site-settings.js, sans recompilation. Les remplir ici les fige dans
# le HTML compilé : à faire seulement quand elles sont définitivement arrêtées.
CREDITS = {
    # {"label": "Studio Untel", "href": "https://…"} — le lien est facultatif.
    "developer": {"label": "", "href": ""},
    # Le mot qui introduit la ligne. « Conception & développement » décrit le
    # travail réellement fourni ; « Réalisé par » conviendrait aussi.
    "developer_prefix": "Conception & développement",
    # [{"label": "Nom du partenaire", "href": "https://…"}, …]
    "partners": [],
    "partners_title": "Avec le soutien de",
}
