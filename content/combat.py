# -*- coding: utf-8 -*-
"""Pages 9 à 20 — Notre combat contre les mauvaises pratiques."""

SEC = "Notre combat"

PAGES = [

# 9 — NOTRE COMBAT (vue d'ensemble) -----------------------------------------
{
  "slug": "notre-combat",
  "title": "Notre combat",
  "section": SEC,
  "description": "Le plaidoyer de l'ACCI contre les mauvaises pratiques sur les réseaux sociaux en Côte d'Ivoire : désinformation, harcèlement, arnaques et plus encore.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "image": "usage-responsable.jpg",
     "kicker": "Notre combat",
     "title": "Contre les **dérives**, pour un numérique qui élève",
     "subtitle": "Les réseaux sociaux sont une chance pour la Côte d'Ivoire. Mais sans vigilance, ils deviennent un espace de désinformation, de violence et d'arnaques. Voici les combats que mène l'ACCI.",
     "cta": [{"label": "Voir les mauvaises pratiques", "href": "mauvaises-pratiques", "style": "btn--primary", "arrow": True}]},

    {"type": "section", "align": "center", "title": "Des écrans aux conséquences réelles",
     "lead": "Derrière chaque publication malveillante, il y a des victimes : une réputation détruite, une famille trompée, un adolescent harcelé, une communauté divisée. Notre combat est d'abord humain."},

    {"type": "cards", "columns": 4, "title": "Les fronts de notre action",
     "items": [
       {"icon": "fact", "title": "Désinformation", "text": "Endiguer la propagation des fausses nouvelles.", "href": "desinformation"},
       {"icon": "shield", "title": "Cyberharcèlement", "text": "Mettre fin aux violences en ligne.", "href": "cyberharcelement"},
       {"icon": "money", "title": "Arnaques en ligne", "text": "Protéger le public des escroqueries.", "href": "cyber-escroquerie"},
       {"icon": "scale", "title": "Diffamation", "text": "Défendre la dignité et la réputation.", "href": "diffamation"},
       {"icon": "warning", "title": "Discours de haine", "text": "Refuser la division et l'incitation.", "href": "discours-haine"},
       {"icon": "child", "title": "Protection des mineurs", "text": "Sécuriser l'expérience des plus jeunes.", "href": "protection-mineurs"},
       {"icon": "lock", "title": "Sextorsion", "text": "Combattre le chantage à l'intime.", "href": "sextorsion"},
       {"icon": "key", "title": "Vie privée", "text": "Protéger les données personnelles.", "href": "vie-privee"},
     ]},

    {"type": "split", "icon": "scale",
     "kicker": "Notre approche", "title": "Éduquer, protéger, plaider",
     "text": [
       "Nous ne croyons pas à la solution unique de la répression. Notre combat repose sur trois leviers complémentaires.",
       "**Éduquer** pour prévenir : développer l'esprit critique et les bons réflexes. **Protéger** pour réparer : accompagner les victimes. **Plaider** pour transformer : dialoguer avec les plateformes et les institutions.",
     ],
     "bullets": [
       "Des campagnes de sensibilisation grand public",
       "Une cellule d'écoute pour les victimes",
       "Un accompagnement juridique de proximité",
       "Un plaidoyer pour des règles plus protectrices",
     ],
     "cta": {"label": "Découvrir nos services", "href": "services"}},

    {"type": "stats", "items": [
      {"value": "7", "label": "Internautes sur 10 exposés aux fausses infos"},
      {"value": "1", "suffix": "/3", "label": "Jeunes témoins de harcèlement en ligne"},
      {"value": "24", "suffix": "h", "label": "Pour qu'une rumeur devienne virale"},
      {"value": "100", "suffix": "%", "label": "De notre engagement"},
    ]},

    {"type": "chart", "kind": "donut", "narrow": True,
     "kicker": "Ce que l'on nous signale",
     "title": "Répartition des signalements reçus",
     "lead": "Les situations qui nous sont remontées dessinent les priorités de notre action.",
     "center": "6", "center_label": "grands types",
     "items": [
       {"label": "Cyberharcèlement", "value": 28},
       {"label": "Arnaques en ligne", "value": 24},
       {"label": "Désinformation", "value": 19},
       {"label": "Discours de haine", "value": 12},
       {"label": "Atteinte à la vie privée", "value": 9},
       {"label": "Autres dérives", "value": 8},
     ],
     "source": "Répartition illustrative des signalements, à titre indicatif."},

    {"type": "cta", "title": "Ce combat est aussi le vôtre",
     "text": "Sensibilisez, signalez, soutenez. Chaque geste compte.",
     "buttons": [
       {"label": "Signaler un abus", "href": "signaler-abus", "style": "btn--light", "arrow": True},
       {"label": "Rejoindre l'ACCI", "href": "adhesion", "style": "btn--outline-light"},
     ]},
  ],
},

# 10 — MAUVAISES PRATIQUES (panorama) ---------------------------------------
{
  "slug": "mauvaises-pratiques",
  "title": "Les mauvaises pratiques sur les réseaux sociaux",
  "section": SEC,
  "description": "Panorama des mauvaises pratiques sur les réseaux sociaux en Côte d'Ivoire et de leurs conséquences sur la société.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Panorama",
     "title": "Les mauvaises pratiques sur les réseaux sociaux",
     "subtitle": "Comprendre les dérives pour mieux les combattre. Tour d'horizon des comportements qui empoisonnent l'espace numérique ivoirien."},

    {"type": "section", "title": "Quand l'outil se retourne contre l'humain",
     "lead": "Les réseaux sociaux ne sont ni bons ni mauvais en soi : tout dépend de l'usage qu'on en fait.",
     "body": [
       "Pensés pour connecter les gens, ils peuvent aussi amplifier le pire : la rumeur plus que la nuance, l'indignation plus que la réflexion, le sensationnel plus que la vérité.",
       "En Côte d'Ivoire comme ailleurs, certaines pratiques se sont banalisées au point de paraître normales. Elles ne le sont pas. Les nommer, c'est déjà commencer à les combattre.",
     ]},

    {"type": "checklist", "variant": "bad", "columns": 2, "title": "Les pratiques que nous dénonçons",
     "items": [
       "Diffuser une information sans la vérifier",
       "Insulter, humilier ou harceler une personne",
       "Propager des propos haineux, tribaux ou discriminatoires",
       "Monter des arnaques et de faux investissements",
       "Usurper l'identité d'autrui",
       "Publier des images intimes ou choquantes",
       "Exposer la vie privée des gens sans consentement",
       "Manipuler l'opinion par de faux comptes",
       "Exploiter ou exposer des mineurs",
       "Lancer des défis dangereux pour le buzz",
     ]},

    {"type": "section", "title": "Pourquoi ces pratiques prospèrent",
     "body": [
       "Plusieurs facteurs expliquent la diffusion de ces comportements : la recherche du buzz et des revenus à tout prix, l'anonymat qui désinhibe, le manque de culture numérique, la viralité qui récompense l'émotion forte et l'absence de conséquences perçues.",
       "L'ACCI agit sur chacun de ces leviers : en valorisant un contenu de qualité, en responsabilisant les créateurs, en formant le public et en facilitant le signalement.",
     ]},

    {"type": "cards", "columns": 4, "title": "Explorer chaque dérive",
     "items": [
       {"icon": "fact", "title": "Désinformation", "href": "desinformation", "text": "Fausses nouvelles et rumeurs."},
       {"icon": "shield", "title": "Cyberharcèlement", "href": "cyberharcelement", "text": "Violences répétées en ligne."},
       {"icon": "warning", "title": "Discours de haine", "href": "discours-haine", "text": "Incitation et discrimination."},
       {"icon": "money", "title": "Arnaques", "href": "cyber-escroquerie", "text": "Escroqueries numériques."},
       {"icon": "scale", "title": "Diffamation", "href": "diffamation", "text": "Atteinte à la réputation."},
       {"icon": "eye", "title": "Contenus explicites", "href": "contenus-explicites", "text": "Nudité et choc gratuit."},
       {"icon": "lock", "title": "Sextorsion", "href": "sextorsion", "text": "Chantage à l'intime."},
       {"icon": "alert", "title": "Défis dangereux", "href": "defis-dangereux", "text": "Challenges à risque."},
     ]},

    {"type": "cta", "title": "Face à une mauvaise pratique, agissez",
     "buttons": [{"label": "Signaler un abus", "href": "signaler-abus", "style": "btn--light", "arrow": True}]},
  ],
},

# 11 — DÉSINFORMATION -------------------------------------------------------
{
  "slug": "desinformation",
  "title": "Désinformation & fausses nouvelles",
  "section": SEC,
  "description": "La désinformation et les fausses nouvelles en Côte d'Ivoire : comprendre, repérer et combattre les fake news.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Fléau n°1",
     "title": "Désinformation & fausses nouvelles",
     "subtitle": "La fausse information se propage six fois plus vite que la vraie. Apprendre à la repérer est devenu un réflexe vital."},

    {"type": "section", "title": "Qu'est-ce que la désinformation ?",
     "lead": "La désinformation désigne la diffusion d'informations fausses ou trompeuses, intentionnellement ou non.",
     "body": [
       "On distingue la **mésinformation** (fausse information partagée de bonne foi), la **désinformation** (mensonge diffusé délibérément) et la **malinformation** (information vraie utilisée pour nuire).",
       "Rumeurs sur la santé, fausses annonces de décès, photos sorties de leur contexte, montages, fausses citations de personnalités : les formes sont multiples et de plus en plus convaincantes, notamment avec l'intelligence artificielle.",
     ]},

    {"type": "callout", "variant": "danger", "title": "Des conséquences graves",
     "text": ["La désinformation peut provoquer des mouvements de panique, nuire à la santé publique, attiser les tensions communautaires, ruiner des réputations et fragiliser la confiance dans les institutions et les médias."]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Les signaux d'alerte d'une fausse information",
     "items": [
       "Un titre choc, conçu pour révolter ou faire peur",
       "Aucune source identifiable ou vérifiable",
       "Une image spectaculaire mais sans contexte",
       "Des fautes, un style approximatif, une mise en page douteuse",
       "Une demande pressante de « partager vite »",
       "Une information introuvable dans les médias sérieux",
     ]},

    {"type": "steps", "title": "Les bons réflexes avant de partager",
     "items": [
       {"title": "Marquer une pause", "text": "Si l'information vous fait réagir très fort, c'est le moment de se méfier et de respirer."},
       {"title": "Vérifier la source", "text": "Qui publie ? Est-ce un média reconnu, un compte officiel, ou un compte anonyme créé récemment ?"},
       {"title": "Recouper l'information", "text": "L'information est-elle relayée par d'autres sources fiables et indépendantes ?"},
       {"title": "Vérifier les images", "text": "Une recherche d'image inversée révèle souvent une photo ancienne ou détournée."},
       {"title": "Ne pas partager le doute", "text": "Dans le doute, on s'abstient. Partager une fausse information, c'est en devenir le complice."},
     ]},

    {"type": "split", "icon": "fact", "reverse": True,
     "kicker": "Notre action", "title": "La campagne #PartageVrai",
     "text": [
       "L'ACCI mène des campagnes pour ancrer le réflexe de vérification dans la population, en particulier chez les jeunes et les créateurs très suivis.",
       "Nous formons à la vérification des faits (fact-checking) et travaillons avec les médias pour démentir rapidement les rumeurs les plus dangereuses.",
     ],
     "cta": {"label": "Apprendre à vérifier l'information", "href": "verification-information"}},

    {"type": "cta", "title": "Ne soyez pas un relais de la rumeur",
     "text": "Vérifiez avant de partager. C'est simple et ça change tout.",
     "buttons": [{"label": "Guide de vérification", "href": "verification-information", "style": "btn--light", "arrow": True}]},
  ],
},

# 12 — CYBERHARCÈLEMENT -----------------------------------------------------
{
  "slug": "cyberharcelement",
  "title": "Cyberharcèlement",
  "section": SEC,
  "description": "Comprendre et combattre le cyberharcèlement en Côte d'Ivoire : formes, conséquences et solutions.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Violence en ligne",
     "title": "Le cyberharcèlement",
     "subtitle": "Des mots qui blessent, des attaques qui s'acharnent. Le harcèlement en ligne fait des victimes bien réelles, parfois des drames."},

    {"type": "section", "title": "Qu'est-ce que le cyberharcèlement ?",
     "lead": "C'est le fait de harceler une personne de manière répétée via les outils numériques.",
     "body": [
       "Insultes, menaces, moqueries, rumeurs, publication de photos humiliantes, exclusion organisée, « raids » de commentaires haineux : le cyberharcèlement prend de nombreuses formes.",
       "Sa particularité est qu'il poursuit la victime partout, à toute heure, et que les contenus peuvent être vus et partagés par un très grand nombre de personnes. La victime se sent traquée, sans échappatoire.",
     ]},

    {"type": "checklist", "variant": "bad", "columns": 2, "title": "Les visages du cyberharcèlement",
     "items": [
       "Insultes et menaces répétées",
       "Création de comptes pour humilier une personne",
       "Diffusion de photos ou vidéos dégradantes",
       "Campagnes de dénigrement organisées (« raids »)",
       "Rumeurs et calomnies ciblées",
       "Usurpation d'identité pour nuire",
       "Exclusion et mise au ban d'un groupe",
       "Chantage et intimidation",
     ]},

    {"type": "callout", "variant": "danger", "title": "Un impact dévastateur",
     "text": ["Anxiété, dépression, isolement, décrochage scolaire, atteinte à l'image, et dans les cas les plus graves, idées suicidaires. Le cyberharcèlement n'a rien d'anodin : il peut détruire une vie."]},

    {"type": "steps", "title": "Que faire si vous êtes victime ?",
     "items": [
       {"title": "Ne pas répondre à l'agresseur", "text": "Répondre nourrit souvent l'escalade. Gardez votre calme et votre dignité."},
       {"title": "Conserver les preuves", "text": "Faites des captures d'écran datées des messages, commentaires et publications."},
       {"title": "Bloquer et signaler", "text": "Bloquez les comptes en cause et signalez les contenus aux plateformes."},
       {"title": "En parler", "text": "Brisez l'isolement : parlez-en à un proche, à un adulte de confiance ou à notre cellule d'écoute."},
       {"title": "Porter plainte si nécessaire", "text": "Le cyberharcèlement est répréhensible. Notre accompagnement juridique peut vous orienter."},
     ]},

    {"type": "split", "icon": "heart", "reverse": True,
     "kicker": "Vous n'êtes pas seul(e)", "title": "Notre cellule d'écoute est là pour vous",
     "text": [
       "L'ACCI propose un soutien confidentiel et bienveillant aux victimes de harcèlement en ligne, ainsi qu'une orientation vers un accompagnement psychologique et juridique.",
       "Et si vous êtes témoin ? Ne restez pas spectateur : soutenez la victime, signalez les contenus, refusez de relayer.",
     ],
     "cta": {"label": "Contacter la cellule d'écoute", "href": "cellule-ecoute"}},

    {"type": "cta", "title": "Témoin ou victime de harcèlement ?",
     "buttons": [
       {"label": "Signaler un abus", "href": "signaler-abus", "style": "btn--light", "arrow": True},
       {"label": "Demander de l'aide", "href": "cellule-ecoute", "style": "btn--outline-light"},
     ]},
  ],
},

# 13 — CYBER-ESCROQUERIE ----------------------------------------------------
{
  "slug": "cyber-escroquerie",
  "title": "Arnaques & cyber-escroquerie",
  "section": SEC,
  "description": "Les arnaques en ligne en Côte d'Ivoire : faux investissements, usurpation, phishing. Apprenez à les reconnaître et à vous protéger.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Escroquerie numérique",
     "title": "Arnaques & cyber-escroquerie",
     "subtitle": "Faux gains, faux investissements, faux profils : les escrocs rivalisent d'ingéniosité. La meilleure protection reste la vigilance."},

    {"type": "section", "title": "L'arnaque en ligne, un fléau coûteux",
     "lead": "Les escroqueries numériques font des milliers de victimes et minent la confiance dans l'économie en ligne.",
     "body": [
       "Profitant de l'attrait de l'argent facile et de la crédulité, des réseaux d'escrocs sévissent sur les réseaux sociaux et les applications de messagerie. Ils se font passer pour des proches, des entreprises, des célébrités ou des institutions.",
       "Les créateurs de contenu sont aussi visés : usurpation de leur identité, faux comptes sponsorisés, fausses collaborations. L'ACCI alerte et outille le public.",
     ]},

    {"type": "checklist", "variant": "bad", "columns": 2, "title": "Les arnaques les plus courantes",
     "items": [
       "Faux investissements et « placements miracles »",
       "Fausses loteries et faux gains à réclamer",
       "Usurpation d'identité de proches ou de marques",
       "Hameçonnage (phishing) pour voler vos identifiants",
       "Fausses ventes en ligne (paiement sans livraison)",
       "Faux recrutements et fausses offres d'emploi",
       "Arnaques sentimentales (« brouteurs »)",
       "Faux comptes de célébrités demandant de l'argent",
     ]},

    {"type": "callout", "variant": "warning", "title": "La règle d'or",
     "text": ["Si une offre paraît trop belle pour être vraie, c'est presque toujours qu'elle est fausse. Aucun investissement sérieux ne garantit de doubler votre argent en quelques jours."]},

    {"type": "steps", "title": "Comment vous protéger",
     "items": [
       {"title": "Méfiez-vous de l'urgence", "text": "Les escrocs créent un sentiment de pression pour vous empêcher de réfléchir."},
       {"title": "Vérifiez l'identité", "text": "Confirmez par un autre canal qu'il s'agit bien de la personne ou de l'entreprise annoncée."},
       {"title": "Ne communiquez jamais vos codes", "text": "Aucun service sérieux ne vous demandera votre mot de passe ou votre code de transaction."},
       {"title": "Ne payez pas d'avance", "text": "Méfiez-vous des frais à régler pour « débloquer » un gain ou une opportunité."},
       {"title": "Signalez", "text": "Alertez la plateforme, vos proches et, le cas échéant, les autorités compétentes."},
     ]},

    {"type": "cta", "title": "Victime ou témoin d'une arnaque ?",
     "text": "Le signalement protège les prochaines victimes.",
     "buttons": [{"label": "Signaler une arnaque", "href": "signaler-abus", "style": "btn--light", "arrow": True}]},
  ],
},

# 14 — DIFFAMATION ----------------------------------------------------------
{
  "slug": "diffamation",
  "title": "Diffamation & atteinte à la dignité",
  "section": SEC,
  "description": "Diffamation, injure et atteinte à la dignité sur les réseaux sociaux : ce que dit le bon sens et ce que protège le droit.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Atteinte à la réputation",
     "title": "Diffamation & atteinte à la dignité",
     "subtitle": "Salir une réputation en un clic est facile ; réparer le tort causé l'est beaucoup moins. La parole en ligne engage."},

    {"type": "section", "title": "Quand la critique devient une atteinte",
     "lead": "La liberté d'expression est précieuse, mais elle s'arrête là où commence l'atteinte injustifiée à autrui.",
     "body": [
       "La **diffamation** consiste à imputer à une personne un fait précis qui porte atteinte à son honneur ou à sa considération. L'**injure** est une expression outrageante ne reposant sur aucun fait. La **dénonciation calomnieuse** accuse faussement quelqu'un.",
       "Sur les réseaux, ces atteintes prennent une ampleur considérable : un message peut être vu par des milliers de personnes et rester en ligne indéfiniment.",
     ]},

    {"type": "callout", "variant": "info", "title": "Critiquer n'est pas diffamer",
     "text": ["Exprimer une opinion, signaler un dysfonctionnement ou critiquer une œuvre est légitime. La frontière se situe dans l'intention de nuire, le mensonge et l'attaque gratuite contre la personne."]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "S'exprimer sans nuire",
     "items": [
       "Distinguer les faits avérés des opinions",
       "Vérifier avant d'accuser publiquement",
       "Critiquer des idées ou des actes, pas des personnes",
       "Éviter les insultes et les attaques personnelles",
       "Accepter le droit de réponse et la nuance",
       "Supprimer et s'excuser en cas d'erreur",
     ]},

    {"type": "split", "icon": "scale", "reverse": True,
     "kicker": "Vos droits", "title": "Que faire si vous êtes visé(e) ?",
     "text": [
       "Si vous êtes victime de propos diffamatoires ou injurieux, vous n'êtes pas démuni(e). Conservez les preuves, demandez le retrait des contenus et faites valoir vos droits.",
       "Notre service d'accompagnement juridique peut vous informer sur les démarches possibles et vous orienter.",
     ],
     "cta": {"label": "Accompagnement juridique", "href": "accompagnement-juridique"}},

    {"type": "cta", "title": "La réputation se protège",
     "buttons": [{"label": "Signaler un contenu", "href": "signaler-abus", "style": "btn--light", "arrow": True}]},
  ],
},

# 15 — DISCOURS DE HAINE ----------------------------------------------------
{
  "slug": "discours-haine",
  "title": "Discours de haine",
  "section": SEC,
  "description": "Le discours de haine en ligne : propos tribaux, religieux et discriminatoires. Pourquoi et comment l'ACCI le combat.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Cohésion sociale",
     "title": "Le discours de haine",
     "subtitle": "Des mots qui divisent peuvent allumer des incendies. Dans un pays riche de sa diversité, refuser la haine en ligne est un devoir collectif."},

    {"type": "section", "title": "Comprendre le discours de haine",
     "lead": "Le discours de haine désigne tout propos qui attaque ou rabaisse une personne ou un groupe en raison de son identité.",
     "body": [
       "Origine ethnique, région, religion, genre, handicap, orientation : la haine en ligne cible ce qui devrait rassembler. Elle se nourrit des préjugés et prospère dans l'anonymat.",
       "Particulièrement dangereux en période de tensions, le discours de haine peut inciter à la discrimination, à l'hostilité, voire à la violence. Il fragilise le vivre-ensemble.",
     ]},

    {"type": "callout", "variant": "danger", "title": "Les mots ont des conséquences",
     "text": ["L'Histoire l'a montré : les violences de masse sont souvent précédées par la banalisation de discours déshumanisants. Veiller au langage en ligne, c'est protéger la paix sociale."]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Notre engagement contre la haine",
     "items": [
       "Refuser et ne jamais relayer les propos haineux",
       "Promouvoir un langage respectueux de la diversité",
       "Soutenir les personnes et groupes pris pour cible",
       "Signaler systématiquement les contenus haineux",
       "Valoriser les contenus qui rassemblent",
       "Sensibiliser à la cohésion nationale",
     ]},

    {"type": "quote",
     "text": "Notre diversité n'est pas une faiblesse à exploiter, c'est une richesse à célébrer.",
     "author": "ACCI"},

    {"type": "cta", "title": "Choisissez les mots qui rassemblent",
     "buttons": [{"label": "Signaler un discours de haine", "href": "signaler-abus", "style": "btn--light", "arrow": True}]},
  ],
},

# 16 — PROTECTION DES MINEURS -----------------------------------------------
{
  "slug": "protection-mineurs",
  "title": "Protection des mineurs",
  "section": SEC,
  "description": "Protéger les enfants et adolescents en ligne en Côte d'Ivoire : risques, conseils aux parents et engagement de l'ACCI.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Priorité absolue",
     "title": "La protection des mineurs",
     "subtitle": "Les plus jeunes sont les plus présents en ligne et les plus vulnérables. Les protéger est une responsabilité partagée."},

    {"type": "section", "title": "Des enfants surexposés",
     "lead": "Les mineurs accèdent aux réseaux de plus en plus tôt, souvent sans accompagnement.",
     "body": [
       "Contenus inadaptés, contacts malveillants, harcèlement entre pairs, exposition de leur image, pression du paraître, addiction aux écrans : les risques sont nombreux et bien documentés.",
       "L'ACCI plaide pour un internet qui protège l'enfance et sensibilise parents, éducateurs et créateurs à leurs responsabilités.",
     ]},

    {"type": "split", "image": "protection-enfants.jpg",
     "alt": "Un parent et son enfant utilisant une tablette ensemble en toute sécurité",
     "kicker": "Accompagner plutôt que subir", "title": "Grandir en sécurité dans le monde numérique",
     "text": [
       "La meilleure protection n'est pas l'interdiction, mais l'accompagnement. Un enfant à qui l'on explique les risques et qui sait qu'il peut se confier est bien mieux armé.",
       "Parents, enseignants et créateurs ont chacun un rôle à jouer pour faire d'internet un espace d'épanouissement plutôt que de danger.",
     ],
     "bullets": [
       "Dialoguer sans juger",
       "Activer le contrôle parental",
       "Montrer l'exemple",
       "Rester un recours de confiance",
     ]},

    {"type": "checklist", "variant": "bad", "columns": 2, "title": "Les principaux risques",
     "items": [
       "Exposition à des contenus violents ou pornographiques",
       "Contacts avec des adultes mal intentionnés",
       "Harcèlement entre camarades",
       "Partage de l'image d'enfants sans protection",
       "Pression sociale et atteinte à l'estime de soi",
       "Addiction et troubles du sommeil",
     ]},

    {"type": "steps", "title": "Conseils aux parents et éducateurs",
     "items": [
       {"title": "Dialoguer", "text": "Parler régulièrement avec l'enfant de ce qu'il voit et vit en ligne, sans le juger."},
       {"title": "Accompagner l'âge venu", "text": "Respecter les âges minimums des plateformes et accompagner les premiers usages."},
       {"title": "Paramétrer", "text": "Activer le contrôle parental et les réglages de confidentialité adaptés."},
       {"title": "Fixer un cadre", "text": "Définir des temps et des espaces sans écran, montrer l'exemple."},
       {"title": "Rester un recours", "text": "Faire savoir à l'enfant qu'il peut tout dire sans crainte d'être puni."},
     ]},

    {"type": "callout", "variant": "warning", "title": "Créateurs, soyez vigilants",
     "text": ["Filmer ou exposer des enfants, même les siens, comporte des risques. Protégez leur image, leur intimité et leur droit à décider plus tard de leur présence en ligne."]},

    {"type": "cta", "title": "Protégeons ensemble nos enfants",
     "buttons": [{"label": "Cellule d'écoute", "href": "cellule-ecoute", "style": "btn--light", "arrow": True}]},
  ],
},

# 17 — CONTENUS EXPLICITES --------------------------------------------------
{
  "slug": "contenus-explicites",
  "title": "Contenus à caractère sexuel & choquants",
  "section": SEC,
  "description": "Nudité, contenus explicites et choquants sur les réseaux sociaux : enjeux, risques et appel à la responsabilité.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Responsabilité éditoriale",
     "title": "Contenus explicites & choquants",
     "subtitle": "Le sensationnel et la provocation attirent les vues, mais à quel prix ? La quête du buzz ne justifie pas tout."},

    {"type": "section", "title": "La course au choc",
     "lead": "Pour capter l'attention, certains contenus misent sur la nudité, la violence ou le scandale.",
     "body": [
       "Or ces contenus circulent dans un espace ouvert, accessible aux mineurs, et heurtent une grande partie du public. Diffusés sans avertissement ni consentement, ils peuvent causer un tort durable.",
       "L'ACCI appelle à une création responsable : il est possible de divertir, d'informer et de marquer les esprits sans franchir les limites du respect et de la décence.",
     ]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Créer sans choquer gratuitement",
     "items": [
       "Penser au public, notamment aux plus jeunes",
       "Obtenir le consentement des personnes filmées",
       "Avertir avant un contenu sensible",
       "Refuser la mise en scène de la souffrance d'autrui",
       "Ne pas relayer de contenus à caractère sexuel non consentis",
       "Privilégier la créativité au sensationnalisme",
    ]},

    {"type": "callout", "variant": "danger", "title": "Tolérance zéro",
     "text": ["La diffusion d'images intimes sans consentement et tout contenu impliquant des mineurs sont des actes graves, fermement condamnés par l'ACCI et réprimés par la loi. Voir aussi notre page sur le chantage et la sextorsion."]},

    {"type": "cta", "title": "Le respect, ça se cultive en ligne aussi",
     "buttons": [{"label": "Signaler un contenu", "href": "signaler-abus", "style": "btn--light", "arrow": True}]},
  ],
},

# 18 — SEXTORSION -----------------------------------------------------------
{
  "slug": "sextorsion",
  "title": "Chantage & sextorsion",
  "section": SEC,
  "description": "Le chantage à l'image intime (sextorsion) : comment il fonctionne, comment réagir et où trouver de l'aide.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Alerte",
     "title": "Chantage & sextorsion",
     "subtitle": "Une menace en pleine expansion qui exploite l'intimité pour extorquer de l'argent ou des faveurs. Personne ne devrait y faire face seul."},

    {"type": "section", "title": "Comprendre la sextorsion",
     "lead": "La sextorsion est un chantage exercé à partir d'images ou de vidéos à caractère intime.",
     "body": [
       "Le mécanisme est souvent le même : une relation de confiance ou de séduction est créée en ligne, des images intimes sont obtenues, puis la victime est menacée de leur diffusion si elle ne paie pas ou n'obéit pas.",
       "Les victimes, paralysées par la honte et la peur, n'osent souvent pas en parler. C'est précisément ce silence que les maîtres chanteurs exploitent.",
     ]},

    {"type": "callout", "variant": "danger", "title": "Si vous êtes victime : ne payez pas",
     "text": ["Payer n'arrête presque jamais le chantage — au contraire, cela encourage le maître chanteur à demander davantage. Coupez le contact, conservez les preuves et demandez de l'aide immédiatement."]},

    {"type": "steps", "title": "Comment réagir",
     "items": [
       {"title": "Ne cédez pas au chantage", "text": "Ne payez pas et n'envoyez aucun contenu supplémentaire."},
       {"title": "Conservez les preuves", "text": "Captures d'écran des menaces, du profil et des échanges."},
       {"title": "Bloquez et signalez", "text": "Bloquez l'auteur et signalez le compte à la plateforme."},
       {"title": "Parlez-en", "text": "Contactez une personne de confiance ou notre cellule d'écoute. Vous n'êtes pas coupable."},
       {"title": "Faites valoir vos droits", "text": "La sextorsion est un délit. Notre accompagnement juridique peut vous orienter vers les autorités."},
     ]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Prévenir le risque",
     "items": [
       "Se méfier des relations en ligne trop rapides et trop intenses",
       "Ne jamais envoyer d'images intimes, même en confiance",
       "Protéger ses comptes et sa caméra",
       "Vérifier l'identité réelle de ses interlocuteurs",
       "Sensibiliser les jeunes à ce risque spécifique",
       "En parler dès les premières menaces",
    ]},

    {"type": "cta", "title": "Vous êtes victime ? Réagissez maintenant.",
     "text": "Notre cellule d'écoute est confidentielle et sans jugement.",
     "buttons": [
       {"label": "Demander de l'aide", "href": "cellule-ecoute", "style": "btn--light", "arrow": True},
       {"label": "Signaler", "href": "signaler-abus", "style": "btn--outline-light"},
     ]},
  ],
},

# 19 — VIE PRIVÉE -----------------------------------------------------------
{
  "slug": "vie-privee",
  "title": "Atteinte à la vie privée",
  "section": SEC,
  "description": "Protéger sa vie privée et ses données personnelles en ligne : risques d'exposition et bonnes pratiques.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Données personnelles",
     "title": "Atteinte à la vie privée",
     "subtitle": "Ce que vous publiez vous échappe. Protéger sa vie privée et celle des autres est un réflexe à cultiver."},

    {"type": "section", "title": "La vie privée à l'ère des réseaux",
     "lead": "Chaque publication laisse une trace, et chaque trace peut être exploitée.",
     "body": [
       "Adresse, habitudes, entourage, opinions, localisation en temps réel : nous livrons sans toujours en avoir conscience une foule d'informations sur nous-mêmes et nos proches.",
       "L'atteinte à la vie privée survient aussi quand on expose autrui sans son accord : photo d'un tiers, capture d'une conversation privée, divulgation d'informations personnelles (« doxxing »).",
     ]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Protéger sa vie privée",
     "items": [
       "Limiter les informations personnelles publiées",
       "Régler la confidentialité de ses comptes",
       "Désactiver le partage de localisation en temps réel",
       "Réfléchir avant de publier une photo de quelqu'un",
       "Ne pas divulguer les données d'autrui",
       "Vérifier les autorisations des applications",
    ]},

    {"type": "callout", "variant": "warning", "title": "Le consentement, toujours",
     "text": ["Publier la photo ou les informations d'une autre personne sans son accord est une atteinte à sa vie privée. Demandez toujours la permission, surtout pour les enfants."]},

    {"type": "split", "icon": "key", "reverse": True,
     "kicker": "Aller plus loin", "title": "Sécurité et vie privée vont de pair",
     "text": [
       "Protéger sa vie privée, c'est aussi sécuriser ses comptes contre les piratages qui exposent vos données.",
       "Découvrez nos conseils pratiques pour verrouiller vos comptes et garder le contrôle de votre identité numérique.",
     ],
     "cta": {"label": "Guide de sécurité numérique", "href": "securite-numerique"}},

    {"type": "cta", "title": "Reprenez le contrôle de vos données",
     "buttons": [{"label": "Sécuriser mes comptes", "href": "securite-numerique", "style": "btn--light", "arrow": True}]},
  ],
},

# 20 — DÉFIS DANGEREUX ------------------------------------------------------
{
  "slug": "defis-dangereux",
  "title": "Défis dangereux (challenges)",
  "section": SEC,
  "description": "Les défis viraux dangereux sur les réseaux sociaux : pourquoi ils prolifèrent et comment protéger les jeunes.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Phénomène viral",
     "title": "Les défis dangereux",
     "subtitle": "Au nom du buzz, certains challenges mettent des vies en jeu. La popularité ne vaut jamais un drame."},

    {"type": "section", "title": "Quand le challenge devient piège",
     "lead": "Les défis viraux poussent à reproduire des actions de plus en plus risquées pour gagner des vues.",
     "body": [
       "Cascades dangereuses, jeux d'asphyxie, ingestion de substances, comportements à risque sur la voie publique : ces défis exploitent le désir de reconnaissance, particulièrement fort à l'adolescence.",
       "L'algorithme récompense l'extrême, et la pression du groupe fait le reste. Le résultat peut être dramatique : blessures graves, voire décès.",
     ]},

    {"type": "callout", "variant": "danger", "title": "Aucune vue ne vaut une vie",
     "text": ["Un défi qui met en danger votre intégrité ou celle d'autrui n'est pas un divertissement : c'est un risque réel. Refuser d'y participer et de le relayer, c'est faire preuve de courage, pas de faiblesse."]},

    {"type": "checklist", "variant": "good", "columns": 2, "title": "Comment réagir",
     "items": [
       "Ne pas relayer ni encourager les défis dangereux",
       "En parler ouvertement avec les jeunes",
       "Valoriser les challenges positifs et créatifs",
       "Signaler les contenus mettant en danger",
       "Expliquer les mécanismes de pression du groupe",
       "Promouvoir l'esprit critique face aux modes",
    ]},

    {"type": "split", "icon": "lightbulb", "reverse": True,
     "kicker": "L'alternative", "title": "Des défis qui font du bien",
     "text": [
       "Tout l'enjeu n'est pas d'interdire les challenges, mais de réorienter cette énergie créative vers le positif.",
       "Défis solidaires, éducatifs, artistiques, sportifs : les créateurs ivoiriens regorgent d'idées capables de faire le buzz sans danger.",
     ]},

    {"type": "cta", "title": "Le buzz responsable, c'est possible",
     "buttons": [{"label": "Bonnes pratiques", "href": "bonnes-pratiques", "style": "btn--light", "arrow": True}]},
  ],
},

]
