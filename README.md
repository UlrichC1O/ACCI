# ACCI — Site web

**Association des Créateurs de Contenu Ivoiriens**
Site institutionnel professionnel de 50 pages en français, dédié à la promotion
d'un usage responsable des réseaux sociaux en Côte d'Ivoire et à la lutte contre
les mauvaises pratiques en ligne.

## Aperçu

- **50 pages de contenu** + plan du site + page 404 (52 fichiers HTML au total)
- 100 % en **français**, ton institutionnel et professionnel
- Identité visuelle inspirée du **drapeau ivoirien** (orange · blanc · vert)
- Entièrement **responsive** (ordinateur, tablette, mobile)
- **Accessible** : navigation clavier, lien d'évitement, contrastes, `prefers-reduced-motion`
- Méga-menu, menu mobile, **recherche intégrée**, accordéons, animations au défilement
- **Photos professionnelles** intégrées (héros, sections, galerie)
- **Graphiques animés** (barres et anneau) en SVG, sans bibliothèque externe
- **Assistant conversationnel** (chat) à base de règles, présent sur toutes les pages
- **Aucune dépendance** : généré par un script Python 3, hébergeable partout

## Blocs de contenu disponibles

`hero` (avec image de fond optionnelle) · `section` · `cards` · `stats` ·
`accordion` · `steps` · `split` (icône **ou** photo) · `callout` · `checklist` ·
`quote` · `cta` · `table` · `timeline` · `team` · `posts` · `downloads` ·
`definitions` · `contact` · `richtext` · `image` (bannière) · `gallery` ·
`chart` (`kind: "bar"` ou `"donut"`).

Les images vont dans `assets/img/` ; un bloc les référence par leur nom de
fichier (ex. `{"type": "image", "image": "formation.jpg", "alt": "…"}`).
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

- **Connexion** par code d'accès (créé à la première ouverture ; modifiable
  dans Réglages). *Protection locale — voir la note de sécurité ci-dessous.*
- **Tableau de bord** : indicateurs (total, actifs, prospects, charte signée,
  nouveaux du mois) + graphiques par domaine et par statut.
- **Membres** : ajouter / modifier / supprimer, recherche, filtres (statut,
  domaine), tri, sélection multiple (suppression / changement de statut en lot).
- **Boîte de réception** : les envois des formulaires du site (sur le même
  navigateur) y arrivent et se convertissent en membre en un clic.
- **Import / Export** : CSV et JSON (sauvegarde, portabilité, modèle fourni).
- **Base de données** : les données sont stockées dans le navigateur
  (`localStorage`). Exportez régulièrement pour sauvegarder.

**Sécurité / production** : la protection par code et le stockage local
conviennent à un usage simple sur un poste. Pour un accès **partagé, en ligne
et multi-appareils**, connectez une base **Supabase** (offre gratuite) :
créez une table `members`, puis renseignez l'URL + la clé publique dans
`admin/admin.js` (section `DB`). L'interface reste identique.

## Formulaires (contact & newsletter)

Les formulaires sont **fonctionnels** : validation en temps réel (champs
obligatoires, format e-mail, longueur minimale), protection anti-spam
(« honeypot ») et envoi réel.

Deux modes d'envoi, configurables en haut de `assets/js/main.js` :

- **Par défaut (sans serveur)** : à la validation, le client e-mail du
  visiteur s'ouvre, pré-rempli, vers `contact@acci.ci` (constante
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
├── assets/
│   ├── css/styles.css    # Système de design complet
│   ├── js/main.js        # Interactions (menu, recherche, accordéon…)
│   └── img/favicon.svg
└── dist/                 # Site généré (sortie) — à publier
```

## Construire le site

Prérequis : **Python 3** (aucune autre dépendance).

```bash
python3 build.py            # génère le site dans ./dist
python3 build.py --serve    # génère puis lance http://localhost:8000
```

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
