/* =========================================================================
   ACCI — Galerie photos pilotée depuis l'administration
   -------------------------------------------------------------------------
   La page « Galerie photos » porte deux sections compilées par build.py :
   « Nos temps forts » (photos) et « Nos albums » (cartes). Ce script les
   remplace chez le visiteur quand l'association a enregistré ses propres
   entrées dans le CRM — sans recompilation ni redéploiement.

   RÈGLE DE REPLI, LA PLUS IMPORTANTE ICI
   Rien n'est effacé tant qu'il n'y a rien à mettre à la place. Base
   injoignable, table vide, réponse illisible, navigation hors ligne : la
   page garde ce qui a été compilé. Une galerie vide serait pire que
   l'ancienne — c'est une page dont l'unique contenu est visuel.

   Même mécanique que site-partners.js : lecture publique avec la clé
   publiable, cache local pour éviter un aller-retour à chaque visite, et
   rendu qui reprend les classes déjà produites par build.py.
   ========================================================================= */
(function () {
  "use strict";

  var SUPABASE_URL = "https://durwoqjfjhdersuwxxwg.supabase.co";
  var SUPABASE_KEY = "sb_publishable_BdVe64A0kV6d6vCjdJglvg_JakPYpZ5";
  var CACHE_KEY = "acci_gallery";
  var CACHE_MS = 10 * 60 * 1000;

  var photoHost = document.querySelector('[data-manage="gallery"]');
  var albumHost = document.querySelector('[data-manage="albums"]');
  if (!photoHost && !albumHost) return;      /* page sans galerie */

  /* ---- Cache (peut être refusé : navigation privée, quota) ---- */
  function readCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY));
      return c && c.at && c.data ? c : null;
    } catch (e) { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data })); }
    catch (e) { /* le cache est un confort, pas une condition */ }
  }

  /* ---- Adresse d'une image ----
     Deux formes acceptées, comme pour les logos de partenaires : une URL
     https complète, ou une clé de photothèque.

     Les déclinaisons produites par build.py sont 640, 1024 et 1600 — et
     seulement celles-là. Une taille inventée (1200, qui n'existe qu'en JPEG)
     donne un fichier absent, donc une photo retirée de la grille par le
     gestionnaire d'erreur : la galerie se vidait entièrement. */
  var WIDTHS = [640, 1024, 1600];

  function stemOf(image) {
    return "assets/img/" + String(image).replace(/\.[a-z0-9]+$/i, "");
  }
  function isURL(image) { return /^https?:\/\//i.test(String(image)); }

  function applySrc(img, image) {
    if (isURL(image)) { img.src = image; return; }
    var stem = stemOf(image);
    img.src = stem + "-1024.webp";
    img.srcset = WIDTHS.map(function (w) {
      return stem + "-" + w + ".webp " + w + "w";
    }).join(", ");
    img.sizes = "(min-width: 900px) 33vw, (min-width: 560px) 50vw, 100vw";
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  /* ---- « Nos temps forts » ---- */
  function renderPhotos(rows) {
    if (!photoHost || !rows.length) return;
    var grid = photoHost.querySelector(".gallery");
    if (!grid) return;

    var frag = document.createDocumentFragment();
    rows.forEach(function (r) {
      if (!r.image) return;
      var fig = el("figure", "gphoto reveal is-in");
      var img = el("img");
      applySrc(img, r.image);
      img.alt = r.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      /* Une image absente laisserait un trou dans la grille : la figure
         entière est retirée plutôt que d'afficher une icône cassée. */
      img.addEventListener("error", function () {
        if (fig.parentNode) fig.parentNode.removeChild(fig);
      });
      fig.appendChild(img);
      if (r.caption) {
        var cap = el("span", "gphoto__cap");
        cap.appendChild(document.createTextNode(r.caption));
        fig.appendChild(cap);
      }
      frag.appendChild(fig);
    });
    if (!frag.childNodes.length) return;

    while (grid.firstChild) grid.removeChild(grid.firstChild);
    grid.appendChild(frag);
  }

  /* ---- « Nos albums » ---- */
  function renderAlbums(rows) {
    if (!albumHost || !rows.length) return;
    var grid = albumHost.querySelector(".grid");
    if (!grid) return;

    var frag = document.createDocumentFragment();
    rows.forEach(function (r) {
      if (!r.title) return;
      var linked = !!r.href;
      var hasImg = !!r.image;
      var node = el(linked ? "a" : "div",
        "card" + (linked ? " card--link" : "") + (hasImg ? " card--media" : ""));
      if (linked) node.setAttribute("href", r.href);

      /* Une carte porte SOIT une photo SOIT une icône, jamais les deux :
         c'est la règle qu'applique déjà build.py, et la cumuler alourdirait
         la carte sans rien ajouter. */
      if (hasImg) {
        var media = el("span", "card__media");
        var mi = el("img");
        applySrc(mi, r.image);
        mi.alt = "";
        mi.loading = "lazy";
        mi.decoding = "async";
        media.appendChild(mi);
        node.appendChild(media);
      }

      var body = el("span", "card__body");
      if (!hasImg) {
        var ic = el("span", "card__icon");
        ic.setAttribute("aria-hidden", "true");
        ic.appendChild(iconSVG(r.icon || "camera"));
        body.appendChild(ic);
      }

      var h3 = el("h3", "card__title");
      h3.appendChild(document.createTextNode(r.title));
      body.appendChild(h3);

      if (r.text) {
        var p = el("p", "card__text");
        p.appendChild(document.createTextNode(r.text));
        body.appendChild(p);
      }
      node.appendChild(body);
      frag.appendChild(node);
    });
    if (!frag.childNodes.length) return;

    while (grid.firstChild) grid.removeChild(grid.firstChild);
    grid.appendChild(frag);
    paintIcons(grid);
  }

  /* Le <svg> reprend exactement les attributs produits par icon() dans
     build.py : même grille, même graisse de trait, mêmes jonctions. Le tracé
     intérieur arrive ensuite d'assets/icons.json — les cartes compilées de
     cette page portent des photos, il n'y a donc aucun gabarit à recopier. */
  function iconSVG(key) {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "26");
    svg.setAttribute("height", "26");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("data-icon-key", key);
    return svg;
  }

  /* Le jeu d'icônes complet est déjà publié pour le site (assets/icons.json,
     utilisé par site-settings.js). Le charger permet de rendre n'importe
     quelle icône choisie dans le CRM. Absent ou illisible : la carte reste
     sans icône plutôt que d'afficher un tracé faux. */
  var iconSet = null;
  function paintIcons(scope) {
    var nodes = scope.querySelectorAll("svg[data-icon-key]");
    if (!nodes.length) return;
    (iconSet || (iconSet = fetch("assets/icons.json").then(function (r) {
      if (!r.ok) throw new Error("icons");
      return r.json();
    }))).then(function (set) {
      nodes.forEach(function (svg) {
        var body = set[svg.getAttribute("data-icon-key")];
        if (body) svg.innerHTML = body;
      });
    }).catch(function () { /* icône du gabarit conservée */ });
  }

  function apply(data) {
    if (data.photos && data.photos.length) renderPhotos(data.photos);
    if (data.albums && data.albums.length) renderAlbums(data.albums);
  }

  function url(table, cols) {
    return SUPABASE_URL + "/rest/v1/" + table + "?select=" + cols +
           "&active=eq.true&order=position.asc,id.asc";
  }
  function get(table, cols) {
    return fetch(url(table, cols), {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(function (rows) { return Array.isArray(rows) ? rows : []; });
  }

  function run() {
    var cached = readCache();
    if (cached) apply(cached.data);
    if (cached && Date.now() - cached.at < CACHE_MS) return;

    Promise.all([
      photoHost ? get("gallery_photos", "image,alt,caption,position") : Promise.resolve([]),
      albumHost ? get("gallery_albums", "title,text,icon,href,position") : Promise.resolve([])
    ]).then(function (res) {
      var data = { photos: res[0], albums: res[1] };
      writeCache(data);
      apply(data);
    }).catch(function () {
      /* Service injoignable : la page garde son contenu compilé. */
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
