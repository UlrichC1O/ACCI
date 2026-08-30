/* =========================================================================
   ACCI — Application des réglages d'identité
   -------------------------------------------------------------------------
   Le site est statique : le nom de l'association, ses coordonnées, ses liens
   sociaux, son logo et sa favicon sont figés à la compilation. Ce script
   applique au chargement les valeurs corrigées depuis l'espace
   d'administration (rubrique « Identité du site »), sans redéploiement.

   Principe de prudence, identique à site-images.js : si le service est
   injoignable, lent, ou renvoie une réponse inattendue, la page conserve
   exactement ce qui a été compilé. Une coordonnée ne doit jamais disparaître
   à cause de ce script — un pied de page sans adresse e-mail serait pire que
   la valeur d'origine.
   ========================================================================= */
(function () {
  "use strict";

  var SUPABASE_URL = "https://durwoqjfjhdersuwxxwg.supabase.co";
  var SUPABASE_KEY = "sb_publishable_BdVe64A0kV6d6vCjdJglvg_JakPYpZ5";
  var CACHE_KEY = "acci_site_settings";
  var CACHE_MS = 5 * 60 * 1000;   // même fenêtre que les surcharges d'images

  /* Les valeurs textuelles rattachées à un repère data-site. */
  var TEXT_KEYS = ["name", "long_name", "tagline", "email", "phone", "address"];

  /* Icônes d'onglet : le repère data-site-icon porte le suffixe de la clé. */
  var ICON_KEYS = { png: "brand.favicon_png", svg: "brand.favicon_svg",
                    apple: "brand.apple_touch" };

  /* Le logo clair sert au pied de page et à l'assistant : un seul réglage. */
  var LOGO_KEYS = { header: "brand.logo_header", footer: "brand.logo_footer",
                    chat: "brand.logo_footer" };

  /* ---- Stockage local (peut être refusé : navigation privée, quota) ---- */

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || typeof c.map !== "object" || !c.at) return null;
      return c;
    } catch (e) { return null; }
  }

  function writeCache(map) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), map: map }));
    } catch (e) { /* le cache est un confort, jamais une condition */ }
  }

  /* ---- Application ---- */

  /* Une image de marque qui ne se charge pas laisserait un cadre vide, et le
     navigateur ne revient pas de lui-même à la source précédente. On rétablit
     donc explicitement l'ancienne adresse si la nouvelle échoue. */
  function swapImage(img, src) {
    if (!img || !src || img.getAttribute("src") === src) return;
    var old = img.getAttribute("src");
    function done() {
      img.removeEventListener("error", fail);
      img.removeEventListener("load", done);
    }
    function fail() {
      done();
      if (old == null) img.removeAttribute("src");
      else img.setAttribute("src", old);
    }
    img.addEventListener("error", fail);
    img.addEventListener("load", done);
    /* Une source de rechange figée (srcset) l'emporterait sur le nouveau
       fichier : elle est retirée pour que le remplacement soit visible. */
    var pic = img.parentNode;
    if (pic && pic.tagName === "PICTURE") {
      var srcs = pic.querySelectorAll("source");
      for (var i = 0; i < srcs.length; i++) srcs[i].removeAttribute("srcset");
    }
    img.removeAttribute("srcset");
    img.src = src;
  }

  function setText(key, value) {
    var nodes = document.querySelectorAll('[data-site="' + key + '"]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value;
  }

  function apply(map) {
    if (!map) return;

    /* Texte : nom, slogan, coordonnées. */
    TEXT_KEYS.forEach(function (k) {
      var v = map["site." + k];
      if (typeof v === "string" && v !== "") setText(k, v);
    });

    /* Les liens d'écriture et d'appel doivent suivre la coordonnée affichée,
       sinon le pied de page annoncerait une adresse et en ouvrirait une autre. */
    var mail = map["site.email"], tel = map["site.phone"];
    if (mail) {
      var ml = document.querySelectorAll('a[href^="mailto:"]');
      for (var i = 0; i < ml.length; i++) ml[i].href = "mailto:" + mail;
    }
    if (tel) {
      var tl = document.querySelectorAll('a[href^="tel:"]');
      var compact = tel.replace(/[^\d+]/g, "");
      for (var j = 0; j < tl.length; j++) tl[j].href = "tel:" + compact;
    }

    /* Réseaux sociaux : une URL vide masque le lien plutôt que de mener au
       compte inventé qui a été compilé. */
    var socials = document.querySelectorAll("[data-site-social]");
    for (var s = 0; s < socials.length; s++) {
      var el = socials[s];
      var key = "social." + el.getAttribute("data-site-social");
      if (!(key in map)) continue;
      var href = map[key];
      if (href) { el.href = href; el.hidden = false; }
      else el.hidden = true;
    }

    /* Logos. */
    var logos = document.querySelectorAll("[data-site-logo]");
    for (var l = 0; l < logos.length; l++) {
      var slot = logos[l].getAttribute("data-site-logo");
      var lk = LOGO_KEYS[slot];
      if (lk && map[lk]) swapImage(logos[l], map[lk]);
    }

    /* Icônes d'onglet : un href erroné laisse simplement l'icône par défaut du
       navigateur, il n'y a rien à rétablir. */
    var icons = document.querySelectorAll("[data-site-icon]");
    for (var c = 0; c < icons.length; c++) {
      var ik = ICON_KEYS[icons[c].getAttribute("data-site-icon")];
      if (ik && map[ik]) icons[c].href = map[ik];
    }
  }

  /* ---- Chargement ---- */

  function toMap(rows) {
    var map = {};
    if (!Array.isArray(rows)) return map;
    rows.forEach(function (r) {
      if (r && typeof r.key === "string") map[r.key] = r.value == null ? "" : String(r.value);
    });
    return map;
  }

  function fetchSettings() {
    return fetch(SUPABASE_URL + "/rest/v1/site_settings?select=key,value", {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(toMap);
  }

  function run() {
    /* Le cache est appliqué d'abord : sans lui, chaque page afficherait
       brièvement la valeur compilée avant de la corriger. */
    var cached = readCache();
    if (cached) apply(cached.map);
    if (cached && Date.now() - cached.at < CACHE_MS) return;

    fetchSettings().then(function (map) {
      writeCache(map);
      apply(map);
    }).catch(function () {
      /* Service injoignable : la page garde ce qui a été compilé. */
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
