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

  var state = { inv: null, images: {}, placements: {}, filter: "", loading: false };

  /* ------------------------------ Session ------------------------------- */

  function session() {
    try { return JSON.parse(localStorage.getItem(TOK_KEY)); } catch (e) { return null; }
  }
  function setSession(s) {
    if (s) localStorage.setItem(TOK_KEY, JSON.stringify(s));
    else localStorage.removeItem(TOK_KEY);
  }
  function authHeaders(json) {
    var s = session();
    var h = { apikey: SB_KEY, Authorization: "Bearer " + (s && s.access_token ? s.access_token : SB_KEY) };
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

  function loadAll() {
    state.loading = true;
    return Promise.all([
      fetch("../assets/img/inventory.json").then(function (r) { return r.json(); }),
      fetch(SB_URL + "/rest/v1/image_overrides?select=*", { headers: authHeaders() })
        .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }),
      fetch(SB_URL + "/rest/v1/placement_overrides?select=*", { headers: authHeaders() })
        .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    ]).then(function (res) {
      state.inv = res[0];
      state.images = {};   res[1].forEach(function (r) { state.images[r.key] = r; });
      state.placements = {}; res[2].forEach(function (r) { state.placements[r.slot] = r; });
      state.loading = false;
    });
  }

  function upsert(table, row, conflictCol) {
    return fetch(SB_URL + "/rest/v1/" + table + "?on_conflict=" + conflictCol, {
      method: "POST",
      headers: Object.assign(authHeaders(true), {
        Prefer: "resolution=merge-duplicates,return=representation"
      }),
      body: JSON.stringify(row)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.message || j.hint || "Écriture refusée");
        return j;
      });
    });
  }

  function del(table, col, value) {
    return fetch(SB_URL + "/rest/v1/" + table + "?" + col + "=eq." + encodeURIComponent(value), {
      method: "DELETE", headers: authHeaders()
    });
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
    return fetch(SB_URL + "/storage/v1/object/" + BUCKET + "/" + path, {
      method: "POST",
      headers: Object.assign(authHeaders(), {
        "Content-Type": blob.type, "x-upsert": "true"
      }),
      body: blob
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error("Téléversement refusé : " + t.slice(0, 120)); });
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

  function thumbUrl(key) {
    var ov = state.images[key];
    if (ov) return SB_URL + "/storage/v1/object/public/" + BUCKET + "/" + ov.fallback;
    var stem = key.replace(/\.[^.]+$/, "");
    return "../assets/img/" + stem + "-640.webp";
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

  function libraryHTML() {
    if (!session()) return needLogin();
    if (!state.inv) return '<section class="panel"><p class="muted">Chargement de la photothèque…</p></section>';
    var q = state.filter.toLowerCase();
    var list = state.inv.images.filter(function (i) { return !q || i.key.toLowerCase().indexOf(q) !== -1; });
    var cards = list.map(function (i) {
      var n = usageOf(i.key).length;
      var over = state.images[i.key];
      return '<figure class="imgcard' + (over ? ' imgcard--over' : '') + '">' +
        '<img loading="lazy" src="' + esc(thumbUrl(i.key)) + '" alt="">' +
        '<figcaption><b>' + esc(i.key) + '</b>' +
        '<span class="muted">' + n + ' emplacement' + (n > 1 ? 's' : '') +
        (over ? ' · remplacée' : '') + '</span>' +
        '<span class="btnrow">' +
          '<button class="abtn abtn--ghost abtn--sm" data-rep="' + esc(i.key) + '">Remplacer</button>' +
          (over ? '<button class="abtn abtn--ghost abtn--sm" data-rev="' + esc(i.key) + '">Rétablir</button>' : '') +
        '</span></figcaption></figure>';
    }).join("");
    return '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title">Photothèque — ' + list.length + ' image(s)</h2>' +
      '<input class="asearch-inline" id="img-q" placeholder="Filtrer…" value="' + esc(state.filter) + '"></div>' +
      '<div class="imggrid">' + cards + '</div>' +
      '<input type="file" id="img-file" accept="image/*" hidden></section>';
  }

  function placementsHTML() {
    if (!session()) return needLogin();
    if (!state.inv) return '<section class="panel"><p class="muted">Chargement…</p></section>';
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

  function bindLogin() {
    var b = $("#sb-login"); if (!b) return;
    b.addEventListener("click", function () {
      var m = $("#sb-msg");
      signIn($("#sb-mail").value.trim(), $("#sb-pass").value).then(function () {
        toast("Session ouverte."); return loadAll();
      }).then(function () { A.refresh(); }).catch(function (e) {
        m.className = "ferr"; m.textContent = e.message; m.hidden = false;
      });
    });
  }

  function bindLibrary() {
    bindLogin();
    var q = $("#img-q");
    if (q) q.addEventListener("input", function () { state.filter = this.value; A.refresh(); });
    var file = $("#img-file"), pending = null;
    A.ui.$$("[data-rep]").forEach(function (b) {
      b.addEventListener("click", function () { pending = b.getAttribute("data-rep"); file.click(); });
    });
    A.ui.$$("[data-rev]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-rev");
        del("image_overrides", "key", k).then(function () {
          toast("Photo d'origine rétablie."); return loadAll();
        }).then(A.refresh);
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
    var p = state.inv.placements.filter(function (x) { return x.slot === slot; })[0];
    var pl = state.placements[slot] || {};
    var cur = pl.image || p.image;
    var opts = state.inv.images.map(function (i) {
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
      del("placement_overrides", "slot", slot).then(function () {
        A.ui.closeModal(); toast("Emplacement réinitialisé."); return loadAll();
      }).then(A.refresh);
    });
  }

  function bindPlacements() {
    bindLogin();
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

  if (session()) loadAll().then(function () { A.refresh(); });
})();
