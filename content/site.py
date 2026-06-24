# -*- coding: utf-8 -*-
"""Configuration globale du site : identité, navigation, pied de page."""

SITE = {
    "name": "ACCI",
    "long_name": "Association des Créateurs de Contenu Ivoiriens",
    "tagline": "Pour un usage responsable, sûr et éthique des réseaux sociaux en Côte d'Ivoire.",
    "url": "https://www.acci.ci",
    "email": "contact@acci.ci",
    "phone": "+225 27 22 00 00 00",
    "address": "Cocody, Riviera Golf — Abidjan, Côte d'Ivoire",
    "year": 2026,
}

# Réseaux sociaux (barre supérieure + pied de page).
# ⚠️ Remplacez les URL ci-dessous par les comptes officiels réels de l'ACCI.
SOCIAL = [
    {"label": "Facebook", "icon": "facebook", "href": "https://www.facebook.com/ACCI.CotedIvoire"},
    {"label": "X (Twitter)", "icon": "x", "href": "https://x.com/ACCI_CI"},
    {"label": "Instagram", "icon": "instagram", "href": "https://www.instagram.com/acci.ci"},
    {"label": "TikTok", "icon": "tiktok", "href": "https://www.tiktok.com/@acci.ci"},
    {"label": "YouTube", "icon": "youtube", "href": "https://www.youtube.com/@ACCI-CotedIvoire"},
    {"label": "LinkedIn", "icon": "linkedin", "href": "https://www.linkedin.com/company/acci-ci"},
]

# Liens de la barre utilitaire (en haut)
UTILITY = [
    {"label": "Signaler un abus", "href": "signaler-abus", "icon": "alert"},
    {"label": "Cellule d'écoute", "href": "cellule-ecoute", "icon": "heart"},
    {"label": "FAQ", "href": "faq", "icon": "lightbulb"},
]

# Navigation principale (menus déroulants « méga-menu »)
NAV = [
    {
        "label": "L'ACCI",
        "children": [
            {"label": "Qui sommes-nous", "slug": "a-propos", "icon": "users", "desc": "Notre identité et notre raison d'être"},
            {"label": "Mission & vision", "slug": "mission-vision", "icon": "compass", "desc": "Ce que nous voulons changer"},
            {"label": "Notre histoire", "slug": "histoire", "icon": "book", "desc": "De l'idée à l'association"},
            {"label": "Nos valeurs", "slug": "valeurs", "icon": "heart", "desc": "Les principes qui nous guident"},
            {"label": "Bureau exécutif", "slug": "bureau-executif", "icon": "users", "desc": "L'équipe dirigeante"},
            {"label": "Statuts & règlement", "slug": "statuts", "icon": "doc", "desc": "Notre cadre juridique"},
            {"label": "Nos partenaires", "slug": "partenaires", "icon": "handshake", "desc": "Institutions et alliés"},
        ],
    },
    {
        "label": "Notre combat",
        "children": [
            {"label": "Notre combat", "slug": "notre-combat", "icon": "flag", "desc": "Vue d'ensemble de notre plaidoyer"},
            {"label": "Les mauvaises pratiques", "slug": "mauvaises-pratiques", "icon": "alert", "desc": "Le panorama des dérives"},
            {"label": "Désinformation", "slug": "desinformation", "icon": "fact", "desc": "Fausses nouvelles et rumeurs"},
            {"label": "Cyberharcèlement", "slug": "cyberharcelement", "icon": "shield", "desc": "Violences en ligne"},
            {"label": "Arnaques en ligne", "slug": "cyber-escroquerie", "icon": "money", "desc": "Escroqueries numériques"},
            {"label": "Diffamation", "slug": "diffamation", "icon": "scale", "desc": "Atteinte à la dignité"},
            {"label": "Discours de haine", "slug": "discours-haine", "icon": "warning", "desc": "Propos haineux et incitation"},
            {"label": "Protection des mineurs", "slug": "protection-mineurs", "icon": "child", "desc": "Protéger les plus jeunes"},
            {"label": "Contenus explicites", "slug": "contenus-explicites", "icon": "eye", "desc": "Nudité et contenus sensibles"},
            {"label": "Chantage & sextorsion", "slug": "sextorsion", "icon": "lock", "desc": "Extorsion à caractère sexuel"},
            {"label": "Vie privée", "slug": "vie-privee", "icon": "key", "desc": "Données personnelles exposées"},
            {"label": "Défis dangereux", "slug": "defis-dangereux", "icon": "alert", "desc": "Challenges à risque"},
        ],
    },
    {
        "label": "Chartes & guides",
        "children": [
            {"label": "Charte du créateur", "slug": "charte", "icon": "doc", "desc": "Nos engagements communs"},
            {"label": "Bonnes pratiques", "slug": "bonnes-pratiques", "icon": "check", "desc": "Créer de façon responsable"},
            {"label": "Code de déontologie", "slug": "deontologie", "icon": "scale", "desc": "Règles professionnelles"},
            {"label": "Guide du débutant", "slug": "guide-debutant", "icon": "lightbulb", "desc": "Bien démarrer en ligne"},
            {"label": "Monétisation éthique", "slug": "monetisation-ethique", "icon": "money", "desc": "Gagner sa vie sainement"},
            {"label": "Droits d'auteur", "slug": "droits-auteur", "icon": "copyright", "desc": "Propriété intellectuelle"},
            {"label": "Vérifier l'information", "slug": "verification-information", "icon": "fact", "desc": "Méthodes anti-fake news"},
            {"label": "Sécurité numérique", "slug": "securite-numerique", "icon": "lock", "desc": "Protéger ses comptes"},
        ],
    },
    {
        "label": "Services",
        "children": [
            {"label": "Nos services", "slug": "services", "icon": "star", "desc": "Tout l'accompagnement ACCI"},
            {"label": "Adhésion", "slug": "adhesion", "icon": "users", "desc": "Devenir membre"},
            {"label": "Formations", "slug": "formations", "icon": "graduation", "desc": "Se former au numérique"},
            {"label": "Accompagnement juridique", "slug": "accompagnement-juridique", "icon": "scale", "desc": "Aide et conseil de droit"},
            {"label": "Signaler un abus", "slug": "signaler-abus", "icon": "alert", "desc": "Dénoncer un contenu nuisible"},
            {"label": "Cellule d'écoute", "slug": "cellule-ecoute", "icon": "heart", "desc": "Soutien aux victimes"},
            {"label": "Ressources", "slug": "ressources", "icon": "download", "desc": "Guides à télécharger"},
            {"label": "Espace presse", "slug": "espace-presse", "icon": "megaphone", "desc": "Médias et journalistes"},
        ],
    },
    {
        "label": "Actualités",
        "children": [
            {"label": "Actualités", "slug": "actualites", "icon": "doc", "desc": "Le fil de l'association"},
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
    "about": "Une initiative citoyenne au service d'un espace numérique ivoirien plus sûr, plus respectueux et plus crédible.",
    "columns": [
        {
            "title": "L'association",
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
            "title": "Notre combat",
            "links": [
                {"label": "Les mauvaises pratiques", "slug": "mauvaises-pratiques"},
                {"label": "Désinformation", "slug": "desinformation"},
                {"label": "Cyberharcèlement", "slug": "cyberharcelement"},
                {"label": "Arnaques en ligne", "slug": "cyber-escroquerie"},
                {"label": "Protection des mineurs", "slug": "protection-mineurs"},
                {"label": "Défis dangereux", "slug": "defis-dangereux"},
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
