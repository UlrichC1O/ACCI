# -*- coding: utf-8 -*-
"""Pages 29 à 38 — Services & ressources."""

SEC = "Services"

PAGES = [

# 29 — SERVICES -------------------------------------------------------------
{
  "slug": "services",
  "title": "Nos services",
  "section": SEC,
  "description": "Les services de l'ACCI : adhésion, formation, accompagnement juridique, cellule d'écoute, signalement et ressources.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "kicker": "Ce que nous offrons",
     "title": "Des services concrets pour **agir et protéger**",
     "subtitle": "Au-delà de la sensibilisation, l'ACCI met à disposition un ensemble de services pour accompagner les créateurs et protéger le public.",
     "cta": [{"label": "Devenir membre", "href": "adhesion", "style": "btn--primary", "arrow": True}]},

    {"type": "cards", "columns": 3, "title": "Nos principaux services",
     "items": [
       {"icon": "users", "title": "Adhésion", "text": "Rejoindre une communauté de créateurs engagés et bénéficier de ses avantages.", "href": "adhesion", "tag": "Membres"},
       {"icon": "graduation", "title": "Formations", "text": "Ateliers et programmes pour se professionnaliser et créer responsable.", "href": "formations", "tag": "Apprendre"},
       {"icon": "scale", "title": "Accompagnement juridique", "text": "Information et orientation en cas de litige ou d'atteinte aux droits.", "href": "accompagnement-juridique", "tag": "Protéger"},
       {"icon": "alert", "title": "Signaler un abus", "text": "Un point de contact pour dénoncer les contenus nuisibles.", "href": "signaler-abus", "tag": "Agir"},
       {"icon": "heart", "title": "Cellule d'écoute", "text": "Un soutien confidentiel pour les victimes de dérives numériques.", "href": "cellule-ecoute", "tag": "Soutenir"},
       {"icon": "download", "title": "Ressources", "text": "Guides, kits et supports à télécharger librement.", "href": "ressources", "tag": "Outils"},
       {"icon": "megaphone", "title": "Campagnes", "text": "Des actions de sensibilisation auxquelles vous pouvez contribuer.", "href": "campagnes", "tag": "Mobiliser"},
       {"icon": "globe", "title": "Espace presse", "text": "Ressources et contacts pour les médias et journalistes.", "href": "espace-presse", "tag": "Médias"},
       {"icon": "handshake", "title": "Partenariats", "text": "Collaborer avec l'ACCI sur des projets d'intérêt commun.", "href": "partenaires", "tag": "Ensemble"},
     ]},

    {"type": "split", "icon": "shield", "reverse": True,
     "kicker": "Un accompagnement de bout en bout", "title": "De la prévention à la réparation",
     "text": [
       "Nos services couvrent l'ensemble du parcours : prévenir par la formation, agir par le signalement, soutenir par l'écoute et défendre par l'accompagnement juridique.",
       "Que vous soyez créateur, parent, victime ou simple internaute, l'ACCI a une réponse adaptée à votre situation.",
     ],
     "cta": {"label": "Nous contacter", "href": "contact"}},

    {"type": "cta", "title": "Une question sur nos services ?",
     "buttons": [{"label": "Contactez-nous", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 30 — ADHÉSION -------------------------------------------------------------
{
  "slug": "adhesion",
  "title": "Adhésion",
  "section": SEC,
  "description": "Devenir membre de l'ACCI : avantages, conditions et démarche pour rejoindre la communauté des créateurs responsables.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "kicker": "Rejoignez-nous",
     "title": "Devenez **membre de l'ACCI**",
     "subtitle": "Rejoignez une communauté de créateurs qui agissent pour un numérique plus sain et bénéficiez d'un accompagnement dédié.",
     "cta": [{"label": "Compléter le formulaire", "href": "contact", "style": "btn--primary", "arrow": True}],
     "badges": [
       {"icon": "doc", "label": "Badge Créateur responsable"},
       {"icon": "graduation", "label": "Accès aux formations"},
       {"icon": "users", "label": "Réseau d'entraide"},
     ]},

    {"type": "cards", "columns": 3, "title": "Les avantages d'être membre",
     "items": [
       {"icon": "doc", "title": "Le badge ACCI", "text": "Affichez votre engagement avec le badge « Créateur responsable »."},
       {"icon": "graduation", "title": "Formations & ateliers", "text": "Accédez en priorité à nos programmes de professionnalisation."},
       {"icon": "scale", "title": "Appui juridique", "text": "Bénéficiez d'informations et d'une orientation en cas de litige."},
       {"icon": "users", "title": "Communauté", "text": "Échangez, collaborez et grandissez au sein d'un réseau solidaire."},
       {"icon": "megaphone", "title": "Visibilité", "text": "Participez à nos campagnes et événements et gagnez en notoriété."},
       {"icon": "heart", "title": "Soutien", "text": "Profitez de l'accompagnement de la cellule d'écoute."},
     ]},

    {"type": "table", "title": "Catégories de membres",
     "headers": ["Catégorie", "Pour qui", "Engagement"],
     "rows": [
       ["Membre adhérent", "Tout créateur ou internaute soutenant la cause", "Signer la charte"],
       ["Membre actif", "Créateurs souhaitant s'impliquer dans les pôles", "Charte + participation"],
       ["Membre bienfaiteur", "Personnes et entreprises soutenant financièrement", "Don de soutien"],
       ["Membre d'honneur", "Personnalités distinguées par l'association", "Sur désignation"],
     ]},

    {"type": "steps", "title": "Comment adhérer",
     "items": [
       {"title": "Prendre connaissance de la charte", "text": "Lisez et approuvez la Charte du créateur responsable."},
       {"title": "Remplir le formulaire", "text": "Communiquez vos informations via notre formulaire de contact."},
       {"title": "Valider votre adhésion", "text": "Notre équipe revient vers vous pour finaliser votre inscription."},
       {"title": "Rejoindre la communauté", "text": "Recevez votre badge et accédez aux avantages réservés aux membres."},
     ]},

    {"type": "cta", "title": "Prêt(e) à nous rejoindre ?",
     "text": "Quelques minutes suffisent pour faire un grand pas.",
     "buttons": [
       {"label": "Lire la charte", "href": "charte", "style": "btn--light", "arrow": True},
       {"label": "Nous contacter", "href": "contact", "style": "btn--outline-light"},
     ]},
  ],
},

# 31 — FORMATIONS -----------------------------------------------------------
{
  "slug": "formations",
  "title": "Formations",
  "section": SEC,
  "description": "Les formations de l'ACCI pour créateurs et grand public : esprit critique, sécurité numérique, création responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Se former",
     "title": "Nos formations",
     "subtitle": "Parce que la responsabilité s'apprend, l'ACCI développe des programmes pour les créateurs, les jeunes et le grand public."},

    {"type": "cards", "columns": 3, "title": "Nos programmes",
     "items": [
       {"icon": "fact", "title": "Esprit critique & info", "text": "Apprendre à vérifier l'information et à déjouer la désinformation."},
       {"icon": "lock", "title": "Sécurité numérique", "text": "Protéger ses comptes, ses données et son identité en ligne."},
       {"icon": "doc", "title": "Création responsable", "text": "Produire un contenu de qualité, éthique et respectueux."},
       {"icon": "money", "title": "Monétisation saine", "text": "Développer une activité durable et transparente."},
       {"icon": "child", "title": "Parentalité numérique", "text": "Accompagner les enfants dans leurs usages numériques."},
       {"icon": "scale", "title": "Droits & devoirs", "text": "Comprendre le cadre légal de la création de contenu."},
     ]},

    {"type": "split", "image": "formation.jpg", "reverse": True,
     "alt": "Atelier de formation au numérique animé par l'ACCI",
     "kicker": "Des formats adaptés", "title": "En présentiel, en ligne et sur mesure",
     "text": [
       "Nos formations s'adaptent à tous les publics : ateliers pratiques, webinaires, interventions en milieu scolaire et programmes sur mesure pour les organisations.",
       "Animées par des professionnels et des créateurs expérimentés, elles allient théorie et mise en pratique.",
     ],
     "bullets": [
       "Ateliers pratiques en présentiel",
       "Webinaires et formations en ligne",
       "Interventions dans les écoles et universités",
       "Programmes sur mesure pour entreprises et institutions",
     ],
     "cta": {"label": "Demander une formation", "href": "contact"}},

    {"type": "callout", "variant": "info", "title": "Vous représentez une école ou une organisation ?",
     "text": ["L'ACCI conçoit des programmes adaptés à vos besoins. Contactez-nous pour construire ensemble une intervention sur la création responsable ou la sécurité numérique."]},

    {"type": "cta", "title": "Investissez dans vos compétences",
     "buttons": [{"label": "Nous contacter", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 32 — ACCOMPAGNEMENT JURIDIQUE ---------------------------------------------
{
  "slug": "accompagnement-juridique",
  "title": "Accompagnement juridique",
  "section": SEC,
  "description": "L'accompagnement juridique de l'ACCI : information, orientation et soutien en cas d'atteinte aux droits en ligne.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Connaître ses droits",
     "title": "Accompagnement juridique",
     "subtitle": "Face à une atteinte en ligne, vous avez des droits. Nous vous aidons à les comprendre et à les faire valoir."},

    {"type": "section", "title": "Une orientation accessible",
     "lead": "L'ACCI informe et oriente les créateurs et les victimes sur les démarches possibles.",
     "body": [
       "Diffamation, harcèlement, usurpation d'identité, atteinte à la vie privée, litige de droit d'auteur, arnaque : nous vous aidons à y voir clair et à identifier les recours adaptés.",
       "Notre rôle est d'informer, d'orienter et, si nécessaire, de vous mettre en relation avec les professionnels et les autorités compétentes.",
     ]},

    {"type": "cards", "columns": 3, "title": "Nous pouvons vous aider sur",
     "items": [
       {"icon": "scale", "title": "Diffamation & injure", "text": "Comprendre vos recours face aux atteintes à votre réputation."},
       {"icon": "shield", "title": "Harcèlement en ligne", "text": "Les démarches pour faire cesser et sanctionner le harcèlement."},
       {"icon": "key", "title": "Vie privée", "text": "Faire retirer des contenus portant atteinte à votre intimité."},
       {"icon": "copyright", "title": "Droit d'auteur", "text": "Défendre vos créations ou régulariser vos usages."},
       {"icon": "money", "title": "Arnaques", "text": "Réagir et signaler en cas d'escroquerie en ligne."},
       {"icon": "lock", "title": "Sextorsion", "text": "Un accompagnement spécifique et confidentiel."},
     ]},

    {"type": "callout", "variant": "warning", "title": "Information, pas substitution",
     "text": ["L'ACCI fournit une information générale et une orientation. Elle ne se substitue pas à un avocat ni aux autorités, mais vous aide à les solliciter au mieux."]},

    {"type": "cta", "title": "Besoin d'être orienté(e) ?",
     "buttons": [{"label": "Nous contacter", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 33 — SIGNALER UN ABUS -----------------------------------------------------
{
  "slug": "signaler-abus",
  "title": "Signaler un abus",
  "section": SEC,
  "description": "Signaler un contenu ou un comportement abusif sur les réseaux sociaux : la démarche pas à pas avec l'ACCI.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Agir",
     "title": "Signaler un abus",
     "subtitle": "Un contenu vous choque, vous blesse ou met quelqu'un en danger ? Le signalement est un geste citoyen qui protège les autres."},

    {"type": "section", "title": "Pourquoi signaler ?",
     "lead": "Signaler, c'est refuser l'impunité et empêcher la diffusion de contenus nuisibles.",
     "body": [
       "Chaque signalement compte. Il alerte les plateformes, documente les abus et peut éviter de nouvelles victimes.",
       "L'ACCI recueille les signalements, oriente vers les bons interlocuteurs et, lorsque c'est pertinent, relaie les situations les plus graves auprès des partenaires compétents.",
     ]},

    {"type": "steps", "title": "Comment signaler efficacement",
     "items": [
       {"title": "Conserver les preuves", "text": "Réalisez des captures d'écran datées du contenu incriminé avant qu'il ne disparaisse."},
       {"title": "Signaler à la plateforme", "text": "Utilisez les outils de signalement intégrés au réseau social concerné."},
       {"title": "Nous alerter", "text": "Transmettez-nous la situation via le formulaire de contact pour être orienté(e)."},
       {"title": "Protéger la victime", "text": "Si une personne est en danger, soutenez-la et orientez-la vers la cellule d'écoute."},
     ]},

    {"type": "cards", "columns": 3, "title": "Que signaler ?",
     "items": [
       {"icon": "shield", "title": "Harcèlement", "text": "Attaques répétées contre une personne."},
       {"icon": "warning", "title": "Discours de haine", "text": "Propos discriminatoires ou incitant à la violence."},
       {"icon": "money", "title": "Arnaques", "text": "Escroqueries et tentatives de fraude."},
       {"icon": "lock", "title": "Contenus intimes", "text": "Images diffusées sans consentement."},
       {"icon": "child", "title": "Mise en danger de mineurs", "text": "Tout contenu impliquant ou menaçant des enfants."},
       {"icon": "fact", "title": "Fausses informations", "text": "Désinformation dangereuse à grande échelle."},
     ]},

    {"type": "callout", "variant": "danger", "title": "Urgence et danger immédiat",
     "text": ["Si une personne est en danger immédiat, contactez sans délai les services d'urgence et les autorités compétentes. Le signalement à l'ACCI ne remplace pas une intervention d'urgence."]},

    {"type": "cta", "title": "Faites un signalement",
     "buttons": [
       {"label": "Nous transmettre un cas", "href": "contact", "style": "btn--light", "arrow": True},
       {"label": "Cellule d'écoute", "href": "cellule-ecoute", "style": "btn--outline-light"},
     ]},
  ],
},

# 34 — CELLULE D'ÉCOUTE -----------------------------------------------------
{
  "slug": "cellule-ecoute",
  "title": "Cellule d'écoute",
  "section": SEC,
  "description": "La cellule d'écoute de l'ACCI : un soutien confidentiel et bienveillant pour les victimes de dérives numériques.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Vous n'êtes pas seul(e)",
     "title": "La cellule d'écoute",
     "subtitle": "Un espace confidentiel, sans jugement, pour les personnes touchées par le harcèlement, la sextorsion ou toute autre violence en ligne."},

    {"type": "section", "title": "Une oreille attentive et un premier secours",
     "lead": "Subir une dérive en ligne est une épreuve. Personne ne devrait la traverser seul.",
     "body": [
       "La cellule d'écoute de l'ACCI accueille les victimes et leurs proches, les écoute avec bienveillance et les oriente vers les ressources adaptées : soutien psychologique, accompagnement juridique, signalement.",
       "La confidentialité et le respect de la personne sont au cœur de notre démarche. Vous n'êtes jamais jugé(e), jamais coupable.",
     ]},

    {"type": "split", "image": "ecoute.jpg",
     "alt": "Accompagnement bienveillant d'une personne par la cellule d'écoute",
     "kicker": "Un espace sûr", "title": "Parler, c'est déjà commencer à se reconstruire",
     "text": [
       "Nos écoutants accueillent votre parole sans jugement et à votre rythme. L'objectif : vous aider à comprendre la situation, à reprendre le contrôle et à identifier les prochaines étapes.",
       "Que vous soyez directement touché(e) ou que vous vous inquiétiez pour un proche, vous pouvez nous solliciter en toute confidentialité.",
     ],
     "cta": {"label": "Nous contacter", "href": "contact"}},

    {"type": "cards", "columns": 3, "title": "Ce que nous offrons",
     "items": [
       {"icon": "heart", "title": "Écoute bienveillante", "text": "Un espace pour parler librement et être entendu(e)."},
       {"icon": "compass", "title": "Orientation", "text": "Vers les professionnels et services adaptés à votre situation."},
       {"icon": "lock", "title": "Confidentialité", "text": "Vos échanges restent strictement confidentiels."},
       {"icon": "scale", "title": "Lien juridique", "text": "Une passerelle vers notre accompagnement juridique."},
       {"icon": "users", "title": "Soutien des proches", "text": "Un appui aussi pour l'entourage des victimes."},
       {"icon": "shield", "title": "Mise en sécurité", "text": "Des conseils pour reprendre le contrôle de vos comptes."},
     ]},

    {"type": "callout", "variant": "success", "title": "Le premier pas, c'est en parler",
     "text": ["Briser le silence est souvent le geste le plus difficile et le plus libérateur. Contactez-nous : nous sommes là pour vous accompagner."]},

    {"type": "cta", "title": "Demandez de l'aide en toute confidentialité",
     "buttons": [{"label": "Contacter la cellule d'écoute", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 35 — ESPACE PRESSE --------------------------------------------------------
{
  "slug": "espace-presse",
  "title": "Espace presse",
  "section": SEC,
  "description": "Espace presse de l'ACCI : communiqués, dossiers, ressources et contacts pour les médias et journalistes.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Médias",
     "title": "Espace presse",
     "subtitle": "Ressources, contacts et éléments d'information à destination des journalistes et des médias."},

    {"type": "section", "title": "L'ACCI au service de l'information",
     "lead": "Nous sommes à la disposition des médias pour éclairer le débat sur le numérique responsable.",
     "body": [
       "Nos porte-parole peuvent intervenir sur les enjeux liés aux réseaux sociaux : désinformation, cyberharcèlement, protection des mineurs, éducation aux médias, création de contenu.",
       "Vous trouverez ici nos communiqués, des éléments de contexte et nos coordonnées presse.",
     ]},

    {"type": "cards", "columns": 3, "title": "Ressources pour les médias",
     "items": [
       {"icon": "bullhorn", "title": "Communiqués", "text": "Nos prises de position officielles.", "href": "communiques"},
       {"icon": "doc", "title": "Dossiers de presse", "text": "Des éléments de contexte sur nos thématiques.", "href": "ressources"},
       {"icon": "camera", "title": "Médiathèque", "text": "Photos et visuels libres pour vos publications.", "href": "galerie"},
       {"icon": "users", "title": "Porte-parole", "text": "Des intervenants disponibles pour vos sujets."},
       {"icon": "calendar", "title": "Agenda", "text": "Nos prochains événements à couvrir.", "href": "evenements"},
       {"icon": "mail", "title": "Contact presse", "text": "Un interlocuteur dédié pour vos demandes.", "href": "contact"},
     ]},

    {"type": "callout", "variant": "info", "title": "Demande d'interview ou d'information",
     "text": ["Journalistes, pour toute sollicitation (interview, intervention, données), contactez notre service communication via la page contact. Nous nous efforçons de répondre rapidement."]},

    {"type": "cta", "title": "Une demande presse ?",
     "buttons": [{"label": "Contacter le service presse", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 36 — RESSOURCES -----------------------------------------------------------
{
  "slug": "ressources",
  "title": "Ressources & téléchargements",
  "section": SEC,
  "description": "Guides, kits et supports à télécharger gratuitement pour un usage responsable des réseaux sociaux.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Boîte à outils",
     "title": "Ressources & téléchargements",
     "subtitle": "Des guides pratiques et des supports gratuits pour vous, vos proches, votre classe ou votre organisation."},

    {"type": "downloads", "title": "Guides pratiques",
     "items": [
       {"title": "Guide du créateur responsable", "text": "Les bonnes pratiques essentielles en un document.", "meta": "PDF"},
       {"title": "Vérifier l'information en 5 étapes", "text": "Le mémo anti fake news à garder sous la main.", "meta": "PDF"},
       {"title": "Sécuriser ses comptes", "text": "La checklist de cybersécurité du créateur.", "meta": "PDF"},
       {"title": "Parents : accompagner les enfants en ligne", "text": "Conseils pratiques pour une parentalité numérique sereine.", "meta": "PDF"},
       {"title": "Réagir au cyberharcèlement", "text": "Que faire, étape par étape, en tant que victime ou témoin.", "meta": "PDF"},
       {"title": "Comprendre la sextorsion", "text": "Reconnaître la menace et savoir où trouver de l'aide.", "meta": "PDF"},
     ]},

    {"type": "cards", "columns": 3, "title": "Kits de sensibilisation",
     "items": [
       {"icon": "graduation", "title": "Kit pédagogique", "text": "Supports prêts à l'emploi pour les enseignants."},
       {"icon": "megaphone", "title": "Kit de campagne", "text": "Visuels et messages pour relayer nos campagnes."},
       {"icon": "child", "title": "Kit parents", "text": "Fiches conseils pour les familles."},
       {"icon": "doc", "title": "Affiches", "text": "Supports à imprimer pour vos locaux."},
       {"icon": "play", "title": "Capsules vidéo", "text": "De courtes vidéos pédagogiques à partager.", "href": "videos"},
       {"icon": "book", "title": "Glossaire", "text": "Tous les termes du numérique expliqués.", "href": "glossaire"},
     ]},

    {"type": "callout", "variant": "success", "title": "Libres de partage",
     "text": ["Nos ressources sont conçues pour être diffusées. Partagez-les autour de vous, dans vos écoles, vos entreprises et vos communautés."]},

    {"type": "cta", "title": "Besoin d'une ressource spécifique ?",
     "buttons": [{"label": "Nous contacter", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 37 — FAQ ------------------------------------------------------------------
{
  "slug": "faq",
  "title": "Foire aux questions",
  "section": SEC,
  "description": "Questions fréquentes sur l'ACCI, ses missions, l'adhésion et le signalement des abus en ligne.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Vous vous demandez…",
     "title": "Foire aux questions",
     "subtitle": "Les réponses aux questions les plus fréquentes sur l'ACCI et son action."},

    {"type": "accordion", "title": "À propos de l'association",
     "items": [
       {"q": "Qu'est-ce que l'ACCI ?", "a": ["L'ACCI est l'Association des Créateurs de Contenu Ivoiriens, une organisation à but non lucratif qui promeut un usage responsable des réseaux sociaux et lutte contre les mauvaises pratiques en ligne en Côte d'Ivoire."]},
       {"q": "L'ACCI est-elle un organe de censure ?", "a": ["Non. L'ACCI ne censure rien. Nous misons sur l'éducation, la sensibilisation et la responsabilité, dans le respect de la liberté d'expression."]},
       {"q": "L'ACCI est-elle liée à un parti ou à un gouvernement ?", "a": ["Non. L'ACCI est une initiative citoyenne indépendante, sans appartenance partisane."]},
     ]},

    {"type": "accordion", "title": "Adhésion & participation",
     "items": [
       {"q": "Qui peut adhérer à l'ACCI ?", "a": ["Tout créateur de contenu, professionnel du numérique ou citoyen partageant nos valeurs peut adhérer. Voir notre page Adhésion."]},
       {"q": "Faut-il avoir beaucoup d'abonnés pour adhérer ?", "a": ["Non. L'engagement compte plus que le nombre d'abonnés. Débutants comme créateurs confirmés sont les bienvenus."]},
       {"q": "Comment puis-je m'impliquer concrètement ?", "a": ["Vous pouvez signer la charte, relayer nos campagnes, devenir membre actif d'un pôle, ou nous soutenir par un don."]},
     ]},

    {"type": "accordion", "title": "Signalement & aide",
     "items": [
       {"q": "Comment signaler un contenu abusif ?", "a": ["Conservez les preuves, signalez le contenu à la plateforme concernée et transmettez-nous la situation via notre page Signaler un abus."]},
       {"q": "Je suis victime de harcèlement, que faire ?", "a": ["Ne restez pas seul(e). Conservez les preuves, bloquez l'auteur et contactez notre cellule d'écoute pour être accompagné(e)."]},
       {"q": "L'ACCI peut-elle agir à ma place en justice ?", "a": ["L'ACCI informe et oriente. Elle ne se substitue pas à un avocat ou aux autorités, mais vous aide à les solliciter."]},
     ]},

    {"type": "cta", "title": "Vous n'avez pas trouvé votre réponse ?",
     "buttons": [{"label": "Posez-nous votre question", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 38 — GLOSSAIRE ------------------------------------------------------------
{
  "slug": "glossaire",
  "title": "Glossaire du numérique",
  "section": SEC,
  "description": "Glossaire des termes du numérique et des réseaux sociaux expliqués simplement par l'ACCI.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Comprendre les mots",
     "title": "Glossaire du numérique",
     "subtitle": "Les termes essentiels des réseaux sociaux et de la sécurité en ligne, expliqués simplement."},

    {"type": "definitions", "title": "De A à Z",
     "items": [
       {"term": "Cyberharcèlement", "def": "Harcèlement exercé de façon répétée au moyen des outils numériques (messages, publications, commentaires)."},
       {"term": "Désinformation", "def": "Diffusion délibérée d'informations fausses ou trompeuses dans le but d'induire en erreur."},
       {"term": "Doxxing", "def": "Publication malveillante d'informations personnelles d'une personne dans le but de lui nuire."},
       {"term": "Fact-checking", "def": "Travail de vérification des faits visant à confirmer ou démentir une information."},
       {"term": "Hameçonnage (phishing)", "def": "Technique frauduleuse visant à voler vos identifiants en se faisant passer pour un service de confiance."},
       {"term": "Influence", "def": "Capacité d'un créateur à orienter les opinions et comportements de son audience."},
       {"term": "Modération", "def": "Encadrement des contenus publiés sur une plateforme pour faire respecter ses règles."},
       {"term": "Sextorsion", "def": "Chantage exercé à partir d'images ou de vidéos à caractère intime."},
       {"term": "Troll", "def": "Personne qui publie des messages provocateurs dans le but de susciter des conflits."},
       {"term": "Viralité", "def": "Diffusion très rapide et massive d'un contenu sur les réseaux sociaux."},
       {"term": "Double authentification (2FA)", "def": "Mesure de sécurité ajoutant une seconde vérification lors de la connexion à un compte."},
       {"term": "Deepfake", "def": "Contenu falsifié, souvent vidéo, créé par intelligence artificielle pour faire dire ou faire à quelqu'un ce qu'il n'a jamais dit ou fait."},
     ]},

    {"type": "cta", "title": "Un terme vous échappe encore ?",
     "buttons": [{"label": "Demandez-nous", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

]
