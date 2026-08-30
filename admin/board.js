/* =========================================================================
   ACCI — Bureau exécutif
   -------------------------------------------------------------------------
   Le site est compilé : la composition du bureau est figée dans les fichiers
   produits par build.py. Or un bureau se renouvelle — départs, arrivées,
   réélections — et les portraits arrivent souvent après la mise en ligne.
   Passer par un développeur pour un changement de titulaire n'est pas tenable.

   Ce module rend la liste modifiable, selon le principe déjà retenu pour les
   photos, les textes et les graphiques : une surcharge enregistrée dans
   Supabase, appliquée chez le visiteur par assets/js/site-settings.js.

   Deux règles valent ici comme ailleurs :

   1. Une surcharge illisible ne casse rien. Le site relit la liste et, au
      moindre doute, garde celle qui a été compilée : un bureau vidé par erreur
      réapparaît tel qu'il était plutôt que de laisser une page sans personne.
   2. Le portrait reste facultatif. À défaut, les initiales s'affichent — une
      silhouette générique signalerait une absence plutôt qu'un choix.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  var SB = window.ACCI_SB;
  if (!A || !SB) return;
  var $ = A.ui.$, $$ = A.ui.$$, esc = A.ui.esc, toast = A.ui.toast;

  var TABLE = "site_settings";
  var WIDTHS = [220, 440];      /* le portrait s'affiche dans un disque de 84 px */
  var MAXBYTES = 8 * 1024 * 1024;

  var state = { anchors: [], key: null, list: null, compiled: null,
                loaded: false, error: null, busy: false };

  /* ------------------------------ Données ------------------------------- */

  function load() {
    state.error = null;
    return fetch("/assets/team-index.json")
      .then(function (r) {
        if (!r.ok) throw new Error("Inventaire du bureau introuvable.");
        return r.json();
      })
      .then(function (inv) {
        if (!inv || !Array.isArray(inv.blocks) || !inv.blocks.length) {
          throw new Error("Aucun bureau exécutif n'a été trouvé sur le site.");
        }
        state.anchors = inv.blocks;
        state.key = "team." + inv.blocks[0].anchor;
        state.compiled = inv.blocks[0].members;
        return SB.ensureSession();
      })
      .then(function () {
        return fetch(SB.url + "/rest/v1/" + TABLE + "?select=key,value&key=eq." +
                     encodeURIComponent(state.key), { headers: SB.authHeaders() });
      })
      .then(function (r) {
        if (!r.ok) { var e = new Error("Chargement impossible (" + r.status + ")."); e.auth = (r.status === 401 || r.status === 403); throw e; }
        return r.json();
      })
      .then(function (rows) {
        var raw = rows && rows[0] ? rows[0].value : "";
        var list = null;
        if (typeof raw === "string" && raw !== "") {
          try { list = JSON.parse(raw); } catch (e) { list = null; }
        }
        /* Sans surcharge enregistrée, on part de la liste compilée : l'écran
           montre alors ce que le visiteur voit réellement. */
        state.list = Array.isArray(list) ? list.slice() : state.compiled.slice();
        state.loaded = true;
      });
  }

  function persist() {
    var payload = JSON.stringify(state.list);
    return SB.ensureSession().then(function () {
      return fetch(SB.url + "/rest/v1/" + TABLE + "?on_conflict=key", {
        method: "POST",
        headers: Object.assign(SB.authHeaders(true, true), {
          Prefer: "resolution=merge-duplicates,return=representation"
        }),
        body: JSON.stringify({ key: state.key, value: payload,
                               updated_at: new Date().toISOString() })
      });
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.message || j.hint || "Écriture refusée");
        return j;
      });
    });
  }

  /* Revenir à la liste compilée : on supprime le réglage plutôt que d'y écrire
     la liste d'origine, sinon le site continuerait d'appliquer une surcharge —
     figée cette fois — au lieu de suivre ce qui est compilé. */
  function reset() {
    return SB.ensureSession().then(function () {
      return fetch(SB.url + "/rest/v1/" + TABLE + "?key=eq." + encodeURIComponent(state.key),
                   { method: "DELETE", headers: SB.authHeaders() });
    }).then(function (r) {
      if (!r.ok) throw new Error("Suppression refusée (" + r.status + ").");
      state.list = state.compiled.slice();
    });
  }

  /* ---------------------------- Portraits -------------------------------- */

  function loadBitmap(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Image illisible.")); };
      img.src = url;
    });
  }

  /* Le portrait s'affiche dans un disque : on recadre au carré autour du centre
     avant d'encoder, sinon une photo en pied serait rognée au hasard par le CSS
     et pourrait couper le visage. */
  function square(img, size) {
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var s = Math.min(img.naturalWidth, img.naturalHeight);
    var sx = (img.naturalWidth - s) / 2, sy = (img.naturalHeight - s) / 2;
    c.getContext("2d").drawImage(img, sx, sy, s, s, 0, 0, size, size);
    return new Promise(function (resolve, reject) {
      c.toBlob(function (b) { b ? resolve(b) : reject(new Error("Encodage impossible.")); },
               "image/webp", 0.82);
    });
  }

  function uploadPortrait(file, index) {
    var base = "team/" + Date.now().toString(36) + "-" + index;
    return loadBitmap(file).then(function (img) {
      var chain = Promise.resolve(), made = [];
      WIDTHS.forEach(function (w) {
        chain = chain.then(function () {
          return square(img, w).then(function (blob) {
            return SB.upload(base + "-" + w + ".webp", blob).then(function () { made.push(w); });
          });
        });
      });
      /* La plus grande largeur est retenue : le disque est petit, mais les
         écrans à forte densité en tirent un rendu net. */
      return chain.then(function () { return SB.publicUrl(base + "-" + WIDTHS[WIDTHS.length - 1] + ".webp"); });
    });
  }

  /* ------------------------------ Rendu ---------------------------------- */

  function gate() {
    if (!SB.session()) {
      return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Connexion requise</h2></div>' +
        '<p class="muted">Ouvrez la rubrique « Images du site » pour vous connecter : ' +
        'modifier le bureau publié demande une session authentifiée.</p></section>';
    }
    if (state.error) {
      return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Bureau indisponible</h2></div>' +
        '<p class="muted">' + esc(state.error) + '</p>' +
        '<div class="btnrow"><button class="abtn abtn--primary abtn--sm" id="bd-retry">Réessayer</button></div></section>';
    }
    if (!state.loaded) {
      return '<section class="panel"><p class="muted">Chargement du bureau…</p></section>';
    }
    return null;
  }

  function memberRow(m, i) {
    var photo = m.photo ? '<img class="bd-thumb" src="' + esc(m.photo) + '" alt="">'
                        : '<span class="bd-thumb bd-thumb--none">' +
                          esc(String(m.name || "").split(/\s+/).slice(0, 2)
                              .map(function (w) { return w.charAt(0); }).join("").toUpperCase()) +
                          '</span>';
    return '<tr data-i="' + i + '">' +
      '<td>' + photo + '</td>' +
      '<td><b>' + esc(m.name || "") + '</b></td>' +
      '<td>' + esc(m.role || "") + '</td>' +
      '<td class="muted">' + esc(String(m.bio || "").slice(0, 60)) + (String(m.bio || "").length > 60 ? "…" : "") + '</td>' +
      '<td class="rowact">' +
        '<button class="iact" data-up="' + i + '" title="Monter"><i data-ic=upload></i></button>' +
        '<button class="iact" data-edit="' + i + '" title="Modifier"><i data-ic=pencil></i></button>' +
        '<button class="iact iact--del" data-del="' + i + '" title="Retirer"><i data-ic=trash></i></button>' +
      '</td></tr>';
  }

  function boardHTML() {
    var g = gate();
    if (g) return g;
    var rows = state.list.length
      ? state.list.map(memberRow).join("")
      : '<tr><td colspan="5" class="empty">Le bureau est vide. Le site affichera la liste compilée.</td></tr>';
    var override = JSON.stringify(state.list) !== JSON.stringify(state.compiled);
    return '<section class="panel">' +
      '<div class="panel__head"><h2 class="panel__title">Bureau exécutif — ' +
        state.list.length + ' membre(s)</h2>' +
        '<div class="btnrow"><button class="abtn abtn--primary abtn--sm" id="bd-add">' +
        '<i data-ic=plus></i> Ajouter un membre</button></div></div>' +
      '<p class="muted">Cette liste remplace celle du site dès son enregistrement. ' +
        'Le portrait est facultatif : à défaut, les initiales s\'affichent.</p>' +
      '<div class="dtable"><table><thead><tr>' +
        '<th style="width:64px">Portrait</th><th>Nom</th><th>Fonction</th><th>Présentation</th><th></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="btnrow">' +
        '<button class="abtn abtn--primary" id="bd-save">Publier le bureau</button>' +
        (override ? '<button class="abtn abtn--ghost" id="bd-reset">Rétablir la liste du site</button>' : '') +
      '</div><p class="ferr" id="bd-msg" hidden></p>' +
      '<input type="file" id="bd-file" accept="image/*" hidden></section>';
  }

  /* ----------------------------- Interactions ---------------------------- */

  function editMember(i) {
    var m = i === null ? { name: "", role: "", bio: "", photo: "" } : state.list[i];
    A.ui.openModal(
      '<div class="modal__head"><h2>' + (i === null ? "Ajouter un membre" : "Modifier le membre") +
        '</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body">' +
        '<div class="afield"><label>Nom</label><input id="bd-name" value="' + esc(m.name || "") + '"></div>' +
        '<div class="afield"><label>Fonction</label><input id="bd-role" value="' + esc(m.role || "") + '"></div>' +
        '<div class="afield"><label>Présentation</label><textarea id="bd-bio" rows="3">' + esc(m.bio || "") + '</textarea></div>' +
        '<div class="afield"><label>Portrait</label>' +
          '<div class="bd-photo">' +
            (m.photo ? '<img id="bd-prev" src="' + esc(m.photo) + '" alt="">'
                     : '<span id="bd-prev" class="bd-thumb bd-thumb--none">—</span>') +
            '<button class="abtn abtn--ghost abtn--sm" id="bd-pick">Choisir une photo</button>' +
            (m.photo ? '<button class="abtn abtn--ghost abtn--sm" id="bd-nophoto">Retirer</button>' : '') +
          '</div><p class="muted" id="bd-photostate"></p></div>' +
      '</div>' +
      '<div class="modal__foot"><span style="flex:1"></span>' +
        '<button class="abtn abtn--ghost" data-close>Annuler</button>' +
        '<button class="abtn abtn--primary" id="bd-ok">Valider</button></div>', true);

    var draft = { photo: m.photo || "" };
    var file = $("#bd-file");

    $("#bd-pick").addEventListener("click", function () { file.click(); });
    var rm = $("#bd-nophoto");
    if (rm) rm.addEventListener("click", function () {
      draft.photo = "";
      $("#bd-photostate").textContent = "Portrait retiré — les initiales s'afficheront.";
    });

    file.onchange = function () {
      var f = this.files[0]; this.value = "";
      if (!f) return;
      if (f.size > MAXBYTES) { $("#bd-photostate").textContent = "Fichier trop lourd (8 Mo maximum)."; return; }
      $("#bd-photostate").textContent = "Préparation du portrait…";
      uploadPortrait(f, i === null ? state.list.length : i).then(function (url) {
        draft.photo = url;
        var prev = $("#bd-prev");
        var img = document.createElement("img");
        img.id = "bd-prev"; img.src = url; img.alt = "";
        prev.replaceWith(img);
        $("#bd-photostate").textContent = "Portrait prêt. Il sera publié avec le bureau.";
      }).catch(function (e) { $("#bd-photostate").textContent = e.message; });
    };

    $("#bd-ok").addEventListener("click", function () {
      var rec = {
        name: $("#bd-name").value.trim(),
        role: $("#bd-role").value.trim(),
        bio: $("#bd-bio").value.trim(),
        photo: draft.photo
      };
      if (!rec.name) { $("#bd-photostate").textContent = "Le nom est nécessaire."; return; }
      if (i === null) state.list.push(rec); else state.list[i] = rec;
      A.ui.closeModal(); A.refresh();
    });
  }

  /* La session Supabase s'ouvre depuis la rubrique « Images du site », souvent
     après le chargement de ce module : sans ce rattrapage, la composition
     restait indéfiniment sur son message d'attente. */
  var loading = false;
  function ensureLoaded() {
    if (state.loaded || loading || state.error || !SB.session()) return;
    loading = true;
    load().then(function () { loading = false; A.refresh(); },
                function (e) { loading = false; state.error = e.message; A.refresh(); });
  }

  function bindBoard() {
    var retry = $("#bd-retry");
    if (retry) retry.addEventListener("click", function () {
      state.loaded = false; state.error = null; loading = false; A.refresh();
      ensureLoaded();
    });
    if (!state.loaded) { ensureLoaded(); return; }

    var add = $("#bd-add");
    if (add) add.addEventListener("click", function () { editMember(null); });

    $$("[data-edit]").forEach(function (b) {
      b.addEventListener("click", function () { editMember(+b.getAttribute("data-edit")); });
    });
    $$("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-del");
        state.list.splice(i, 1); A.refresh();
      });
    });
    /* Remonter d'un rang : l'ordre du tableau est celui de la page. */
    $$("[data-up]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-up");
        if (i === 0) return;
        var t = state.list[i - 1]; state.list[i - 1] = state.list[i]; state.list[i] = t;
        A.refresh();
      });
    });

    var save = $("#bd-save");
    if (save) save.addEventListener("click", function () {
      var msg = $("#bd-msg");
      if (state.busy) return;
      state.busy = true; save.disabled = true; save.textContent = "Publication…";
      persist().then(function () {
        toast("Bureau publié. Il est en ligne.");
        msg.className = "ferr okmsg"; msg.textContent = "✓ Publié."; msg.hidden = false;
      }).catch(function (e) {
        msg.className = "ferr"; msg.textContent = e.message; msg.hidden = false;
      }).then(function () {
        state.busy = false; save.disabled = false; save.textContent = "Publier le bureau";
      });
    });

    var rst = $("#bd-reset");
    if (rst) rst.addEventListener("click", function () {
      reset().then(function () { toast("Liste du site rétablie."); A.refresh(); })
             .catch(function (e) { toast(e.message, "err"); });
    });
  }

  /* ---------------------------- Enregistrement --------------------------- */

  A.register(
    { view: "board", icon: "team", label: "Bureau exécutif" },
    { title: "Bureau exécutif", tabs: [{ id: "list", l: "Composition" }] },
    { "board.list": { r: boardHTML, b: bindBoard } }
  );

  ensureLoaded();
})();
