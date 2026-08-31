# -*- coding: utf-8 -*-
"""Pages 39 à 44 — Actualités & événements."""

SEC = "Actualités"

PAGES = [

# 39 — ACTUALITÉS -----------------------------------------------------------
{
  "slug": "actualites",
  "title": "Actualités",
  "seo_title": "Actualités de l’ACCI — création de contenu en Côte d’Ivoire",
  "section": SEC,
  "description": "L’actualité de l’ACCI : campagnes, événements, prises de position et initiatives en faveur d’un numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Le fil de l’ACCI",
     "title": "Actualités",
     "subtitle": "Nos actions, nos campagnes et nos prises de position en faveur d’un numérique ivoirien responsable."},

    {"type": "posts", "title": "À la une",
     "items": [
       {"category": "Campagne", "title": "#PartageVrai : une campagne pour la vérification de l’information", "excerpt": "L’ACCI engage une campagne nationale destinée à encourager le réflexe de vérification avant le partage.", "date": "12 juin 2026", "href": "campagnes", "icon": "fact", "color": "orange"},
       {"category": "Événement", "title": "Le Forum du créateur responsable revient en 2026", "excerpt": "Deux jours d’ateliers, d’échanges et de rencontres avec les acteurs du numérique ivoirien.", "date": "28 mai 2026", "href": "evenements", "icon": "calendar", "color": "green"},
       {"category": "Communiqué", "title": "Appel à la responsabilité face au harcèlement en ligne", "excerpt": "Devant la progression des attaques en ligne, l’ACCI appelle à une responsabilité partagée.", "date": "03 mai 2026", "href": "communiques", "icon": "megaphone", "color": "deep"},
       {"category": "Formation", "title": "Tournée des écoles : 1 000 élèves sensibilisés", "excerpt": "Retour sur notre programme d’éducation aux médias dans les établissements scolaires.", "date": "21 avril 2026", "href": "formations", "icon": "graduation", "color": "green"},
       {"category": "Partenariat", "title": "Nouveau partenariat pour la protection des mineurs", "excerpt": "L’ACCI s’associe à des acteurs engagés pour un internet plus sûr pour les enfants.", "date": "08 avril 2026", "href": "partenaires", "icon": "handshake", "color": "deep"},
       {"category": "Cellule d’écoute", "title": "Six mois d’écoute : les enseignements d’un premier bilan", "excerpt": "La cellule d’écoute publie un premier bilan des situations accompagnées.", "date": "15 mars 2026", "href": "cellule-ecoute", "icon": "heart", "color": "orange"},
     ]},

    {"type": "cta", "title": "Rester informé de nos actions",
     "text": "Nous vous invitons à vous abonner à notre lettre d’information.",
     "buttons": [{"label": "Voir nos campagnes", "href": "campagnes", "style": "btn--light", "arrow": True}]},
  ],
},

# 40 — ÉVÉNEMENTS -----------------------------------------------------------
{
  "slug": "evenements",
  "title": "Événements",
  "seo_title": "Événements et rencontres des créateurs ivoiriens — ACCI",
  "section": SEC,
  "description": "L’agenda de l’ACCI : forums, ateliers, conférences et rencontres autour du numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Agenda",
     "title": "Nos événements",
     "subtitle": "Rencontres, forums et ateliers : l’ACCI va à la rencontre du public, à Abidjan et dans les régions."},

    {"type": "posts", "title": "Prochains rendez-vous",
     "items": [
       {"category": "Forum", "title": "Forum du créateur responsable 2026", "excerpt": "Le rendez-vous annuel des créateurs de contenu ivoiriens. Conférences, ateliers et rencontres professionnelles.", "date": "Octobre 2026 — Abidjan", "icon": "calendar", "color": "orange"},
       {"category": "Atelier", "title": "Atelier vérification de l’information", "excerpt": "Une demi-journée pratique consacrée aux outils de vérification des faits.", "date": "Septembre 2026 — En ligne", "icon": "fact", "color": "green"},
       {"category": "Conférence", "title": "Protéger les enfants en ligne", "excerpt": "Une conférence à destination des parents et des éducateurs.", "date": "Septembre 2026 — Yamoussoukro", "icon": "child", "color": "deep"},
       {"category": "Tournée", "title": "Caravane numérique dans les régions", "excerpt": "L’ACCI va à la rencontre des jeunes créateurs des villes de l’intérieur.", "date": "À partir d’août 2026", "icon": "globe", "color": "green"},
       {"category": "Webinaire", "title": "Sécuriser ses comptes : les bases", "excerpt": "Un webinaire gratuit consacré à la protection de sa présence en ligne.", "date": "Juillet 2026 — En ligne", "icon": "lock", "color": "orange"},
       {"category": "Rencontre", "title": "Café des créateurs", "excerpt": "Un moment d’échange informel entre membres de la communauté ACCI.", "date": "Chaque mois — Abidjan", "icon": "users", "color": "deep"},
     ]},

    {"type": "callout", "variant": "info", "title": "Vous souhaitez accueillir un événement ?",
     "text": ["Écoles, entreprises, collectivités : l’ACCI peut organiser une intervention dans vos locaux. Nous vous invitons à nous contacter pour en définir les modalités."]},

    {"type": "cta", "title": "Prendre part à nos rencontres",
     "buttons": [{"label": "S’inscrire / se renseigner", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 41 — CAMPAGNES ------------------------------------------------------------
{
  "slug": "campagnes",
  "title": "Campagnes de sensibilisation",
  "section": SEC,
  "description": "Les campagnes de sensibilisation de l’ACCI pour un usage responsable des réseaux sociaux en Côte d’Ivoire.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "kicker": "Sensibiliser",
     "title": "Nos **campagnes** de sensibilisation",
     "subtitle": "Faire évoluer les usages commence par l’information : l’ACCI conçoit des campagnes claires, accessibles et fondées sur des faits.",
     "cta": [{"label": "Relayer nos campagnes", "href": "ressources", "style": "btn--primary", "arrow": True}]},

    {"type": "cards", "columns": 3, "title": "Nos grandes campagnes",
     "items": [
       {"icon": "fact", "title": "#PartageVrai", "text": "Vérifier avant de partager : prévenir la circulation des fausses informations."},
       {"icon": "shield", "title": "#StopCyberharcèlement", "text": "Libérer la parole et accompagner les personnes visées par le harcèlement."},
       {"icon": "child", "title": "#EnfanceProtégée", "text": "Pour un internet plus sûr pour les plus jeunes."},
       {"icon": "money", "title": "#DéjouonsLesArnaques", "text": "Reconnaître et signaler les escroqueries en ligne."},
       {"icon": "heart", "title": "#RespectEnLigne", "text": "Promouvoir le respect et la bienveillance dans les échanges."},
       {"icon": "lock", "title": "#MonCompteMaSécurité", "text": "Sensibiliser à la protection des comptes et des données."},
     ]},

    {"type": "split", "icon": "megaphone", "reverse": True,
     "kicker": "Devenir relais", "title": "Relayer nos messages",
     "text": [
       "Nos campagnes reposent sur celles et ceux qui les diffusent. Créateurs, internautes, écoles, entreprises : chacun peut en devenir un relais.",
       "Nos kits, nos visuels et nos mots-clés sont à disposition pour élargir la portée de ces messages.",
     ],
     "bullets": [
       "Diffuser nos visuels et vidéos",
       "Utiliser nos mots-clés de campagne",
       "Organiser une action dans votre communauté",
       "Témoigner et inviter à témoigner",
     ],
     "cta": {"label": "Télécharger un kit", "href": "ressources"}},

    {"type": "stats", "items": [
      {"value": "32", "label": "Campagnes menées"},
      {"value": "2", "suffix": "M+", "label": "Personnes touchées"},
      {"value": "14", "label": "Régions couvertes"},
      {"value": "200", "suffix": "+", "label": "Relais bénévoles"},
    ]},

    {"type": "cta", "title": "Contribuer à nos campagnes",
     "buttons": [{"label": "Rejoindre l’ACCI", "href": "adhesion", "style": "btn--light", "arrow": True}]},
  ],
},

# 42 — COMMUNIQUÉS ----------------------------------------------------------
{
  "slug": "communiques",
  "title": "Communiqués de presse",
  "section": SEC,
  "description": "Les communiqués et prises de position officielles de l’ACCI sur les enjeux du numérique.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Prises de position",
     "title": "Communiqués de presse",
     "subtitle": "Les positions officielles de l’ACCI sur les principaux enjeux du numérique ivoirien."},

    {"type": "posts", "title": "Derniers communiqués",
     "items": [
       {"category": "03 mai 2026", "title": "L’ACCI appelle à la responsabilité face au harcèlement en ligne", "excerpt": "Devant la progression des campagnes d’attaques en ligne, l’association appelle l’ensemble des acteurs à la responsabilité.", "icon": "megaphone", "color": "deep"},
       {"category": "18 avril 2026", "title": "Désinformation : pour une réponse concertée de tous les acteurs", "excerpt": "L’ACCI formule des propositions concrètes pour limiter la circulation des fausses informations.", "icon": "fact", "color": "orange"},
       {"category": "29 mars 2026", "title": "Protection des mineurs : l’ACCI appelle à une action coordonnée", "excerpt": "L’association appelle l’attention sur l’exposition croissante des enfants aux risques numériques.", "icon": "child", "color": "green"},
       {"category": "10 mars 2026", "title": "L’ACCI salue les initiatives pour un numérique plus sûr", "excerpt": "Point d’étape sur les avancées enregistrées et sur les chantiers en cours.", "icon": "check", "color": "green"},
       {"category": "22 février 2026", "title": "Sextorsion : informer et accompagner les personnes concernées", "excerpt": "L’ACCI rappelle l’importance de ne pas céder au chantage et de solliciter un accompagnement.", "icon": "lock", "color": "deep"},
       {"category": "05 février 2026", "title": "Lancement officiel des activités 2026 de l’ACCI", "excerpt": "L’association présente sa feuille de route pour l’année.", "icon": "flag", "color": "orange"},
     ]},

    {"type": "callout", "variant": "info", "title": "Vous êtes journaliste ?",
     "text": ["Nos ressources et nos contacts presse sont réunis dans l’espace dédié aux médias."]},

    {"type": "cta", "title": "Ressources à destination des médias",
     "buttons": [{"label": "Espace presse", "href": "espace-presse", "style": "btn--light", "arrow": True}]},
  ],
},

# 43 — GALERIE --------------------------------------------------------------
{
  "slug": "galerie",
  "title": "Galerie photos",
  "section": SEC,
  "description": "Retour en images sur les événements, les campagnes et les actions de terrain de l’ACCI.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Retour en images",
     "title": "Galerie photos",
     "subtitle": "Nos actions de terrain, nos rencontres et nos campagnes en images."},

    # « manage » rend ces deux blocs administrables depuis le CRM
    # (rubrique « Galerie photos »). Ce qui suit reste le contenu de repli,
    # affiché tant qu'aucune ligne n'a été enregistrée.
    {"type": "gallery", "columns": 3, "title": "Nos temps forts", "manage": "gallery",
     "lead": "Un aperçu de la vie de l’association et de ses actions de sensibilisation.",
     "items": [
       {"image": "hero-creators.jpg", "alt": "Atelier de tournage", "caption": "Atelier de création de contenu"},
       {"image": "formation.jpg", "alt": "Formation au numérique", "caption": "Formation à la création responsable"},
       {"image": "communaute.jpg", "alt": "Communauté de créateurs", "caption": "Rencontre de la communauté ACCI"},
       {"image": "protection-enfants.jpg", "alt": "Parentalité numérique", "caption": "Sensibilisation des familles"},
       {"image": "ecoute.jpg", "alt": "Cellule d’écoute", "caption": "Accompagnement des personnes concernées"},
       {"image": "solidarite.jpg", "alt": "Action de sensibilisation collective", "caption": "Sensibilisation et solidarité"},
     ]},

    {"type": "cards", "columns": 3, "title": "Nos albums", "manage": "albums",
     "items": [
       {"icon": "camera", "title": "Forum du créateur responsable", "text": "Les temps forts de notre rendez-vous annuel."},
       {"icon": "graduation", "title": "Ateliers & formations", "text": "Nos interventions auprès des jeunes et des créateurs."},
       {"icon": "megaphone", "title": "Campagnes de proximité", "text": "La sensibilisation sur le terrain, au plus près du public."},
       {"icon": "child", "title": "Tournée des écoles", "text": "L’éducation aux médias dans les établissements."},
       {"icon": "handshake", "title": "Rencontres partenaires", "text": "Les temps de collaboration avec nos partenaires."},
       {"icon": "users", "title": "Vie de la communauté", "text": "Les cafés des créateurs et les rencontres de membres."},
     ]},

    {"type": "callout", "variant": "info", "title": "Médias et partenaires",
     "text": ["Pour utiliser nos photos ou obtenir des visuels en haute définition, nous vous invitons à écrire à notre service communication."]},

    {"type": "cta", "title": "Découvrir nos prochains événements",
     "buttons": [{"label": "Voir l’agenda", "href": "evenements", "style": "btn--light", "arrow": True}]},
  ],
},

# 44 — VIDÉOS ---------------------------------------------------------------
{
  "slug": "videos",
  "title": "Vidéothèque",
  "seo_title": "Vidéothèque — sensibilisation au numérique responsable",
  "section": SEC,
  "description": "Les vidéos et capsules pédagogiques de l’ACCI consacrées au numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "À regarder",
     "title": "Vidéothèque",
     "subtitle": "Nos capsules pédagogiques et vidéos de sensibilisation, à regarder et à partager."},

    {"type": "cards", "columns": 3, "title": "Nos capsules",
     "items": [
       {"icon": "play", "title": "Repérer une fausse information", "text": "3 minutes pour apprendre à identifier une information douteuse."},
       {"icon": "play", "title": "Réagir au cyberharcèlement", "text": "Les réflexes utiles en cas de harcèlement en ligne."},
       {"icon": "play", "title": "Protéger ses enfants en ligne", "text": "Les recommandations essentielles pour les parents."},
       {"icon": "play", "title": "Reconnaître les arnaques", "text": "Identifier les procédés frauduleux les plus courants."},
       {"icon": "play", "title": "Sécuriser ses comptes", "text": "Le tutoriel sécurité en quelques minutes."},
       {"icon": "play", "title": "Créer de façon responsable", "text": "Témoignages de créateurs engagés."},
     ]},

    {"type": "callout", "variant": "success", "title": "Des contenus à diffuser largement",
     "text": ["Nos vidéos sont conçues pour être reprises et diffusées. Nous vous invitons à les partager avec vos proches, vos élèves et vos communautés."]},

    {"type": "cta", "title": "Découvrir nos autres ressources pédagogiques",
     "buttons": [{"label": "Voir les ressources", "href": "ressources", "style": "btn--light", "arrow": True}]},
  ],
},

]
