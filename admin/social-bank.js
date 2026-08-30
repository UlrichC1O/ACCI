/* =========================================================================
   ACCI — Banque de contenu pour les réseaux sociaux
   -------------------------------------------------------------------------
   Le CRM planifie déjà des publications (Marketing → Réseaux), mais il part
   d'une page blanche : rien n'y propose quoi publier. Ce module apporte le
   fonds éditorial — 1 500 publications — et le document imprimable qui permet
   de le faire circuler hors de l'écran (bureau, partenaire, prestataire).

   D'OÙ VIENNENT LES 1 500
     · 120 publications rédigées à la main, quinze pour chacun des huit
       services de l'association. Accroche, intention, appel à l'action et
       mots-dièse sont écrits : seul le visuel reste à produire.
     ·  1 380 combinaisons issues du croisement 25 thèmes × 12 formats ×
       10 angles (3 000 possibles). Ce sont des PISTES, pas des textes prêts :
       le document le dit à l'endroit où on les lit.
   Les 1 380 sont choisies par un pas de 7 sur les 3 000 : 7 est premier avec
   3 000, donc la suite ne repasse jamais deux fois au même endroit et les
   25 thèmes restent également représentés. Le tirage est reproductible —
   deux exports donnent le même document.

   POURQUOI PAS DE BIBLIOTHÈQUE PDF. Même raison que certificate.js : aucune
   dépendance ne peut être installée ici, et l'impression du navigateur rend
   un PDF vectoriel de qualité équivalente. Le document s'ouvre dans un onglet
   dédié pour que la feuille de style de l'administration ne s'en mêle pas.

   CE MODULE N'ÉCRIT RIEN TOUT SEUL. La banque est en lecture seule ; le
   chargement dans « Réseaux » est une action explicite, dédoublonnée, et qui
   procède par une écriture unique — Store.add() relit et réécrit la totalité
   du tableau à chaque appel, donc 1 500 appels auraient figé la page.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;
  var esc = A.ui.esc, $ = A.ui.$, toast = A.ui.toast;

  /* --------------------------------------------------------------------- */
  /* Feuille de style : chargée d'ici, comme pieces.js.                     */
  (function styles() {
    if (document.getElementById("acci-social-bank-css")) return;
    var l = document.createElement("link");
    l.id = "acci-social-bank-css";
    l.rel = "stylesheet";
    l.href = "/admin/social-bank.css";
    document.head.appendChild(l);
  })();

  var PILLARS = [
    {k:"adhesion",  n:"Adhésion & communauté",     c:"#F77F00", d:"Faire adhérer : badge Créateur responsable, catégories de membres, réseau d’entraide."},
    {k:"formation", n:"Formations & ateliers",     c:"#0B7A3B", d:"Remplir les sessions : professionnalisation, ateliers en région, programmes."},
    {k:"juridique", n:"Accompagnement juridique",  c:"#B34F00", d:"Faire connaître l’appui en cas de litige, d’atteinte aux droits ou de diffamation."},
    {k:"ecoute",    n:"Cellule d’écoute",          c:"#0B7A3B", d:"Faire savoir qu’un soutien confidentiel existe pour les personnes touchées."},
    {k:"signal",    n:"Signalement des abus",      c:"#B34F00", d:"Transformer le témoin passif en signalant : quoi, comment, et ce qui se passe ensuite."},
    {k:"ressource", n:"Ressources & guides",       c:"#F77F00", d:"Générer du téléchargement : chartes, guides, kits et supports libres."},
    {k:"campagne",  n:"Campagnes de sensibilisation", c:"#0B7A3B", d:"Porter les douze champs d’action auprès du grand public."},
    {k:"institut",  n:"Presse & partenariats",     c:"#B34F00", d:"Crédibiliser l’association auprès des médias, institutions et partenaires."}
  ];

  var IDEAS = [
  /* --- 1. Adhésion & communauté --------------------------------------- */
  {i:1,p:"adhesion",f:"Reel",t:"« Pourquoi j’ai rejoint l’ACCI »",d:"Trois membres, quinze secondes chacun, filmés là où ils créent. Une seule question posée hors champ, aucune réponse écrite à l’avance.",c:"Devenir membre → adhesion",h:"#ACCI #CréateurResponsable #CôteDIvoire"},
  {i:2,p:"adhesion",f:"Carrousel",t:"Six avantages concrets du badge Créateur responsable",d:"Une diapositive par avantage, illustrée d’un cas réel. Terminer par la démarche en trois étapes.",c:"Découvrir les avantages → adhesion",h:"#ACCI #BadgeACCI #Créateurs"},
  {i:3,p:"adhesion",f:"Post image",t:"Le badge ACCI, ça veut dire quoi exactement ?",d:"Visuel du badge en grand, avec la phrase d’engagement de la charte en légende. Répondre à la confusion fréquente : ce n’est pas une certification d’État.",c:"Lire la charte → charte",h:"#ACCI #BadgeACCI #Déontologie"},
  {i:4,p:"adhesion",f:"Story",t:"Es-tu déjà membre d’une association de créateurs ?",d:"Sondage à deux options, puis diapositive de résultats le lendemain avec le lien d’adhésion.",c:"Adhérer → adhesion",h:"#ACCI #Créateurs"},
  {i:5,p:"adhesion",f:"Infographie",t:"Adhérent, actif, bienfaiteur : trois façons de rejoindre l’ACCI",d:"Tableau en trois colonnes reprenant les catégories de membres, pour qui et l’engagement demandé.",c:"Choisir sa catégorie → adhesion",h:"#ACCI #Adhésion"},
  {i:6,p:"adhesion",f:"Témoignage vidéo",t:"Portrait — un mois dans la vie d’un membre actif",d:"Suivre un membre d’un pôle : réunion, atelier, publication. Montrer le travail, pas la carte de membre.",c:"Rejoindre un pôle → adhesion",h:"#ACCI #Communauté"},
  {i:7,p:"adhesion",f:"Thread X",t:"Créer seul ou créer en réseau : ce que ça change vraiment",d:"Fil de huit messages, chacun un bénéfice mesurable du collectif. Sourcer les affirmations.",c:"Rejoindre le réseau → adhesion",h:"#ACCI #Créateurs #CôteDIvoire"},
  {i:8,p:"adhesion",f:"Live",t:"Vos questions sur l’adhésion, en direct",d:"Trente minutes avec un membre du bureau exécutif. Annoncer trois jours avant, collecter les questions en story.",c:"Poser une question → contact",h:"#ACCI #Live #Adhésion"},
  {i:9,p:"adhesion",f:"Article LinkedIn",t:"Pourquoi la Côte d’Ivoire avait besoin d’une association de créateurs",d:"Texte de fond signé du bureau : le constat, la réponse, ce qui a été fait la première année.",c:"Découvrir l’association → a-propos",h:"#ACCI #ÉconomieCréative #CôteDIvoire"},
  {i:10,p:"adhesion",f:"Reel",t:"Adhérer à l’ACCI en trente secondes, chrono",d:"Capture d’écran filmée du parcours réel, du formulaire à la confirmation. Aucune étape coupée.",c:"Commencer → adhesion",h:"#ACCI #Adhésion #TutoRapide"},
  {i:11,p:"adhesion",f:"Carrousel",t:"Ce que l’ACCI fait de votre adhésion",d:"Transparence financière : à quoi servent les cotisations, poste par poste. Rassure les hésitants.",c:"Consulter les statuts → statuts",h:"#ACCI #Transparence"},
  {i:12,p:"adhesion",f:"Post image",t:"Nous venons de franchir un cap",d:"Publier chaque jalon de membres atteint, avec remerciement nominatif aux dix derniers inscrits qui l’acceptent.",c:"Rejoindre le mouvement → adhesion",h:"#ACCI #Communauté #Merci"},
  {i:13,p:"adhesion",f:"Story",t:"Dans les coulisses d’une réunion du bureau",d:"Séquence de stories brutes, sans montage : ordre du jour, débat, décision. Humanise l’institution.",c:"Voir le bureau → bureau-executif",h:"#ACCI #Coulisses"},
  {i:14,p:"adhesion",f:"Sondage",t:"Quel avantage vous ferait adhérer aujourd’hui ?",d:"Quatre options : formations, appui juridique, réseau, visibilité. Le résultat oriente les publications du mois suivant.",c:"Adhérer → adhesion",h:"#ACCI #Adhésion"},
  {i:15,p:"adhesion",f:"Vidéo YouTube",t:"Une journée avec un créateur membre de l’ACCI",d:"Format long de huit minutes : matinée de tournage, atelier ACCI l’après-midi, montage le soir.",c:"Devenir membre → adhesion",h:"#ACCI #Créateurs #CôteDIvoire"},

  /* --- 2. Formations & ateliers ---------------------------------------- */
  {i:16,p:"formation",f:"Reel",t:"Trois réglages à changer avant ton prochain tournage",d:"Extrait d’atelier filmé, un formateur ACCI face caméra. Donner la valeur avant de vendre la formation.",c:"Voir le calendrier → formations",h:"#ACCI #Formation #Créateurs"},
  {i:17,p:"formation",f:"Carrousel",t:"Le programme complet de nos ateliers, module par module",d:"Une diapositive par module, avec la durée et le niveau requis. Terminer sur les dates ouvertes.",c:"S’inscrire → formations",h:"#ACCI #Formation"},
  {i:18,p:"formation",f:"Post image",t:"Prochaine session à Bouaké : les inscriptions sont ouvertes",d:"Visuel d’annonce avec ville, date, nombre de places. Décliner pour chaque région couverte.",c:"Réserver sa place → formations",h:"#ACCI #Formation #Bouaké"},
  {i:19,p:"formation",f:"Témoignage vidéo",t:"« Avant l’atelier, je publiais sans stratégie »",d:"Un ancien participant, six mois après. Montrer un avant/après chiffré de sa chaîne, avec son accord.",c:"S’inscrire → formations",h:"#ACCI #Formation #Témoignage"},
  {i:20,p:"formation",f:"Story",t:"L’atelier commence dans une heure",d:"Compte à rebours en direct depuis la salle : installation, arrivée des participants, premier exercice.",c:"Suivre les prochaines dates → formations",h:"#ACCI #Formation #EnDirect"},
  {i:21,p:"formation",f:"Infographie",t:"Du débutant au professionnel : le parcours de formation ACCI",d:"Schéma de progression en quatre paliers, avec les compétences acquises à chaque étape.",c:"Trouver son niveau → formations",h:"#ACCI #Formation #Parcours"},
  {i:22,p:"formation",f:"Thread X",t:"Dix erreurs de débutant que l’on corrige à chaque atelier",d:"Une erreur par message, avec la correction. Le fil sert de démonstration du contenu de la formation.",c:"Se former → formations",h:"#ACCI #Formation #Conseils"},
  {i:23,p:"formation",f:"Live",t:"Atelier ouvert : monter une vidéo courte sans logiciel payant",d:"Une heure de démonstration en direct, outils gratuits uniquement. Rediffusion conservée en épinglé.",c:"Voir les formations complètes → formations",h:"#ACCI #Formation #Montage"},
  {i:24,p:"formation",f:"Vidéo YouTube",t:"L’atelier de Bouaké, du premier au dernier jour",d:"Rétrospective de dix minutes : le lieu, les formateurs, les productions des participants.",c:"Participer à la prochaine → formations",h:"#ACCI #Formation #Reportage"},
  {i:25,p:"formation",f:"Post image",t:"Ce que les participants ont produit en deux jours",d:"Mosaïque des travaux réalisés pendant l’atelier, avec le prénom de chaque auteur.",c:"S’inscrire → formations",h:"#ACCI #Formation #Portfolio"},
  {i:26,p:"formation",f:"Carrousel",t:"Faut-il du matériel cher pour commencer ? Non.",d:"Comparatif honnête : ce qu’on peut faire avec un téléphone, ce qui justifie vraiment un investissement.",c:"Guide du débutant → guide-debutant",h:"#ACCI #Formation #Matériel"},
  {i:27,p:"formation",f:"Sondage",t:"Quel module vous manque le plus ?",d:"Quatre options issues du programme réel. Les résultats orientent la programmation du trimestre.",c:"Proposer un thème → contact",h:"#ACCI #Formation"},
  {i:28,p:"formation",f:"Capsule podcast",t:"Se professionnaliser quand on crée depuis une chambre",d:"Vingt minutes avec deux formateurs. Diffuser en audio et en extraits vidéo verticaux.",c:"Se former avec l’ACCI → formations",h:"#ACCI #Podcast #Formation"},
  {i:29,p:"formation",f:"Article LinkedIn",t:"Former les créateurs, c’est structurer une filière",d:"Argumentaire destiné aux partenaires et bailleurs : le lien entre formation et économie créative.",c:"Devenir partenaire → partenaires",h:"#ACCI #ÉconomieCréative #Formation"},
  {i:30,p:"formation",f:"Reel",t:"Une astuce d’atelier par semaine",d:"Série récurrente, format court et identique chaque semaine. La régularité construit l’audience.",c:"Tout le programme → formations",h:"#ACCI #Formation #Astuce"},

  /* --- 3. Accompagnement juridique ------------------------------------- */
  {i:31,p:"juridique",f:"Carrousel",t:"Diffamation, injure, dénigrement : ce ne sont pas la même chose",d:"Trois définitions claires, un exemple par cas, et ce que l’ACCI peut faire dans chaque situation.",c:"Demander un accompagnement → accompagnement-juridique",h:"#ACCI #Droit #Diffamation"},
  {i:32,p:"juridique",f:"Post image",t:"On a utilisé votre vidéo sans votre accord. Vous avez des droits.",d:"Visuel sobre, une phrase forte, et le rappel du principe de droit d’auteur applicable.",c:"Vos droits d’auteur → droits-auteur",h:"#ACCI #DroitDAuteur #Créateurs"},
  {i:33,p:"juridique",f:"Thread X",t:"Que faire dans les 48 heures après une atteinte à votre e-réputation",d:"Marche à suivre en sept messages : capturer, dater, signaler, conserver, ne pas répondre publiquement.",c:"Être accompagné → accompagnement-juridique",h:"#ACCI #Droit #EReputation"},
  {i:34,p:"juridique",f:"Article LinkedIn",t:"Le cadre juridique du contenu en ligne en Côte d’Ivoire",d:"Texte de référence à destination des médias et institutions. Faire relire par le pôle juridique.",c:"Nous contacter → contact",h:"#ACCI #Droit #CôteDIvoire"},
  {i:35,p:"juridique",f:"Reel",t:"« Est-ce que j’ai le droit de filmer ça ? »",d:"Trois situations du quotidien, trois réponses en quinze secondes. Toujours renvoyer vers un conseil personnalisé.",c:"Poser sa question → accompagnement-juridique",h:"#ACCI #Droit #Tournage"},
  {i:36,p:"juridique",f:"Infographie",t:"Le parcours d’un dossier, du signalement à l’orientation",d:"Schéma en cinq étapes de ce que fait concrètement l’ACCI quand un créateur la sollicite.",c:"Ouvrir un dossier → accompagnement-juridique",h:"#ACCI #Droit #Accompagnement"},
  {i:37,p:"juridique",f:"Carrousel",t:"Contrat de partenariat : cinq clauses à ne jamais signer les yeux fermés",d:"Une clause par diapositive, formulée simplement, avec la conséquence concrète d’une signature hâtive.",c:"Faire relire un contrat → accompagnement-juridique",h:"#ACCI #Contrat #Monétisation"},
  {i:38,p:"juridique",f:"Post image",t:"La capture d’écran seule ne suffit pas comme preuve",d:"Expliquer ce qui constitue un élément recevable et comment conserver une trace exploitable.",c:"Se faire accompagner → accompagnement-juridique",h:"#ACCI #Droit #Preuve"},
  {i:39,p:"juridique",f:"Live",t:"Une heure avec un juriste : vos questions sans filtre",d:"Direct mensuel. Rappeler en ouverture que l’échange informe et oriente, sans remplacer un avocat.",c:"Poser une question → contact",h:"#ACCI #Live #Droit"},
  {i:40,p:"juridique",f:"Vidéo YouTube",t:"Ils ont été diffamés : trois créateurs racontent la suite",d:"Format long, visages floutés si nécessaire. Insister sur la sortie de crise, pas sur l’agression.",c:"Être accompagné → accompagnement-juridique",h:"#ACCI #Diffamation #Témoignage"},
  {i:41,p:"juridique",f:"Story",t:"Vrai ou faux : « en ligne, tout est permis »",d:"Sondage à deux options, suivi d’une diapositive de correction sourcée.",c:"En savoir plus → accompagnement-juridique",h:"#ACCI #Droit"},
  {i:42,p:"juridique",f:"Carrousel",t:"Monétisation : ce que le fisc et la loi attendent de vous",d:"Rappel des obligations d’un créateur qui perçoit des revenus. Renvoyer vers la page monétisation éthique.",c:"Monétiser proprement → monetisation-ethique",h:"#ACCI #Monétisation #Droit"},
  {i:43,p:"juridique",f:"Capsule podcast",t:"Créer sans se mettre en danger juridiquement",d:"Trente minutes avec le pôle juridique. Découper en cinq extraits verticaux pour les réseaux courts.",c:"Nos services juridiques → accompagnement-juridique",h:"#ACCI #Podcast #Droit"},
  {i:44,p:"juridique",f:"Thread X",t:"Les mots qui engagent votre responsabilité sans que vous le sachiez",d:"Analyse de formulations courantes en commentaire ou en direct, et de leur portée juridique.",c:"Se former au droit → accompagnement-juridique",h:"#ACCI #Droit #Responsabilité"},
  {i:45,p:"juridique",f:"Post image",t:"Un litige ? Ne restez pas seul.",d:"Visuel institutionnel avec les coordonnées et les horaires du pôle. À republier chaque mois.",c:"Nous écrire → contact",h:"#ACCI #Accompagnement #Droit"},

  /* --- 4. Cellule d'écoute --------------------------------------------- */
  {i:46,p:"ecoute",f:"Post image",t:"Quelqu’un vous écoute, et cela reste entre nous",d:"Visuel calme, sans photo de victime. Coordonnées de la cellule et rappel de la confidentialité.",c:"Contacter la cellule → cellule-ecoute",h:"#ACCI #CelluleDÉcoute #Soutien"},
  {i:47,p:"ecoute",f:"Carrousel",t:"Comment se passe un premier échange avec la cellule d’écoute",d:"Cinq diapositives qui lèvent les freins : qui répond, combien de temps, ce qui est noté, ce qui ne l’est jamais.",c:"Prendre contact → cellule-ecoute",h:"#ACCI #CelluleDÉcoute"},
  {i:48,p:"ecoute",f:"Reel",t:"Trois signes qu’un proche subit du harcèlement en ligne",d:"Adressé à l’entourage, pas à la victime. Voix posée, aucun effet dramatisant.",c:"Trouver de l’aide → cellule-ecoute",h:"#ACCI #Cyberharcèlement #Prévention"},
  {i:49,p:"ecoute",f:"Story",t:"Ce que vous vivez a un nom",d:"Série de stories nommant les situations : cyberharcèlement, sextorsion, exposition de la vie privée. Nommer aide à demander de l’aide.",c:"Parler à quelqu’un → cellule-ecoute",h:"#ACCI #Soutien"},
  {i:50,p:"ecoute",f:"Infographie",t:"Confidentialité : ce que la cellule fait et ne fait jamais",d:"Deux colonnes nettes. Aucune ambiguïté : c’est la condition pour que les gens osent écrire.",c:"Nous écrire → cellule-ecoute",h:"#ACCI #Confidentialité"},
  {i:51,p:"ecoute",f:"Témoignage vidéo",t:"« J’ai attendu six mois avant d’en parler »",d:"Témoignage anonymisé, voix modifiée ou comédien lisant un récit réel avec accord écrit. Jamais de victime identifiable.",c:"Ne pas attendre → cellule-ecoute",h:"#ACCI #Témoignage #Soutien"},
  {i:52,p:"ecoute",f:"Post image",t:"Vous n’êtes pas responsable de ce qui vous arrive",d:"Message de déculpabilisation, typographie sobre sur fond vert institutionnel.",c:"Cellule d’écoute → cellule-ecoute",h:"#ACCI #Soutien #Bienveillance"},
  {i:53,p:"ecoute",f:"Carrousel",t:"Parents : comment ouvrir la conversation avec votre adolescent",d:"Cinq amorces de dialogue concrètes, et trois phrases à éviter absolument.",c:"Protection des mineurs → protection-mineurs",h:"#ACCI #Parents #Prévention"},
  {i:54,p:"ecoute",f:"Live",t:"Rencontre avec l’équipe de la cellule d’écoute",d:"Direct sans témoignage de victime : présenter les personnes, la méthode, les limites du service.",c:"Poser une question → contact",h:"#ACCI #Live #CelluleDÉcoute"},
  {i:55,p:"ecoute",f:"Thread X",t:"Ce qu’il ne faut jamais dire à quelqu’un qui subit du harcèlement",d:"Six phrases courantes et bien intentionnées qui aggravent la situation, avec l’alternative.",c:"Orienter vers la cellule → cellule-ecoute",h:"#ACCI #Cyberharcèlement"},
  {i:56,p:"ecoute",f:"Reel",t:"Chantage à la vidéo intime : les trois premiers réflexes",d:"Ne pas payer, ne pas supprimer, conserver les preuves. Ton factuel, aucune image suggestive.",c:"Sextorsion → sextorsion",h:"#ACCI #Sextorsion #Prévention"},
  {i:57,p:"ecoute",f:"Post image",t:"La cellule d’écoute en chiffres cette année",d:"Nombre de sollicitations et délai moyen de réponse, uniquement si les données sont vérifiées.",c:"Nous solliciter → cellule-ecoute",h:"#ACCI #Bilan #Soutien"},
  {i:58,p:"ecoute",f:"Capsule podcast",t:"Écouter sans juger : le métier de l’accueil",d:"Entretien avec un écoutant sur la posture d’accueil. Utile aussi pour recruter des bénévoles.",c:"Rejoindre l’équipe → contact",h:"#ACCI #Podcast #Écoute"},
  {i:59,p:"ecoute",f:"Story",t:"Où trouver de l’aide, ce soir",d:"Story récurrente du vendredi soir, moment de forte exposition. Coordonnées et horaires uniquement.",c:"Cellule d’écoute → cellule-ecoute",h:"#ACCI #Soutien"},
  {i:60,p:"ecoute",f:"Carrousel",t:"Le harcèlement en ligne ne s’arrête pas à l’écran",d:"Conséquences réelles documentées : scolarité, sommeil, travail. Sourcer chaque affirmation.",c:"Demander du soutien → cellule-ecoute",h:"#ACCI #Cyberharcèlement #Santé"},

  /* --- 5. Signalement des abus ----------------------------------------- */
  {i:61,p:"signal",f:"Reel",t:"Signaler prend trente secondes. Voilà comment.",d:"Capture d’écran filmée du formulaire de signalement, du début à la confirmation.",c:"Signaler un abus → signaler-abus",h:"#ACCI #Signalement #AgirEnLigne"},
  {i:62,p:"signal",f:"Carrousel",t:"Que devient un signalement après votre envoi ?",d:"Cinq étapes, du dépôt à l’orientation. La transparence sur le traitement augmente les signalements.",c:"Faire un signalement → signaler-abus",h:"#ACCI #Signalement #Transparence"},
  {i:63,p:"signal",f:"Post image",t:"Vous n’êtes pas obligé d’être la victime pour signaler",d:"Lever le principal frein : le témoin peut agir. Message court, visuel institutionnel.",c:"Signaler → signaler-abus",h:"#ACCI #Signalement #Témoin"},
  {i:64,p:"signal",f:"Infographie",t:"Que peut-on signaler à l’ACCI, et que faut-il porter ailleurs",d:"Deux colonnes honnêtes. Orienter vers les autorités compétentes quand ce n’est pas du ressort de l’association.",c:"Comprendre → signaler-abus",h:"#ACCI #Signalement"},
  {i:65,p:"signal",f:"Thread X",t:"Comment documenter un abus avant qu’il ne disparaisse",d:"Marche à suivre : capture datée, adresse du contenu, contexte, témoins. Sans preuve, pas de suite possible.",c:"Signaler avec les preuves → signaler-abus",h:"#ACCI #Signalement #Preuve"},
  {i:66,p:"signal",f:"Story",t:"Avez-vous déjà signalé un contenu ?",d:"Sondage, puis diapositive expliquant pourquoi si peu de gens le font et comment y remédier.",c:"Signaler → signaler-abus",h:"#ACCI #Signalement"},
  {i:67,p:"signal",f:"Reel",t:"Ce commentaire est-il une opinion ou un délit ?",d:"Trois exemples limites analysés en quinze secondes chacun. Renvoyer vers le pôle juridique.",c:"En savoir plus → discours-haine",h:"#ACCI #DiscoursDeHaine #Signalement"},
  {i:68,p:"signal",f:"Carrousel",t:"Signaler sur chaque plateforme : le mode d’emploi",d:"Une diapositive par réseau, capture d’écran du chemin exact. Contenu à mettre à jour deux fois par an.",c:"Puis signaler à l’ACCI → signaler-abus",h:"#ACCI #Signalement #Tuto"},
  {i:69,p:"signal",f:"Post image",t:"Le silence protège celui qui nuit",d:"Affiche de campagne, une seule phrase, logo en bas à droite. Décliner en affichage physique.",c:"Signaler un abus → signaler-abus",h:"#ACCI #Campagne #Signalement"},
  {i:70,p:"signal",f:"Vidéo YouTube",t:"Enquête : comment circule une rumeur en Côte d’Ivoire",d:"Format long documentaire, retraçant la propagation d’une fausse information réelle et déjà démentie.",c:"Vérifier l’information → verification-information",h:"#ACCI #Désinformation #Enquête"},
  {i:71,p:"signal",f:"Live",t:"Modération : pourquoi vos signalements restent parfois sans suite",d:"Direct pédagogique sur les limites des plateformes et le rôle complémentaire de l’ACCI.",c:"Signaler → signaler-abus",h:"#ACCI #Live #Modération"},
  {i:72,p:"signal",f:"Sondage",t:"Qu’est-ce qui vous empêche de signaler ?",d:"Quatre freins courants : peur, méconnaissance, découragement, indifférence. Traiter le gagnant en publication dédiée.",c:"Signaler → signaler-abus",h:"#ACCI #Signalement"},
  {i:73,p:"signal",f:"Carrousel",t:"Arnaque en ligne : les six signaux qui doivent alerter",d:"Un signal par diapositive, tiré de cas réellement signalés à l’association.",c:"Escroqueries en ligne → cyber-escroquerie",h:"#ACCI #Escroquerie #Prévention"},
  {i:74,p:"signal",f:"Post image",t:"Bilan trimestriel des signalements",d:"Trois chiffres vérifiés et une tendance commentée. Publier chaque trimestre à date fixe.",c:"Signaler → signaler-abus",h:"#ACCI #Bilan #Signalement"},
  {i:75,p:"signal",f:"Thread X",t:"Défis dangereux : reconnaître ce qui met vraiment en danger",d:"Décrire les mécanismes sans jamais nommer ni montrer le défi, pour ne pas lui faire de publicité.",c:"Défis à risque → defis-dangereux",h:"#ACCI #Prévention #Jeunes"},

  /* --- 6. Ressources & guides ------------------------------------------ */
  {i:76,p:"ressource",f:"Post image",t:"La Charte du créateur responsable, à télécharger",d:"Visuel du document, une phrase d’engagement mise en avant, lien direct vers le téléchargement.",c:"Télécharger la charte → charte",h:"#ACCI #Charte #Créateurs"},
  {i:77,p:"ressource",f:"Carrousel",t:"Cinq guides ACCI, et à qui chacun s’adresse",d:"Une diapositive par guide : le public visé, ce qu’on y trouve, le temps de lecture.",c:"Accéder aux ressources → ressources",h:"#ACCI #Ressources #Guides"},
  {i:78,p:"ressource",f:"Reel",t:"Le guide du débutant, feuilleté en vingt secondes",d:"Filmer le document en main ou à l’écran, page après page, sur un rythme soutenu.",c:"Télécharger → guide-debutant",h:"#ACCI #GuideDébutant"},
  {i:79,p:"ressource",f:"Infographie",t:"Sécuriser ses comptes : la checklist en huit points",d:"Visuel autonome, utile même sans cliquer. Renvoyer vers le guide complet pour le détail.",c:"Sécurité numérique → securite-numerique",h:"#ACCI #SécuritéNumérique"},
  {i:80,p:"ressource",f:"Story",t:"Nouveau guide disponible",d:"Trois stories : couverture, extrait, lien. Réutiliser à chaque parution.",c:"Télécharger → ressources",h:"#ACCI #Ressources"},
  {i:81,p:"ressource",f:"Carrousel",t:"Vérifier une information en quatre gestes",d:"Recouper la source, dater l’image, chercher l’original, attendre avant de partager. Un geste par diapositive.",c:"Le guide complet → verification-information",h:"#ACCI #Désinformation #Vérification"},
  {i:82,p:"ressource",f:"Post image",t:"Le glossaire du numérique, en français simple",d:"Mettre en avant trois termes expliqués. Le glossaire complet reste sur le site.",c:"Consulter le glossaire → glossaire",h:"#ACCI #Glossaire #Numérique"},
  {i:83,p:"ressource",f:"Thread X",t:"Le code de déontologie de l’ACCI, article par article",d:"Un article par message, formulé en langage courant, avec un exemple d’application.",c:"Lire le code → deontologie",h:"#ACCI #Déontologie"},
  {i:84,p:"ressource",f:"Reel",t:"Trois réglages de confidentialité à changer maintenant",d:"Démonstration à l’écran sur le réseau le plus utilisé par l’audience visée.",c:"Protéger sa vie privée → vie-privee",h:"#ACCI #ViePrivée #Sécurité"},
  {i:85,p:"ressource",f:"Post image",t:"Kit de campagne : les visuels sont libres de droits",d:"Inviter les membres à relayer avec les visuels officiels. Fournir le lien de téléchargement.",c:"Récupérer le kit → ressources",h:"#ACCI #Campagne #Kit"},
  {i:86,p:"ressource",f:"Carrousel",t:"Bonnes pratiques : dix règles tenables au quotidien",d:"Dix règles issues de la page dédiée, formulées à l’impératif, applicables dès le jour même.",c:"Bonnes pratiques → bonnes-pratiques",h:"#ACCI #BonnesPratiques"},
  {i:87,p:"ressource",f:"Vidéo YouTube",t:"Tout le guide du débutant, commenté",d:"Format long où un formateur commente chaque chapitre. Ajouter des chapitres horodatés.",c:"Télécharger le guide → guide-debutant",h:"#ACCI #GuideDébutant #Formation"},
  {i:88,p:"ressource",f:"Sondage",t:"Quel guide vous manque encore ?",d:"Quatre propositions de sujets non couverts. Le résultat alimente la production de l’année suivante.",c:"Proposer un sujet → contact",h:"#ACCI #Ressources"},
  {i:89,p:"ressource",f:"Story",t:"Un terme du glossaire par jour",d:"Série quotidienne courte, très peu coûteuse à produire, qui entretient la présence.",c:"Le glossaire → glossaire",h:"#ACCI #Glossaire"},
  {i:90,p:"ressource",f:"Capsule podcast",t:"Monétiser sans trahir son audience",d:"Discussion de vingt-cinq minutes sur la monétisation éthique, avec deux créateurs invités.",c:"Monétisation éthique → monetisation-ethique",h:"#ACCI #Podcast #Monétisation"},

  /* --- 7. Campagnes de sensibilisation --------------------------------- */
  {i:91,p:"campagne",f:"Post image",t:"Une rumeur partagée mille fois reste une rumeur",d:"Affiche de campagne, phrase unique, palette institutionnelle. Décliner en plusieurs formats.",c:"Vérifier avant de partager → desinformation",h:"#ACCI #Désinformation #Campagne"},
  {i:92,p:"campagne",f:"Reel",t:"Ce que ça fait de recevoir cent messages de haine",d:"Mise en scène sobre, sans victime réelle : les notifications défilent, le son monte, puis silence.",c:"Cyberharcèlement → cyberharcelement",h:"#ACCI #Cyberharcèlement #Campagne"},
  {i:93,p:"campagne",f:"Carrousel",t:"Les douze dérives que l’ACCI combat",d:"Une diapositive par champ d’action, avec la définition en une phrase et le lien vers la page dédiée.",c:"Nos champs d’action → notre-combat",h:"#ACCI #Sensibilisation"},
  {i:94,p:"campagne",f:"Vidéo YouTube",t:"Film de campagne : « Derrière chaque écran »",d:"Court-métrage de trois minutes, tourné à Abidjan avec des comédiens. Pièce maîtresse de la campagne annuelle.",c:"Rejoindre la campagne → campagnes",h:"#ACCI #Campagne #CôteDIvoire"},
  {i:95,p:"campagne",f:"Story",t:"Partagez-vous avant de vérifier ?",d:"Sondage sans jugement, suivi d’une diapositive avec les quatre gestes de vérification.",c:"Vérifier l’information → verification-information",h:"#ACCI #Désinformation"},
  {i:96,p:"campagne",f:"Infographie",t:"Comment une fausse information se propage en 24 heures",d:"Chronologie visuelle en six paliers, fondée sur un cas réel déjà démenti publiquement.",c:"Comprendre → desinformation",h:"#ACCI #Désinformation #Infographie"},
  {i:97,p:"campagne",f:"Thread X",t:"Discours de haine : où s’arrête la liberté d’expression",d:"Fil pédagogique appuyé sur le droit ivoirien. Faire relire par le pôle juridique avant publication.",c:"Discours de haine → discours-haine",h:"#ACCI #LibertéDExpression #Droit"},
  {i:98,p:"campagne",f:"Post image",t:"Protéger les mineurs, ce n’est pas les surveiller",d:"Message adressé aux parents, ton non culpabilisant, visuel doux.",c:"Protection des mineurs → protection-mineurs",h:"#ACCI #Parents #Mineurs"},
  {i:99,p:"campagne",f:"Reel",t:"Le défi qui a envoyé un adolescent à l’hôpital",d:"Raconter le mécanisme sans nommer le défi ni montrer les gestes. Terminer sur les ressources d’aide.",c:"Défis à risque → defis-dangereux",h:"#ACCI #Prévention #Jeunes"},
  {i:100,p:"campagne",f:"Carrousel",t:"Reconnaître une escroquerie amoureuse en ligne",d:"Six signaux, tirés de cas signalés à l’association, avec la conduite à tenir.",c:"Escroqueries → cyber-escroquerie",h:"#ACCI #Escroquerie #Prévention"},
  {i:101,p:"campagne",f:"Live",t:"Table ronde : jeunes, écrans et santé mentale",d:"Direct d’une heure avec un psychologue, un enseignant et un créateur. Rediffusion en podcast.",c:"Nos campagnes → campagnes",h:"#ACCI #Live #SantéMentale"},
  {i:102,p:"campagne",f:"Témoignage vidéo",t:"« J’ai partagé une fausse information, et je m’en excuse »",d:"Témoignage rare et fort d’un créateur assumant une erreur. Valorise l’honnêteté plutôt que la perfection.",c:"Vérifier l’information → verification-information",h:"#ACCI #Désinformation #Témoignage"},
  {i:103,p:"campagne",f:"Post image",t:"Compte à rebours : la campagne démarre lundi",d:"Série de trois visuels sur trois jours pour installer l’attente avant le lancement.",c:"Suivre la campagne → campagnes",h:"#ACCI #Campagne"},
  {i:104,p:"campagne",f:"Carrousel",t:"Ce que la campagne a changé, en chiffres",d:"Bilan de fin de campagne : portée, signalements, adhésions. Uniquement des données vérifiées.",c:"Voir le bilan → campagnes",h:"#ACCI #Bilan #Campagne"},
  {i:105,p:"campagne",f:"Capsule podcast",t:"Sensibiliser sans faire peur",d:"Échange méthodologique sur la communication de prévention. Intéresse aussi les partenaires institutionnels.",c:"Nos campagnes → campagnes",h:"#ACCI #Podcast #Prévention"},

  /* --- 8. Presse & partenariats ---------------------------------------- */
  {i:106,p:"institut",f:"Article LinkedIn",t:"Un an d’action : le bilan de l’ACCI",d:"Rapport public résumé en article : réalisations, chiffres vérifiés, perspectives. Publier à date anniversaire.",c:"Consulter le bilan → a-propos",h:"#ACCI #Bilan #CôteDIvoire"},
  {i:107,p:"institut",f:"Post image",t:"Nouveau partenariat signé",d:"Photo de signature, logos des deux structures, une phrase sur l’objet du partenariat.",c:"Nos partenaires → partenaires",h:"#ACCI #Partenariat"},
  {i:108,p:"institut",f:"Carrousel",t:"Ce que l’ACCI peut apporter à votre institution",d:"Argumentaire en cinq points destiné aux ministères, écoles et entreprises.",c:"Devenir partenaire → partenaires",h:"#ACCI #Partenariat #Institutions"},
  {i:109,p:"institut",f:"Post image",t:"Espace presse : nos ressources pour les journalistes",d:"Annoncer la mise à disposition du dossier de presse, des visuels et des contacts.",c:"Espace presse → espace-presse",h:"#ACCI #Presse #Médias"},
  {i:110,p:"institut",f:"Vidéo YouTube",t:"Qui sommes-nous ? L’ACCI en trois minutes",d:"Film de présentation institutionnel. Pièce de référence à épingler sur tous les réseaux.",c:"Découvrir l’ACCI → a-propos",h:"#ACCI #Présentation"},
  {i:111,p:"institut",f:"Article LinkedIn",t:"Les créateurs de contenu, un secteur économique à structurer",d:"Tribune destinée aux décideurs publics. Chiffres sourcés obligatoires.",c:"Travailler avec nous → partenaires",h:"#ACCI #ÉconomieCréative #CôteDIvoire"},
  {i:112,p:"institut",f:"Post image",t:"L’ACCI dans la presse cette semaine",d:"Revue de presse visuelle : titres, logos des médias, extraits. Publier chaque vendredi utile.",c:"Espace presse → espace-presse",h:"#ACCI #Presse"},
  {i:113,p:"institut",f:"Carrousel",t:"Le bureau exécutif, visage par visage",d:"Une diapositive par membre : fonction, parcours, domaine de responsabilité.",c:"Le bureau → bureau-executif",h:"#ACCI #Gouvernance"},
  {i:114,p:"institut",f:"Live",t:"Assemblée générale : les grandes décisions expliquées",d:"Direct après l’assemblée pour restituer les décisions aux membres qui n’ont pas pu venir.",c:"Nos statuts → statuts",h:"#ACCI #Gouvernance #Live"},
  {i:115,p:"institut",f:"Thread X",t:"Comment l’ACCI est née, et pourquoi maintenant",d:"Récit fondateur en dix messages. À republier chaque année à la date anniversaire.",c:"Notre histoire → histoire",h:"#ACCI #Histoire"},
  {i:116,p:"institut",f:"Post image",t:"Communiqué : la position de l’ACCI",d:"Gabarit réutilisable pour chaque prise de position officielle. Toujours daté et signé.",c:"Nos communiqués → communiques",h:"#ACCI #Communiqué"},
  {i:117,p:"institut",f:"Infographie",t:"L’ACCI en un coup d’œil",d:"Fiche d’identité : mission, champs d’action, services, implantation. Utile aux journalistes pressés.",c:"Espace presse → espace-presse",h:"#ACCI #Presse #Institution"},
  {i:118,p:"institut",f:"Témoignage vidéo",t:"Un partenaire raconte pourquoi il travaille avec l’ACCI",d:"Interview courte d’un représentant partenaire. Crédibilise auprès des futurs partenaires.",c:"Devenir partenaire → partenaires",h:"#ACCI #Partenariat #Témoignage"},
  {i:119,p:"institut",f:"Story",t:"En route pour le forum",d:"Stories de déplacement lors d’un événement : arrivée, intervention, rencontres.",c:"Nos événements → evenements",h:"#ACCI #Événement"},
  {i:120,p:"institut",f:"Capsule podcast",t:"Construire une association crédible en partant de zéro",d:"Entretien avec le bureau sur la structuration. Destiné aux autres associations et aux bailleurs.",c:"Notre histoire → histoire",h:"#ACCI #Podcast #Gouvernance"}
  ];

  var THEMES = [
    {n:"la désinformation",           s:"desinformation",           a:"grand public",   claim:"une information partagée par un proche est forcément fiable"},
    {n:"le cyberharcèlement",         s:"cyberharcelement",         a:"jeunes",         claim:"bloquer suffit à faire cesser le harcèlement"},
    {n:"les escroqueries en ligne",   s:"cyber-escroquerie",        a:"grand public",   claim:"seules les personnes naïves se font arnaquer"},
    {n:"la diffamation",              s:"diffamation",              a:"créateurs",      claim:"on peut tout dire tant qu’on précise « à mon avis »"},
    {n:"les discours de haine",       s:"discours-haine",           a:"grand public",   claim:"un commentaire haineux relève de la simple opinion"},
    {n:"la protection des mineurs",   s:"protection-mineurs",       a:"parents",        claim:"interdire les réseaux protège vraiment un adolescent"},
    {n:"les contenus explicites",     s:"contenus-explicites",      a:"parents",        claim:"les filtres des plateformes suffisent à protéger les enfants"},
    {n:"le chantage à la vidéo intime", s:"sextorsion",             a:"jeunes",         claim:"payer met fin au chantage"},
    {n:"la vie privée en ligne",      s:"vie-privee",               a:"créateurs",      claim:"un compte privé met les publications à l’abri"},
    {n:"les défis dangereux",         s:"defis-dangereux",          a:"parents",        claim:"les défis en ligne restent un jeu sans conséquence"},
    {n:"la charte du créateur",       s:"charte",                   a:"créateurs",      claim:"signer une charte n’engage à rien de concret"},
    {n:"les bonnes pratiques",        s:"bonnes-pratiques",         a:"créateurs",      claim:"créer responsable fait perdre de l’audience"},
    {n:"le code de déontologie",      s:"deontologie",              a:"créateurs",      claim:"la déontologie ne concerne que les journalistes"},
    {n:"les débuts d’un créateur",    s:"guide-debutant",           a:"débutants",      claim:"il faut du matériel coûteux pour commencer"},
    {n:"la monétisation éthique",     s:"monetisation-ethique",     a:"créateurs",      claim:"toute monétisation trahit forcément l’audience"},
    {n:"les droits d’auteur",         s:"droits-auteur",            a:"créateurs",      claim:"citer l’auteur dispense de demander l’autorisation"},
    {n:"la vérification de l’information", s:"verification-information", a:"grand public", claim:"une photo constitue une preuve suffisante"},
    {n:"la sécurité numérique",       s:"securite-numerique",       a:"créateurs",      claim:"un mot de passe compliqué suffit à tout protéger"},
    {n:"l’adhésion",                  s:"adhesion",                 a:"créateurs",      claim:"l’association ne s’adresse qu’aux créateurs déjà connus"},
    {n:"les formations",              s:"formations",               a:"créateurs",      claim:"se former ne sert à rien quand on a déjà une audience"},
    {n:"l’accompagnement juridique",  s:"accompagnement-juridique", a:"créateurs",      claim:"faire valoir ses droits coûte forcément très cher"},
    {n:"la cellule d’écoute",         s:"cellule-ecoute",           a:"grand public",   claim:"il faut avoir porté plainte pour être écouté"},
    {n:"le signalement d’un abus",    s:"signaler-abus",            a:"grand public",   claim:"signaler ne change jamais rien"},
    {n:"les ressources et guides",    s:"ressources",               a:"grand public",   claim:"les guides sont réservés aux membres"},
    {n:"les partenariats",            s:"partenaires",              a:"institutions",   claim:"une association citoyenne ne pèse pas face aux plateformes"}
  ];

  var FORMATS = [
    {n:"Reel",             p:"Vertical, moins de 30 secondes, accroche visuelle dès la première image."},
    {n:"Carrousel",        p:"Six à huit diapositives, une idée par diapositive, appel à l’action sur la dernière."},
    {n:"Post image",       p:"Un visuel, une phrase. Le texte long va en légende, pas sur l’image."},
    {n:"Story",            p:"Trois écrans maximum, avec un autocollant sondage ou question."},
    {n:"Live",             p:"Trente à soixante minutes, annoncé trois jours avant, rediffusion épinglée."},
    {n:"Vidéo YouTube",    p:"Format long avec chapitres horodatés et description renvoyant vers le site."},
    {n:"Thread X",         p:"Six à dix messages, un argument par message, source dans le dernier."},
    {n:"Article LinkedIn", p:"Texte de fond signé, destiné aux institutions, médias et partenaires."},
    {n:"Sondage",          p:"Quatre options au maximum ; les résultats orientent la publication suivante."},
    {n:"Infographie",      p:"Visuel autonome, compréhensible sans légende, réutilisable en affichage."},
    {n:"Témoignage vidéo", p:"Accord écrit obligatoire ; anonymiser dès qu’une victime est concernée."},
    {n:"Capsule podcast",  p:"Vingt à trente minutes, découpé ensuite en extraits verticaux."}
  ];

  /* Dix manières de raconter un même thème sans se répéter. « t » compose le
     titre, « w » dit ce que la publication doit faire. Écrit en ES5 comme le
     reste de l'administration : ni fonction fléchée ni gabarit de chaîne. */
  var ANGLES = [
    {n:"Le mythe à déconstruire", w:"Énoncer l’idée reçue, la corriger, sourcer la correction.",
     t:function(t){return "Vrai ou faux : « " + t.claim + " »";}},
    {n:"Le témoignage", w:"Un récit à la première personne, anonymisé si nécessaire.",
     t:function(t){return "Ils l’ont vécu : " + t.n;}},
    {n:"Le chiffre qui interpelle", w:"Un seul chiffre, sa source à l’écran, ce qu’il implique concrètement.",
     t:function(t){return "Le chiffre à connaître sur " + t.n;}},
    {n:"Le pas-à-pas", w:"Quatre étapes numérotées, réalisables le jour même.",
     t:function(t){return cap(t.n) + " : la marche à suivre, étape par étape";}},
    {n:"L’erreur fréquente", w:"Nommer l’erreur, montrer sa conséquence, donner la correction.",
     t:function(t){return "L’erreur que presque tout le monde commet avec " + t.n;}},
    {n:"La question ouverte", w:"Poser la question, répondre en commentaire, compiler les réponses ensuite.",
     t:function(t){return "Et vous, comment gérez-vous " + t.n + " ?";}},
    {n:"Avant / après", w:"Deux situations comparées, même personne, même contexte.",
     t:function(t){return "Avant / après : ce que change une bonne pratique face " + aA(t.n);}},
    {n:"Le rappel juridique", w:"Faire relire par le pôle juridique avant toute publication.",
     t:function(t){return "Ce que dit la loi ivoirienne sur " + t.n;}},
    {n:"La checklist", w:"Cinq à huit points cochables, visuel réutilisable en affichage.",
     t:function(t){return "La checklist ACCI — " + t.n;}},
    {n:"Les coulisses de l’ACCI", w:"Montrer la méthode et les personnes, pas seulement le résultat.",
     t:function(t){return "Dans les coulisses : comment l’ACCI traite " + t.n;}}
  ];

  /* --------------------------------------------------------------------- */
  /* Construction des 1 500                                                 */
  /* --------------------------------------------------------------------- */

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* Contraction de « à » avec l'article : à+le=au, à+les=aux. Sans elle,
     l'angle « Avant / après » produisait « face à le cyberharcèlement ». */
  function aA(n) {
    if (n.indexOf("les ") === 0) return "aux " + n.slice(4);
    if (n.indexOf("le ") === 0) return "au " + n.slice(3);
    return "à " + n;
  }

  /* Chaque format a un réseau naturel : c'est ce qui remplit la colonne
     « Plateforme » de Marketing → Réseaux, qui n'accepte que ces six valeurs. */
  var PLATFORM = {
    "Reel": "Instagram", "Carrousel": "Instagram", "Story": "Instagram",
    "Post image": "Facebook", "Live": "Facebook", "Infographie": "Facebook",
    "Vidéo YouTube": "YouTube", "Témoignage vidéo": "YouTube", "Capsule podcast": "YouTube",
    "Thread X": "X (Twitter)", "Sondage": "X (Twitter)",
    "Article LinkedIn": "LinkedIn"
  };
  function platformOf(fmt) { return PLATFORM[fmt] || "Facebook"; }

  var PILLAR_OF = {};
  PILLARS.forEach(function (p) { PILLAR_OF[p.k] = p.n; });

  var TOTAL = 1500, STRIDE = 7, SPACE = 3000;

  /* Les 1 380 pistes. Un quota par thème plutôt qu'un pas unique sur les
     3 000 : le pas unique laissait certains thèmes à 51 pistes et d'autres à
     69, ce qui se voyait dans le document. 1 380 = 25 × 55 + 5, donc cinq
     thèmes en portent 56 et les vingt autres 55.
     À l'intérieur d'un thème, le pas de 7 sur les 120 couples format × angle
     (7 est premier avec 120) évite de prendre douze fois le même format. */
  function generated() {
    var want = TOTAL - IDEAS.length;
    var per = Math.floor(want / THEMES.length);
    var extra = want % THEMES.length;
    var out = [];
    THEMES.forEach(function (t, ti) {
      var n = per + (ti < extra ? 1 : 0);
      for (var k = 0; k < n; k++) {
        var rem = (k * 7) % 120;
        var fi = Math.floor(rem / 10), ai = rem % 10;
        var f = FORMATS[fi], g = ANGLES[ai];
        out.push({
          ref: "G-" + String(ti * 120 + rem + 1).padStart(4, "0"),
          kind: "piste",
          theme: cap(t.n), themeIdx: ti,
          format: f.n, angle: g.n, audience: t.a,
          title: g.t(t), note: g.w + " " + f.p, cta: t.s
        });
      }
    });
    return out;
  }

  function written() {
    return IDEAS.map(function (it) {
      return {
        ref: "#" + String(it.i).padStart(3, "0"),
        kind: "rédigée",
        theme: PILLAR_OF[it.p] || it.p, pillar: it.p,
        format: it.f, angle: "", audience: "",
        title: it.t, note: it.d, cta: it.c, tags: it.h
      };
    });
  }

  var BANK = null;
  function bank() { if (!BANK) BANK = written().concat(generated()); return BANK; }

  /* Texte déposé dans le champ « Contenu » de Marketing → Réseaux. */
  function contentOf(r) {
    var s = r.title + "\n\n" + r.note + "\n\nRenvoyer vers : " + r.cta;
    if (r.tags) s += "\n" + r.tags;
    return s + "\n[" + r.ref + "]";
  }

  /* --------------------------------------------------------------------- */
  /* Onglet « Banque » — consultation et filtres                            */
  /* --------------------------------------------------------------------- */

  var flt = { kind: "", pillar: "", format: "", q: "" };

  function match(r) {
    if (flt.kind && r.kind !== flt.kind) return false;
    if (flt.pillar && r.pillar !== flt.pillar) return false;
    if (flt.format && r.format !== flt.format) return false;
    if (flt.q) {
      var hay = (r.ref + " " + r.title + " " + r.note + " " + r.theme + " " +
                 r.format + " " + r.cta + " " + (r.tags || "")).toLowerCase();
      if (hay.indexOf(flt.q) < 0) return false;
    }
    return true;
  }

  function opts(list, sel, blank) {
    var h = '<option value="">' + esc(blank) + "</option>";
    list.forEach(function (o) {
      h += '<option value="' + esc(o.v) + '"' + (sel === o.v ? " selected" : "") +
           ">" + esc(o.l) + "</option>";
    });
    return h;
  }

  function bankHTML() {
    var all = bank(), rows = all.filter(match);
    var fmts = {}; all.forEach(function (r) { fmts[r.format] = 1; });
    var fmtList = Object.keys(fmts).sort().map(function (f) { return { v: f, l: f }; });
    var pilList = PILLARS.map(function (p) { return { v: p.k, l: p.n }; });

    /* 400 lignes au maximum : la vue est une consultation, pas un export.
       Le document PDF, lui, contient toujours les 1 500. */
    var shown = rows.slice(0, 400);

    var h = '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title">Banque de contenu ACCI</h2></div>' +
      '<div class="stat-row">' +
        '<div class="stat-box"><div class="stat-box__val">' + all.length + '</div><div class="stat-box__label">Publications</div></div>' +
        '<div class="stat-box"><div class="stat-box__val">' + IDEAS.length + '</div><div class="stat-box__label">Rédigées</div></div>' +
        '<div class="stat-box"><div class="stat-box__val">' + (all.length - IDEAS.length) + '</div><div class="stat-box__label">Pistes générées</div></div>' +
        '<div class="stat-box"><div class="stat-box__val">' + PILLARS.length + '</div><div class="stat-box__label">Piliers</div></div>' +
      '</div>' +
      '<div class="sb-filters">' +
        '<label>Type<select id="sb-kind">' + opts([{v:"rédigée",l:"Rédigées"},{v:"piste",l:"Pistes générées"}], flt.kind, "Tous") + '</select></label>' +
        '<label>Pilier<select id="sb-pillar">' + opts(pilList, flt.pillar, "Tous les piliers") + '</select></label>' +
        '<label>Format<select id="sb-format">' + opts(fmtList, flt.format, "Tous les formats") + '</select></label>' +
        '<label>Rechercher<input type="search" id="sb-q" value="' + esc(flt.q) + '" placeholder="mot-clé, thème, service…"></label>' +
        '<span class="sb-count"><b>' + rows.length + '</b> résultat' + (rows.length > 1 ? "s" : "") + '</span>' +
      '</div>';

    if (!rows.length) {
      h += '<p class="muted sb-empty">Aucune publication ne correspond à ces critères.</p></section>';
      return h;
    }

    h += '<div class="dtable"><table><thead><tr>' +
      '<th>Réf.</th><th>Type</th><th>Thème / pilier</th><th>Format</th><th>Réseau</th><th>Accroche</th><th>Renvoi</th>' +
      '</tr></thead><tbody>';
    shown.forEach(function (r) {
      h += "<tr>" +
        '<td class="sb-ref">' + esc(r.ref) + "</td>" +
        '<td><span class="badge badge--' + (r.kind === "rédigée" ? "ok" : "brouillon") + '">' + esc(r.kind) + "</span></td>" +
        "<td>" + esc(r.theme) + "</td>" +
        "<td>" + esc(r.format) + "</td>" +
        "<td>" + esc(platformOf(r.format)) + "</td>" +
        '<td class="sb-title">' + esc(r.title) + "</td>" +
        '<td class="sb-cta">' + esc(r.cta) + "</td>" +
      "</tr>";
    });
    h += "</tbody></table></div>";
    if (rows.length > shown.length) {
      h += '<p class="muted sb-more">' + (rows.length - shown.length) +
           ' autres lignes ne sont pas affichées ici. Le document PDF contient la totalité.</p>';
    }
    return h + "</section>";
  }

  function bindBank() {
    function set(id, key, ev) {
      var el = $("#" + id); if (!el) return;
      el.addEventListener(ev, function () {
        flt[key] = ev === "input" ? el.value.trim().toLowerCase() : el.value;
        A.refresh();
      });
    }
    set("sb-kind", "kind", "change");
    set("sb-pillar", "pillar", "change");
    set("sb-format", "format", "change");
    set("sb-q", "q", "input");
  }

  /* --------------------------------------------------------------------- */
  /* Onglet « Document » — PDF téléchargeable                               */
  /* --------------------------------------------------------------------- */

  function docHTML() {
    return '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title">Document à télécharger</h2></div>' +
      '<p class="muted">Le document rassemble les <b>' + TOTAL + ' publications</b> : les ' +
        IDEAS.length + ' rédigées, puis les ' + (TOTAL - IDEAS.length) + ' pistes classées par thème. ' +
        'Il s’ouvre dans un onglet dédié et la fenêtre d’impression s’affiche seule : ' +
        'choisissez <b>« Enregistrer au format PDF »</b> comme destination.</p>' +
      '<p class="muted sb-hint">Aucune bibliothèque PDF n’est installée dans l’administration. ' +
        'L’impression du navigateur produit un PDF vectoriel — le texte y reste sélectionnable ' +
        'et le tampon net à toutes les échelles.</p>' +
      '<div class="btnrow">' +
        '<button class="abtn abtn--primary abtn--sm" id="sb-pdf"><i data-ic=download></i> Télécharger le document PDF</button>' +
        '<button class="abtn abtn--ghost abtn--sm" id="sb-csv"><i data-ic=doc></i> Exporter en CSV</button>' +
      '</div>' +

      '<div class="sb-sep"></div>' +
      '<h3 class="sb-h3">Charger dans Marketing → Réseaux</h3>' +
      '<p class="muted">Optionnel. Crée une publication au statut « Brouillon » par entrée, ' +
        'planifiée à raison de cinq par semaine à partir de lundi prochain. ' +
        'Les entrées déjà chargées sont ignorées, un second clic ne double donc rien.</p>' +
      '<p class="muted sb-warn">Le CRM conserve ses données dans ce navigateur, dont l’espace est ' +
        'limité (environ 5 Mo, partagés avec les membres, les photos et les factures). ' +
        '' + TOTAL + ' publications occupent près de 500 Ko. Exportez une sauvegarde avant, ' +
        'depuis Réglages → Exporter.</p>' +
      '<div class="btnrow">' +
        '<button class="abtn abtn--ghost abtn--sm" id="sb-seed">Charger les ' + TOTAL + ' publications</button>' +
        '<span class="sb-seedmsg" id="sb-seedmsg"></span>' +
      '</div>' +
    '</section>';
  }

  /* Cinq publications par semaine, du lundi au vendredi. */
  function schedule(i) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));   /* lundi prochain */
    d.setDate(d.getDate() + Math.floor(i / 5) * 7 + (i % 5));
    return d.toISOString().slice(0, 10);
  }

  function seed() {
    var raw, list;
    try { raw = JSON.parse(localStorage.getItem("acci_social")); } catch (e) { raw = null; }
    list = Array.isArray(raw) ? raw : [];

    /* Dédoublonnage sur la référence laissée en fin de contenu. */
    var seen = {};
    list.forEach(function (p) {
      var m = /\[((?:#|G-)[0-9]{3,4})\]\s*$/.exec(String(p.content || ""));
      if (m) seen[m[1]] = 1;
    });

    var fresh = [], i = 0;
    bank().forEach(function (r) {
      if (seen[r.ref]) return;
      fresh.push({
        id: "sb-" + r.ref.replace(/[^0-9A-Za-z]/g, ""),
        platform: platformOf(r.format),
        content: contentOf(r),
        scheduledDate: schedule(i++),
        status: "Brouillon",
        createdAt: new Date().toISOString()
      });
    });

    if (!fresh.length) { toast("Tout est déjà chargé : rien à ajouter."); return; }

    /* Une seule écriture : Store.add() relit et réécrit tout le tableau à
       chaque appel, donc 1 500 appels auraient bloqué l'onglet. */
    try {
      localStorage.setItem("acci_social", JSON.stringify(fresh.concat(list)));
    } catch (e) {
      toast("Espace de stockage insuffisant : rien n’a été chargé.", "err");
      var m0 = $("#sb-seedmsg");
      if (m0) m0.textContent = "Échec — libérez de l’espace puis réessayez.";
      return;
    }
    toast(fresh.length + " publication(s) chargée(s) dans Réseaux.");
    var m = $("#sb-seedmsg");
    if (m) m.textContent = fresh.length + " ajoutée(s), " +
      (bank().length - fresh.length) + " déjà présente(s).";
  }

  function csv() {
    var head = ["reference", "type", "theme", "format", "reseau", "accroche", "intention", "renvoi", "motsdiese"];
    var lines = [head.join(";")];
    bank().forEach(function (r) {
      lines.push([r.ref, r.kind, r.theme, r.format, platformOf(r.format),
                  r.title, r.note, r.cta, r.tags || ""]
        .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(";"));
    });
    var blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "acci-banque-contenu-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    toast(TOTAL + " publications exportées.");
  }

  function bindDoc() {
    var p = $("#sb-pdf"); if (p) p.addEventListener("click", openPrintable);
    var c = $("#sb-csv"); if (c) c.addEventListener("click", csv);
    var s = $("#sb-seed"); if (s) s.addEventListener("click", seed);
  }

  /* --------------------------------------------------------------------- */
  /* Le document imprimable                                                 */
  /* --------------------------------------------------------------------- */

  /* Espace fine insécable : « 1 500 », et jamais « 1500 » ni une coupure de
     ligne au milieu du nombre. */
  function nb(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f"); }

  /* Coordonnées de l'association. Celles compilées dans le site datent de la
     mise en production ; celles qui font foi sont dans les réglages
     (Identité du site), et elles ont changé. Un document destiné à circuler
     ne peut pas imprimer une adresse périmée, d'où la lecture avant tirage.
     Repli sur les valeurs compilées si la lecture échoue. */
  var IDENT = {
    "site.long_name": "Association des Créateurs de Contenu Ivoiriens",
    "site.email": "contact@acci.ci",
    "site.phone": "+225 27 22 00 00 00",
    "site.address": "Cocody, Riviera Golf — Abidjan, Côte d’Ivoire"
  };
  function ident(k) { return IDENT[k] || ""; }

  function loadIdentity() {
    var SB = window.ACCI_SB;
    if (!SB || !SB.url) return Promise.resolve();
    return fetch(SB.url + "/rest/v1/site_settings?select=key,value", { headers: SB.authHeaders() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        (Array.isArray(rows) ? rows : []).forEach(function (row) {
          if (row && typeof row.key === "string" && row.value != null &&
              String(row.value) !== "" && IDENT.hasOwnProperty(row.key)) {
            IDENT[row.key] = String(row.value);
          }
        });
      })
      .catch(function () { /* le repli compilé suffit */ });
  }

  var MONTHS = ["janvier","février","mars","avril","mai","juin","juillet",
                "août","septembre","octobre","novembre","décembre"];
  function longDate(d) {
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function printCSS() {
    return '@page{size:A4;margin:16mm 14mm 14mm}' +
    'html,body{margin:0;padding:0}' +
    'body{font:10.5pt/1.5 "Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#22302a;background:#fff;' +
      '-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    'h1,h2,h3,h4{font-family:"Sora",Georgia,serif;color:#0B3D2E;margin:0;line-height:1.2}' +
    '.seal{display:block}' +
    /* couverture */
    '.cover{height:245mm;display:flex;flex-direction:column;justify-content:space-between;break-after:page}' +
    '.cover__logo{height:24mm;width:auto}' +
    '.cover__eyebrow{font-size:8pt;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#B34F00;margin:14mm 0 4mm}' +
    '.cover h1{font-size:30pt;letter-spacing:-.02em;max-width:150mm}' +
    '.cover__sub{margin-top:6mm;font-size:12pt;color:#4a5a52;max-width:130mm}' +
    '.cover__bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:10mm;' +
      'border-top:.4mm solid #d8e2dc;padding-top:6mm}' +
    '.cover__meta{font-size:9pt;color:#5b6b63}' +
    '.cover__meta b{color:#14201b;font-weight:600}' +
    '.cover__meta p{margin:0 0 1.5mm}' +
    /* sections */
    '.part{break-before:page}' +
    '.part__num{font-size:8pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B34F00}' +
    '.part h2{font-size:18pt;margin:2mm 0 3mm}' +
    '.part__lede{font-size:10pt;color:#5b6b63;max-width:150mm;margin-bottom:7mm}' +
    '.grp{break-inside:avoid;margin-bottom:7mm}' +
    '.grp__t{font-size:11pt;color:#0B7A3B;border-bottom:.4mm solid #e1e9e4;padding-bottom:2mm;margin-bottom:4mm}' +
    /* publications rédigées */
    '.w{break-inside:avoid;margin-bottom:5mm;padding-left:16mm;position:relative}' +
    '.w__ref{position:absolute;left:0;top:0;font-family:"Sora",Georgia,serif;font-weight:700;' +
      'font-size:9pt;color:#B34F00;font-variant-numeric:tabular-nums}' +
    '.w__fmt{font-size:7.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0B7A3B}' +
    '.w__t{font-family:"Sora",Georgia,serif;font-weight:700;font-size:10.5pt;color:#14201b;margin:.8mm 0 1.2mm}' +
    '.w__d{font-size:9.5pt;color:#3d4a44;margin:0}' +
    '.w__c{font-size:8.5pt;color:#5b6b63;margin:1.2mm 0 0}' +
    '.w__c b{color:#B34F00}' +
    /* pistes générées */
    '.pistes{column-count:2;column-gap:8mm}' +
    '.g{break-inside:avoid;margin-bottom:4mm}' +
    '.g p{margin:0}' +
    '.g__t{font-family:"Sora",Georgia,serif;font-weight:700;font-size:9.5pt;color:#14201b;line-height:1.3}' +
    '.g__a{font-size:8pt;color:#0B7A3B;margin-top:.6mm}' +
    '.g__f{font-size:7.8pt;color:#6b776f;line-height:1.5;margin-top:.6mm}' +
    '.g__ref{font-family:"Sora",Georgia,serif;font-weight:700;color:#B34F00;font-variant-numeric:tabular-nums}' +
    '.foot{margin-top:8mm;border-top:.4mm solid #d8e2dc;padding-top:3mm;font-size:8pt;color:#6b776f}';
  }

  /* Tampon du document. Volontairement PAS celui de certificate.js : celui-là
     porte « Certifié — créateur responsable », la mention remise à un membre.
     Apposée sur un plan de communication interne, elle laisserait croire que
     le document atteste de quelque chose. Celui-ci ne dit que son origine. */
  function docSeal(now) {
    var INK = "#0B3D2E";
    return '' +
    '<svg class="seal" viewBox="0 0 220 220" width="150" height="150" ' +
        'role="img" aria-label="Tampon de l\'ACCI" style="transform:rotate(-6deg)">' +
      '<defs>' +
        '<path id="sb-arc-t" d="M 110,110 m -84,0 a 84,84 0 1,1 168,0" fill="none"/>' +
        '<path id="sb-arc-b" d="M 110,110 m -80,6 a 80,80 0 1,0 160,0" fill="none"/>' +
      '</defs>' +
      '<circle cx="110" cy="110" r="98" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="110" cy="110" r="90" fill="none" stroke="' + INK + '" stroke-width="1"/>' +
      '<circle cx="110" cy="110" r="66" fill="none" stroke="' + INK + '" stroke-width="1"/>' +
      '<text font-family="Georgia,serif" font-size="8.4" font-weight="700" fill="' + INK + '" ' +
        'letter-spacing="1.1">' +
        '<textPath href="#sb-arc-t" startOffset="50%" text-anchor="middle" textLength="250">' +
          'ASSOCIATION DES CRÉATEURS DE CONTENU IVOIRIENS' +
        '</textPath></text>' +
      '<text font-family="Georgia,serif" font-size="8" font-weight="700" fill="' + INK + '" ' +
        'letter-spacing="1.4">' +
        '<textPath href="#sb-arc-b" startOffset="50%" text-anchor="middle" textLength="150">' +
          'ABIDJAN · CÔTE D\'IVOIRE' +
        '</textPath></text>' +
      '<text x="110" y="103" text-anchor="middle" font-family="Georgia,serif" ' +
        'font-size="26" font-weight="700" fill="' + INK + '" letter-spacing="2">ACCI</text>' +
      '<line x1="76" y1="114" x2="144" y2="114" stroke="' + INK + '" stroke-width="1"/>' +
      '<text x="110" y="129" text-anchor="middle" font-family="Georgia,serif" ' +
        'font-size="8.6" font-weight="700" fill="' + INK + '" letter-spacing="1.2">BANQUE DE CONTENU</text>' +
      '<text x="110" y="143" text-anchor="middle" font-family="Georgia,serif" ' +
        'font-size="7.6" fill="' + INK + '">' + esc(longDate(now)) + '</text>' +
    '</svg>';
  }

  function coverHTML(now) {
    var seal = docSeal(now);
    return '<section class="cover">' +
      '<div>' +
        '<img class="cover__logo" src="' + location.origin + '/assets/img/logo-wordmark-480.png" alt="ACCI">' +
        '<p class="cover__eyebrow">Document de travail · Communication</p>' +
        '<h1>Banque de contenu — ' + nb(TOTAL) + ' publications</h1>' +
        '<p class="cover__sub">Le fonds éditorial de l’association pour ses six réseaux sociaux : ' +
          nb(IDEAS.length) + ' publications rédigées, prêtes à programmer, et ' + nb(TOTAL - IDEAS.length) +
          ' pistes à retravailler, classées par thème.</p>' +
      '</div>' +
      '<div class="cover__bottom">' +
        '<div class="cover__meta">' +
          '<p><b>' + esc(ident("site.long_name")) + '</b></p>' +
          '<p>' + esc(ident("site.address")) + '</p>' +
          '<p>' + esc(ident("site.email")) + ' · ' + esc(ident("site.phone")) + '</p>' +
          '<p style="margin-top:4mm">Établi le <b>' + longDate(now) + '</b> · Version <b>1.0</b></p>' +
        '</div>' +
        seal +
      '</div>' +
    '</section>';
  }

  function writtenPartHTML() {
    var h = '<section class="part"><p class="part__num">Partie 1</p>' +
      '<h2>' + nb(IDEAS.length) + ' publications rédigées</h2>' +
      '<p class="part__lede">Quinze par service. L’accroche est le texte à afficher dès la première ' +
        'seconde ; l’intention dit quoi montrer. Chaque publication renvoie à une page du site : ' +
        'sans lien, elle ne vend aucun service.</p>';
    PILLARS.forEach(function (p) {
      var rows = bank().filter(function (r) { return r.pillar === p.k; });
      if (!rows.length) return;
      h += '<div class="grp"><h3 class="grp__t">' + esc(p.n) + ' — ' + rows.length + ' publications</h3>';
      rows.forEach(function (r) {
        h += '<div class="w">' +
          '<span class="w__ref">' + esc(r.ref) + '</span>' +
          '<span class="w__fmt">' + esc(r.format) + ' · ' + esc(platformOf(r.format)) + '</span>' +
          '<p class="w__t">' + esc(r.title) + '</p>' +
          '<p class="w__d">' + esc(r.note) + '</p>' +
          '<p class="w__c">Appel à l’action · <b>' + esc(r.cta) + '</b>' +
            (r.tags ? ' — ' + esc(r.tags) : '') + '</p>' +
        '</div>';
      });
      h += '</div>';
    });
    return h + '</section>';
  }

  /* Le titre d'une piste ne dépend que du thème et de l'angle : à 55 pistes
     par thème pour 10 angles, la même accroche revient cinq à six fois avec
     des formats différents. Imprimée telle quelle, la liste se lisait comme
     un bégaiement. L'accroche est donc écrite une fois, suivie des formats
     qui la déclinent — même contenu, moitié moins de pages. */
  function pistesPartHTML() {
    var rows = bank().filter(function (r) { return r.kind === "piste"; });
    var h = '<section class="part"><p class="part__num">Partie 2</p>' +
      '<h2>' + nb(rows.length) + ' pistes à retravailler</h2>' +
      '<p class="part__lede">Issues du croisement 25 thèmes × 12 formats × 10 angles. Ce sont des ' +
        'points de départ, pas des textes prêts à publier : vérifiez le fond, ajoutez la source, ' +
        'puis écrivez la légende. Chaque accroche est suivie des formats qui la déclinent ; ' +
        'la référence sert à la retrouver depuis le CRM.</p>';

    THEMES.forEach(function (t, ti) {
      var sub = rows.filter(function (r) { return r.themeIdx === ti; });
      if (!sub.length) return;

      /* Regroupement par accroche, dans l'ordre d'apparition. */
      var order = [], byTitle = {};
      sub.forEach(function (r) {
        if (!byTitle[r.title]) { byTitle[r.title] = []; order.push(r.title); }
        byTitle[r.title].push(r);
      });

      h += '<div class="grp"><h3 class="grp__t">' + esc(cap(t.n)) +
        ' — ' + sub.length + ' pistes · ' + order.length + ' accroches</h3>' +
        '<div class="pistes">';
      order.forEach(function (title) {
        var list = byTitle[title];
        h += '<div class="g">' +
          '<p class="g__t">' + esc(title) + '</p>' +
          '<p class="g__a">' + esc(list[0].angle) + ' · public : ' + esc(list[0].audience) +
            ' · → ' + esc(list[0].cta) + '</p>' +
          '<p class="g__f">' +
            list.map(function (r) {
              return '<span class="g__ref">' + esc(r.ref) + '</span>\u202f' + esc(r.format);
            }).join(" · ") +
          '</p>' +
        '</div>';
      });
      h += '</div></div>';
    });

    return h + '<p class="foot">' + esc(ident("site.long_name")) + ' — banque de contenu, ' +
      nb(TOTAL) + ' publications. Document interne.</p></section>';
  }

  function openPrintable() {
    /* La fenêtre s'ouvre dans le fil du clic : ouverte après l'attente du
       réseau, elle serait bloquée comme une fenêtre surgissante. */
    var win = window.open("", "_blank");
    if (!win) { toast("Le navigateur a bloqué l’onglet. Autorisez les fenêtres pour ce site.", "err"); return; }
    win.document.write('<!doctype html><meta charset="utf-8"><title>Préparation…</title>' +
      '<p style="font:15px system-ui;padding:2rem;color:#3d4a44">Préparation du document…</p>');
    loadIdentity().then(function () { writePrintable(win); });
  }

  function writePrintable(win) {
    var now = new Date();
    var doc = '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
      '<title>ACCI — Banque de contenu (' + nb(TOTAL) + ' publications)</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;700&family=Inter:wght@400;600;700&display=swap">' +
      '<style>' + printCSS() + '</style></head><body>' +
      coverHTML(now) + writtenPartHTML() + pistesPartHTML() +
      '<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>' +
      '</body></html>';
    win.document.open();
    win.document.write(doc);
    win.document.close();
  }

  /* --------------------------------------------------------------------- */
  /* Enregistrement de la rubrique                                          */
  /* --------------------------------------------------------------------- */
  A.register(
    { view: "socialbank", icon: "megaphone", label: "Banque de contenu" },
    { title: "Banque de contenu ACCI", tabs: [
      { id: "bank", l: "Publications" },
      { id: "doc",  l: "Document PDF" }
    ] },
    {
      "socialbank.bank": { r: bankHTML, b: bindBank },
      "socialbank.doc":  { r: docHTML,  b: bindDoc }
    }
  );

  /* Surface de lecture pour d'autres modules : le fonds, jamais l'écriture. */
  window.ACCI_BANK = {
    all: function () { return bank().slice(); },
    count: function () { return bank().length; }
  };
})();
