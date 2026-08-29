# -*- coding: utf-8 -*-
"""Pages 21 à 28 — Chartes, guides et bonnes pratiques."""

SEC = "Chartes & guides"

PAGES = [

# 21 — CHARTE ---------------------------------------------------------------
{
  "slug": "charte",
  "title": "Charte du créateur responsable",
  "section": SEC,
  "description": "La charte d’engagement de l’ACCI : les principes que s’engagent à respecter les créateurs de contenu ivoiriens responsables.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "kicker": "Notre engagement commun",
     "title": "La Charte du **créateur responsable**",
     "subtitle": "Dix engagements clairs pour inscrire la création de contenu ivoirienne dans une exigence d’éthique, de qualité et de respect.",
     "cta": [{"label": "Signer la charte", "href": "adhesion", "style": "btn--primary", "arrow": True}]},

    {"type": "section", "title": "Pourquoi une charte ?",
     "lead": "Parce que l’influence engage une responsabilité et que la confiance du public est précieuse.",
     "body": [
       "La charte de l’ACCI est un engagement volontaire. En la signant, le créateur affirme publiquement sa volonté de produire un contenu responsable et de contribuer à un espace numérique plus sain.",
       "Elle constitue un repère commun : un ensemble de principes partagés qui élèvent la profession tout entière.",
     ]},

    {"type": "accordion", "title": "Les 10 engagements du créateur responsable",
     "items": [
       {"q": "1. Je vérifie avant de publier", "a": ["Je m’assure de la fiabilité d’une information avant de la diffuser et je rectifie mes erreurs."]},
       {"q": "2. Je respecte la dignité des personnes", "a": ["Je m’exprime sans harcèlement, sans insulte ni diffamation. Je débats des idées, jamais des personnes."]},
       {"q": "3. Je contribue à la cohésion sociale", "a": ["Je m’abstiens de relayer des propos tribaux, religieux ou discriminatoires et je promeus le vivre-ensemble."]},
       {"q": "4. Je protège les mineurs", "a": ["Je veille à ce que mon contenu soit adapté et je protège l’image et l’intimité des enfants."]},
       {"q": "5. Je respecte la vie privée", "a": ["Je ne diffuse des informations ou des images d’autrui qu’avec leur consentement."]},
       {"q": "6. Je crée avec discernement", "a": ["Je privilégie la créativité au sensationnalisme et j’avertis avant un contenu sensible."]},
       {"q": "7. Je respecte le droit d’auteur", "a": ["Je crédite mes sources et j’obtiens les autorisations nécessaires."]},
       {"q": "8. Je suis transparent(e)", "a": ["J’indique clairement mes contenus sponsorisés et mes partenariats commerciaux."]},
       {"q": "9. Je protège mon public des arnaques", "a": ["Je m’abstiens de promouvoir toute offre frauduleuse et j’informe mon public des risques."]},
       {"q": "10. Je donne l’exemple", "a": ["Je me comporte en ligne comme je souhaiterais que les autres se comportent."]},
     ]},

    {"type": "callout", "variant": "success", "title": "Une signature, un symbole",
     "text": ["Les créateurs signataires reçoivent le badge « Créateur responsable ACCI » et rejoignent une communauté engagée concrètement en faveur d’un numérique plus responsable."]},

    {"type": "cta", "title": "Prêt(e) à vous engager ?",
     "text": "Rejoignez les créateurs qui font le choix de la responsabilité.",
     "buttons": [
       {"label": "Signer & adhérer", "href": "adhesion", "style": "btn--light", "arrow": True},
       {"label": "Lire le code de déontologie", "href": "deontologie", "style": "btn--outline-light"},
     ]},
  ],
},

# 22 — BONNES PRATIQUES -----------------------------------------------------
{
  "slug": "bonnes-pratiques",
  "title": "Bonnes pratiques sur les réseaux sociaux",
  "section": SEC,
  "description": "Les bonnes pratiques pour créer et partager du contenu de façon responsable sur les réseaux sociaux.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Guide pratique",
     "title": "Les bonnes pratiques sur les réseaux sociaux",
     "subtitle": "Des réflexes simples, pour les créateurs comme pour le grand public, afin de profiter du meilleur des réseaux."},

    {"type": "cards", "columns": 2, "title": "Avant, pendant et après la publication",
     "items": [
       {"icon": "fact", "title": "Vérifier l’information", "text": "Toujours s’assurer de la fiabilité d’un contenu avant de le partager."},
       {"icon": "heart", "title": "Rester respectueux", "text": "Garder le ton du dialogue, même dans le désaccord, et s’exprimer sans insulte ni mépris."},
       {"icon": "lock", "title": "Protéger sa sécurité", "text": "Sécuriser ses comptes et préserver sa vie privée et celle des autres."},
       {"icon": "scale", "title": "Assumer ses propos", "text": "Ne rien publier qu’on ne pourrait assumer publiquement et durablement."},
       {"icon": "users", "title": "Soutenir la communauté", "text": "Encourager les autres créateurs et valoriser leur travail."},
       {"icon": "lightbulb", "title": "Apporter de la valeur", "text": "Privilégier un contenu utile, créatif et soigné plutôt que la recherche du buzz."},
     ]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Les réflexes du bon usage",
     "items": [
       "Je réfléchis avant de publier ou de commenter",
       "Je vérifie mes sources",
       "Je respecte le droit à l’image",
       "Je signale les contenus problématiques",
       "Je protège mes mots de passe",
       "Je fais des pauses sans écran",
       "Je crédite les auteurs des contenus que je partage",
       "Je reconnais et corrige mes erreurs",
    ]},

    {"type": "split", "icon": "compass", "reverse": True,
     "kicker": "Pour aller plus loin", "title": "Des ressources pour chaque besoin",
     "text": [
       "Que vous débutiez ou que vous soyez un créateur confirmé, l’ACCI met à votre disposition des guides détaillés.",
       "Apprenez à vérifier l’information, à sécuriser vos comptes, à monétiser sainement votre activité et à respecter le droit d’auteur.",
     ],
     "bullets": [
       "Guide du créateur débutant",
       "Guide de vérification de l’information",
       "Guide de sécurité numérique",
       "Guide de la monétisation éthique",
     ],
     "cta": {"label": "Voir toutes les ressources", "href": "ressources"}},

    {"type": "cta", "title": "Adoptez les bons réflexes",
     "buttons": [{"label": "Signer la charte", "href": "charte", "style": "btn--light", "arrow": True}]},
  ],
},

# 23 — DÉONTOLOGIE ----------------------------------------------------------
{
  "slug": "deontologie",
  "title": "Code de déontologie",
  "section": SEC,
  "description": "Le code de déontologie des créateurs de contenu : les règles professionnelles promues par l’ACCI.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Éthique professionnelle",
     "title": "Code de déontologie",
     "subtitle": "Au-delà de la charte, des règles professionnelles pour faire de la création de contenu un métier exercé avec rigueur."},

    {"type": "section", "title": "Vers une profession structurée",
     "lead": "La création de contenu est devenue une activité économique à part entière, qui appelle des standards.",
     "body": [
       "Le code de déontologie de l’ACCI fixe des repères professionnels pour les créateurs, à l’image de ceux qui existent dans le journalisme, la publicité ou la communication.",
       "Il vise à protéger le public, à garantir la transparence des pratiques commerciales et à renforcer la crédibilité de toute la profession.",
     ]},

    {"type": "accordion", "title": "Principes déontologiques",
     "items": [
       {"q": "Honnêteté et exactitude", "a": ["Le créateur s’efforce de transmettre des informations exactes et de corriger sans délai toute erreur avérée."]},
       {"q": "Transparence commerciale", "a": ["Tout contenu sponsorisé, partenariat ou placement de produit doit être clairement signalé au public."]},
       {"q": "Indépendance éditoriale", "a": ["Le créateur conserve la maîtrise de sa ligne éditoriale et ne relaie pas de propos contraires à l’intérêt de son public."]},
       {"q": "Respect des personnes", "a": ["Le créateur respecte la dignité, la vie privée et le droit à l’image des personnes."]},
       {"q": "Protection des publics fragiles", "a": ["Une attention particulière est portée aux mineurs et aux personnes vulnérables."]},
       {"q": "Loyauté envers le public", "a": ["Le créateur informe loyalement son audience et s’abstient de promouvoir des offres frauduleuses ou nocives."]},
       {"q": "Respect de la propriété intellectuelle", "a": ["Le créateur respecte le travail d’autrui, cite ses sources et obtient les droits nécessaires."]},
     ]},

    {"type": "callout", "variant": "info", "title": "Un cadre évolutif",
     "text": ["Le code de déontologie est appelé à évoluer avec les usages et les technologies, en concertation avec la communauté des créateurs et les parties prenantes."]},

    {"type": "cta", "title": "Faites de l’éthique votre signature",
     "buttons": [{"label": "Adhérer à l’ACCI", "href": "adhesion", "style": "btn--light", "arrow": True}]},
  ],
},

# 24 — GUIDE DÉBUTANT -------------------------------------------------------
{
  "slug": "guide-debutant",
  "title": "Guide du créateur débutant",
  "section": SEC,
  "description": "Bien démarrer comme créateur de contenu en Côte d’Ivoire : conseils pratiques pour des débuts sains et durables.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Bien démarrer",
     "title": "Le guide du créateur débutant",
     "subtitle": "Vous vous lancez dans la création de contenu ? Voici les fondations pour construire une présence durable et responsable."},

    {"type": "steps", "title": "Vos premiers pas",
     "items": [
       {"title": "Définir sa raison d’être", "text": "Quel message, quelle valeur, quel public ? Un créateur qui sait pourquoi il crée tient sur la durée."},
       {"title": "Choisir ses thématiques", "text": "Il est préférable d’approfondir un domaine qui vous passionne plutôt que de se disperser."},
       {"title": "Soigner la qualité", "text": "Un bon son, une lumière correcte et un message clair valent mieux qu’un matériel coûteux mal utilisé."},
       {"title": "Être régulier", "text": "La constance prime sur la quantité : un contenu abouti par semaine vaut mieux que dix approximatifs."},
       {"title": "Construire une communauté", "text": "Répondre, échanger, remercier : l’engagement compte davantage que les chiffres bruts."},
       {"title": "Rester soi-même et éthique", "text": "L’authenticité et le respect de la charte sont vos meilleurs atouts à long terme."},
     ]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Les écueils à connaître dès le départ",
     "items": [
       "Courir après le buzz au détriment de la qualité",
       "Acheter de faux abonnés ou de faux likes",
       "Copier sans créditer les autres créateurs",
       "Négliger la sécurité de ses comptes",
       "Ignorer le droit d’auteur sur les musiques et images",
       "Se laisser atteindre par les commentaires négatifs",
    ]},

    {"type": "split", "icon": "graduation", "reverse": True,
     "kicker": "Vous accompagner", "title": "Ne restez pas seul(e) dans l’aventure",
     "text": [
       "L’ACCI propose des formations, du mentorat et une communauté d’entraide pour accompagner les créateurs émergents.",
       "Rejoignez-nous pour apprendre, échanger et grandir dans un cadre bienveillant et professionnel.",
     ],
     "cta": {"label": "Découvrir nos formations", "href": "formations"}},

    {"type": "cta", "title": "Lancez-vous du bon pied",
     "buttons": [{"label": "Rejoindre l’ACCI", "href": "adhesion", "style": "btn--light", "arrow": True}]},
  ],
},

# 25 — MONÉTISATION ÉTHIQUE -------------------------------------------------
{
  "slug": "monetisation-ethique",
  "title": "Monétisation éthique",
  "section": SEC,
  "description": "Gagner sa vie comme créateur de contenu de façon éthique et transparente : conseils et bonnes pratiques.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Vivre de sa passion",
     "title": "La monétisation éthique",
     "subtitle": "Vivre de sa créativité tout en préservant la confiance de son public et son intégrité professionnelle."},

    {"type": "section", "title": "Monétiser en toute transparence",
     "lead": "La création de contenu peut devenir un métier rémunérateur, à condition de l’exercer avec honnêteté.",
     "body": [
       "Publicité, partenariats, vente de produits ou de services, dons de la communauté, contenus exclusifs : les sources de revenus sont multiples et légitimes.",
       "Le risque éthique apparaît lorsque la rémunération prend le pas sur la loyauté envers le public : promotion de produits non vérifiés, partenariats non déclarés, recommandations de complaisance.",
     ]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Les règles d’une monétisation saine",
     "items": [
       "Signaler clairement les contenus sponsorisés",
       "Ne promouvoir que ce en quoi on croit",
       "Écarter les offres frauduleuses ou risquées",
       "Tester réellement avant de recommander",
       "Rester transparent sur ses partenariats",
       "Distinguer publicité et avis personnel",
    ]},

    {"type": "callout", "variant": "warning", "title": "Vigilance face aux fausses opportunités",
     "text": ["Il est recommandé de rester vigilant face aux « marques » qui proposent des partenariats irréalistes, réclament un paiement préalable ou incitent à promouvoir des offres frauduleuses. La crédibilité est le premier capital d’un créateur."]},

    {"type": "split", "icon": "money", "reverse": True,
     "kicker": "Le bon calcul", "title": "La confiance est votre meilleur capital",
     "text": [
       "Un public qui vous fait confiance vaut bien plus qu’un gain rapide obtenu au prix de votre crédibilité.",
       "Les créateurs qui durent sont ceux qui protègent leur relation avec leur communauté. L’éthique est aussi une stratégie gagnante.",
     ]},

    {"type": "cta", "title": "Construisez une activité durable",
     "buttons": [{"label": "Lire le code de déontologie", "href": "deontologie", "style": "btn--light", "arrow": True}]},
  ],
},

# 26 — DROITS D’AUTEUR ------------------------------------------------------
{
  "slug": "droits-auteur",
  "title": "Droits d’auteur & propriété intellectuelle",
  "section": SEC,
  "description": "Comprendre et respecter le droit d’auteur quand on crée du contenu : musique, images, vidéos et citations.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Respecter la création",
     "title": "Droits d’auteur & propriété intellectuelle",
     "subtitle": "Respecter le travail des autres, c’est aussi protéger le sien. Un repère essentiel pour tout créateur."},

    {"type": "section", "title": "Le b.a.-ba du droit d’auteur",
     "lead": "Toute œuvre originale est protégée : musique, photo, vidéo, texte, illustration, logo.",
     "body": [
       "Utiliser l’œuvre d’autrui sans autorisation peut entraîner le retrait de votre contenu, la perte de revenus, voire des poursuites. Cela vaut pour les musiques, les extraits de films, les photos et les créations graphiques.",
       "À l’inverse, vos propres créations sont protégées : vous pouvez vous opposer à leur utilisation non autorisée.",
     ]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Créer en respectant les droits",
     "items": [
       "Utiliser des musiques et images libres de droits",
       "Demander l’autorisation des auteurs",
       "Créditer systématiquement vos sources",
       "Privilégier vos propres créations originales",
       "Vérifier les licences avant toute utilisation",
       "Respecter les conditions des plateformes",
    ]},

    {"type": "callout", "variant": "info", "title": "Le « partage » n’est pas une autorisation",
     "text": ["Qu’un contenu soit disponible en ligne ne signifie pas qu’il est libre d’utilisation. En cas de doute, il est recommandé de solliciter l’autorisation ou de renoncer à cette utilisation."]},

    {"type": "cta", "title": "Protégez et respectez la création",
     "buttons": [{"label": "Accompagnement juridique", "href": "accompagnement-juridique", "style": "btn--light", "arrow": True}]},
  ],
},

# 27 — VÉRIFICATION DE L’INFORMATION ----------------------------------------
{
  "slug": "verification-information",
  "title": "Vérifier l’information",
  "section": SEC,
  "description": "Méthodes et outils pour vérifier une information et contribuer à réduire la circulation des fausses nouvelles (fact-checking).",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Esprit critique",
     "title": "Vérifier l’information",
     "subtitle": "Le fact-checking n’est pas réservé aux journalistes : quelques réflexes suffisent à distinguer une information fiable d’une rumeur."},

    {"type": "steps", "title": "La méthode en 5 étapes",
     "items": [
       {"title": "Identifier la source", "text": "Remonter à l’origine de l’information. Qui l’a publiée en premier, et avec quelle crédibilité ?"},
       {"title": "Évaluer l’auteur", "text": "Compte officiel, média reconnu, expert… ou compte anonyme récent et sans historique ?"},
       {"title": "Recouper", "text": "Une information vraie est généralement confirmée par plusieurs sources indépendantes."},
       {"title": "Vérifier les médias", "text": "Une recherche d’image inversée révèle si une photo est ancienne, détournée ou générée."},
       {"title": "Garder son sang-froid", "text": "Les fausses nouvelles jouent sur l’émotion : plus un contenu suscite une réaction vive, plus il mérite vérification."},
     ]},

    {"type": "cards", "columns": 3, "title": "Vos outils de vérification",
     "items": [
       {"icon": "search", "title": "Recherche inversée", "text": "Pour savoir d’où vient réellement une image et depuis quand elle circule."},
       {"icon": "globe", "title": "Sites de fact-checking", "text": "Des plateformes spécialisées vérifient et documentent les rumeurs les plus répandues."},
       {"icon": "book", "title": "Sources primaires", "text": "Remonter aux communiqués officiels, études et déclarations originales."},
       {"icon": "calendar", "title": "Vérifier la date", "text": "Une vieille information ressortie hors contexte est une forme de désinformation."},
       {"icon": "users", "title": "Demander de l’aide", "text": "Dans le doute, solliciter une personne ou une source compétente."},
       {"icon": "fact", "title": "Le bon sens", "text": "Une affirmation extraordinaire exige des preuves extraordinaires."},
     ]},

    {"type": "callout", "variant": "success", "title": "Un réflexe simple et rapide",
     "text": ["Une vérification ne demande souvent que quelques minutes. C’est un investissement utile face à la manipulation et un service rendu à sa communauté."]},

    {"type": "cta", "title": "Mieux comprendre la désinformation",
     "buttons": [{"label": "En savoir plus sur la désinformation", "href": "desinformation", "style": "btn--light", "arrow": True}]},
  ],
},

# 28 — SÉCURITÉ NUMÉRIQUE ---------------------------------------------------
{
  "slug": "securite-numerique",
  "title": "Sécurité numérique",
  "section": SEC,
  "description": "Protéger ses comptes et son identité numérique : mots de passe, double authentification et bons réflexes de cybersécurité.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Cybersécurité",
     "title": "Sécurité numérique",
     "subtitle": "Vos comptes sont votre vitrine et parfois votre gagne-pain. Les protéger est la première des responsabilités."},

    {"type": "section", "title": "Pourquoi sécuriser ses comptes",
     "lead": "Un compte compromis, c’est une réputation exposée, des proches sollicités par des escrocs et un travail parfois perdu.",
     "body": [
       "Les créateurs sont des cibles privilégiées : leur audience attire des acteurs malveillants qui usurpent leur identité pour diffuser des offres frauduleuses.",
       "La bonne nouvelle : quelques gestes simples suffisent à élever considérablement votre niveau de protection.",
     ]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Les réflexes de sécurité essentiels",
     "items": [
       "Utiliser des mots de passe longs et uniques",
       "Activer la double authentification (2FA)",
       "Se méfier des liens et pièces jointes suspects",
       "Ne jamais communiquer ses codes de connexion",
       "Vérifier les appareils connectés à ses comptes",
       "Mettre à jour ses applications régulièrement",
       "Utiliser un gestionnaire de mots de passe",
       "Sauvegarder ses contenus importants",
    ]},

    {"type": "steps", "title": "Que faire en cas de piratage ?",
     "items": [
       {"title": "Réagir vite", "text": "Reprenez la main sur le compte et changez immédiatement vos mots de passe."},
       {"title": "Prévenir la plateforme", "text": "Utilisez les procédures de récupération de compte compromis."},
       {"title": "Alerter votre communauté", "text": "Informez vos abonnés afin qu’ils ne répondent pas aux messages frauduleux envoyés en votre nom."},
       {"title": "Renforcer la sécurité", "text": "Activez la double authentification et vérifiez les accès une fois le compte récupéré."},
     ]},

    {"type": "callout", "variant": "warning", "title": "La double authentification, votre meilleur allié",
     "text": ["Même si un tiers obtient votre mot de passe, la double authentification l’empêche d’accéder à votre compte. Il est recommandé de l’activer partout où elle est disponible."]},

    {"type": "cta", "title": "Sécurisez vos comptes dès aujourd’hui",
     "buttons": [{"label": "Protéger ma vie privée", "href": "vie-privee", "style": "btn--light", "arrow": True}]},
  ],
},

]
