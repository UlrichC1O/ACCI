/* =========================================================================
   ACCI — Application des surcharges d'images
   -------------------------------------------------------------------------
   Le site est statique : ses photos sont figées à la compilation. Ce script
   applique, au chargement, les remplacements décidés depuis l'espace
   d'administration — nouvelle photo, réaffectation, cadrage, texte alternatif.

   Principe de prudence : si le service est injoignable, lent, ou renvoie une
   réponse inattendue, la page conserve simplement les photos d'origine. Aucune
   image ne doit jamais disparaître à cause de ce script.
   ========================================================================= */
(function () {
  "use strict";

  var SUPABASE_URL = "https://durwoqjfjhdersuwxxwg.supabase.co";
  var SUPABASE_KEY = "sb_publishable_BdVe64A0kV6d6vCjdJglvg_JakPYpZ5";
  var BUCKET = "site-images";
  var CACHE_KEY = "acci_img_overrides";
  var CACHE_MS = 5 * 60 * 1000;      // 5 min : assez court pour voir vite une
                                     // modification, assez long pour épargner
                                     // une requête à chaque page visitée.

  function publicUrl(path) {
    return SUPABASE_URL + "/storage/v1/object/public/" + BUCKET + "/" + path;
  }

  /* ---- Application ---- */

  function applyImage(node, ov) {
    // node est un <picture> (ou un <img> isolé) portant data-img.
    var img = node.tagName === "IMG" ? node : node.querySelector("img");
    if (!img) return;
    var source = node.tagName === "PICTURE" ? node.querySelector("source") : null;

    if (source && ov.widths && ov.widths.length) {
      source.srcset = ov.widths.map(function (w) {
        return publicUrl(ov.base + "-" + w + ".webp") + " " + w + "w";
      }).join(", ");
    }
    if (ov.fallback) img.src = publicUrl(ov.fallback);
    if (ov.width)  img.width = ov.width;
    if (ov.height) img.height = ov.height;
    // Ne pas écraser un texte alternatif déjà rédigé pour cet emplacement.
    if (ov.alt != null && !img.dataset.altLocked) img.alt = ov.alt;
  }

  function applyPlacement(node, pl, images) {
    var img = node.tagName === "IMG" ? node : node.querySelector("img");
    if (!img) return;

    // Réaffectation : cet emplacement doit montrer une autre photo.
    if (pl.image && pl.image !== node.dataset.img) {
      var target = images[pl.image];
      if (target) {
        applyImage(node, target);
      } else {
        // Photo d'origine du site (non remplacée) : chemins locaux.
        var stem = pl.image.replace(/\.[^.]+$/, "");
        var source = node.tagName === "PICTURE" ? node.querySelector("source") : null;
        if (source) {
          source.srcset = [640, 1024, 1600].map(function (w) {
            return "assets/img/" + stem + "-" + w + ".webp " + w + "w";
          }).join(", ");
        }
        img.src = "assets/img/" + stem + "-1200.jpg";
      }
    }

    // Cadrage : déplace le point d'intérêt sans réencoder la photo.
    if (pl.focal_x != null && pl.focal_y != null) {
      img.style.objectPosition = pl.focal_x + "% " + pl.focal_y + "%";
    }
    if (pl.alt != null) {
      img.alt = pl.alt;
      img.dataset.altLocked = "1";   // prime sur l'alt générique de la photo
    }
  }

  function apply(data) {
    if (!data || !data.images) return;
    var byPlacement = data.placements || {};

    // Les emplacements priment : ils décrivent un cas particulier.
    document.querySelectorAll("[data-slot]").forEach(function (node) {
      var pl = byPlacement[node.dataset.slot];
      if (pl) applyPlacement(node, pl, data.images);
    });
    document.querySelectorAll("[data-img]").forEach(function (node) {
      if (node.dataset.slot && byPlacement[node.dataset.slot] &&
          byPlacement[node.dataset.slot].image) return;   // déjà réaffecté
      var ov = data.images[node.dataset.img];
      if (ov) applyImage(node, ov);
    });
  }

  /* ---- Récupération ---- */

  function fetchOverrides() {
    var opts = {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
      // Une surcharge d'image n'est pas une donnée critique : on n'attend pas.
      cache: "no-store"
    };
    return Promise.all([
      fetch(SUPABASE_URL + "/rest/v1/image_overrides?select=*", opts),
      fetch(SUPABASE_URL + "/rest/v1/placement_overrides?select=*", opts)
    ]).then(function (rs) {
      if (!rs[0].ok || !rs[1].ok) throw new Error("HTTP");
      return Promise.all([rs[0].json(), rs[1].json()]);
    }).then(function (j) {
      var images = {}, placements = {};
      j[0].forEach(function (r) { images[r.key] = r; });
      j[1].forEach(function (r) { placements[r.slot] = r; });
      return { images: images, placements: placements, t: Date.now() };
    });
  }

  function cached() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      return (Date.now() - d.t < CACHE_MS) ? d : null;
    } catch (e) { return null; }
  }

  function run() {
    var c = cached();
    if (c) { apply(c); return; }          // instantané : pas de clignotement
    fetchOverrides().then(function (d) {
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (e) {}
      apply(d);
    }).catch(function () {
      /* Service injoignable : les photos d'origine restent en place. */
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
