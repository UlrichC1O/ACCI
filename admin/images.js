/* =========================================================================
   ACCI — Gestion des images du site
   -------------------------------------------------------------------------
   Le site public est statique : ses photos sont figées à la compilation. Ce
   module permet de les remplacer, de les réaffecter, de corriger un cadrage ou
   un texte alternatif — sans redéploiement. Les modifications sont écrites
   dans Supabase et appliquées par assets/js/site-images.js chez le visiteur.

   Sécurité : la lecture est publique, l'écriture exige une session Supabase.
   Le code d'accès local protège l'interface ; il ne protégerait pas le site.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;                       // admin.js absent : on ne fait rien
  var $ = A.ui.$, esc = A.ui.esc, toast = A.ui.toast;

  var SB_URL = "https://durwoqjfjhdersuwxxwg.supabase.co";
  var SB_KEY = "sb_publishable_BdVe64A0kV6d6vCjdJglvg_JakPYpZ5";
  var BUCKET = "site-images";
  var WIDTHS = [640, 1024, 1600];
  var FALLBACK_W = 1200;
  var TOK_KEY = "acci_sb_session";

  var state = { inv: null, byKey: {}, slotImages: {}, images: {}, placements: {},
                filter: "", loading: false, authed: false, error: null };

  /* Rectangle de remplacement affiché quand une vignette est introuvable :
     sans lui, l'aperçu de cadrage s'effondre à une hauteur nulle et le point
     d'intérêt se choisit à l'aveugle. */
  var PLACEHOLDER = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="427">' +
    '<rect width="100%" height="100%" fill="#e2e8f0"/>' +
    '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" ' +
    'font-family="sans-serif" font-size="26" fill="#64748b">Aperçu indisponible</text></svg>');

  /* ------------------------------ Session ------------------------------- */

  function session() {
    try { return JSON.parse(localStorage.getItem(TOK_KEY)); } catch (e) { return null; }
  }
  function setSession(s) {
    if (s) {
      // Le jeton d'accès ne vit qu'une heure : on retient son échéance pour
      // pouvoir le renouveler avant qu'il n'expire.
      s.expires_at = Date.now() + ((s.expires_in || 3600) - 60) * 1000;
      localStorage.setItem(TOK_KEY, JSON.stringify(s));
    } else {
      localStorage.removeItem(TOK_KEY);
    }
  }

  /* Renouvelle le jeton si nécessaire. Sans cela, une session ouverte depuis
     plus d'une heure échouait silencieusement à l'écriture, avec un message
     d'erreur incompréhensible pour l'utilisateur. */
  var refreshing = null;
  /* Sans session utilisable, ces promesses échouent au lieu de se résoudre à
     null : un appel qui continuait retombait sur la clé publiable, et une
     suppression anonyme — refusée par la politique d'accès mais répondue 204 —
     était annoncée comme un succès. */
  function noSession() {
    var e = new Error("Session expirée, reconnectez-vous.");
    e.auth = true;
    return e;
  }
  function ensureSession() {
    var s = session();
    if (!s) return Promise.reject(noSession());
    if (s.expires_at && Date.now() < s.expires_at) return Promise.resolve(s);
    if (!s.refresh_token) {
      setSession(null); state.authed = false; A.refresh();
      return Promise.reject(noSession());
    }
    if (refreshing) return refreshing;
    refreshing = fetch(SB_URL + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      headers: { apikey: SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    }).then(function (r) {
      if (!r.ok) throw new Error("refresh");
      return r.json();
    }).then(function (j) {
      setSession(j); refreshing = null; return j;
    }).catch(function () {
      // Renouvellement impossible : on repasse par l'écran de connexion
      // plutôt que d'enchaîner des écritures refusées.
      setSession(null); refreshing = null;
      state.authed = false;
      A.refresh();
      throw noSession();
    });
    return refreshing;
  }

  function authHeaders(json, write) {
    var s = session();
    var tok = s && s.access_token;
    // Une écriture ne doit jamais repartir avec la clé publiable : elle serait
    // exécutée en anonyme, sans droit d'écrire, et l'échec passerait inaperçu.
    if (write && !tok) throw noSession();
    var h = { apikey: SB_KEY, Authorization: "Bearer " + (tok || SB_KEY) };
    if (json) h["Content-Type"] = "application/json";
    return h;
  }

  function signIn(email, password) {
    return fetch(SB_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error_description || j.msg || "Identifiants refusés");
        return j;
      });
    }).then(function (j) { setSession(j); return j; });
  }

  /* --------------------------- Données ---------------------------------- */

  function loadInventory() {
    return fetch("../assets/img/inventory.json").then(function (r) {
      if (!r.ok) throw new Error("Inventaire des images introuvable.");
      return r.json();
    }).then(function (j) {
      // Un serveur qui répond autre chose que l'inventaire (page d'erreur,
      // redirection) passait le décodage sans être détecté : le module restait
      // alors bloqué sur « Chargement… » sans rien signaler.
      if (!j || !Array.isArray(j.images) || !Array.isArray(j.placements)) {
        throw new Error("Inventaire des images illisible.");
      }
      return j;
    });
  }

  function loadTable(table) {
    return fetch(SB_URL + "/rest/v1/" + table + "?select=*", { headers: authHeaders() })
      .then(function (r) {
        if (!r.ok) {
          // Ne jamais substituer une liste vide : l'interface annoncerait
          // « aucune surcharge » alors qu'elles existent, et l'enregistrement
          // suivant écraserait des réglages toujours en ligne.
          var e = new Error("Chargement des surcharges impossible (" + r.status + ").");
          e.auth = (r.status === 401 || r.status === 403);
          throw e;
        }
        return r.json();
      });
  }

  /* Le chargement passe par ensureSession() comme les écritures : avec un
     jeton périmé, les surcharges revenaient en 401 et disparaissaient de
     l'écran, sans que rien ne l'indique à l'utilisateur. */
  function loadAll() {
    state.loading = true;
    return ensureSession().then(function () {
      return Promise.all([loadInventory(), loadTable("image_overrides"), loadTable("placement_overrides")]);
    }).then(function (res) {
      state.inv = res[0];
      state.byKey = {};    res[0].images.forEach(function (i) { state.byKey[i.key] = i; });
      // Une photo posée par le gabarit apparaît toujours dans un emplacement :
      // celles qui n'y figurent pas ne portent aucun repère dans les pages et
      // ne peuvent donc être ni remplacées ni réaffectées.
      state.slotImages = {}; res[0].placements.forEach(function (p) { state.slotImages[p.image] = true; });
      state.images = {};   res[1].forEach(function (r) { state.images[r.key] = r; });
      state.placements = {}; res[2].forEach(function (r) { state.placements[r.slot] = r; });
      state.loading = false; state.authed = true; state.error = null;
    }, function (e) {
      state.loading = false;
      if (e && e.auth) state.authed = false; else state.error = e.message;
      throw e;
    });
  }

  function upsert(table, row, conflictCol) {
    return ensureSession().then(function () {
      return fetch(SB_URL + "/rest/v1/" + table + "?on_conflict=" + conflictCol, {
        method: "POST",
        headers: Object.assign(authHeaders(true, true), {
          Prefer: "resolution=merge-duplicates,return=representation"
        }),
        body: JSON.stringify(row)
      });
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.message || j.hint || "Écriture refusée");
        return j;
      });
    });
  }

  function del(table, col, value) {
    return ensureSession().then(function () {
      return fetch(SB_URL + "/rest/v1/" + table + "?" + col + "=eq." + encodeURIComponent(value), {
        method: "DELETE",
        // Sans « return=representation », une suppression qui n'efface rien
        // (droits insuffisants, entrée déjà absente) répond 204 exactement
        // comme une vraie suppression : le retour en arrière était alors
        // confirmé à l'utilisateur alors que la photo restait remplacée.
        headers: Object.assign(authHeaders(false, true), { Prefer: "return=representation" })
      });
    }).then(function (r) {
      return r.text().then(function (t) {
        if (!r.ok) throw new Error("Suppression refusée : " + t.slice(0, 120));
        var rows = [];
        try { rows = t ? JSON.parse(t) : []; } catch (e) { rows = []; }
        if (!rows.length) throw new Error("Aucune ligne supprimée — droits insuffisants ou entrée déjà absente.");
        return rows;
      });
    });
  }

  /* Supprime les fichiers d'une photo remplacée. Sans ce nettoyage, chaque
     remplacement puis retour en arrière laissait quatre fichiers orphelins
     dans le dépôt, qui finissaient par en occuper tout l'espace. */
  function purgeFiles(ov) {
    if (!ov || !ov.base) return Promise.resolve();
    var paths = (ov.widths || []).map(function (w) { return ov.base + "-" + w + ".webp"; });
    if (ov.fallback) paths.push(ov.fallback);
    if (!paths.length) return Promise.resolve();
    return ensureSession().then(function () {
      return fetch(SB_URL + "/storage/v1/object/" + BUCKET, {
        method: "DELETE",
        headers: Object.assign(authHeaders(true, true), {}),
        body: JSON.stringify({ prefixes: paths })
      });
    }).catch(function () { /* le retour en arrière prime sur le ménage */ });
  }

  /* --------------------- Fabrication des variantes ----------------------- */
  /* Les déclinaisons responsives sont produites dans le navigateur, afin que
     les photos téléversées gardent exactement le même traitement que celles
     du site : WebP à plusieurs largeurs plus un repli JPEG.                  */

  function loadBitmap(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("Image illisible")); };
      img.src = URL.createObjectURL(file);
    });
  }

  function encode(img, width, type, quality) {
    var scale = Math.min(1, width / img.naturalWidth);
    var c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return new Promise(function (resolve, reject) {
      c.toBlob(function (b) {
        b ? resolve({ blob: b, w: c.width, h: c.height }) : reject(new Error("Encodage impossible"));
      }, type, quality);
    });
  }

  function upload(path, blob) {
    return ensureSession().then(function () {
      return fetch(SB_URL + "/storage/v1/object/" + BUCKET + "/" + path, {
        method: "POST",
        headers: Object.assign(authHeaders(false, true), {
          "Content-Type": blob.type, "x-upsert": "true"
        }),
        body: blob
      });
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error("Téléversement refusé : " + t.slice(0, 120));
        });
      }
    });
  }

  function replaceImage(key, file, onProgress) {
    var stem = key.replace(/\.[^.]+$/, "");
    var base = "img/" + Date.now().toString(36) + "-" + stem;   // évite le cache CDN
    var made = [], meta = null;
    return loadBitmap(file).then(function (img) {
      var jobs = WIDTHS.filter(function (w) { return w <= img.naturalWidth; });
      if (!jobs.length) jobs = [img.naturalWidth];
      var chain = Promise.resolve();
      jobs.forEach(function (w) {
        chain = chain.then(function () {
          onProgress && onProgress("WebP " + w + " px…");
          return encode(img, w, "image/webp", 0.78).then(function (r) {
            return upload(base + "-" + w + ".webp", r.blob).then(function () { made.push(w); });
          });
        });
      });
      return chain.then(function () {
        onProgress && onProgress("Repli JPEG…");
        return encode(img, FALLBACK_W, "image/jpeg", 0.78);
      }).then(function (r) {
        meta = r;
        return upload(base + "-" + FALLBACK_W + ".jpg", r.blob);
      });
    }).then(function () {
      onProgress && onProgress("Enregistrement…");
      var previous = state.images[key];    // fichiers de la version précédente
      if (previous) purgeFiles(previous);
      return upsert("image_overrides", {
        key: key, base: base, widths: made,
        fallback: base + "-" + FALLBACK_W + ".jpg",
        width: meta.w, height: meta.h
      }, "key");
    });
  }

  /* ------------------------------ Rendu ---------------------------------- */

  function usageOf(key) {
    if (!state.inv) return [];
    return state.inv.placements.filter(function (p) {
      var pl = state.placements[p.slot];
      return (pl && pl.image) ? pl.image === key : p.image === key;
    });
  }

  /* Une photo n'est remplaçable que si le gabarit l'a posée dans un
     emplacement : les logos, écrits en dur dans l'en-tête, ne portent aucun
     repère dans les pages, si bien qu'un téléversement les concernant
     réussissait sans jamais rien changer sur le site. */
  function replaceable(key) {
    return !!state.slotImages[key];
  }

  function thumbUrl(key) {
    var ov = state.images[key];
    if (ov) return SB_URL + "/storage/v1/object/public/" + BUCKET + "/" + ov.fallback;
    var stem = key.replace(/\.[^.]+$/, "");
    var info = state.byKey[key];
    var widths = info && info.widths && info.widths.length ? info.widths : null;
    if (widths) {
      // Toutes les images ne sont pas déclinées aux mêmes largeurs (les logos
      // s'arrêtent à 480 px) : on prend la plus large sous 640 px, sinon la
      // plus petite disponible — supposer un « -640.webp » donnait une
      // vignette cassée et un aperçu de cadrage sans hauteur.
      var small = widths.filter(function (w) { return w <= 640; });
      var w = small.length ? Math.max.apply(null, small) : Math.min.apply(null, widths);
      return "../assets/img/" + stem + "-" + w + ".webp";
    }
    if (info && info.fallback) return "../assets/img/" + info.fallback;
    return "../assets/img/" + stem + "-640.webp";
  }

  /* Une vignette manquante laisse un cadre vide, voire une zone de cadrage de
     hauteur nulle : on lui substitue un visuel de remplacement. */
  function guardThumbs(sel, onBroken) {
    A.ui.$$(sel).forEach(function (im) {
      im.addEventListener("error", function () {
        if (this.src !== PLACEHOLDER) { this.src = PLACEHOLDER; if (onBroken) onBroken(this); }
      });
    });
  }

  function needLogin() {
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Connexion requise</h2></div>' +
      '<p class="muted">Le code d\'accès local ouvre cette interface, mais il ne protège pas le site public : ' +
      'il est vérifié dans le navigateur. Pour modifier les images vues par les visiteurs, une session ' +
      'authentifiée est nécessaire — sans quoi n\'importe qui pourrait remplacer les photos du site.</p>' +
      '<div class="fgrid">' +
        '<div class="afield"><label>Adresse e-mail</label><input id="sb-mail" type="email" autocomplete="username"></div>' +
        '<div class="afield"><label>Mot de passe</label><input id="sb-pass" type="password" autocomplete="current-password"></div>' +
      '</div><div class="btnrow"><button class="abtn abtn--primary" id="sb-login">Se connecter</button></div>' +
      '<p class="ferr" id="sb-msg" hidden></p></section>';
  }

  function errorHTML(msg) {
    return '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title">Photothèque indisponible</h2></div>' +
      '<p class="ferr">' + esc(msg) + '</p>' +
      '<div class="btnrow"><button class="abtn abtn--primary" id="img-retry">Réessayer</button></div></section>';
  }

  /* Écran à afficher tant que les données ne sont pas exploitables. Sans lui,
     un chargement refusé laissait indéfiniment « Chargement… » à l'écran, ou
     pire, une photothèque d'apparence normale mais vide de ses surcharges. */
  function gateHTML(loadingLabel) {
    if (!session()) return needLogin();
    if (state.error) return errorHTML(state.error);
    if (!state.authed && !state.loading) return needLogin();
    if (!state.inv) return '<section class="panel"><p class="muted">' + loadingLabel + '</p></section>';
    return null;
  }

  function libraryHTML() {
    var gate = gateHTML("Chargement de la photothèque…");
    if (gate) return gate;
    var q = state.filter.toLowerCase();
    var list = state.inv.images.filter(function (i) { return !q || i.key.toLowerCase().indexOf(q) !== -1; });
    var cards = list.map(function (i) {
      var n = usageOf(i.key).length;
      var over = state.images[i.key];
      var free = replaceable(i.key);
      return '<figure class="imgcard' + (over ? ' imgcard--over' : '') + '" data-key="' + esc(i.key) + '">' +
        '<img loading="lazy" src="' + esc(thumbUrl(i.key)) + '" alt="">' +
        '<figcaption><b>' + esc(i.key) + '</b>' +
        '<span class="muted">' + (free
          ? (n + ' emplacement' + (n > 1 ? 's' : '') + (over ? ' · remplacée' : ''))
          : 'non remplaçable ici (intégrée au gabarit)') + '</span>' +
        (free ? '<span class="btnrow">' +
          '<button class="abtn abtn--ghost abtn--sm" data-rep="' + esc(i.key) + '">Remplacer</button>' +
          (over ? '<button class="abtn abtn--ghost abtn--sm" data-rev="' + esc(i.key) + '">Rétablir</button>' : '') +
        '</span>' : '') +
        '</figcaption></figure>';
    }).join("");
    return '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title" id="img-count">Photothèque — ' + list.length + ' image(s)</h2>' +
      '<input class="asearch-inline" id="img-q" placeholder="Filtrer…" value="' + esc(state.filter) + '"></div>' +
      '<div class="imggrid">' + cards + '</div>' +
      '<input type="file" id="img-file" accept="image/*" hidden></section>';
  }

  function placementsHTML() {
    var gate = gateHTML("Chargement…");
    if (gate) return gate;
    var byPage = {};
    state.inv.placements.forEach(function (p) {
      (byPage[p.page || "—"] = byPage[p.page || "—"] || []).push(p);
    });
    var html = Object.keys(byPage).sort().map(function (pg) {
      var rows = byPage[pg].map(function (p) {
        var pl = state.placements[p.slot] || {};
        var cur = pl.image || p.image;
        var label = p.slot.split("::")[1] || p.slot;
        return '<tr><td>' + esc(label) + '<br><span class="muted">' + esc(p.slot.split(":")[0]) + '</span></td>' +
          '<td><img class="tinythumb" loading="lazy" src="' + esc(thumbUrl(cur)) + '" alt=""></td>' +
          '<td>' + esc(cur) + (pl.image ? ' <span class="muted">(réaffectée)</span>' : '') + '</td>' +
          '<td>' + (pl.focal_x != null ? pl.focal_x + '% / ' + pl.focal_y + '%' : '<span class="muted">centre</span>') + '</td>' +
          '<td>' + (pl.alt ? esc(pl.alt).slice(0, 40) : '<span class="muted">—</span>') + '</td>' +
          '<td class="rowact"><button class="abtn abtn--ghost abtn--sm" data-slot="' + esc(p.slot) + '">Modifier</button></td></tr>';
      }).join("");
      return '<h3 class="imgpage">' + esc(pg) + '</h3><div class="dtable"><table><thead><tr>' +
        '<th>Emplacement</th><th>Aperçu</th><th>Photo</th><th>Cadrage</th><th>Texte alt.</th><th></th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    }).join("");
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">' +
      state.inv.placements.length + ' emplacements</h2></div>' + html + '</section>';
  }

  /* ------------------------------ Liaisons -------------------------------- */

  function bindGate() {
    var r = $("#img-retry");
    if (r) r.addEventListener("click", function () {
      state.error = null; A.refresh();
      loadAll().then(A.refresh).catch(function (e) { toast(e.message, "err"); A.refresh(); });
    });
    var b = $("#sb-login"); if (!b) return;
    b.addEventListener("click", function () {
      var m = $("#sb-msg");
      signIn($("#sb-mail").value.trim(), $("#sb-pass").value).then(function () {
        toast("Session ouverte.");
        // Un chargement qui échoue après une connexion réussie n'est pas un
        // refus d'identifiants : il est rapporté par le panneau d'erreur, et
        // non dans le formulaire, qui laisserait croire à un mot de passe faux.
        return loadAll().catch(function (e) { toast(e.message, "err"); });
      }).then(function () { A.refresh(); }).catch(function (e) {
        m.className = "ferr"; m.textContent = e.message; m.hidden = false;
      });
    });
  }

  function bindLibrary() {
    bindGate();
    guardThumbs(".imgcard img");
    var q = $("#img-q");
    // Le filtre agit sur les cartes déjà en place : redessiner toute la vue à
    // chaque frappe détruisait le champ qui avait le curseur, et la saisie
    // s'arrêtait au premier caractère.
    if (q) q.addEventListener("input", function () {
      state.filter = this.value;
      var f = state.filter.trim().toLowerCase(), shown = 0;
      A.ui.$$(".imgcard").forEach(function (c) {
        var hit = !f || (c.getAttribute("data-key") || "").toLowerCase().indexOf(f) !== -1;
        c.style.display = hit ? "" : "none";
        if (hit) shown++;
      });
      var h = $("#img-count");
      if (h) h.textContent = "Photothèque — " + shown + " image(s)";
    });
    var file = $("#img-file"), pending = null;
    A.ui.$$("[data-rep]").forEach(function (b) {
      b.addEventListener("click", function () { pending = b.getAttribute("data-rep"); file.click(); });
    });
    A.ui.$$("[data-rev]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-rev");
        var ov = state.images[k];
        del("image_overrides", "key", k).then(function () {
          return purgeFiles(ov);           // ne pas laisser de fichiers orphelins
        }).then(function () {
          toast("Photo d'origine rétablie."); return loadAll();
        }).then(A.refresh).catch(function (e) { toast(e.message, "err"); });
      });
    });
    if (file) file.addEventListener("change", function () {
      var f = this.files[0]; this.value = "";
      if (!f || !pending) return;
      if (f.size > 10 * 1024 * 1024) { toast("Fichier trop lourd (10 Mo maximum).", "err"); return; }
      toast("Préparation des variantes…");
      replaceImage(pending, f, function (msg) { toast(msg); })
        .then(function () { toast("Photo remplacée. Elle est en ligne."); return loadAll(); })
        .then(A.refresh)
        .catch(function (e) { toast(e.message, "err"); });
    });
  }

  function editPlacement(slot) {
    // L'enregistrement réécrit toute la ligne à partir de state.placements :
    // tant que les surcharges ne sont pas chargées, modifier un seul champ
    // effacerait le cadrage et la réaffectation déjà en ligne.
    if (!state.authed || !state.inv) { toast("Rechargez la photothèque avant de modifier un emplacement.", "err"); return; }
    var p = state.inv.placements.filter(function (x) { return x.slot === slot; })[0];
    if (!p) return;
    var pl = state.placements[slot] || {};
    var cur = pl.image || p.image;
    // Seules les photos posées par le gabarit sont proposées : les autres
    // (logos) n'ont pas les mêmes déclinaisons et laisseraient l'emplacement
    // vide chez le visiteur.
    var opts = state.inv.images.filter(function (i) {
      return replaceable(i.key) || i.key === cur;
    }).map(function (i) {
      return '<option value="' + esc(i.key) + '"' + (i.key === cur ? ' selected' : '') + '>' + esc(i.key) + '</option>';
    }).join("");
    A.ui.openModal(
      '<div class="modal__head"><h2>' + esc(slot) + '</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body">' +
        '<div class="focalwrap"><img id="pl-prev" src="' + esc(thumbUrl(cur)) + '" alt="">' +
          '<span id="pl-dot" class="focaldot"></span></div>' +
        '<p class="muted">Cliquez sur l\'aperçu pour choisir le point à préserver au recadrage.</p>' +
        '<div class="afield"><label>Photo affichée</label><select id="pl-img">' + opts + '</select></div>' +
        '<div class="afield"><label>Texte alternatif</label><input id="pl-alt" value="' + esc(pl.alt || "") + '"></div>' +
      '</div>' +
      '<div class="modal__foot"><button class="abtn abtn--ghost" id="pl-reset">Réinitialiser</button>' +
      '<span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button>' +
      '<button class="abtn abtn--primary" id="pl-save">Enregistrer</button></div>', true);

    var fx = pl.focal_x != null ? pl.focal_x : 50, fy = pl.focal_y != null ? pl.focal_y : 50;
    function dot() { $("#pl-dot").style.left = fx + "%"; $("#pl-dot").style.top = fy + "%"; }
    dot();
    // Un aperçu introuvable réduit la zone de cadrage à une hauteur nulle :
    // on affiche un visuel de remplacement et on interdit d'enregistrer un
    // point d'intérêt qui aurait été pointé au hasard.
    var save = $("#pl-save");
    $("#pl-prev").addEventListener("error", function () {
      if (this.src !== PLACEHOLDER) this.src = PLACEHOLDER;
      save.disabled = true;
      save.title = "Aperçu indisponible : choisissez une autre photo.";
    });
    $("#pl-prev").addEventListener("load", function () {
      if (this.src === PLACEHOLDER) return;
      save.disabled = false; save.removeAttribute("title");
    });
    $("#pl-prev").addEventListener("click", function (e) {
      var r = this.getBoundingClientRect();
      fx = Math.round((e.clientX - r.left) / r.width * 100);
      fy = Math.round((e.clientY - r.top) / r.height * 100);
      dot();
    });
    $("#pl-img").addEventListener("change", function () { $("#pl-prev").src = thumbUrl(this.value); });
    $("#pl-save").addEventListener("click", function () {
      upsert("placement_overrides", {
        slot: slot,
        image: $("#pl-img").value === p.image ? null : $("#pl-img").value,
        focal_x: fx, focal_y: fy,
        alt: $("#pl-alt").value.trim() || null
      }, "slot").then(function () {
        A.ui.closeModal(); toast("Emplacement mis à jour."); return loadAll();
      }).then(A.refresh).catch(function (e) { toast(e.message, "err"); });
    });
    $("#pl-reset").addEventListener("click", function () {
      // Rien à supprimer : la suppression répondrait « aucune ligne » et
      // signalerait une erreur là où l'emplacement est simplement d'origine.
      if (!state.placements[slot]) { A.ui.closeModal(); toast("Cet emplacement est déjà celui d'origine."); return; }
      del("placement_overrides", "slot", slot).then(function () {
        A.ui.closeModal(); toast("Emplacement réinitialisé."); return loadAll();
      }).then(A.refresh).catch(function (e) { toast(e.message, "err"); });
    });
  }

  function bindPlacements() {
    bindGate();
    guardThumbs(".tinythumb");
    A.ui.$$("[data-slot]").forEach(function (b) {
      b.addEventListener("click", function () { editPlacement(b.getAttribute("data-slot")); });
    });
  }

  /* ---------------------------- Enregistrement ---------------------------- */

  A.register(
    { view: "images", icon: "🖼", label: "Images du site" },
    { title: "Images du site", tabs: [
      { id: "library", l: "Photothèque" },
      { id: "placements", l: "Emplacements" }
    ] },
    {
      "images.library":    { r: libraryHTML,    b: bindLibrary },
      "images.placements": { r: placementsHTML, b: bindPlacements }
    }
  );

  // Un échec de chargement au démarrage doit se voir : sans ce traitement,
  // la rubrique restait figée sur son message d'attente.
  if (session()) loadAll().then(function () { A.refresh(); },
                               function (e) { toast(e.message, "err"); A.refresh(); });
})();
