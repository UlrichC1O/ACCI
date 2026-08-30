/* =========================================================================
   ACCI — Galerie photos : « Nos temps forts » et « Nos albums »
   -------------------------------------------------------------------------
   Les deux sections de la page Galerie étaient figées dans build.py : ajouter
   une photo après un événement demandait de modifier le code et de recompiler
   le site. Cette rubrique les rend modifiables, et le site les applique au
   chargement (assets/js/site-gallery.js).

   CE QUE FAIT LE SITE DE CES LIGNES — à garder en tête en administrant :
   tant qu'aucune ligne n'existe, la page affiche ce qui a été compilé. Dès
   qu'une section compte au moins une ligne active, ces lignes REMPLACENT
   entièrement la section compilée. Il n'y a pas de fusion : enregistrer une
   seule photo laisse une galerie d'une seule photo. La rubrique le dit à
   l'écran plutôt que de le laisser découvrir en production.

   IMAGES. Deux formes sont acceptées, les mêmes que pour les logos de
   partenaires : une clé de photothèque (« formation.jpg »), dont les
   déclinaisons responsives existent déjà, ou une URL https complète. Aucun
   téléversement ici : la photothèque du site (rubrique Images) est faite pour
   cela, et dupliquer son sélecteur ferait diverger les deux.

   Lecture publique, écriture authentifiée : voir
   supabase/migrations/20260830140000_gallery.sql.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;
  var esc = A.ui.esc, $ = A.ui.$, $$ = A.ui.$$, toast = A.ui.toast;
  var openModal = A.ui.openModal, closeModal = A.ui.closeModal;

  /* Feuille de style chargée d'ici, comme pieces.js : la rubrique s'ajoute et
     se retire d'un seul bloc, et ne dépend d'aucun autre module pour son
     propre affichage. */
  (function styles() {
    if (document.getElementById("acci-gallery-css")) return;
    var l = document.createElement("link");
    l.id = "acci-gallery-css";
    l.rel = "stylesheet";
    l.href = "/admin/gallery.css";
    document.head.appendChild(l);
  })();

  var PHOTOS = "gallery_photos";
  var ALBUMS = "gallery_albums";

  /* Icônes proposées pour un album : celles du jeu livré avec le site qui ont
     un sens pour un album de photos. La liste est volontairement courte —
     soixante-dix choix ne rendent pas la sélection meilleure. */
  var ICONS = ["camera", "image", "graduation", "megaphone", "bullhorn", "child",
               "handshake", "users", "star", "calendar", "flag", "heart", "globe", "play"];

  var state = {
    photos: null, albums: null,
    loaded: false, error: null, tab: "photos"
  };

  /* --------------------------------------------------------------------- */
  /* Accès aux données                                                     */
  /* --------------------------------------------------------------------- */
  function sb() { return window.ACCI_SB; }

  function needSession() {
    var S = sb();
    return !S || !S.session || !S.session();
  }

  function load() {
    var S = sb();
    if (!S || !S.url) { state.error = "Module Supabase indisponible."; return Promise.resolve(); }
    state.error = null;
    var q = "?select=*&order=position.asc,id.asc";
    return Promise.all([
      fetch(S.url + "/rest/v1/" + PHOTOS + q, { headers: S.authHeaders() }),
      fetch(S.url + "/rest/v1/" + ALBUMS + q, { headers: S.authHeaders() })
    ]).then(function (rs) {
      if (rs[0].status === 404 || rs[1].status === 404) {
        throw new Error("Les tables de la galerie n’existent pas encore. Appliquez " +
                        "supabase/migrations/20260830140000_gallery.sql.");
      }
      if (!rs[0].ok || !rs[1].ok) throw new Error("Lecture refusée.");
      return Promise.all([rs[0].json(), rs[1].json()]);
    }).then(function (d) {
      state.photos = Array.isArray(d[0]) ? d[0] : [];
      state.albums = Array.isArray(d[1]) ? d[1] : [];
      state.loaded = true;
    }).catch(function (e) {
      state.error = e.message || "Chargement impossible.";
      state.photos = state.photos || [];
      state.albums = state.albums || [];
      state.loaded = true;
    });
  }

  function write(table, method, body, query) {
    var S = sb();
    if (needSession()) return Promise.reject(new Error("Connectez-vous à Supabase (rubrique Images)."));
    return fetch(S.url + "/rest/v1/" + table + (query || ""), {
      method: method,
      headers: Object.assign(S.authHeaders(true, true), { Prefer: "return=minimal" }),
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("Écriture refusée (" + r.status + ").");
    });
  }

  function reloadAndRender() { return load().then(function () { A.refresh(); }); }

  /* --------------------------------------------------------------------- */
  /* Rendu                                                                 */
  /* --------------------------------------------------------------------- */
  function warn(rows, what) {
    if (!rows.length) {
      return '<p class="muted sb-warn">Aucune entrée : la page affiche ' +
             'actuellement ' + what + ' compilé' + (what.indexOf("les") === 0 ? 's' : '') +
             ' dans le site. Enregistrez au moins une entrée pour le remplacer.</p>';
    }
    var active = rows.filter(function (r) { return r.active !== false; }).length;
    return '<p class="muted sb-warn"><b>' + active + '</b> entrée(s) active(s) remplaceront ' +
           'entièrement la section sur le site — il n’y a pas de fusion avec le contenu compilé.</p>';
  }

  function head(title, lead, addLabel, addId) {
    return '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title">' + esc(title) + '</h2>' +
      '<button class="abtn abtn--primary abtn--sm" id="' + addId + '">+ ' + esc(addLabel) + '</button>' +
      '</div><p class="muted">' + lead + '</p>';
  }

  function stateNotes() {
    var s = "";
    if (state.error) s += '<p class="ferr" style="display:block">' + esc(state.error) + '</p>';
    if (needSession()) {
      s += '<p class="muted sb-warn">Lecture seule : ouvrez une session Supabase ' +
           'dans la rubrique <b>Images</b> pour enregistrer des modifications.</p>';
    }
    return s;
  }

  function thumb(image) {
    if (!image) return '<span class="gal-thumb gal-thumb--none">—</span>';
    var u = /^https?:\/\//i.test(image)
      ? image
      : "/assets/img/" + String(image).replace(/\.[a-z0-9]+$/i, "") + "-640.webp";
    return '<img class="gal-thumb" src="' + esc(u) + '" alt="" loading="lazy">';
  }

  function photosHTML() {
    if (!state.loaded) return '<p class="muted">Chargement…</p>';
    var rows = state.photos;
    var h = head("Nos temps forts", "Les photos de la section « Nos temps forts » de la page " +
      "Galerie. L’ordre d’affichage suit la colonne Position.", "Ajouter une photo", "gp-add");
    h += stateNotes() + warn(rows, "les photos");

    if (!rows.length) return h + "</section>";
    h += '<div class="dtable"><table><thead><tr><th></th><th>Légende</th>' +
      '<th>Description (alt)</th><th>Image</th><th>Pos.</th><th>État</th><th></th></tr></thead><tbody>';
    rows.forEach(function (r, i) {
      h += "<tr>" +
        "<td>" + thumb(r.image) + "</td>" +
        "<td><b>" + esc(r.caption || "—") + "</b></td>" +
        '<td class="muted">' + esc(r.alt || "—") + "</td>" +
        '<td class="muted gal-src">' + esc(r.image || "") + "</td>" +
        '<td class="gal-pos">' + (r.position || 0) + "</td>" +
        "<td>" + (r.active === false
          ? '<span class="badge badge--inactif">Masquée</span>'
          : '<span class="badge badge--ok">Visible</span>') + "</td>" +
        '<td class="gal-act">' +
          '<button class="abtn abtn--ghost abtn--sm gp-up" data-i="' + i + '" title="Monter">↑</button>' +
          '<button class="abtn abtn--ghost abtn--sm gp-dn" data-i="' + i + '" title="Descendre">↓</button>' +
          '<button class="abtn abtn--ghost abtn--sm gp-ed" data-i="' + i + '">Modifier</button>' +
          '<button class="abtn abtn--ghost abtn--sm gp-rm" data-i="' + i + '">Retirer</button>' +
        "</td></tr>";
    });
    return h + "</tbody></table></div></section>";
  }

  function albumsHTML() {
    if (!state.loaded) return '<p class="muted">Chargement…</p>';
    var rows = state.albums;
    var h = head("Nos albums", "Les albums présentés en cartes sous la galerie. " +
      "Un album peut renvoyer vers une page du site ou rester informatif.",
      "Ajouter un album", "ga-add");
    h += stateNotes() + warn(rows, "les albums");

    if (!rows.length) return h + "</section>";
    h += '<div class="dtable"><table><thead><tr><th>Titre</th><th>Texte</th>' +
      '<th>Icône</th><th>Lien</th><th>Pos.</th><th>État</th><th></th></tr></thead><tbody>';
    rows.forEach(function (r, i) {
      h += "<tr>" +
        "<td><b>" + esc(r.title || "—") + "</b></td>" +
        '<td class="muted">' + esc((r.text || "").slice(0, 70)) + "</td>" +
        '<td class="muted">' + esc(r.icon || "camera") + "</td>" +
        '<td class="muted">' + esc(r.href || "—") + "</td>" +
        '<td class="gal-pos">' + (r.position || 0) + "</td>" +
        "<td>" + (r.active === false
          ? '<span class="badge badge--inactif">Masqué</span>'
          : '<span class="badge badge--ok">Visible</span>') + "</td>" +
        '<td class="gal-act">' +
          '<button class="abtn abtn--ghost abtn--sm ga-up" data-i="' + i + '" title="Monter">↑</button>' +
          '<button class="abtn abtn--ghost abtn--sm ga-dn" data-i="' + i + '" title="Descendre">↓</button>' +
          '<button class="abtn abtn--ghost abtn--sm ga-ed" data-i="' + i + '">Modifier</button>' +
          '<button class="abtn abtn--ghost abtn--sm ga-rm" data-i="' + i + '">Retirer</button>' +
        "</td></tr>";
    });
    return h + "</tbody></table></div></section>";
  }

  /* --------------------------------------------------------------------- */
  /* Formulaires                                                           */
  /* --------------------------------------------------------------------- */
  function field(label, id, value, hint, type) {
    return '<label class="afield"><span>' + esc(label) + "</span>" +
      (type === "textarea"
        ? '<textarea id="' + id + '" rows="3">' + esc(value || "") + "</textarea>"
        : '<input type="text" id="' + id + '" value="' + esc(value || "") + '">') +
      (hint ? '<small class="muted">' + hint + "</small>" : "") + "</label>";
  }

  function photoForm(row) {
    var r = row || { image: "", alt: "", caption: "", position: (state.photos.length + 1) * 10, active: true };
    openModal(
      '<div class="modal__head"><h2>' + (row ? "Modifier la photo" : "Ajouter une photo") +
        '</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body">' +
        field("Image *", "gp-image", r.image,
          "Clé de la photothèque (ex. <b>formation.jpg</b>) ou adresse https complète. " +
          "Les déclinaisons responsives d’une clé existent déjà — inutile de les indiquer.") +
        field("Légende", "gp-caption", r.caption, "Affichée sous la photo.") +
        field("Description (alt)", "gp-alt", r.alt,
          "Lue par les lecteurs d’écran. Décrivez ce que montre la photo ; laissez vide si elle est purement décorative.") +
        field("Position", "gp-position", r.position, "Ordre croissant. 10, 20, 30… laisse de la place pour intercaler.") +
        '<label class="fcheck"><input type="checkbox" id="gp-active"' +
          (r.active === false ? "" : " checked") + "> Visible sur le site</label>" +
        '<p class="ferr" id="gp-err" hidden></p>' +
      "</div>" +
      '<div class="modal__foot"><button class="abtn abtn--ghost" data-close>Annuler</button>' +
        '<button class="abtn abtn--primary" id="gp-save">Enregistrer</button></div>');

    $("#gp-save").addEventListener("click", function () {
      var image = $("#gp-image").value.trim();
      var err = $("#gp-err");
      if (!image) { err.textContent = "L’image est obligatoire."; err.hidden = false; return; }
      var body = {
        image: image,
        caption: $("#gp-caption").value.trim(),
        alt: $("#gp-alt").value.trim(),
        position: parseInt($("#gp-position").value, 10) || 0,
        active: $("#gp-active").checked
      };
      var p = row
        ? write(PHOTOS, "PATCH", body, "?id=eq." + row.id)
        : write(PHOTOS, "POST", body);
      p.then(function () {
        closeModal(); toast(row ? "Photo modifiée." : "Photo ajoutée."); return reloadAndRender();
      }).catch(function (e) { err.textContent = e.message; err.hidden = false; });
    });
  }

  function albumForm(row) {
    var r = row || { title: "", text: "", icon: "camera", href: "", position: (state.albums.length + 1) * 10, active: true };
    var opts = ICONS.map(function (k) {
      return '<option value="' + k + '"' + (r.icon === k ? " selected" : "") + ">" + k + "</option>";
    }).join("");
    openModal(
      '<div class="modal__head"><h2>' + (row ? "Modifier l’album" : "Ajouter un album") +
        '</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body">' +
        field("Titre *", "ga-title", r.title) +
        field("Texte", "ga-text", r.text, "Une phrase de présentation.", "textarea") +
        '<label class="afield"><span>Icône</span><select id="ga-icon">' + opts + "</select>" +
          '<small class="muted">Jeu d’icônes du site.</small></label>' +
        field("Lien", "ga-href", r.href,
          "Page du site (ex. <b>evenements</b>) ou adresse https. Laissez vide pour une carte non cliquable.") +
        field("Position", "ga-position", r.position, "Ordre croissant.") +
        '<label class="fcheck"><input type="checkbox" id="ga-active"' +
          (r.active === false ? "" : " checked") + "> Visible sur le site</label>" +
        '<p class="ferr" id="ga-err" hidden></p>' +
      "</div>" +
      '<div class="modal__foot"><button class="abtn abtn--ghost" data-close>Annuler</button>' +
        '<button class="abtn abtn--primary" id="ga-save">Enregistrer</button></div>');

    $("#ga-save").addEventListener("click", function () {
      var title = $("#ga-title").value.trim();
      var err = $("#ga-err");
      if (!title) { err.textContent = "Le titre est obligatoire."; err.hidden = false; return; }
      var href = $("#ga-href").value.trim();
      var body = {
        title: title,
        text: $("#ga-text").value.trim(),
        icon: $("#ga-icon").value,
        href: href || null,
        position: parseInt($("#ga-position").value, 10) || 0,
        active: $("#ga-active").checked
      };
      var p = row
        ? write(ALBUMS, "PATCH", body, "?id=eq." + row.id)
        : write(ALBUMS, "POST", body);
      p.then(function () {
        closeModal(); toast(row ? "Album modifié." : "Album ajouté."); return reloadAndRender();
      }).catch(function (e) { err.textContent = e.message; err.hidden = false; });
    });
  }

  /* --------------------------------------------------------------------- */
  /* Actions communes                                                      */
  /* --------------------------------------------------------------------- */
  /* Le déplacement échange les positions des deux voisins plutôt que de
     renuméroter toute la liste : deux écritures au lieu de N, et l'ordre
     reste stable si deux administrateurs travaillent en même temps. */
  function move(table, rows, i, delta) {
    var j = i + delta;
    if (j < 0 || j >= rows.length) return;
    var a = rows[i], b = rows[j];
    var pa = a.position || 0, pb = b.position || 0;
    if (pa === pb) { pa = i * 10; pb = j * 10; }
    Promise.all([
      write(table, "PATCH", { position: pb }, "?id=eq." + a.id),
      write(table, "PATCH", { position: pa }, "?id=eq." + b.id)
    ]).then(reloadAndRender).catch(function (e) { toast(e.message, "err"); });
  }

  function remove(table, row, label) {
    openModal('<div class="modal__head"><h2>Confirmer</h2>' +
      '<button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body"><p>Retirer <b>' + esc(label) + "</b> ? " +
      "L’entrée est supprimée de la base ; le fichier image, lui, reste dans la photothèque.</p></div>" +
      '<div class="modal__foot"><button class="abtn abtn--ghost" data-close>Annuler</button>' +
      '<button class="abtn abtn--danger" id="gal-del">Retirer</button></div>');
    $("#gal-del").addEventListener("click", function () {
      write(table, "DELETE", null, "?id=eq." + row.id).then(function () {
        closeModal(); toast("Entrée retirée."); return reloadAndRender();
      }).catch(function (e) { toast(e.message, "err"); });
    });
  }

  function bindPhotos() {
    var add = $("#gp-add"); if (add) add.addEventListener("click", function () { photoForm(null); });
    $$(".gp-ed").forEach(function (b) {
      b.addEventListener("click", function () { photoForm(state.photos[+b.getAttribute("data-i")]); });
    });
    $$(".gp-rm").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = state.photos[+b.getAttribute("data-i")];
        remove(PHOTOS, r, r.caption || r.image);
      });
    });
    $$(".gp-up").forEach(function (b) {
      b.addEventListener("click", function () { move(PHOTOS, state.photos, +b.getAttribute("data-i"), -1); });
    });
    $$(".gp-dn").forEach(function (b) {
      b.addEventListener("click", function () { move(PHOTOS, state.photos, +b.getAttribute("data-i"), 1); });
    });
  }

  function bindAlbums() {
    var add = $("#ga-add"); if (add) add.addEventListener("click", function () { albumForm(null); });
    $$(".ga-ed").forEach(function (b) {
      b.addEventListener("click", function () { albumForm(state.albums[+b.getAttribute("data-i")]); });
    });
    $$(".ga-rm").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = state.albums[+b.getAttribute("data-i")];
        remove(ALBUMS, r, r.title);
      });
    });
    $$(".ga-up").forEach(function (b) {
      b.addEventListener("click", function () { move(ALBUMS, state.albums, +b.getAttribute("data-i"), -1); });
    });
    $$(".ga-dn").forEach(function (b) {
      b.addEventListener("click", function () { move(ALBUMS, state.albums, +b.getAttribute("data-i"), 1); });
    });
  }

  /* Premier affichage : les données ne sont pas encore là. On rend l'attente,
     puis on redemande un rendu une fois la réponse reçue. */
  function ensure(render) {
    return function () {
      if (!state.loaded) { load().then(function () { A.refresh(); }); }
      return render();
    };
  }

  A.register(
    { view: "gallery", icon: "camera", label: "Galerie photos" },
    { title: "Galerie photos", tabs: [
      { id: "photos", l: "Nos temps forts" },
      { id: "albums", l: "Nos albums" }
    ] },
    {
      "gallery.photos": { r: ensure(photosHTML), b: bindPhotos },
      "gallery.albums": { r: ensure(albumsHTML), b: bindAlbums }
    }
  );
})();
