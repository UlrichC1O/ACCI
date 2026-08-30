# ACCI — Site web

**Association des Créateurs de Contenu Ivoiriens**
Site institutionnel professionnel de 50 pages en français, dédié à la promotion
d'un usage responsable des réseaux sociaux en Côte d'Ivoire et à la prévention
des mauvaises pratiques en ligne.

## Aperçu

- **50 pages de contenu** + plan du site + page 404 (52 fichiers HTML au total)
- 100 % en **français**, ton institutionnel et professionnel
- Identité visuelle inspirée du **drapeau ivoirien** (orange · blanc · vert)
- Entièrement **responsive** (ordinateur, tablette, mobile)
- **Accessible** : navigation clavier, lien d'évitement, contrastes, `prefers-reduced-motion`
- Méga-menu, menu mobile, **recherche intégrée**, accordéons, animations au défilement
- **Photos professionnelles** intégrées (héros, sections, galerie), servies en
  **WebP responsive** (`<picture>` + `srcset`) avec repli JPEG
- **Graphiques animés** (barres et anneau) en SVG, sans bibliothèque externe
- **Jeu d’icônes maison** : 42 pictogrammes tracés sur une grille de 24 × 24,
  trait unique de 1,5 px, registre institutionnel
- **Assistant conversationnel** (chat) à base de règles, présent sur toutes les pages
- **Aucune dépendance** : généré par un script Python 3, hébergeable partout
- **Polices auto-hébergées** (Inter + Sora, sous-ensembles latin) : aucune
  requête vers un tiers, pas de rendu bloqué par Google Fonts
- **Référencement** : canoniques, sitemap daté, données structurées JSON-LD
  (NGO, WebSite, BreadcrumbList, FAQPage), Open Graph et carte Twitter
- **Accessibilité** : contrastes conformes WCAG 2.1 AA, anneau de focus visible,
  gestion du focus dans les panneaux, `prefers-reduced-motion` complet
- **Le contenu reste lisible sans JavaScript** (et si un script échoue à charger)

## Blocs de contenu disponibles

`hero` (avec image de fond optionnelle) · `section` · `cards` · `stats` ·
`accordion` · `steps` · `split` (icône **ou** photo) · `callout` · `checklist` ·
`quote` · `cta` · `table` · `timeline` · `team` · `posts` · `downloads` ·
`definitions` · `contact` · `richtext` · `image` (bannière) · `gallery` ·
`chart` (`kind: "bar"` ou `"donut"`).

Les images vont dans `assets/img/` ; un bloc les référence par leur nom de
fichier (ex. `{"type": "image", "image": "formation.jpg", "alt": "…"}`).

### Photos des cartes

Les blocs `cards` et `posts` affichent une photo au-dessus du titre. Elle est
résolue dans cet ordre :

1. la clé `image` de la carte, si elle est renseignée ;
2. `content/card_images.json`, qui associe un intitulé de carte à un fichier —
   la clé `"page::Titre"` prime sur la clé `"Titre"` seule, ce qui permet de
   distinguer deux cartes homonymes ;
3. à défaut, la carte retombe sur son icône (et le bloc `posts` sur un aplat de
   marque). Le build **signale alors chaque carte sans photo**, pour qu'un oubli
   ne passe pas inaperçu.

Lorsqu'une photo est présente, l'icône n'est pas affichée : les cumuler
alourdirait la carte sans rien apporter.
L'assistant de chat se configure dans `assets/js/chat.js` (base de
connaissances `INTENTS` + suggestions `QUICK`).

Le site compte **37 photos réalistes** (générées par IA). Une image d'en-tête
est attribuée automatiquement à 30 pages via la table `HERO_IMAGES` de
`content/pages.py` — pour changer une photo, remplacez le fichier
correspondant dans `assets/img/` (mêmes nom et extension) ou modifiez la table.

## CRM — Gestion des membres (`/admin`)

Un **CRM d'administration** complet et gratuit, sans serveur, est inclus dans
`admin/` (copié vers `dist/admin/` au build). Ouvrez **`/admin/`** (lien
« Espace administration » en bas de page).

- **Connexion** en trois modes : *Admin* (identifiant + mot de passe), *Membre*
  et *Artiste Pro* (code d'accès personnel). Aucun identifiant n'est livré avec
  le site : le compte administrateur se crée à la première ouverture, et les
  codes des portails s'émettent fiche par fiche. *Voir la note de sécurité
  ci-dessous.*
- **Tableau de bord** : indicateurs (total, actifs, prospects, charte signée,
  nouveaux du mois) + graphiques par domaine et par statut.
- **Membres** : ajouter / modifier / supprimer, recherche, filtres (statut,
  domaine), tri, sélection multiple (suppression / changement de statut en lot).
- **Boîte de réception** : convertit une demande en membre en un clic.
  *Elle n'est plus alimentée automatiquement par les formulaires du site* : ceux-ci
  écrivaient auparavant chaque message (nom, e-mail, téléphone, contenu — y compris
  les signalements adressés à la cellule d'écoute) dans le `localStorage` **du
  visiteur**, où la personne suivante à utiliser l'appareil pouvait les lire, et
  d'où ils ne parvenaient de toute façon jamais à l'ACCI. Alimentez-la par import
  CSV/JSON depuis votre service de formulaire.
- **Import / Export** : CSV et JSON (sauvegarde, portabilité, modèle fourni).
- **Base de données** : les données sont stockées dans le navigateur
  (`localStorage`). Exportez régulièrement pour sauvegarder.

### Comptes Membre et Artiste Pro — ce qui est protégé, et ce qui ne l'est pas

Il faut être exact sur ce point, car les deux moitiés comptent.

**Ce qui a été corrigé.** Les codes d'accès étaient auparavant tirés de
`Math.random()`, longs de huit caractères, et **conservés en clair** dans la
fiche du membre — donc présents dans chaque export CSV, chaque sauvegarde JSON
et le journal d'audit, affichés en entier dans l'en-tête des portails, et
recopiés dans l'infobulle de la liste des membres. Sept d'entre eux étaient de
surcroît **écrits dans `admin/admin.js`**, fichier servi publiquement : le code
`AAAAAOOO` ouvrait l'espace Artiste Pro à n'importe quel visiteur, et il était
recréé de force à chaque chargement — révoquer cet accès ne tenait pas.
Désormais :

| | Avant | Maintenant |
|---|---|---|
| Génération | `Math.random()`, ~33 bits | `crypto.getRandomValues()`, 60 bits |
| Format | `ABCDE123` | `XXXX-XXXXXXXX` (identifiant public + secret) |
| Au repos | code en clair | sel + empreinte PBKDF2-SHA-256 (100 000 tours) |
| Exports CSV / JSON | code inclus | code absent |
| Journal d'audit | `nom → CODE` | `nom` seul |
| Affichage | code entier | masqué (`K7M2-••••••3B`) |
| Comptes de démonstration | 7 codes valides publiés | aucun code livré |
| Révocation | l'empreinte survivait | tous les champs effacés, session fermée |

Le code complet n'est montré **qu'une fois**, à l'émission. Le CRM ne peut plus
le relire : perdu, il se renouvelle depuis la fiche du membre.

Les fiches créées avant cette mise à jour continuent de fonctionner : leur code
est accepté une dernière fois, converti en empreinte à la connexion, puis
signalé « code hérité — à renouveler » dans la fiche.

**Ce qui n'est pas protégé, et ne peut pas l'être ici.** Ce site n'a *aucun
composant serveur* : le CRM s'exécute entièrement dans le navigateur et ses
données vivent dans le `localStorage` de la machine. La vérification du code a
donc lieu du côté de celui qui la subit. Quiconque dispose des outils de
développement sur ce poste lit le fichier des membres sans connaître aucun code,
et peut ouvrir un portail sans se connecter. **Le contrôle d'accès des portails
protège les identifiants, pas les données.**

Ce que le renforcement apporte réellement :

- un code volé ailleurs (export, sauvegarde, capture d'écran, journal) ne permet
  plus de se connecter, puisqu'il n'y figure plus ;
- connaître un code n'aide plus à deviner les autres, l'aléa étant désormais
  cryptographique ;
- un accès révoqué l'est immédiatement, y compris pour un portail déjà ouvert ;
- une session de portail se ferme après 20 minutes d'inactivité, et la
  déconnexion efface réellement le contenu affiché.

**Pour une vraie protection des données**, il faut un serveur qui arbitre. Le
projet en dispose déjà : l'onglet « Images du site » écrit dans **Supabase**
derrière une session authentifiée et des politiques RLS (voir plus bas). Porter
les comptes Membre et Artiste Pro sur ce même mécanisme — une table `members` en
RLS, l'authentification par e-mail — est la suite logique, et la seule qui
déplacerait la vérification hors du navigateur. En l'état, cet espace reste
prévu pour **un poste unique et de confiance**.

## Gestion des images depuis l'administration

L'onglet **« Images du site »** de `/admin/` permet de gérer les 159 photos et
leurs 292 emplacements **sans redéploiement** :

- **Photothèque** — toutes les photos, avec le nombre d'emplacements où chacune
  sert. « Remplacer » téléverse une nouvelle image ; les déclinaisons WebP
  (640/1024/1600) et le repli JPEG sont fabriqués **dans le navigateur**, pour
  que les photos ajoutées reçoivent le même traitement que celles du site.
  « Rétablir » revient à la photo d'origine.
- **Emplacements** — pour chaque carte ou en-tête : changer la photo affichée,
  déplacer le **point focal** (en cliquant sur l'aperçu, afin que le sujet
  survive au recadrage large), et corriger le **texte alternatif**.

### Comment cela fonctionne

Le site reste statique. `build.py` marque chaque image d'un `data-img` et d'un
`data-slot`, et exporte `assets/img/inventory.json`. Au chargement,
`assets/js/site-images.js` lit les surcharges dans Supabase et les applique.
Si le service est injoignable, **les photos d'origine restent affichées** :
aucune image ne peut disparaître à cause de ce mécanisme.

### Sécurité

Le code d'accès de `/admin/` est vérifié dans le navigateur : il masque
l'interface, il ne protège pas le site. C'est pourquoi **l'écriture exige une
session Supabase authentifiée** — sans quoi n'importe quel visiteur pourrait
remplacer toutes les photos. La lecture est publique (le site en a besoin),
l'écriture est fermée aux anonymes, vérifié par test.

Projet Supabase : `supabase-acci-data`. Table `image_overrides` (remplacement
d'une photo partout), table `placement_overrides` (photo, cadrage et texte
alternatif d'un emplacement précis), dépôt `site-images`.

#### Quelle clé Supabase utiliser

| Clé | Où | Pourquoi |
|---|---|---|
| **URL du projet** | `admin/images.js`, `assets/js/site-images.js` | publique |
| **Clé publiable** (`sb_publishable_…`) | idem | conçue pour être publique ; les politiques RLS décident de ce qu'elle peut faire |
| **Clé secrète** (`sb_secret_…`) | **nulle part dans ce dépôt** | elle contourne les politiques RLS |

Ce projet n'a **aucun composant serveur** : le site est statique et son
administration s'exécute entièrement dans le navigateur. Tout ce que contient ce
dépôt est donc lisible par n'importe quel visiteur. Y placer la clé secrète
reviendrait à publier un accès complet en lecture, écriture et suppression sur
la base — elle ignore les politiques RLS.

Un contrôle avant commit refuse ce type de fuite. À activer une fois par poste :

```bash
git config core.hooksPath tools/git-hooks
```

Si une clé secrète a été exposée (collée dans une conversation, un ticket, une
capture d'écran), révoquez-la : *Supabase → Settings → API keys → Rotate*.

## Graphiques, assistant et données — modifiables depuis l'administration

La rubrique **« Graphiques & assistant »** de `/admin/` complète « Textes du site » :
l'essentiel de ce qu'affiche le site se corrige désormais sans recompilation.

| Quoi | Où | Clé enregistrée |
|---|---|---|
| Textes et **données des blocs** (chiffres-clés, étapes, chronologie, équipe, définitions, listes, téléchargements) | Identité du site ▸ Textes du site | `content.<page>#<bloc>.<champ>` |
| **Graphiques** (barres et anneau) : intitulés, valeurs, suffixes, couleurs, ajout / retrait / ordre des séries | Graphiques & assistant ▸ Graphiques | `chart.<page>#<bloc>` |
| **Assistant** : intentions (mots-clés → réponse → liens) et suggestions rapides | Graphiques & assistant ▸ Assistant | `chat.intents`, `chat.quick` |

L'inventaire des textes modifiables est passé de 1 083 à **1 419** : les données des
blocs, et non plus seulement leurs titres, sont adressables.

### Ce qui protège le site de ses propres réglages

Un réglage est écrit par un humain pressé, et lu par toutes les pages publiques.
Trois garde-fous, chacun posé en réponse à un défaut réel constaté dans ce dépôt :

- **Une valeur illisible ne casse rien.** Série vide, JSON invalide, valeur négative,
  couleur qui n'en est pas une : la valeur est écartée et la page garde ce qui a été
  compilé. Un graphique ne peut pas devenir un cadre blanc.
- **Un graphique est redessiné, pas seulement réécrit.** La largeur d'une barre et
  l'arc d'un secteur sont calculés à la compilation. Remplacer le nombre affiché sans
  refaire ce calcul aurait donné une barre dont la longueur dément son étiquette.
- **La base de connaissances de l'assistant n'est jamais interprétée comme du
  balisage.** `chat.js` insérait ses réponses en `innerHTML` ; une base modifiable en
  aurait fait un point d'exécution sur les 52 pages du site. Les réponses sont
  désormais posées en texte, et l'adresse d'un lien n'est retenue que si elle mène à
  une page du site, à une adresse électronique ou à un numéro.

Un **contrôle à la compilation** refuse par ailleurs de marquer modifiable un élément
qui en contient d'autres : une correction enregistrée sur un tel noeud en effacerait
la structure — icône, lien, paragraphes — et seulement chez le visiteur. Trois défauts
de ce type existaient et ont été corrigés (le libellé d'un bouton qui emportait sa
flèche, un bloc de texte enrichi entier, et des clés de contact numérotées sur la
longueur du HTML au lieu du rang de la ligne).

Enfin, chaque page ne télécharge que **les réglages qui la concernent** : les clés
générales, plus les corrections de la page affichée. Sans ce filtre, la page d'accueil
aurait chargé les corrections des cinquante et une autres.

## Réseaux sociaux — renseignés depuis l'administration

Les icônes de réseaux sociaux (barre supérieure et pied de page) **ne sont pas
écrites dans le code**. `content/site.py` déclare seulement quels réseaux le
site sait afficher et dans quel ordre ; les adresses des comptes se renseignent
dans **`/admin/` → « Identité du site » → « Réseaux sociaux »**, et sont
stockées dans la table Supabase `site_settings` (clés `social.facebook`,
`social.x`, `social.instagram`, `social.tiktok`, `social.youtube`,
`social.linkedin`).

**Un réseau sans adresse n'affiche aucune icône.** Les six emplacements sont
compilés masqués et sans lien ; `assets/js/site-settings.js` révèle chez le
visiteur les seules icônes dont l'adresse est renseignée, et masque le bloc
entier tant qu'il n'y en a aucune. Un champ vidé puis enregistré retire
l'icône du site sous 5 minutes (durée du cache navigateur).

C'est la seule rubrique du site où une valeur manquante **fait disparaître**
quelque chose au lieu de conserver ce qui a été compilé — contrairement aux
photos et aux coordonnées. Le choix est délibéré : une icône menant au compte
d'un inconnu est plus dommageable pour l'association qu'une icône absente. Deux
conséquences à connaître :

- si Supabase est injoignable chez le visiteur, aucune icône ne s'affiche ;
- les données structurées (`schema.org`) ne déclarent plus de `sameAs`, car la
  compilation ne consulte pas l'administration. Les moteurs de recherche ne se
  voient donc plus annoncer de comptes officiels — mieux vaut cela que de leur
  annoncer des comptes inventés.

Seules les adresses complètes en `https://` sont acceptées, à l'enregistrement
comme à l'affichage : un réglage détourné ne peut pas devenir un lien piégé sur
les cinquante pages.

## Formulaires (contact & newsletter)

Les formulaires sont **fonctionnels** : validation en temps réel (champs
obligatoires, format e-mail, longueur minimale), protection anti-spam
(« honeypot ») et envoi réel.

Deux modes d'envoi, configurables en haut de `assets/js/main.js` :

- **Par défaut (sans serveur)** : à la validation, le client e-mail du
  visiteur s'ouvre, pré-rempli, vers `contact@ivoiriens.ac.ci` (constante
  `ACCI_CONTACT_EMAIL`).
- **Envoi automatique (recommandé en production)** : renseignez
  `ACCI_FORM_ENDPOINT` avec l'URL d'un service de formulaire
  (ex. Formspree, Web3Forms). Les messages sont alors envoyés en
  arrière-plan, sans ouvrir de client e-mail, avec un repli automatique
  sur le mode e-mail en cas d'échec.

## Structure du projet

```
ACCI/
├── build.py              # Générateur de site statique (moteur de rendu)
├── content/              # Contenu et configuration
│   ├── site.py           # Identité, navigation, pied de page
│   ├── pages.py          # Agrégation + pages utilitaires (plan, 404)
│   ├── presentation.py   # Pages 1-8   — L'ACCI
│   ├── combat.py         # Pages 9-20  — Notre combat
│   ├── chartes.py        # Pages 21-28 — Chartes & guides
│   ├── services.py       # Pages 29-38 — Services & ressources
│   ├── actualites.py     # Pages 39-44 — Actualités & événements
│   └── engagement.py     # Pages 45-50 — Engagement & légal
├── tools/
│   └── optimize-images.sh # Préparation des photos (WebP responsive)
├── assets/
│   ├── css/styles.css    # Système de design complet
│   ├── css/fonts.css     # @font-face auto-hébergés (Inter + Sora)
│   ├── js/main.js        # Interactions (menu, recherche, accordéon…)
│   ├── js/chat.js        # Assistant conversationnel
│   ├── fonts/            # Sous-ensembles woff2 (latin, latin-ext)
│   └── img/              # Variantes responsives + manifest.json
├── vercel.json           # Déploiement : en-têtes de sécurité et de cache
└── dist/                 # Site généré (sortie) — à publier
```

## Construire le site

Prérequis : **Python 3** (aucune autre dépendance).

```bash
python3 build.py            # génère le site dans ./dist
python3 build.py --serve    # génère puis lance http://localhost:8000
```

Les fichiers CSS et JS reçoivent une **empreinte de contenu** au build
(`styles.<hash>.css`) : ils peuvent ainsi être servis avec un cache d'un an
sans qu'un visiteur reçoive jamais une version périmée.

### Photos — préparation (ponctuelle)

Les photos servies sont des variantes générées (`nom-640.webp`, `nom-1024.webp`,
`nom-1600.webp`, plus un repli `nom-1200.jpg`), **versionnées dans le dépôt** :
le build reste ainsi sans dépendance. Pour ajouter ou remplacer une photo :

```bash
mkdir -p assets/img/_originals      # dossier non versionné
cp ma-photo.jpg assets/img/_originals/
bash tools/optimize-images.sh       # nécessite Node.js (npx sharp-cli)
```

Le script régénère aussi `assets/img/manifest.json`, dont `build.py` se sert
pour écrire les `srcset` et les dimensions intrinsèques (`width`/`height`, qui
évitent les sauts de mise en page au chargement).

**Direction artistique.** Les photos suivent une ligne unique : photographie
documentaire éditoriale, cadre ivoirien, lumière naturelle douce, un sujet clair
sur fond dégagé — le registre d'un rapport d'activité, non celui de la banque
d'images. Deux règles sont impératives : aucun texte ni logo de marque lisible
dans l'image (une photo montrant une carte bancaire de marque réelle sur une page
consacrée aux arnaques a dû être remplacée), et un traitement digne des sujets
sensibles — on photographie l'accompagnement, jamais la détresse mise en scène,
et jamais un mineur en situation d'exposition.

### URL canonique — à renseigner avant la mise en ligne

`SITE["url"]` alimente les balises canoniques, le sitemap, `robots.txt` et les
données structurées. La valeur par défaut est `https://ivoiriens.ac.ci`, **domaine
qui ne résout pas à ce jour** (NXDOMAIN, constaté le 29/08/2026). Renseignez le
domaine réel via la variable d'environnement `SITE_URL` (Vercel : *Settings →
Environment Variables*) ou en modifiant `content/site.py`.

## Publier

Le dossier `dist/` est un site statique complet. Il peut être déposé tel quel sur
n'importe quel hébergement : Netlify, Vercel, GitHub Pages, Cloudflare Pages, ou
un hébergement web classique (FTP).

## Modifier le contenu

Le contenu est séparé de la présentation. Pour modifier une page, éditez le
fichier correspondant dans `content/`, puis relancez `python3 build.py`.
Chaque page est décrite par des **blocs** (hero, section, cartes, accordéon,
étapes, statistiques, citation, tableau, formulaire de contact, etc.) assemblés
automatiquement avec l'en-tête, la navigation et le pied de page.
