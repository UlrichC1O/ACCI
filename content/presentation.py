# -*- coding: utf-8 -*-
"""Pages 1 à 8 — Présentation de l'ACCI."""

PAGES = [

# 1 — ACCUEIL ---------------------------------------------------------------
{
  "slug": "index",
  "title": "Accueil",
  "description": "L'ACCI défend un usage responsable des réseaux sociaux en Côte d'Ivoire et lutte contre les mauvaises pratiques en ligne : désinformation, cyberharcèlement, arnaques.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "image": "hero-creators.jpg",
     "kicker": "Association des Créateurs de Contenu Ivoiriens",
     "title": "Pour un espace numérique **sain, responsable et crédible** en Côte d'Ivoire",
     "subtitle": "L'ACCI rassemble les créateurs de contenu ivoiriens pour promouvoir de bonnes pratiques sur les réseaux sociaux et lutter contre les dérives qui menacent la jeunesse, la vérité et la cohésion sociale.",
     "cta": [
       {"label": "Découvrir notre combat", "href": "notre-combat", "style": "btn--primary", "arrow": True},
       {"label": "Devenir membre", "href": "adhesion", "style": "btn--outline-light"},
     ],
     "badges": [
       {"icon": "users", "label": "Une communauté de créateurs engagés"},
       {"icon": "shield", "label": "Protection des internautes"},
       {"icon": "graduation", "label": "Formation & sensibilisation"},
     ]},

    {"type": "stats", "items": [
      {"value": "1 200", "suffix": "+", "label": "Créateurs sensibilisés"},
      {"value": "32", "label": "Campagnes de sensibilisation"},
      {"value": "14", "label": "Régions couvertes"},
      {"value": "85", "suffix": "%", "label": "Des jeunes sur les réseaux"},
    ]},

    {"type": "section", "kicker": "Notre raison d'être", "align": "center",
     "title": "Le numérique ivoirien à la croisée des chemins",
     "lead": "Les réseaux sociaux offrent des opportunités immenses : informer, divertir, entreprendre, créer des emplois. Mais sans repères, ils deviennent aussi le terrain de dérives qui blessent des personnes réelles. L'ACCI agit pour faire pencher la balance du bon côté."},

    {"type": "cards", "columns": 3,
     "items": [
       {"icon": "fact", "title": "Lutter contre la désinformation", "text": "Rumeurs, fausses nouvelles et manipulations se propagent plus vite que la vérité. Nous formons à la vérification de l'information.", "href": "desinformation", "tag": "Combat"},
       {"icon": "shield", "title": "Combattre le cyberharcèlement", "text": "Insultes, intimidations et campagnes de haine détruisent des vies. Nous accompagnons les victimes et sensibilisons.", "href": "cyberharcelement", "tag": "Combat"},
       {"icon": "money", "title": "Démasquer les arnaques", "text": "Faux investissements, fausses promotions, usurpation d'identité : nous alertons et protégeons le public.", "href": "cyber-escroquerie", "tag": "Combat"},
       {"icon": "child", "title": "Protéger les mineurs", "text": "Les plus jeunes sont les plus exposés. Nous promouvons un internet adapté et sécurisé pour les enfants.", "href": "protection-mineurs", "tag": "Combat"},
       {"icon": "doc", "title": "Une charte commune", "text": "Nous proposons aux créateurs une charte d'engagement pour produire un contenu responsable et de qualité.", "href": "charte", "tag": "Engagement"},
       {"icon": "graduation", "title": "Former la relève", "text": "Ateliers, formations et accompagnement pour professionnaliser les créateurs de contenu ivoiriens.", "href": "formations", "tag": "Service"},
     ]},

    {"type": "split", "image": "communaute.jpg",
     "alt": "Jeunes créateurs de contenu ivoiriens travaillant ensemble",
     "kicker": "Qui sommes-nous", "title": "Une initiative citoyenne portée par les créateurs eux-mêmes",
     "text": [
       "L'**Association des Créateurs de Contenu Ivoiriens (ACCI)** réunit influenceurs, blogueurs, vidéastes, podcasteurs, photographes et community managers qui partagent une même conviction : le talent numérique ivoirien mérite un cadre éthique et professionnel.",
       "Nous ne sommes pas contre les réseaux sociaux — nous sommes pour leur bon usage. Notre rôle : sensibiliser, former, accompagner et défendre, afin que la création de contenu rime avec responsabilité.",
     ],
     "bullets": [
       "Promouvoir les bonnes pratiques numériques",
       "Dénoncer et prévenir les dérives en ligne",
       "Accompagner et protéger les victimes",
       "Valoriser et professionnaliser les créateurs",
     ],
     "cta": {"label": "En savoir plus sur l'ACCI", "href": "a-propos"}},

    {"type": "chart", "kind": "bar",
     "kicker": "L'ampleur du phénomène",
     "title": "Exposition déclarée aux mauvaises pratiques en ligne",
     "lead": "Une large majorité d'internautes affirme avoir déjà été confrontée à au moins une dérive sur les réseaux sociaux.",
     "items": [
       {"label": "Fausses informations", "value": 78, "suffix": " %"},
       {"label": "Contenus choquants", "value": 54, "suffix": " %"},
       {"label": "Arnaques en ligne", "value": 52, "suffix": " %"},
       {"label": "Discours de haine", "value": 47, "suffix": " %"},
       {"label": "Cyberharcèlement", "value": 38, "suffix": " %"},
     ],
     "source": "Données présentées à titre indicatif pour illustrer les tendances observées. L'ACCI milite pour la production de statistiques officielles fiables sur ces phénomènes."},

    {"type": "section", "kicker": "Les dérives que nous combattons", "align": "center",
     "title": "Les mauvaises pratiques sur les réseaux sociaux",
     "lead": "Derrière chaque écran, des conséquences bien réelles. Voici les fléaux qui minent l'espace numérique ivoirien et que l'ACCI s'engage à combattre."},

    {"type": "cards", "columns": 4,
     "items": [
       {"icon": "fact", "title": "Fausses nouvelles", "text": "Rumeurs et intox qui sèment la peur et la confusion.", "href": "desinformation"},
       {"icon": "shield", "title": "Cyberharcèlement", "text": "Attaques répétées contre des personnes ciblées.", "href": "cyberharcelement"},
       {"icon": "warning", "title": "Discours de haine", "text": "Propos tribaux, religieux ou discriminatoires.", "href": "discours-haine"},
       {"icon": "money", "title": "Arnaques en ligne", "text": "Escroqueries, faux gains, usurpations d'identité.", "href": "cyber-escroquerie"},
       {"icon": "eye", "title": "Contenus explicites", "text": "Nudité et contenus choquants non maîtrisés.", "href": "contenus-explicites"},
       {"icon": "lock", "title": "Chantage & sextorsion", "text": "Extorsion à partir d'images intimes.", "href": "sextorsion"},
       {"icon": "key", "title": "Atteinte à la vie privée", "text": "Exposition de données et d'images sans consentement.", "href": "vie-privee"},
       {"icon": "alert", "title": "Défis dangereux", "text": "Challenges viraux qui mettent des vies en péril.", "href": "defis-dangereux"},
     ]},

    {"type": "cta", "title": "Vous êtes créateur de contenu ? Rejoignez le mouvement.",
     "text": "Ensemble, faisons des réseaux sociaux ivoiriens un espace dont nous pouvons être fiers.",
     "buttons": [
       {"label": "Adhérer à l'ACCI", "href": "adhesion", "style": "btn--light", "arrow": True},
       {"label": "Signer la charte", "href": "charte", "style": "btn--outline-light"},
     ]},

    {"type": "posts", "title": "Actualités & campagnes",
     "lead": "Suivez nos dernières actions de sensibilisation et nos prises de position.",
     "items": [
       {"category": "Campagne", "title": "#PartageVrai : vérifier avant de partager", "excerpt": "Une campagne nationale pour endiguer la propagation des fausses nouvelles pendant les périodes sensibles.", "date": "12 juin 2026", "href": "campagnes", "icon": "fact", "color": "orange"},
       {"category": "Événement", "title": "Forum du créateur responsable 2026", "excerpt": "Deux jours de rencontres, d'ateliers et de débats avec les acteurs du numérique ivoirien à Abidjan.", "date": "28 mai 2026", "href": "evenements", "icon": "calendar", "color": "green"},
       {"category": "Communiqué", "title": "L'ACCI appelle à une trêve numérique du harcèlement", "excerpt": "Face à la recrudescence des attaques en ligne, l'association lance un appel à la responsabilité collective.", "date": "03 mai 2026", "href": "communiques", "icon": "megaphone", "color": "deep"},
     ]},

    {"type": "quote",
     "text": "Créer du contenu, c'est prendre la parole devant des milliers de personnes. Avec cette audience vient une responsabilité que nous avons le devoir d'assumer.",
     "author": "Le Bureau exécutif de l'ACCI", "role": "Association des Créateurs de Contenu Ivoiriens"},
  ],
},

# 2 — À PROPOS --------------------------------------------------------------
{
  "slug": "a-propos",
  "title": "Qui sommes-nous",
  "section": "L'ACCI",
  "description": "Découvrez l'Association des Créateurs de Contenu Ivoiriens : son identité, ses membres et son engagement pour un numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "L'ACCI",
     "title": "Qui sommes-nous ?",
     "subtitle": "Une communauté de créateurs ivoiriens unie autour d'une ambition : faire du numérique un espace de progrès, de vérité et de respect."},

    {"type": "section", "title": "L'Association des Créateurs de Contenu Ivoiriens",
     "lead": "L'ACCI est une organisation à but non lucratif qui fédère les créateurs de contenu de Côte d'Ivoire.",
     "body": [
       "Influenceurs, blogueurs, vidéastes, podcasteurs, humoristes du web, photographes, illustrateurs et community managers : tous partagent un même espace d'expression — les réseaux sociaux — et une même responsabilité vis-à-vis du public ivoirien.",
       "Née du constat que le numérique ivoirien grandit plus vite que la culture du bon usage qui devrait l'accompagner, l'ACCI s'est donné pour mission de **promouvoir les bonnes pratiques** et de **lutter contre les dérives** qui fragilisent la confiance, la sécurité et la cohésion de notre société.",
       "Nous croyons que les créateurs ne sont pas le problème : ils sont une grande partie de la solution. En montrant l'exemple, en formant et en sensibilisant, ils peuvent transformer durablement la qualité de l'information et du débat en ligne.",
     ]},

    {"type": "cards", "columns": 3, "kicker": "Notre ADN", "title": "Ce qui nous définit",
     "items": [
       {"icon": "flag", "title": "Ivoirienne et citoyenne", "text": "Une initiative ancrée dans les réalités de la Côte d'Ivoire, au service de l'intérêt général."},
       {"icon": "users", "title": "Communautaire", "text": "Portée par les créateurs, pour les créateurs, dans un esprit d'entraide et de solidarité."},
       {"icon": "scale", "title": "Indépendante", "text": "Libre de toute appartenance partisane, guidée par l'éthique et le bien commun."},
       {"icon": "graduation", "title": "Pédagogique", "text": "Nous préférons éduquer et accompagner plutôt que stigmatiser."},
       {"icon": "shield", "title": "Protectrice", "text": "Aux côtés des victimes des dérives numériques et des plus vulnérables."},
       {"icon": "globe", "title": "Ouverte", "text": "À tous les talents, toutes les régions et toutes les plateformes."},
     ]},

    {"type": "split", "image": "communaute.jpg", "reverse": True,
     "alt": "Communauté de créateurs de contenu ivoiriens",
     "kicker": "Notre communauté", "title": "Des profils variés, une même conviction",
     "text": [
       "L'ACCI rassemble des créateurs aux audiences et aux thématiques diverses : éducation, humour, mode, cuisine, sport, entrepreneuriat, culture, technologie, santé…",
       "Cette diversité est notre force. Elle nous permet de toucher tous les publics et de porter le message du numérique responsable dans chaque communauté.",
     ],
     "bullets": [
       "Influenceurs et créateurs établis",
       "Jeunes talents et créateurs émergents",
       "Médias en ligne et webzines",
       "Agences, community managers et professionnels du digital",
     ]},

    {"type": "cta", "title": "Envie de contribuer à un numérique plus responsable ?",
     "text": "Rejoignez une communauté qui agit concrètement.",
     "buttons": [
       {"label": "Devenir membre", "href": "adhesion", "style": "btn--light", "arrow": True},
       {"label": "Nous contacter", "href": "contact", "style": "btn--outline-light"},
     ]},
  ],
},

# 3 — MISSION & VISION ------------------------------------------------------
{
  "slug": "mission-vision",
  "title": "Mission & vision",
  "section": "L'ACCI",
  "description": "La mission et la vision de l'ACCI : promouvoir un usage responsable des réseaux sociaux et bâtir un écosystème numérique sain en Côte d'Ivoire.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "L'ACCI",
     "title": "Notre mission & notre vision",
     "subtitle": "Pourquoi nous existons, et le numérique ivoirien que nous voulons construire."},

    {"type": "split", "icon": "flag",
     "kicker": "Notre mission", "title": "Promouvoir le bon usage, combattre les dérives",
     "text": [
       "La mission de l'ACCI est de **sensibiliser, former et mobiliser** la communauté des créateurs de contenu et le grand public autour d'un usage responsable des réseaux sociaux.",
       "Nous voulons réduire l'impact des mauvaises pratiques — désinformation, harcèlement, arnaques, atteintes à la dignité — tout en valorisant un contenu de qualité, utile et respectueux.",
     ],
     "bullets": [
       "Éduquer aux risques et aux bonnes pratiques",
       "Protéger les victimes et les publics vulnérables",
       "Professionnaliser la création de contenu",
       "Plaider pour un environnement numérique plus sûr",
     ]},

    {"type": "split", "icon": "compass", "reverse": True,
     "kicker": "Notre vision", "title": "Une Côte d'Ivoire numérique exemplaire",
     "text": [
       "Nous rêvons d'un espace numérique ivoirien où l'information est fiable, où le débat est respectueux, où les talents sont valorisés et où chacun — en particulier les jeunes — peut s'exprimer en sécurité.",
       "Une Côte d'Ivoire où être créateur de contenu est un métier reconnu, exercé avec éthique et fierté, et où les réseaux sociaux servent le progrès plutôt que la division.",
     ]},

    {"type": "cards", "columns": 4, "kicker": "Nos objectifs stratégiques", "title": "Quatre priorités, un même cap",
     "items": [
       {"icon": "lightbulb", "title": "Sensibiliser", "text": "Mener des campagnes d'envergure nationale sur les risques et les bonnes pratiques."},
       {"icon": "graduation", "title": "Former", "text": "Outiller les créateurs et le public en compétences numériques et en esprit critique."},
       {"icon": "shield", "title": "Protéger", "text": "Accompagner les victimes et défendre les droits des internautes."},
       {"icon": "scale", "title": "Plaider", "text": "Dialoguer avec les institutions et les plateformes pour un cadre plus sain."},
     ]},

    {"type": "callout", "variant": "success", "title": "Notre conviction",
     "text": ["Le changement durable ne viendra pas de la censure, mais de l'éducation, de la responsabilité et de l'exemplarité. C'est en élevant le niveau d'exigence de toute la communauté que nous assainirons l'espace numérique."]},

    {"type": "stats", "variant": "is-light", "title": "Nos ambitions à l'horizon 2030",
     "items": [
       {"value": "10 000", "suffix": "+", "label": "Personnes formées"},
       {"value": "100", "suffix": "%", "label": "Des régions touchées"},
       {"value": "500", "suffix": "+", "label": "Créateurs signataires de la charte"},
       {"value": "0", "label": "Tolérance pour le harcèlement"},
     ]},

    {"type": "cta", "title": "Partagez notre vision ?",
     "text": "Construisons ensemble le numérique ivoirien de demain.",
     "buttons": [{"label": "Rejoindre l'ACCI", "href": "adhesion", "style": "btn--light", "arrow": True}]},
  ],
},

# 4 — HISTOIRE --------------------------------------------------------------
{
  "slug": "histoire",
  "title": "Notre histoire",
  "section": "L'ACCI",
  "description": "De l'idée à l'association : retour sur la naissance et le développement de l'ACCI.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "L'ACCI",
     "title": "Notre histoire",
     "subtitle": "L'histoire d'une prise de conscience devenue mouvement collectif."},

    {"type": "section", "title": "Une réponse à un besoin urgent",
     "lead": "L'ACCI est née de la rencontre entre des créateurs lassés de voir le numérique ivoirien gangrené par les dérives.",
     "body": [
       "À mesure que les réseaux sociaux prenaient une place centrale dans la vie des Ivoiriens, un constat s'imposait : aux opportunités formidables s'ajoutaient des dangers grandissants. Fausses informations virales, campagnes de harcèlement, arnaques sophistiquées, exposition des mineurs… Les exemples se multipliaient.",
       "Plutôt que de subir, un groupe de créateurs a choisi d'agir. De discussions informelles en rencontres structurées, l'idée d'une association dédiée a pris forme.",
     ]},

    {"type": "timeline", "title": "Les grandes étapes",
     "items": [
       {"year": "2023", "title": "Les premières discussions", "text": "Un collectif informel de créateurs s'alarme de la dégradation du climat sur les réseaux sociaux ivoiriens et commence à échanger sur des solutions."},
       {"year": "2024", "title": "Naissance du projet ACCI", "text": "Le projet d'association se structure autour d'une charte, d'objectifs clairs et d'un premier noyau de membres fondateurs."},
       {"year": "2025", "title": "Création officielle", "text": "L'ACCI est constituée et adopte ses statuts. Le premier bureau exécutif est élu et les premières campagnes de sensibilisation sont lancées."},
       {"year": "2026", "title": "Déploiement national", "text": "Multiplication des formations, partenariats institutionnels, ouverture d'une cellule d'écoute et lancement du Forum du créateur responsable."},
     ]},

    {"type": "quote",
     "text": "Nous étions fatigués de commenter le problème. Nous avons décidé d'en devenir la solution.",
     "author": "Membres fondateurs", "role": "ACCI"},

    {"type": "cta", "title": "Écrivez la suite avec nous",
     "buttons": [{"label": "Devenir membre", "href": "adhesion", "style": "btn--light", "arrow": True}]},
  ],
},

# 5 — VALEURS ---------------------------------------------------------------
{
  "slug": "valeurs",
  "title": "Nos valeurs",
  "section": "L'ACCI",
  "description": "Les valeurs fondamentales qui guident l'action de l'ACCI : responsabilité, vérité, respect, solidarité.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "L'ACCI",
     "title": "Nos valeurs",
     "subtitle": "Les principes qui guident chacune de nos actions et chacun de nos engagements."},

    {"type": "cards", "columns": 3, "title": "Six valeurs cardinales",
     "items": [
       {"icon": "scale", "title": "Responsabilité", "text": "Assumer l'impact de ce que l'on publie. Chaque contenu touche des personnes réelles."},
       {"icon": "fact", "title": "Vérité", "text": "Privilégier l'information vérifiée, refuser la rumeur et la manipulation."},
       {"icon": "heart", "title": "Respect", "text": "Considérer la dignité de chacun, même dans le désaccord et la critique."},
       {"icon": "users", "title": "Solidarité", "text": "Se soutenir entre créateurs et tendre la main aux victimes de dérives."},
       {"icon": "lightbulb", "title": "Intégrité", "text": "Agir avec honnêteté, transparence et cohérence entre paroles et actes."},
       {"icon": "globe", "title": "Inclusion", "text": "Donner leur place à toutes les voix, toutes les régions, toutes les sensibilités."},
     ]},

    {"type": "callout", "variant": "info", "title": "Des valeurs en action",
     "text": ["Nos valeurs ne sont pas de simples mots : elles se traduisent dans notre charte, notre code de déontologie et l'ensemble de nos programmes. Elles constituent la boussole de l'ACCI."]},

    {"type": "split", "icon": "heart", "reverse": True,
     "kicker": "L'exemplarité avant tout", "title": "Donner l'exemple plutôt que la leçon",
     "text": [
       "Nous demandons à nos membres d'incarner ces valeurs dans leur propre pratique. On ne combat pas la désinformation en la pratiquant ; on ne défend pas le respect en humiliant.",
       "C'est par la cohérence et l'exemplarité que la communauté des créateurs gagnera la confiance du public et fera évoluer les comportements.",
     ],
     "cta": {"label": "Découvrir notre charte", "href": "charte"}},
  ],
},

# 6 — BUREAU EXÉCUTIF -------------------------------------------------------
{
  "slug": "bureau-executif",
  "title": "Bureau exécutif",
  "section": "L'ACCI",
  "description": "L'équipe dirigeante de l'ACCI et l'organisation de sa gouvernance.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Gouvernance",
     "title": "Le bureau exécutif",
     "subtitle": "Une équipe bénévole et engagée qui pilote l'association au quotidien."},

    {"type": "section", "title": "Une gouvernance au service du collectif",
     "lead": "L'ACCI est dirigée par un bureau exécutif élu par l'assemblée générale des membres.",
     "body": [
       "Le bureau met en œuvre les orientations décidées collectivement, coordonne les programmes et représente l'association auprès des partenaires et des institutions. Il rend compte de son action devant l'assemblée générale.",
     ]},

    {"type": "team", "title": "L'équipe dirigeante",
     "lead": "Des créateurs et professionnels du numérique mobilisés bénévolement.",
     "items": [
       {"name": "Présidence", "role": "Président(e) de l'ACCI", "bio": "Porte la vision de l'association, anime le bureau et la représente officiellement."},
       {"name": "Vice Présidence", "role": "Vice-président(e)", "bio": "Seconde la présidence et supervise les programmes stratégiques."},
       {"name": "Secrétariat Général", "role": "Secrétaire général(e)", "bio": "Assure la coordination administrative et le suivi des décisions."},
       {"name": "Trésorerie Générale", "role": "Trésorier(ère)", "bio": "Garantit la gestion financière transparente de l'association."},
       {"name": "Communication", "role": "Responsable communication", "bio": "Pilote les campagnes de sensibilisation et la présence en ligne de l'ACCI."},
       {"name": "Pôle Formation", "role": "Responsable formation", "bio": "Conçoit et déploie les ateliers et programmes pédagogiques."},
       {"name": "Pôle Juridique", "role": "Responsable juridique", "bio": "Encadre l'accompagnement juridique et le plaidoyer institutionnel."},
       {"name": "Cellule Écoute", "role": "Responsable cellule d'écoute", "bio": "Coordonne le soutien aux victimes de dérives numériques."},
       {"name": "Pôle Régions", "role": "Responsable des antennes", "bio": "Développe la présence de l'ACCI dans les régions du pays."},
     ]},

    {"type": "callout", "variant": "info", "title": "Vous souhaitez vous engager davantage ?",
     "text": ["Les membres actifs peuvent rejoindre les différents pôles de travail de l'association et participer à sa gouvernance. Contactez-nous pour en savoir plus."]},

    {"type": "cta", "title": "Rejoignez l'équipe des bénévoles",
     "buttons": [{"label": "Nous contacter", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 7 — STATUTS ---------------------------------------------------------------
{
  "slug": "statuts",
  "title": "Statuts & règlement intérieur",
  "section": "L'ACCI",
  "description": "Le cadre juridique de l'ACCI : statuts, règlement intérieur et fonctionnement de l'association.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Cadre juridique",
     "title": "Statuts & règlement intérieur",
     "subtitle": "Le cadre qui organise le fonctionnement transparent et démocratique de l'ACCI."},

    {"type": "section", "title": "Une association régie par des règles claires",
     "lead": "L'ACCI fonctionne selon des statuts et un règlement intérieur adoptés par ses membres.",
     "body": [
       "Ces textes définissent l'objet de l'association, les conditions d'adhésion, le rôle des organes de gouvernance, les modalités de prise de décision et les règles de transparence financière.",
       "Ils garantissent un fonctionnement démocratique, où chaque membre dispose d'une voix et où les dirigeants rendent compte de leur action.",
     ]},

    {"type": "accordion", "title": "Extraits des statuts",
     "items": [
       {"q": "Article 1 — Dénomination et objet", "a": ["Il est créé une association dénommée « Association des Créateurs de Contenu Ivoiriens » (ACCI). Elle a pour objet de promouvoir un usage responsable des réseaux sociaux, de lutter contre les mauvaises pratiques numériques et de défendre les intérêts des créateurs de contenu ivoiriens."]},
       {"q": "Article 2 — Siège social et durée", "a": ["Le siège social est établi à Abidjan. Il peut être transféré sur décision des organes compétents. L'association est constituée pour une durée indéterminée."]},
       {"q": "Article 3 — Membres", "a": ["L'association se compose de membres fondateurs, de membres actifs, de membres adhérents et de membres d'honneur. Les conditions d'adhésion et de perte de la qualité de membre sont précisées par le règlement intérieur."]},
       {"q": "Article 4 — Organes", "a": ["Les organes de l'association sont : l'Assemblée générale, le Bureau exécutif et, le cas échéant, les commissions et antennes régionales."]},
       {"q": "Article 5 — Ressources", "a": ["Les ressources de l'association proviennent des cotisations, des dons et legs, des subventions et de toute ressource autorisée par la loi. Leur emploi fait l'objet d'une gestion transparente."]},
     ]},

    {"type": "downloads", "title": "Documents officiels",
     "items": [
       {"title": "Statuts de l'ACCI", "text": "Version intégrale adoptée en assemblée générale.", "meta": "PDF"},
       {"title": "Règlement intérieur", "text": "Modalités détaillées de fonctionnement.", "meta": "PDF"},
       {"title": "Charte du créateur responsable", "text": "Engagements signés par les membres.", "meta": "PDF"},
     ]},

    {"type": "callout", "variant": "info",
     "text": ["Les documents présentés ici le sont à titre informatif. Pour toute demande officielle, veuillez nous contacter directement."]},
  ],
},

# 8 — PARTENAIRES -----------------------------------------------------------
{
  "slug": "partenaires",
  "title": "Nos partenaires",
  "section": "L'ACCI",
  "description": "Les institutions, entreprises et organisations qui soutiennent l'action de l'ACCI.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Ensemble",
     "title": "Nos partenaires",
     "subtitle": "Aucune transformation durable ne se fait seul. Nous bâtissons des alliances au service d'un numérique plus sain."},

    {"type": "section", "title": "Une dynamique partenariale",
     "lead": "L'ACCI collabore avec une diversité d'acteurs publics et privés.",
     "body": [
       "Pour démultiplier son impact, l'association tisse des liens avec les institutions publiques, les organisations de la société civile, les médias, les établissements d'enseignement et les entreprises du numérique.",
       "Ces partenariats prennent la forme de campagnes communes, de programmes de formation, de soutiens financiers ou logistiques, et de dialogues sur les politiques publiques numériques.",
     ]},

    {"type": "cards", "columns": 3, "title": "Avec qui nous travaillons",
     "items": [
       {"icon": "flag", "title": "Institutions publiques", "text": "Ministères, autorités de régulation et collectivités engagés pour un numérique responsable."},
       {"icon": "graduation", "title": "Écoles & universités", "text": "Pour sensibiliser la jeunesse et former la prochaine génération de créateurs."},
       {"icon": "megaphone", "title": "Médias", "text": "Pour amplifier nos campagnes et promouvoir une information de qualité."},
       {"icon": "globe", "title": "Plateformes numériques", "text": "Pour améliorer la modération et la protection des utilisateurs."},
       {"icon": "handshake", "title": "Société civile", "text": "ONG et associations partageant nos objectifs de protection et d'éducation."},
       {"icon": "money", "title": "Secteur privé", "text": "Entreprises mécènes soutenant nos programmes d'intérêt général."},
     ]},

    {"type": "split", "icon": "handshake", "reverse": True,
     "kicker": "Devenir partenaire", "title": "Associons nos forces",
     "text": [
       "Vous êtes une institution, une entreprise ou une organisation qui partage notre vision ? Plusieurs formes de collaboration sont possibles.",
       "Soutenir l'ACCI, c'est investir dans un espace numérique plus sûr, plus crédible et plus porteur pour la Côte d'Ivoire.",
     ],
     "bullets": [
       "Mécénat et soutien financier",
       "Co-construction de campagnes",
       "Mise à disposition d'expertise ou de moyens",
       "Programmes de formation conjoints",
     ],
     "cta": {"label": "Devenir partenaire", "href": "contact"}},

    {"type": "cta", "title": "Construisons un partenariat utile",
     "buttons": [{"label": "Nous contacter", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

]
