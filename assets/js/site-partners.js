/* =========================================================================
   ACCI — Affichage des partenaires
   -------------------------------------------------------------------------
   La liste des partenaires vit dans Supabase : le bureau en ajoute un depuis
   l'administration, sans recompiler ni redéployer le site.

   Le logo se présente sous deux formes, distinguées ici :
     * une clé de la photothèque du site — « partenaire-x.jpg » — dont les
       déclinaisons responsives ont déjà été produites à la compilation ;
     * une adresse https complète, pour un fichier téléversé après coup.

   Principe de prudence, comme site-images.js et site-settings.js : service
   injoignable, réponse inattendue ou liste vide laissent la section masquée.
   Mieux vaut ne rien afficher qu'un titre suivi d'un vide inexpliqué.
   ========================================================================= */
(function () {
  "use strict";

  var SUPABASE_URL = "https://durwoqjfjhdersuwxxwg.supabase.co";
  var SUPABASE_KEY = "sb_publishable_BdVe64A0kV6d6vCjdJglvg_JakPYpZ5";
  var CACHE_KEY = "acci_partners";
  var CACHE_MS = 5 * 60 * 1000;

  var host = document.querySelector("[data-partners]");
  if (!host) return;                       /* page sans section partenaires */
  var grid = host.querySelector(".partners");
  if (!grid) return;

  /* ---- Cache (peut être refusé : navigation privée, quota) ---- */
  function readCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY));
      return c && Array.isArray(c.rows) && c.at ? c : null;
    } catch (e) { return null; }
  }
  function writeCache(rows) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rows: rows })); }
    catch (e) { /* le cache est un confort, pas une condition */ }
  }

  /* ---- Adresse du logo ---- */
  function logoSrc(logo) {
    if (!logo) return "";
    if (/^https:\/\//i.test(logo)) return logo;
    /* Clé de photothèque : la déclinaison 640 suffit très largement pour un
       logo, et évite de charger l'original de plus d'un mégaoctet. */
    var stem = String(logo).replace(/\.[a-z0-9]+$/i, "");
    return "assets/img/" + stem + "-640.webp";
  }

  /* Un logo introuvable laisserait une case vide au milieu de la grille : la
     vignette est alors remplacée par le nom du partenaire, qui reste une
     information utile et un lien cliquable. */
  function fallbackToName(fig, name) {
    var span = document.createElement("span");
    span.className = "partner__name";
    span.appendChild(document.createTextNode(name));
    var img = fig.querySelector("img");
    if (img && img.parentNode) img.parentNode.replaceChild(span, img);
  }

  function render(rows) {
    rows = rows.filter(function (r) { return r && r.active !== false && r.name; });
    rows.sort(function (a, b) {
      return (a.position || 0) - (b.position || 0) ||
             String(a.name).localeCompare(String(b.name), "fr");
    });
    if (!rows.length) return;              /* rien à montrer : section masquée */

    while (grid.firstChild) grid.removeChild(grid.firstChild);

    rows.forEach(function (r) {
      var name = String(r.name);
      var src = logoSrc(r.logo);

      /* Un lien n'est posé que sur une adresse https : le champ est libre en
         base, et « javascript: » y serait aussi acceptable qu'autre chose. */
      var link = /^https:\/\//i.test(r.url || "") ? r.url : "";
      var node = document.createElement(link ? "a" : "div");
      node.className = "partner";
      if (link) {
        node.href = link;
        node.target = "_blank";
        node.rel = "noopener noreferrer";
        node.title = name + " — ouvre le site du partenaire";
      }

      if (src) {
        var img = document.createElement("img");
        img.className = "partner__logo";
        img.alt = name;
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("error", function () { fallbackToName(node, name); });
        img.src = src;
        node.appendChild(img);
      } else {
        var span = document.createElement("span");
        span.className = "partner__name";
        span.appendChild(document.createTextNode(name));
        node.appendChild(span);
      }
      grid.appendChild(node);
    });

    host.hidden = false;
  }

  function partnersUrl() {
    return SUPABASE_URL + "/rest/v1/partners?select=name,url,logo,category,position,active" +
           "&active=eq.true&order=position.asc,name.asc";
  }

  function run() {
    var cached = readCache();
    if (cached) render(cached.rows);
    if (cached && Date.now() - cached.at < CACHE_MS) return;

    fetch(partnersUrl(), {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(function (rows) {
      if (!Array.isArray(rows)) return;
      writeCache(rows);
      render(rows);
    }).catch(function () {
      /* Service injoignable : la section reste masquée, la page est intacte. */
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
