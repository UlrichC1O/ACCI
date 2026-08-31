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
  /* Le cache suit le découpage de la requête : une seule entrée partagée
     appliquerait à une page la tranche téléchargée pour une autre, et ses
     propres corrections manqueraient. */
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
      var raw = localStorage.getItem(CACHE_KEY + ":" + pageSlug());
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || typeof c.map !== "object" || !c.at) return null;
      return c;
    } catch (e) { return null; }
  }

  function writeCache(map) {
    try {
      localStorage.setItem(CACHE_KEY + ":" + pageSlug(), JSON.stringify({ at: Date.now(), map: map }));
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
      var node = nodes[i];
      var v = map["content." + node.getAttribute("data-ck")];
      if (typeof v !== "string" || v === "" || node.hasAttribute("data-icon")) continue;
      setRich(node, v);
      /* Un chiffre-clé est aussi la cible du compteur animé de main.js, qui lit
         data-count et se termine par « textContent = raw ». Sans report de la
         correction dans l'attribut, la valeur corrigée s'affichait puis
         disparaissait au moment où le bloc entrait dans l'écran, remplacée par
         la valeur compilée — et seulement là, ce qui la rendait difficile à
         croire pour qui venait de l'enregistrer. */
      if (node.hasAttribute("data-count")) node.setAttribute("data-count", v);
    }
  }

  /* ---- Graphiques ----------------------------------------------------- */
  /* Un graphique ne se corrige pas comme un texte : la largeur d'une barre est
     calculée à la compilation (--w), et un secteur d'anneau est un arc dont la
     longueur dépend du total de la série. Remplacer un nombre affiché sans
     refaire ce calcul donnerait une barre dont la longueur dément son étiquette.
     Les séries sont donc relues, puis le graphique est redessiné.

     La série est enregistrée en un seul réglage JSON par graphique
     (chart.<slug>#<bloc>), comme credits.partners l'est déjà pour une liste de
     longueur variable — ce qui permet d'ajouter, de retirer et de réordonner. */
  var MAX_SERIES = 12;

  function readSeries(raw, kind) {
    var doc;
    try { doc = JSON.parse(raw); } catch (e) { return null; }
    if (!doc || doc.kind !== kind || !Array.isArray(doc.items)) return null;
    var out = [];
    for (var i = 0; i < doc.items.length && out.length < MAX_SERIES; i++) {
      var it = doc.items[i];
      if (!it || typeof it.label !== "string" || !it.label.trim()) continue;
      var v = Number(it.value);
      if (!isFinite(v) || v < 0) continue;
      out.push({
        label: it.label,
        value: v,
        suffix: it.suffix == null ? "" : String(it.suffix),
        /* Une couleur qui n'est pas une couleur est ignorée : la valeur part
           dans un attribut style, où « red;background:url(…) » serait autre
           chose qu'une couleur. */
        color: (typeof it.color === "string" && COLOR_RE.test(it.color)) ? it.color : ""
      });
    }
    /* Une série vide n'efface pas le graphique compilé : mieux vaut la version
       d'origine qu'un cadre vide sans explication. */
    return out.length ? out : null;
  }

  function paletteOf(card) {
    var raw = (card.getAttribute("data-chart-palette") || "").split(",");
    var pal = [];
    for (var i = 0; i < raw.length; i++) {
      if (COLOR_RE.test(raw[i])) pal.push(raw[i]);
    }
    return pal.length ? pal : ["#F77F00"];
  }

  /* Ajuste une liste de noeuds à la longueur voulue : les premiers sont
     réutilisés, les manquants clonés sur le premier, le surplus retiré. Sans
     cela, ajouter ou retirer une série depuis l'administration n'aurait aucun
     effet visible. */
  function fitNodes(host, nodes, n, mk) {
    var list = [].slice.call(nodes);
    for (var i = list.length; i < n; i++) {
      var clone = list.length ? list[0].cloneNode(true) : mk();
      host.appendChild(clone);
      list.push(clone);
      /* Un noeud créé après coup n'a jamais été vu par l'observateur qui pose
         « is-in » : sans cette classe, la règle de révélation le maintient à
         une largeur nulle, définitivement. */
      if (clone.classList) clone.classList.add("is-in");
    }
    for (var j = list.length - 1; j >= n; j--) {
      if (list[j].parentNode) list[j].parentNode.removeChild(list[j]);
      list.pop();
    }
    return list;
  }

  function drawBar(card, series) {
    var host = card.querySelector("[data-chart-rows]");
    if (!host) return;
    var max = 0;
    series.forEach(function (s) { if (s.value > max) max = s.value; });
    if (!max) return;
    var pal = paletteOf(card);
    var rows = fitNodes(host, host.querySelectorAll("[data-chart-row]"), series.length);
    rows.forEach(function (row, i) {
      var s = series[i];
      var label = row.querySelector(".cbar__label");
      var fill = row.querySelector(".cbar__fill");
      var val = row.querySelector(".cbar__val");
      if (label) setRich(label, s.label);
      if (fill) {
        /* setProperty sur --w, jamais style.width : une largeur en ligne
           l'emporterait sur la règle qui anime la barre, et la barre
           apparaîtrait déjà remplie. */
        fill.style.setProperty("--w", Math.round(s.value / max * 100) + "%");
        fill.style.setProperty("--c", s.color || pal[i % pal.length]);
      }
      if (val) val.textContent = String(s.value) + s.suffix;
    });
  }

  function drawDonut(card, series) {
    var svg = card.querySelector("[data-chart-arcs]");
    var leg = card.querySelector("[data-chart-legend]");
    if (!svg || !leg) return;
    var r = parseFloat(card.getAttribute("data-chart-r")) || 70;
    var stroke = card.getAttribute("data-chart-stroke") || "26";
    var C = 2 * Math.PI * r;
    var total = 0;
    series.forEach(function (s) { total += s.value; });
    if (!total) return;
    var pal = paletteOf(card);

    var arcs = fitNodes(svg, svg.querySelectorAll("[data-chart-arc]"), series.length, function () {
      return document.createElementNS("http://www.w3.org/2000/svg", "circle");
    });
    var acc = 0;
    arcs.forEach(function (arc, i) {
      var s = series[i], len = s.value / total * C;
      arc.setAttribute("class", "donut__seg");
      arc.setAttribute("data-chart-arc", "");
      arc.setAttribute("cx", "100"); arc.setAttribute("cy", "100");
      arc.setAttribute("r", String(r)); arc.setAttribute("fill", "none");
      arc.setAttribute("stroke", s.color || pal[i % pal.length]);
      arc.setAttribute("stroke-width", stroke);
      arc.setAttribute("stroke-dasharray", len.toFixed(2) + " " + (C - len).toFixed(2));
      arc.setAttribute("stroke-dashoffset", (-acc).toFixed(2));
      arc.setAttribute("transform", "rotate(-90 100 100)");
      arc.setAttribute("stroke-linecap", "butt");
      acc += len;
    });

    var items = fitNodes(leg, leg.querySelectorAll("[data-chart-legitem]"), series.length);
    items.forEach(function (li, i) {
      var s = series[i];
      var sw = li.querySelector(".donut__swatch");
      var tx = li.querySelector(".donut__legtext");
      var vl = li.querySelector(".donut__legval");
      if (sw) sw.style.background = s.color || pal[i % pal.length];
      if (tx) setRich(tx, s.label);
      if (vl) vl.textContent = Math.round(s.value / total * 100) + " %";
    });
  }

  function applyCharts(map) {
    var cards = document.querySelectorAll("[data-chart]");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var raw = map["chart." + card.getAttribute("data-chart")];
      if (typeof raw !== "string" || !raw) continue;
      var kind = card.getAttribute("data-chart-kind");
      var series = readSeries(raw, kind);
      if (!series) continue;
      try {
        if (kind === "bar") drawBar(card, series);
        else if (kind === "donut") drawDonut(card, series);
      } catch (e) { /* graphique laissé tel qu'il a été compilé */ }
    }
  }

  /* La table est publiée ici pour les modules qui en dépendent sans vouloir la
     recharger — l'assistant de conversation y prend sa base de connaissances.
     Elle est posée avant l'événement : un module chargé après ce fichier la
     trouve déjà là, un module chargé avant reçoit l'événement. */
  function publish(map) {
    window.ACCI_SETTINGS = map;
    try {
      document.dispatchEvent(new CustomEvent("acci:settings", { detail: map }));
    } catch (e) {
      /* CustomEvent manquant : les modules déjà chargés liront ACCI_SETTINGS. */
    }
  }

  /* ------------------------------------------------------------------------
     Bureau exécutif
     La composition d'un bureau change : départs, arrivées, réélections. Figer
     neuf places à la compilation obligerait à recompiler le site à chaque
     mouvement, et à passer par un développeur pour une photo. La liste est donc
     transportée en JSON dans un seul réglage, et reconstruite ici.

     Comme partout sur cette page, une valeur illisible ne casse rien : la liste
     compilée reste affichée. Un bureau vidé par erreur réapparaît tel qu'il
     était, plutôt que de laisser une page sans personne.
     ------------------------------------------------------------------------ */
  function memberNode(m) {
    var card = document.createElement("div");
    card.className = "member reveal is-in";

    var name = typeof m.name === "string" ? m.name.trim() : "";
    var photo = typeof m.photo === "string" ? m.photo.trim() : "";

    var av = document.createElement("div");
    if (photo) {
      av.className = "member__avatar member__avatar--photo";
      var img = document.createElement("img");
      img.src = photo;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      /* Un portrait injoignable rend la main aux initiales : mieux vaut une
         pastille lisible qu'un cadre vide au milieu de la grille. */
      img.onerror = function () {
        av.className = "member__avatar";
        av.textContent = initialsOf(name);
      };
      av.appendChild(img);
    } else {
      av.className = "member__avatar";
      av.textContent = initialsOf(name);
    }
    card.appendChild(av);

    var h = document.createElement("h3");
    h.className = "member__name";
    h.textContent = name;
    card.appendChild(h);

    var role = typeof m.role === "string" ? m.role.trim() : "";
    if (role) {
      var r = document.createElement("span");
      r.className = "member__role";
      r.textContent = role;
      card.appendChild(r);
    }
    var bio = typeof m.bio === "string" ? m.bio.trim() : "";
    if (bio) {
      var b = document.createElement("p");
      b.className = "member__bio";
      b.textContent = bio;
      card.appendChild(b);
    }
    return card;
  }

  function initialsOf(name) {
    return String(name || "").split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0); }).join("").toUpperCase();
  }

  function applyTeam(map) {
    var grids = document.querySelectorAll("[data-site-team]");
    for (var g = 0; g < grids.length; g++) {
      var grid = grids[g];
      var raw = map["team." + grid.getAttribute("data-site-team")];
      if (typeof raw !== "string" || raw === "") continue;
      var list = null;
      try { list = JSON.parse(raw); } catch (e) { continue; }
      if (!Array.isArray(list)) continue;

      /* Une entrée sans nom n'est pas une personne : on l'ignore plutôt que
         d'afficher une fiche anonyme. Si aucune n'est valable, la liste
         compilée reste en place. */
      var valid = list.filter(function (m) {
        return m && typeof m === "object" &&
               typeof m.name === "string" && m.name.trim() !== "";
      });
      if (!valid.length) continue;

      while (grid.firstChild) grid.removeChild(grid.firstChild);
      for (var i = 0; i < valid.length; i++) grid.appendChild(memberNode(valid[i]));
    }
  }

  /* Données structurées : « sameAs » est ce qui relie l'association à ses
     comptes officiels dans le graphe de connaissances de Google. La
     compilation ne peut pas le produire — les comptes sont dans
     l'administration, qu'elle ne consulte pas — et le laisser vide revenait à
     ne rien déclarer du tout. Il est donc complété ici, à partir des mêmes
     adresses que les icônes.

     Le contenu d'un script application/ld+json est une donnée, pas du code :
     le réécrire n'est pas soumis à la politique de sécurité des scripts. */
  function applySameAs(urls) {
    if (!urls || !urls.length) return;
    var tags = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < tags.length; i++) {
      var data;
      try { data = JSON.parse(tags[i].textContent); } catch (e) { continue; }
      var nodes = data["@graph"] || [data];
      var touche = false;
      for (var j = 0; j < nodes.length; j++) {
        if (nodes[j] && nodes[j]["@type"] === "NGO") { nodes[j].sameAs = urls; touche = true; }
      }
      if (touche) {
        try { tags[i].textContent = JSON.stringify(data); } catch (e) { /* sans effet */ }
      }
    }
  }

  function apply(map) {
    if (!map) return;
    publish(map);
    applyTheme(map);
    applyContent(map);
    applyIcons(map);
    applyCharts(map);
    applyTeam(map);

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
    var comptes = [];
    for (var s = 0; s < socials.length; s++) {
      var el = socials[s];
      var href = map["social." + el.getAttribute("data-site-social")] || "";
      /* Seul https:// est accepté : un réglage détourné en « javascript: » ou
         en adresse relative deviendrait un lien piégé sur les cinquante pages.
         L'administration applique déjà cette règle ; le site ne s'y fie pas. */
      if (/^https:\/\/[^\s]+$/.test(href)) {
        el.href = href;
        el.hidden = false;
        if (comptes.indexOf(href) === -1) comptes.push(href);
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
    applySameAs(comptes);

    /* Les balises de mesure sont montées par site-analytics.js : ce fichier
       applique l'identité du site, pas le suivi des visiteurs. Les réglages
       lui sont passés plutôt que d'être cherchés une seconde fois. La valeur
       est aussi posée sur window : site-analytics.js peut être évalué après
       ce fichier, et l'événement serait alors déjà passé. */
    window.ACCI_SETTINGS = map;
    try {
      document.dispatchEvent(new CustomEvent("acci:settings", { detail: map }));
    } catch (e) { /* CustomEvent indisponible : le relais par window suffit */ }
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

  /* La page ne demande que ce qui la concerne.

     Les corrections de texte sont enregistrées une par champ, sous une clé
     « content.<page>#<bloc>.<champ> ». Le site en compte 1419 : les charger
     toutes à chaque page revenait à télécharger, pour la page d'accueil, les
     corrections des cinquante et une autres. La requête ne retient donc que les
     clés générales — identité, couleurs, icônes, graphiques, assistant — et les
     corrections de la page affichée.

     Le repère de page est lu sur le premier noeud modifiable plutôt que dans
     l'adresse : c'est la même valeur que celle qui sert de clé, donc elle reste
     juste quelle que soit la façon dont la page a été servie (avec ou sans
     .html, par un alias, depuis un sous-dossier). */
  function pageSlug() {
    var n = document.querySelector("[data-ck]");
    if (n) {
      var k = n.getAttribute("data-ck") || "";
      var hash = k.indexOf("#");
      if (hash > 0) return k.slice(0, hash);
    }
    var last = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "");
    return last || "index";
  }

  function get(query) {
    return fetch(SUPABASE_URL + "/rest/v1/site_settings?" + query, {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(toMap);
  }

  function fetchSettings() {
    var slug = pageSlug();
    /* Un repère inattendu ne part pas dans la requête : il y ouvrirait la
       syntaxe du filtre. Dans ce cas on demande tout, comme avant. */
    if (!/^[a-z0-9-]+$/.test(slug)) return get("select=key,value");
    var filtered = "select=key,value&or=(key.not.like.content.*,key.like.content."
      + encodeURIComponent(slug) + "%23*)";
    return get(filtered).catch(function () {
      /* Filtre refusé (syntaxe, version du service) : on retombe sur la
         requête complète plutôt que de laisser la page sans ses réglages. */
      return get("select=key,value");
    });
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
