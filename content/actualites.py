# -*- coding: utf-8 -*-
"""Pages 39 à 44 — Actualités & événements."""

SEC = "Actualités"

PAGES = [

# 39 — ACTUALITÉS -----------------------------------------------------------
{
  "slug": "actualites",
  "title": "Actualités",
  "section": SEC,
  "description": "Toute l'actualité de l'ACCI : campagnes, événements, prises de position et initiatives pour un numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Le fil de l'ACCI",
     "title": "Actualités",
     "subtitle": "Suivez nos actions, nos campagnes et nos prises de position pour un numérique ivoirien plus sain."},

    {"type": "posts", "title": "À la une",
     "items": [
       {"category": "Campagne", "title": "#PartageVrai : la campagne contre les fausses nouvelles", "excerpt": "L'ACCI lance une grande campagne nationale pour ancrer le réflexe de vérification avant le partage.", "date": "12 juin 2026", "href": "campagnes", "icon": "fact", "color": "orange"},
       {"category": "Événement", "title": "Le Forum du créateur responsable revient en 2026", "excerpt": "Deux jours d'ateliers, de débats et de rencontres avec les acteurs du numérique ivoirien.", "date": "28 mai 2026", "href": "evenements", "icon": "calendar", "color": "green"},
       {"category": "Communiqué", "title": "Appel à une trêve numérique du harcèlement", "excerpt": "Face à la montée des attaques en ligne, l'ACCI appelle à la responsabilité collective.", "date": "03 mai 2026", "href": "communiques", "icon": "megaphone", "color": "deep"},
       {"category": "Formation", "title": "Tournée des écoles : 1 000 élèves sensibilisés", "excerpt": "Retour sur notre programme d'éducation aux médias dans les établissements scolaires.", "date": "21 avril 2026", "href": "formations", "icon": "graduation", "color": "green"},
       {"category": "Partenariat", "title": "Nouvelle alliance pour la protection des mineurs", "excerpt": "L'ACCI s'associe à des acteurs engagés pour un internet plus sûr pour les enfants.", "date": "08 avril 2026", "href": "partenaires", "icon": "handshake", "color": "deep"},
       {"category": "Cellule d'écoute", "title": "Six mois d'écoute : un bilan qui appelle à agir", "excerpt": "La cellule d'écoute publie un premier bilan des situations accompagnées.", "date": "15 mars 2026", "href": "cellule-ecoute", "icon": "heart", "color": "orange"},
     ]},

    {"type": "cta", "title": "Ne manquez aucune actualité",
     "text": "Abonnez-vous à notre lettre d'information.",
     "buttons": [{"label": "Voir nos campagnes", "href": "campagnes", "style": "btn--light", "arrow": True}]},
  ],
},

# 40 — ÉVÉNEMENTS -----------------------------------------------------------
{
  "slug": "evenements",
  "title": "Événements",
  "section": SEC,
  "description": "L'agenda de l'ACCI : forums, ateliers, conférences et rencontres autour du numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Agenda",
     "title": "Nos événements",
     "subtitle": "Rencontres, forums, ateliers : retrouvez l'ACCI sur le terrain, à Abidjan et dans les régions."},

    {"type": "posts", "title": "Prochains rendez-vous",
     "items": [
       {"category": "Forum", "title": "Forum du créateur responsable 2026", "excerpt": "Le grand rendez-vous annuel des créateurs de contenu ivoiriens engagés. Conférences, ateliers et networking.", "date": "Octobre 2026 — Abidjan", "icon": "calendar", "color": "orange"},
       {"category": "Atelier", "title": "Atelier vérification de l'information", "excerpt": "Une demi-journée pratique pour maîtriser les outils du fact-checking.", "date": "Septembre 2026 — En ligne", "icon": "fact", "color": "green"},
       {"category": "Conférence", "title": "Protéger nos enfants en ligne", "excerpt": "Une conférence à destination des parents et éducateurs.", "date": "Septembre 2026 — Yamoussoukro", "icon": "child", "color": "deep"},
       {"category": "Tournée", "title": "Caravane numérique dans les régions", "excerpt": "L'ACCI part à la rencontre des jeunes créateurs des villes de l'intérieur.", "date": "À partir d'août 2026", "icon": "globe", "color": "green"},
       {"category": "Webinaire", "title": "Sécuriser ses comptes : les bases", "excerpt": "Un webinaire gratuit pour apprendre à protéger sa présence en ligne.", "date": "Juillet 2026 — En ligne", "icon": "lock", "color": "orange"},
       {"category": "Rencontre", "title": "Café des créateurs", "excerpt": "Un moment d'échange informel entre membres de la communauté ACCI.", "date": "Chaque mois — Abidjan", "icon": "users", "color": "deep"},
     ]},

    {"type": "callout", "variant": "info", "title": "Vous souhaitez accueillir un événement ?",
     "text": ["Écoles, entreprises, collectivités : l'ACCI peut organiser une intervention chez vous. Contactez-nous pour en discuter."]},

    {"type": "cta", "title": "Participez à nos rencontres",
     "buttons": [{"label": "S'inscrire / se renseigner", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 41 — CAMPAGNES ------------------------------------------------------------
{
  "slug": "campagnes",
  "title": "Campagnes de sensibilisation",
  "section": SEC,
  "description": "Les campagnes de sensibilisation de l'ACCI pour un usage responsable des réseaux sociaux en Côte d'Ivoire.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "kicker": "Mobiliser",
     "title": "Nos **campagnes** de sensibilisation",
     "subtitle": "Parce que changer les comportements commence par changer les regards, l'ACCI mène des campagnes qui marquent les esprits.",
     "cta": [{"label": "Relayer nos campagnes", "href": "ressources", "style": "btn--primary", "arrow": True}]},

    {"type": "cards", "columns": 3, "title": "Nos grandes campagnes",
     "items": [
       {"icon": "fact", "title": "#PartageVrai", "text": "Vérifier avant de partager : la campagne contre la désinformation."},
       {"icon": "shield", "title": "#StopCyberharcèlement", "text": "Briser le silence et soutenir les victimes de harcèlement."},
       {"icon": "child", "title": "#EnfanceProtégée", "text": "Pour un internet plus sûr pour les plus jeunes."},
       {"icon": "money", "title": "#DéjouonsLesArnaques", "text": "Reconnaître et signaler les escroqueries en ligne."},
       {"icon": "heart", "title": "#RespectEnLigne", "text": "Promouvoir la bienveillance et refuser la haine."},
       {"icon": "lock", "title": "#MonCompteMaSécurité", "text": "Sensibiliser à la protection des comptes et des données."},
     ]},

    {"type": "split", "icon": "megaphone", "reverse": True,
     "kicker": "Devenez relais", "title": "Amplifiez nos messages",
     "text": [
       "Nos campagnes vivent grâce à celles et ceux qui les partagent. Créateurs, internautes, écoles, entreprises : vous pouvez devenir un relais.",
       "Téléchargez nos kits, partagez nos visuels et utilisez nos mots-clés pour faire grandir le mouvement.",
     ],
     "bullets": [
       "Partager nos visuels et vidéos",
       "Utiliser nos mots-clés de campagne",
       "Organiser une action dans votre communauté",
       "Témoigner et inviter à témoigner",
     ],
     "cta": {"label": "Télécharger un kit", "href": "ressources"}},

    {"type": "stats", "items": [
      {"value": "32", "label": "Campagnes menées"},
      {"value": "2", "suffix": "M+", "label": "Personnes touchées"},
      {"value": "14", "label": "Régions mobilisées"},
      {"value": "200", "suffix": "+", "label": "Relais bénévoles"},
    ]},

    {"type": "cta", "title": "Faites partie du mouvement",
     "buttons": [{"label": "Rejoindre l'ACCI", "href": "adhesion", "style": "btn--light", "arrow": True}]},
  ],
},

# 42 — COMMUNIQUÉS ----------------------------------------------------------
{
  "slug": "communiques",
  "title": "Communiqués de presse",
  "section": SEC,
  "description": "Les communiqués et prises de position officielles de l'ACCI sur les enjeux du numérique.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Prises de position",
     "title": "Communiqués de presse",
     "subtitle": "Les positions officielles de l'ACCI sur les grands enjeux du numérique ivoirien."},

    {"type": "posts", "title": "Derniers communiqués",
     "items": [
       {"category": "03 mai 2026", "title": "L'ACCI appelle à une trêve numérique du harcèlement", "excerpt": "Face à la recrudescence des campagnes d'attaques en ligne, l'association lance un appel solennel à la responsabilité.", "icon": "megaphone", "color": "deep"},
       {"category": "18 avril 2026", "title": "Désinformation : pour une mobilisation de toute la société", "excerpt": "L'ACCI propose des pistes concrètes pour endiguer la propagation des fausses nouvelles.", "icon": "fact", "color": "orange"},
       {"category": "29 mars 2026", "title": "Protection des mineurs : il y a urgence à agir", "excerpt": "L'association alerte sur l'exposition croissante des enfants aux risques numériques.", "icon": "child", "color": "green"},
       {"category": "10 mars 2026", "title": "L'ACCI salue les initiatives pour un numérique plus sûr", "excerpt": "Retour sur les avancées et les chantiers qui restent à mener.", "icon": "check", "color": "green"},
       {"category": "22 février 2026", "title": "Sextorsion : sortir du silence et protéger les victimes", "excerpt": "L'ACCI rappelle l'importance de ne pas céder au chantage et de demander de l'aide.", "icon": "lock", "color": "deep"},
       {"category": "05 février 2026", "title": "Lancement officiel des activités 2026 de l'ACCI", "excerpt": "L'association présente sa feuille de route pour l'année.", "icon": "flag", "color": "orange"},
     ]},

    {"type": "callout", "variant": "info", "title": "Vous êtes journaliste ?",
     "text": ["Retrouvez nos ressources et nos contacts presse dans l'espace dédié aux médias."]},

    {"type": "cta", "title": "Suivez nos prises de position",
     "buttons": [{"label": "Espace presse", "href": "espace-presse", "style": "btn--light", "arrow": True}]},
  ],
},

# 43 — GALERIE --------------------------------------------------------------
{
  "slug": "galerie",
  "title": "Galerie photos",
  "section": SEC,
  "description": "Retour en images sur les événements, campagnes et actions de terrain de l'ACCI.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Retour en images",
     "title": "Galerie photos",
     "subtitle": "Nos actions de terrain, nos rencontres et nos campagnes en images."},

    {"type": "gallery", "columns": 3, "title": "Nos moments forts",
     "lead": "Un aperçu de la vie de l'association et de ses actions de sensibilisation.",
     "items": [
       {"image": "hero-creators.jpg", "alt": "Atelier de tournage", "caption": "Atelier de création de contenu"},
       {"image": "formation.jpg", "alt": "Formation au numérique", "caption": "Formation à la création responsable"},
       {"image": "communaute.jpg", "alt": "Communauté de créateurs", "caption": "Rencontre de la communauté ACCI"},
       {"image": "protection-enfants.jpg", "alt": "Parentalité numérique", "caption": "Sensibilisation des familles"},
       {"image": "ecoute.jpg", "alt": "Cellule d'écoute", "caption": "Accompagnement des victimes"},
       {"image": "solidarite.jpg", "alt": "Mobilisation citoyenne", "caption": "Mobilisation et solidarité"},
     ]},

    {"type": "cards", "columns": 3, "title": "Nos albums",
     "items": [
       {"icon": "camera", "title": "Forum du créateur responsable", "text": "Les temps forts de notre rendez-vous annuel."},
       {"icon": "graduation", "title": "Ateliers & formations", "text": "Nos interventions auprès des jeunes et des créateurs."},
       {"icon": "megaphone", "title": "Campagnes de rue", "text": "La sensibilisation sur le terrain, au plus près du public."},
       {"icon": "child", "title": "Tournée des écoles", "text": "L'éducation aux médias dans les établissements."},
       {"icon": "handshake", "title": "Rencontres partenaires", "text": "Les moments de collaboration avec nos alliés."},
       {"icon": "users", "title": "Vie de la communauté", "text": "Les cafés des créateurs et rencontres de membres."},
     ]},

    {"type": "callout", "variant": "info", "title": "Médias et partenaires",
     "text": ["Vous souhaitez utiliser nos photos ou obtenir des visuels en haute définition ? Contactez notre service communication."]},

    {"type": "cta", "title": "Vivez nos prochains événements",
     "buttons": [{"label": "Voir l'agenda", "href": "evenements", "style": "btn--light", "arrow": True}]},
  ],
},

# 44 — VIDÉOS ---------------------------------------------------------------
{
  "slug": "videos",
  "title": "Vidéothèque",
  "section": SEC,
  "description": "Les vidéos et capsules pédagogiques de l'ACCI sur le numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "À regarder",
     "title": "Vidéothèque",
     "subtitle": "Nos capsules pédagogiques et vidéos de sensibilisation, à regarder et à partager."},

    {"type": "cards", "columns": 3, "title": "Nos capsules",
     "items": [
       {"icon": "play", "title": "Repérer une fausse info", "text": "3 minutes pour apprendre à déjouer la désinformation."},
       {"icon": "play", "title": "Réagir au cyberharcèlement", "text": "Les bons réflexes en cas d'attaque en ligne."},
       {"icon": "play", "title": "Protéger ses enfants en ligne", "text": "Les conseils essentiels pour les parents."},
       {"icon": "play", "title": "Déjouer les arnaques", "text": "Reconnaître les pièges les plus courants."},
       {"icon": "play", "title": "Sécuriser ses comptes", "text": "Le tutoriel sécurité en quelques minutes."},
       {"icon": "play", "title": "Créer responsable", "text": "Témoignages de créateurs engagés."},
     ]},

    {"type": "callout", "variant": "success", "title": "À partager sans modération",
     "text": ["Nos vidéos sont faites pour circuler. Partagez-les avec vos proches, vos élèves et vos communautés pour démultiplier leur impact."]},

    {"type": "cta", "title": "Plus de ressources pédagogiques",
     "buttons": [{"label": "Voir les ressources", "href": "ressources", "style": "btn--light", "arrow": True}]},
  ],
},

]
