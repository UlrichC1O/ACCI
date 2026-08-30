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

   Les réseaux sociaux font exception, volontairement. Aucune adresse n'est
   compilée : les icônes sont compilées masquées et ce script ne révèle que
   celles dont l'administration a renseigné le compte. Si le service est
   injoignable, aucune icône n'apparaît — une icône menant au compte d'un
   inconnu serait plus dommageable pour l'association qu'une icône absente.
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

  /* Le site écrit **gras** dans ses textes ; para() le convertit à la
     compilation. Un texte corrigé doit suivre la même convention, sinon les
     astérisques s'afficheraient tels quels. Les fragments sont posés par
     createTextNode : rien de ce qui vient des réglages n'est interprété comme
     du balisage — c'est ce qui rend une correction de texte inoffensive. */
  function setRich(node, text) {
    while (node.firstChild) node.removeChild(node.firstChild);
    var parts = String(text).split("**");
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === "") continue;
      if (i % 2) {
        var b = document.createElement("strong");
        b.appendChild(document.createTextNode(parts[i]));
        node.appendChild(b);
      } else {
        node.appendChild(document.createTextNode(parts[i]));
      }
    }
  }

  /* Apparence : les couleurs et la typographie du site sont des variables CSS.
     Les redéfinir sur :root suffit à les propager partout, sans toucher une
     seule règle. Seules les clés connues sont écrites, et leur valeur est
     validée : une chaîne quelconque insérée dans une feuille de style pourrait
     en refermer la déclaration et en injecter d'autres. */
  var COLOR_RE = /^#[0-9a-f]{3,8}$/i;
  var FONT_RE = /^[a-z0-9 ,'"\-]+$/i;

  function applyTheme(map) {
    var css = "";
    Object.keys(map).forEach(function (k) {
      var v = map[k];
      if (!v) return;
      if (k.indexOf("theme.color.") === 0 && COLOR_RE.test(v)) {
        css += "--" + k.slice(12) + ":" + v + ";";
      } else if (k === "theme.font.head" && FONT_RE.test(v)) {
        css += "--font-head:" + v + ";";
      } else if (k === "theme.font.body" && FONT_RE.test(v)) {
        css += "--font-body:" + v + ";";
      } else if (k === "theme.radius" && /^\d{1,2}px$/.test(v)) {
        css += "--radius:" + v + ";";
      }
    });
    if (!css) return;
    var el = document.getElementById("acci-theme");
    if (!el) {
      el = document.createElement("style");
      el.id = "acci-theme";
      document.head.appendChild(el);
    }
    el.textContent = ":root{" + css + "}";
  }

  /* Icônes : le réglage ne transporte qu'un nom, redessiné à partir du jeu
     livré avec le site. Un nom inconnu ne change rien. */
  var icons = null;
  function applyIcons(map) {
    var wanted = [];
    var nodes = document.querySelectorAll("[data-icon][data-ck]");
    for (var i = 0; i < nodes.length; i++) {
      var v = map["content." + nodes[i].getAttribute("data-ck")];
      if (v) wanted.push([nodes[i], v]);
    }
    if (!wanted.length) return;
    (icons || (icons = fetch("assets/icons.json").then(function (r) {
      if (!r.ok) throw new Error("icons");
      return r.json();
    }))).then(function (set) {
      wanted.forEach(function (pair) {
        var body = set[pair[1]];
        if (!body) return;                       // nom inconnu : on ne touche à rien
        var svg = pair[0].querySelector("svg");
        if (svg) svg.innerHTML = body;           // balisage issu du site, pas du réglage
      });
    }).catch(function () { /* jeu d'icônes absent : icônes d'origine */ });
  }

  function applyContent(map) {
    var nodes = document.querySelectorAll("[data-ck]");
    for (var i = 0; i < nodes.length; i++) {
      var v = map["content." + nodes[i].getAttribute("data-ck")];
      if (typeof v === "string" && v !== "" && !nodes[i].hasAttribute("data-icon")) {
        setRich(nodes[i], v);
      }
    }
  }

  function apply(map) {
    if (!map) return;
    applyTheme(map);
    applyContent(map);
    applyIcons(map);

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

    /* Réseaux sociaux : seule une adresse renseignée dans l'administration
       fait apparaître une icône. Une clé absente et une adresse vide valent la
       même chose — aucun compte — car effacer un réglage supprime la ligne :
       le site ne peut pas distinguer « jamais renseigné » de « retiré », et
       les deux doivent masquer l'icône. */
    var socials = document.querySelectorAll("[data-site-social]");
    for (var s = 0; s < socials.length; s++) {
      var el = socials[s];
      var href = map["social." + el.getAttribute("data-site-social")] || "";
      /* Seul https:// est accepté : un réglage détourné en « javascript: » ou
         en adresse relative deviendrait un lien piégé sur les cinquante pages.
         L'administration applique déjà cette règle ; le site ne s'y fie pas. */
      if (/^https:\/\/[^\s]+$/.test(href)) {
        el.href = href;
        el.hidden = false;
      } else {
        /* Sans href, l'ancre n'est ni cliquable ni atteignable au clavier —
           l'attribut ne doit pas survivre à une adresse retirée. */
        el.removeAttribute("href");
        el.hidden = true;
      }
    }

    /* Un conteneur dont toutes les icônes sont masquées reste une boîte flex :
       il laisserait un espace mort dans la barre supérieure et sous le logo du
       pied de page. On le masque tant qu'il ne reste rien à montrer. */
    var groups = document.querySelectorAll("[data-site-socials]");
    for (var g = 0; g < groups.length; g++) {
      groups[g].hidden = !groups[g].querySelector("[data-site-social]:not([hidden])");
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

    applyCredits(map);
  }

  /* ---- Crédits : réalisation du site et partenaires ---- */

  /* Même règle que pour les réseaux sociaux, et pour la même raison : seul
     https:// est accepté. Un réglage détourné en « javascript: » deviendrait
     un lien piégé présent au bas des cinquante pages du site, à l'endroit
     précis où un visiteur accorde le plus de confiance à ce qu'il lit.
     L'administration applique déjà cette règle ; le site ne s'y fie pas. */
  var HTTPS_RE = /^https:\/\/[^\s]+$/;

  function setLink(a, href) {
    if (!a) return;
    if (HTTPS_RE.test(href)) a.setAttribute("href", href);
    /* Une adresse retirée doit retirer l'attribut, sinon l'ancre resterait
       cliquable et tabulable vers l'ancienne destination. */
    else a.removeAttribute("href");
  }

  function applyCredits(map) {
    var wrap = document.querySelector(".footer__credits");

    /* Réalisation du site. Le nom commande tout : sans nom, il n'y a personne
       à créditer, et un lien seul n'aurait rien à porter. */
    var dev = document.querySelector('[data-site-credit="dev"]');
    var nameEl = dev && dev.querySelector('[data-site-credit="dev-name"]');
    if (dev && nameEl) {
      /* Un réglage vide n'écrase rien — c'est la règle de toute cette page :
         effacer un champ dans l'administration doit rendre la main à la valeur
         compilée, et non laisser un pied de page amputé sans qu'on sache si la
         valeur a été retirée ou perdue. */
      var name = map["credits.dev.name"];
      if (typeof name === "string" && name !== "") nameEl.textContent = name;

      var prefix = map["credits.dev.prefix"];
      var pEl = dev.querySelector('[data-site-credit="dev-prefix"]');
      if (pEl && typeof prefix === "string" && prefix !== "") pEl.textContent = prefix;

      /* L'adresse, elle, est appliquée dès que le réglage existe, même vide :
         un lien retiré doit disparaître, sinon le nom corrigé continuerait de
         pointer vers le site du prestataire précédent. */
      var durl = map["credits.dev.url"];
      if (typeof durl === "string") setLink(dev.querySelector('[data-site-credit="dev-link"]'), durl);

      /* Le nom commande l'affichage : sans nom, il n'y a personne à créditer. */
      dev.hidden = !nameEl.textContent.trim();
    }

    /* Partenaires. La liste est libre : elle est transportée en JSON dans un
       seul réglage plutôt qu'en emplacements numérotés, sinon le site imposerait
       à l'association un nombre maximal de partenaires décidé à la compilation.
       Un JSON illisible ne vide pas la liste compilée — il ne fait rien. */
    var pWrap = document.querySelector("[data-site-partners]");
    if (pWrap) {
      var raw = map["credits.partners"], list = null;
      if (typeof raw === "string" && raw !== "") {
        try { list = JSON.parse(raw); } catch (e) { list = null; }
      }
      if (Array.isArray(list)) {
        var ul = pWrap.querySelector("[data-site-partners-list]");
        var title = map["credits.partners.title"];
        var tEl = pWrap.querySelector("[data-site-partners-title]");
        if (tEl && typeof title === "string" && title !== "") tEl.textContent = title;
        if (ul) {
          while (ul.firstChild) ul.removeChild(ul.firstChild);
          var shown = 0;
          for (var i = 0; i < list.length; i++) {
            var p = list[i];
            if (!p || typeof p !== "object") continue;
            var label = typeof p.label === "string" ? p.label.trim() : "";
            if (!label) continue;                 /* un lien sans nom n'est pas un crédit */
            var li = document.createElement("li");
            /* Le nom est posé par createTextNode : rien de ce qui vient des
               réglages n'est interprété comme du balisage. */
            var node;
            if (HTTPS_RE.test(p.url || p.href || "")) {
              node = document.createElement("a");
              node.setAttribute("href", p.url || p.href);
              node.setAttribute("target", "_blank");
              node.setAttribute("rel", "noopener noreferrer");
            } else {
              node = document.createElement("span");
            }
            node.appendChild(document.createTextNode(label));
            li.appendChild(node);
            ul.appendChild(li);
            shown++;
          }
          pWrap.hidden = shown === 0;
        }
      }
    }

    /* Le conteneur porte une bordure supérieure : laissé visible alors que ses
       deux blocs sont masqués, il tracerait un filet inexpliqué au-dessus du
       copyright. */
    if (wrap) {
      var devOn = dev && !dev.hidden;
      var parOn = pWrap && !pWrap.hidden;
      wrap.hidden = !devOn && !parOn;
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
