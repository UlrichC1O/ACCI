/* =========================================================================
   ACCI — Identité du site
   -------------------------------------------------------------------------
   Le site public est statique : son nom, ses coordonnées, ses liens sociaux,
   son logo et sa favicon sont figés à la compilation. Ce module permet de les
   corriger sans redéploiement. Les valeurs sont écrites dans Supabase
   (table site_settings) et appliquées chez le visiteur par
   assets/js/site-settings.js.

   Un champ laissé vide n'écrase rien : la valeur compilée reprend sa place.
   C'est ce qui permet de revenir en arrière sans savoir ce qui avait été
   écrit dans content/site.py.

   Sécurité : la lecture est publique, l'écriture exige une session Supabase.
   Le code d'accès local protège cette interface ; il ne protège pas le site.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  var SB = window.ACCI_SB;
  if (!A || !SB) return;             // admin.js ou images.js absent
  var $ = A.ui.$, $$ = A.ui.$$, esc = A.ui.esc, toast = A.ui.toast;

  var TABLE = "site_settings";

  /* Valeurs compilées, affichées en repère dans chaque champ. Elles disent à
     quoi le site revient si le réglage est effacé — sans elles, un champ vide
     ne se distingue pas d'une valeur perdue. */
  var COMPILED = {
    "site.name": "ACCI",
    "site.long_name": "Association des Créateurs de Contenu Ivoiriens",
    "site.tagline": "Pour un usage responsable, sûr et éthique des réseaux sociaux en Côte d’Ivoire.",
    "site.email": "contact@acci.ci",
    "site.phone": "+225 27 22 00 00 00",
    "site.address": "Cocody, Riviera Golf — Abidjan, Côte d’Ivoire",
    "social.facebook": "https://www.facebook.com/ACCI.CotedIvoire",
    "social.x": "https://x.com/ACCI_CI",
    "social.instagram": "https://www.instagram.com/acci.ci",
    "social.tiktok": "https://www.tiktok.com/@acci.ci",
    "social.youtube": "https://www.youtube.com/@ACCI-CotedIvoire",
    "social.linkedin": "https://www.linkedin.com/company/acci-ci"
  };

  var GENERAL = [
    { k: "site.name",      l: "Nom court",     t: "text" },
    { k: "site.long_name", l: "Nom complet",   t: "text" },
    { k: "site.tagline",   l: "Slogan",        t: "textarea" },
    { k: "site.email",     l: "Adresse e-mail", t: "email" },
    { k: "site.phone",     l: "Téléphone",     t: "tel" },
    { k: "site.address",   l: "Adresse postale", t: "text" }
  ];

  var SOCIALS = [
    { k: "social.facebook",  l: "Facebook" },
    { k: "social.x",         l: "X (Twitter)" },
    { k: "social.instagram", l: "Instagram" },
    { k: "social.tiktok",    l: "TikTok" },
    { k: "social.youtube",   l: "YouTube" },
    { k: "social.linkedin",  l: "LinkedIn" }
  ];

  var BRAND = [
    { k: "brand.logo_header", l: "Logo — en-tête",
      note: "Affiché sur fond clair, en haut de chaque page." },
    { k: "brand.logo_footer", l: "Logo clair — pied de page et assistant",
      note: "Affiché sur fond vert sombre : il lui faut un texte clair, sans quoi il devient illisible." },
    { k: "brand.favicon_png", l: "Favicon PNG",
      note: "Icône de l'onglet. Carrée, 256 × 256 recommandé." },
    { k: "brand.favicon_svg", l: "Favicon SVG",
      note: "Version vectorielle, utilisée en priorité par les navigateurs récents." },
    { k: "brand.apple_touch", l: "Icône iOS",
      note: "Écran d'accueil iPhone / iPad. Carrée, 180 × 180." }
  ];

  var state = { map: {}, loaded: false, error: null, busy: false };

  /* ------------------------------ Données -------------------------------- */

  function load() {
    return fetch(SB.url + "/rest/v1/" + TABLE + "?select=key,value", {
      headers: SB.authHeaders()
    }).then(function (r) {
      if (!r.ok) throw new Error("Lecture des réglages refusée (" + r.status + ").");
      return r.json();
    }).then(function (rows) {
      var m = {};
      (Array.isArray(rows) ? rows : []).forEach(function (row) {
        if (row && typeof row.key === "string") m[row.key] = row.value == null ? "" : String(row.value);
      });
      state.map = m; state.loaded = true; state.error = null;
    });
  }

  function save(key, value) {
    return SB.ensureSession().then(function () {
      return fetch(SB.url + "/rest/v1/" + TABLE + "?on_conflict=key", {
        method: "POST",
        headers: Object.assign(SB.authHeaders(true, true), {
          Prefer: "resolution=merge-duplicates,return=representation"
        }),
        body: JSON.stringify({ key: key, value: value, updated_at: new Date().toISOString() })
      });
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.message || j.hint || "Écriture refusée");
        return j;
      });
    });
  }

  /* Effacer le réglage plutôt que d'enregistrer une chaîne vide : une valeur
     vide serait appliquée telle quelle et effacerait la coordonnée sur le site,
     alors que l'intention est de revenir à ce qui a été compilé. */
  function clear(key) {
    return SB.ensureSession().then(function () {
      return fetch(SB.url + "/rest/v1/" + TABLE + "?key=eq." + encodeURIComponent(key), {
        method: "DELETE",
        headers: Object.assign(SB.authHeaders(true, true), { Prefer: "return=representation" })
      });
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.message || "Suppression refusée");
        return j;
      });
    });
  }

  /* ----------------------------- Validation ------------------------------ */

  function invalid(key, v) {
    if (!v) return null;                       // vide = retour à la valeur compilée
    if (key === "site.email" && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v))
      return "Adresse e-mail invalide.";
    if (key.indexOf("social.") === 0 || key.indexOf("brand.") === 0) {
      if (!/^https:\/\/\S+$/.test(v))
        return "L'adresse doit commencer par https:// — un lien en http est bloqué par la politique de sécurité du site.";
    }
    return null;
  }

  /* ------------------------------- Rendu --------------------------------- */

  function needLogin() {
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Connexion requise</h2></div>' +
      '<p class="muted">Le code d\'accès local ouvre cette interface, mais il ne protège pas le site public : ' +
      'il est vérifié dans le navigateur. Modifier l\'identité vue par les visiteurs demande une session ' +
      'authentifiée — sans quoi n\'importe qui pourrait changer l\'adresse de contact de l\'association.</p>' +
      '<div class="fgrid">' +
        '<div class="afield"><label>Adresse e-mail</label><input id="si-mail" type="email" autocomplete="username"></div>' +
        '<div class="afield"><label>Mot de passe</label><input id="si-pass" type="password" autocomplete="current-password"></div>' +
      '</div><div class="btnrow"><button class="abtn abtn--primary" id="si-login">Se connecter</button></div>' +
      '<p class="ferr" id="si-msg" hidden></p></section>';
  }

  function errorHTML() {
    return '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title">Réglages indisponibles</h2></div>' +
      '<p class="muted">' + esc(state.error || "") + '</p>' +
      '<div class="btnrow"><button class="abtn abtn--ghost" id="si-retry">Réessayer</button></div></section>';
  }

  function waiting() {
    return '<section class="panel"><p class="muted">Chargement des réglages…</p></section>';
  }

  function delay() {
    return '<p class="muted" style="margin-top:14px">Les modifications apparaissent sur le site public ' +
      'dans un délai maximum de 5 minutes (durée du cache navigateur). ' +
      'Un champ vidé rétablit la valeur d\'origine.</p>';
  }

  function fieldRow(f) {
    var v = state.map[f.k] || "";
    var ph = COMPILED[f.k] || "";
    var input = f.t === "textarea"
      ? '<textarea class="si-in" data-k="' + esc(f.k) + '" rows="2" placeholder="' + esc(ph) + '">' + esc(v) + '</textarea>'
      : '<input class="si-in" data-k="' + esc(f.k) + '" type="' + (f.t || "text") + '" value="' + esc(v) + '" placeholder="' + esc(ph) + '">';
    var badge = v
      ? '<span class="tag" style="background:#dcfce7;color:#166534">modifié</span>'
      : '<span class="tag muted">valeur d\'origine</span>';
    return '<div class="afield">' +
      '<label>' + esc(f.l) + ' ' + badge + '</label>' + input +
      (f.note ? '<span class="muted" style="font-size:11.5px">' + esc(f.note) + '</span>' : '') +
      '</div>';
  }

  function panel(title, fields, lead) {
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">' + esc(title) + '</h2></div>' +
      (lead ? '<p class="muted">' + esc(lead) + '</p>' : '') +
      '<div class="fgrid">' + fields.map(fieldRow).join("") + '</div>' +
      '<div class="btnrow"><button class="abtn abtn--primary si-save">Enregistrer</button>' +
      '<button class="abtn abtn--ghost si-reload">Recharger</button></div>' +
      '<p class="ferr" id="si-err" hidden></p>' + delay() + '</section>';
  }

  function guard(fn) {
    return function () {
      if (!SB.session()) return needLogin();
      if (state.error) return errorHTML();
      if (!state.loaded) return waiting();
      return fn();
    };
  }

  var generalHTML = guard(function () {
    return panel("Identité & contact", GENERAL,
      "Ces valeurs apparaissent dans le pied de page, la page Contact et les données structurées lues par les moteurs de recherche.");
  });

  var socialHTML = guard(function () {
    return panel("Réseaux sociaux", SOCIALS,
      "Une adresse effacée puis enregistrée vide masque l'icône sur le site, au lieu de mener au compte compilé par défaut.");
  });

  /* ------------------------------ Marque --------------------------------- */

  function brandRow(f) {
    var v = state.map[f.k] || "";
    var preview = v
      ? '<img src="' + esc(v) + '" alt="" style="max-height:54px;max-width:180px;background:#0b3d2e;padding:6px;border-radius:8px">'
      : '<span class="muted">Image d\'origine conservée</span>';
    return '<div class="admin-card" style="align-items:flex-start;flex-direction:column;gap:8px">' +
      '<div><b>' + esc(f.l) + '</b><br><span class="muted" style="font-size:11.5px">' + esc(f.note) + '</span></div>' +
      '<div>' + preview + '</div>' +
      '<div class="btnrow">' +
        '<label class="abtn abtn--ghost abtn--sm" style="cursor:pointer">Choisir un fichier' +
          '<input type="file" class="si-file" data-k="' + esc(f.k) + '" accept="image/*" hidden></label>' +
        (v ? '<button class="abtn abtn--danger abtn--sm si-clear" data-k="' + esc(f.k) + '">Rétablir l\'origine</button>' : '') +
      '</div></div>';
  }

  var brandHTML = guard(function () {
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Logo & favicon</h2></div>' +
      '<p class="muted">Le fichier est déposé dans le dépôt d\'images du site, puis son adresse est enregistrée. ' +
      'Si le nouveau visuel ne se charge pas chez le visiteur, la page rétablit d\'elle-même l\'image d\'origine.</p>' +
      BRAND.map(brandRow).join("") +
      '<p class="ferr" id="si-err" hidden></p>' + delay() + '</section>';
  });

  /* ------------------------------ Liaisons -------------------------------- */

  function reload() {
    state.loaded = false; A.refresh();
    load().catch(function (e) { state.error = e.message; })
          .then(function () { A.refresh(); });
  }

  function bindLogin() {
    var b = $("#si-login"); if (!b) return true;
    b.addEventListener("click", function () {
      var m = $("#si-msg");
      SB.signIn($("#si-mail").value.trim(), $("#si-pass").value).then(function () {
        toast("Session ouverte.");
        return load().catch(function (e) { state.error = e.message; });
      }).then(function () { A.refresh(); }).catch(function (e) {
        m.className = "ferr"; m.textContent = e.message; m.hidden = false;
      });
    });
    return true;
  }

  function bindCommon() {
    var r = $("#si-retry"); if (r) r.addEventListener("click", reload);
    $$(".si-reload").forEach(function (b) { b.addEventListener("click", reload); });
  }

  function bindForm() {
    if ($("#si-login")) return bindLogin();
    bindCommon();
    $$(".si-save").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (state.busy) return;
        var err = $("#si-err");
        var inputs = $$(".si-in");
        var jobs = [], bad = null;

        inputs.forEach(function (el) {
          var k = el.getAttribute("data-k");
          var v = el.value.trim();
          var msg = invalid(k, v);
          if (msg) { if (!bad) bad = msg; return; }
          var was = state.map[k] || "";
          if (v === was) return;                       // rien à écrire
          jobs.push(v ? save(k, v) : clear(k));
        });

        if (bad) { err.className = "ferr"; err.textContent = bad; err.hidden = false; return; }
        if (!jobs.length) { toast("Aucune modification."); return; }

        state.busy = true; btn.disabled = true;
        Promise.all(jobs).then(function () {
          toast(jobs.length + " réglage(s) enregistré(s).");
          return load();
        }).then(function () {
          state.busy = false; A.refresh();
        }).catch(function (e) {
          state.busy = false; btn.disabled = false;
          err.className = "ferr"; err.textContent = e.message; err.hidden = false;
        });
      });
    });
  }

  function bindBrand() {
    if ($("#si-login")) return bindLogin();
    bindCommon();

    $$(".si-file").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var file = inp.files && inp.files[0];
        if (!file) return;
        var k = inp.getAttribute("data-k");
        var err = $("#si-err");
        /* Un nom stable serait servi depuis le cache du visiteur : chaque dépôt
           reçoit donc un nom neuf, sans quoi l'ancien logo resterait affiché. */
        var ext = (file.name.match(/\.[a-z0-9]+$/i) || [".png"])[0].toLowerCase();
        var path = "brand/" + k.replace(/[^a-z0-9]+/gi, "-") + "-" + Date.now() + ext;

        toast("Téléversement…");
        SB.upload(path, file).then(function () {
          return save(k, SB.publicUrl(path));
        }).then(function () {
          toast("Image enregistrée.");
          return load();
        }).then(function () { A.refresh(); }).catch(function (e) {
          err.className = "ferr"; err.textContent = e.message; err.hidden = false;
        });
      });
    });

    $$(".si-clear").forEach(function (b) {
      b.addEventListener("click", function () {
        var err = $("#si-err");
        clear(b.getAttribute("data-k")).then(function () {
          toast("Image d'origine rétablie.");
          return load();
        }).then(function () { A.refresh(); }).catch(function (e) {
          err.className = "ferr"; err.textContent = e.message; err.hidden = false;
        });
      });
    });
  }

  /* --------------------------- Enregistrement ----------------------------- */

  A.register(
    { view: "identity", icon: "🏷", label: "Identité du site" },
    { title: "Identité du site", tabs: [
      { id: "general", l: "Identité & contact" },
      { id: "social",  l: "Réseaux sociaux" },
      { id: "brand",   l: "Logo & favicon" }
    ] },
    {
      "identity.general": { r: generalHTML, b: bindForm },
      "identity.social":  { r: socialHTML,  b: bindForm },
      "identity.brand":   { r: brandHTML,   b: bindBrand }
    }
  );

  if (SB.session()) {
    load().catch(function (e) { state.error = e.message; })
          .then(function () { A.refresh(); });
  }
})();
