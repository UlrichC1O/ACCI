/* =========================================================================
   ACCI — Partenaires
   -------------------------------------------------------------------------
   Ajoute, ordonne et retire les partenaires affichés sur la page « Nos
   partenaires ». La liste vit dans Supabase et est lue par le visiteur au
   chargement (assets/js/site-partners.js) : un partenaire ajouté ici apparaît
   sur le site sans recompilation ni redéploiement.

   Le logo se choisit de deux façons :
     * dans la photothèque du site — les déclinaisons responsives existent
       déjà, rien n'est téléversé ;
     * par envoi d'un fichier, déposé dans le dépôt site-images.

   Sécurité : la lecture est publique, l'écriture exige une session Supabase.
   Le code d'accès local protège cette interface, pas le site.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  var SB = window.ACCI_SB;
  if (!A || !SB) return;
  var $ = A.ui.$, $$ = A.ui.$$, esc = A.ui.esc, toast = A.ui.toast;
  var openModal = A.ui.openModal, closeModal = A.ui.closeModal;

  var TABLE = "partners";
  var state = { rows: null, error: null, inv: null, busy: false };

  /* ------------------------------ Données -------------------------------- */

  function load() {
    return fetch(SB.url + "/rest/v1/" + TABLE + "?select=*&order=position.asc,name.asc",
                 { headers: SB.authHeaders() })
      .then(function (r) {
        if (!r.ok) throw new Error("Lecture des partenaires refusée (" + r.status + ").");
        return r.json();
      })
      .then(function (rows) { state.rows = Array.isArray(rows) ? rows : []; state.error = null; });
  }

  function save(row) {
    var isNew = !row.id;
    var url = SB.url + "/rest/v1/" + TABLE + (isNew ? "" : "?id=eq." + encodeURIComponent(row.id));
    return SB.ensureSession().then(function () {
      return fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: Object.assign(SB.authHeaders(true, true), { Prefer: "return=representation" }),
        body: JSON.stringify(isNew ? row : {
          name: row.name, url: row.url, logo: row.logo,
          category: row.category, position: row.position, active: row.active,
          updated_at: new Date().toISOString()
        })
      });
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.message || j.hint || "Écriture refusée");
        return j;
      });
    });
  }

  function remove(id) {
    return SB.ensureSession().then(function () {
      return fetch(SB.url + "/rest/v1/" + TABLE + "?id=eq." + encodeURIComponent(id), {
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

  /* La photothèque n'est chargée qu'à l'ouverture du sélecteur : c'est le plus
     gros fichier de l'interface et la liste des partenaires n'en a pas besoin. */
  function loadInventory() {
    if (state.inv) return Promise.resolve(state.inv);
    return fetch("../assets/img/inventory.json").then(function (r) {
      if (!r.ok) throw new Error("Photothèque introuvable — recompilez le site.");
      return r.json();
    }).then(function (j) {
      state.inv = (j && Array.isArray(j.images)) ? j.images : [];
      return state.inv;
    });
  }

  /* ------------------------------- Rendu ---------------------------------- */

  function logoSrc(logo) {
    if (!logo) return "";
    if (/^https:\/\//i.test(logo)) return logo;
    return "../assets/img/" + String(logo).replace(/\.[a-z0-9]+$/i, "") + "-640.webp";
  }

  function needLogin() {
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Connexion requise</h2></div>' +
      '<p class="muted">Les partenaires sont publiés sur le site : les modifier demande une session ' +
      'authentifiée. Le code d\'accès local n\'ouvre que cette interface.</p>' +
      '<div class="fgrid">' +
        '<div class="afield"><label>Adresse e-mail</label><input id="pt-mail" type="email" autocomplete="username"></div>' +
        '<div class="afield"><label>Mot de passe</label><input id="pt-pass" type="password" autocomplete="current-password"></div>' +
      '</div><div class="btnrow"><button class="abtn abtn--primary" id="pt-login">Se connecter</button></div>' +
      '<p class="ferr" id="pt-msg" hidden></p></section>';
  }

  function listHTML() {
    if (!SB.session()) return needLogin();
    if (state.error) {
      return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Partenaires indisponibles</h2></div>' +
        '<p class="muted">' + esc(state.error) + '</p>' +
        '<div class="btnrow"><button class="abtn abtn--ghost" id="pt-retry">Réessayer</button></div></section>';
    }
    if (!state.rows) return '<section class="panel"><p class="muted">Chargement…</p></section>';

    var bar = '<div class="filterbar"><span class="filterbar__count">' + state.rows.length +
      ' partenaire(s)</span><div class="filterbar__right">' +
      '<button class="abtn abtn--primary abtn--sm" id="pt-add">+ Ajouter un partenaire</button></div></div>';

    if (!state.rows.length) {
      return bar + '<div class="empty-state"><div class="empty-state__ic"><i data-ic=handshake></i></div>' +
        '<h2>Aucun partenaire publié</h2>' +
        '<p class="muted">La section « Ils nous accompagnent » reste masquée sur le site tant que la liste est vide.</p></div>';
    }

    var cards = state.rows.map(function (p) {
      var src = logoSrc(p.logo);
      var vis = p.active
        ? '<span class="tag" style="background:#dcfce7;color:#166534">visible</span>'
        : '<span class="tag muted">masqué</span>';
      return '<div class="admin-card">' +
        '<div style="flex:0 0 84px;height:52px;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden">' +
          (src ? '<img src="' + esc(src) + '" alt="" style="max-height:44px;max-width:76px;object-fit:contain">'
               : '<span class="muted" style="font-size:10px">sans logo</span>') +
        '</div>' +
        '<div class="admin-card__info"><h3>' + esc(p.name) + ' ' + vis + '</h3>' +
          '<p>' + (p.category ? esc(p.category) + ' · ' : '') +
          (p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.url) + '</a>'
                 : '<span class="muted">sans lien</span>') +
          ' · rang ' + (p.position || 0) + '</p></div>' +
        '<button class="iact pt-edit" data-id="' + esc(p.id) + '" title="Modifier"><i data-ic=pencil></i></button>' +
        '<button class="iact iact--del pt-del" data-id="' + esc(p.id) + '" title="Supprimer"><i data-ic=trash></i></button>' +
      '</div>';
    }).join("");

    return bar + cards +
      '<p class="muted" style="margin-top:14px">Les modifications apparaissent sur la page « Nos partenaires » ' +
      'dans un délai maximum de 5 minutes (durée du cache navigateur).</p>';
  }

  /* ----------------------------- Formulaire ------------------------------- */

  function form(p) {
    p = p || { id: "", name: "", url: "", logo: "", category: "", position: 0, active: true };
    var src = logoSrc(p.logo);
    openModal(
      '<div class="modal__head"><h2>' + (p.id ? "Modifier le partenaire" : "Nouveau partenaire") +
        '</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<form id="pt-form" class="modal__body"><div class="fgrid">' +
        '<label class="afield"><span>Nom *</span><input name="name" value="' + esc(p.name) + '" required></label>' +
        '<label class="afield"><span>Site web</span><input name="url" type="url" placeholder="https://…" value="' + esc(p.url) + '"></label>' +
        '<label class="afield"><span>Catégorie</span><input name="category" placeholder="Institution, école, média…" value="' + esc(p.category) + '"></label>' +
        '<label class="afield"><span>Rang d\'affichage</span><input name="position" type="number" value="' + (p.position || 0) + '"></label>' +
        '<label class="afield"><span>Visibilité</span><select name="active">' +
          '<option value="true"' + (p.active ? " selected" : "") + '>Visible sur le site</option>' +
          '<option value="false"' + (!p.active ? " selected" : "") + '>Masqué</option></select></label>' +
      '</div>' +
      '<h3 style="margin-top:10px">Logo</h3>' +
      '<div class="admin-card" style="align-items:center">' +
        '<div id="pt-prev" style="flex:0 0 96px;height:60px;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden">' +
          (src ? '<img src="' + esc(src) + '" alt="" style="max-height:52px;max-width:88px;object-fit:contain">'
               : '<span class="muted" style="font-size:10px">aucun</span>') + '</div>' +
        '<div class="btnrow" style="margin:0">' +
          '<button type="button" class="abtn abtn--ghost abtn--sm" id="pt-pick">Choisir dans la photothèque</button>' +
          '<label class="abtn abtn--ghost abtn--sm" style="cursor:pointer">Téléverser un fichier' +
            '<input type="file" id="pt-file" accept="image/*" hidden></label>' +
          (p.logo ? '<button type="button" class="abtn abtn--danger abtn--sm" id="pt-nologo">Retirer</button>' : '') +
        '</div>' +
      '</div>' +
      '<input type="hidden" name="logo" value="' + esc(p.logo) + '">' +
      '<p class="ferr" id="pt-err" hidden></p></form>' +
      '<div class="modal__foot"><span style="flex:1"></span>' +
      '<button class="abtn abtn--ghost" data-close>Annuler</button>' +
      '<button class="abtn abtn--primary" id="pt-save">' + (p.id ? "Enregistrer" : "Créer") + '</button></div>', true);

    var f = $("#pt-form");

    function setLogo(value) {
      f.logo.value = value;
      var prev = $("#pt-prev");
      while (prev.firstChild) prev.removeChild(prev.firstChild);
      var s = logoSrc(value);
      if (s) {
        var img = document.createElement("img");
        img.src = s; img.alt = "";
        img.style.cssText = "max-height:52px;max-width:88px;object-fit:contain";
        prev.appendChild(img);
      } else {
        var sp = document.createElement("span");
        sp.className = "muted"; sp.style.fontSize = "10px";
        sp.appendChild(document.createTextNode("aucun"));
        prev.appendChild(sp);
      }
    }

    var nolog = $("#pt-nologo");
    if (nolog) nolog.addEventListener("click", function () { setLogo(""); });

    $("#pt-pick").addEventListener("click", function () { picker(setLogo); });

    $("#pt-file").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      /* Nom neuf à chaque envoi : un nom stable serait resservi depuis le cache
         du visiteur, et l'ancien logo resterait affiché. */
      var ext = (file.name.match(/\.[a-z0-9]+$/i) || [".png"])[0].toLowerCase();
      var path = "partners/" + Date.now() + ext;
      toast("Téléversement…");
      SB.upload(path, file).then(function () {
        setLogo(SB.publicUrl(path));
        toast("Logo téléversé.");
      }).catch(function (err) {
        var e2 = $("#pt-err"); e2.className = "ferr"; e2.textContent = err.message; e2.hidden = false;
      });
    });

    $("#pt-save").addEventListener("click", function () {
      if (state.busy) return;
      var err = $("#pt-err");
      var row = {
        id: p.id || undefined,
        name: f.name.value.trim(),
        url: f.url.value.trim(),
        logo: f.logo.value.trim(),
        category: f.category.value.trim(),
        position: parseInt(f.position.value, 10) || 0,
        active: f.active.value === "true"
      };
      if (!row.name) { err.className = "ferr"; err.textContent = "Le nom est obligatoire."; err.hidden = false; return; }
      /* Le site n'ouvre que des liens https : une autre forme serait ignorée à
         l'affichage, et le partenaire paraîtrait cliquable sans l'être. */
      if (row.url && !/^https:\/\/\S+$/.test(row.url)) {
        err.className = "ferr";
        err.textContent = "Le lien doit commencer par https:// — les autres formes ne sont pas affichées sur le site.";
        err.hidden = false; return;
      }
      state.busy = true;
      save(row).then(function () {
        toast(p.id ? "Partenaire mis à jour." : "Partenaire ajouté.");
        closeModal(); state.busy = false;
        return load();
      }).then(function () { A.refresh(); }).catch(function (e2) {
        state.busy = false;
        err.className = "ferr"; err.textContent = e2.message; err.hidden = false;
      });
    });
  }

  /* Sélecteur de photothèque : réutilise les images déjà livrées avec le site,
     celles-là mêmes que la galerie affiche. */
  function picker(onPick) {
    openModal('<div class="modal__head"><h2>Photothèque du site</h2>' +
      '<button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body"><p class="muted">Chargement…</p></div>', true);
    loadInventory().then(function (imgs) {
      var grid = imgs.map(function (im) {
        return '<button type="button" class="pt-img" data-key="' + esc(im.key) + '" ' +
          'style="border:1px solid var(--line);border-radius:8px;padding:6px;background:#fff;cursor:pointer">' +
          '<img src="../assets/img/' + esc(String(im.key).replace(/\.[a-z0-9]+$/i, "")) + '-640.webp" ' +
          'alt="" loading="lazy" style="width:100%;height:70px;object-fit:contain">' +
          '<span style="display:block;font-size:9.5px;color:var(--muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
          esc(im.key) + '</span></button>';
      }).join("");
      openModal('<div class="modal__head"><h2>Photothèque du site (' + imgs.length + ')</h2>' +
        '<button class="modal__x" data-close>&times;</button></div>' +
        '<div class="modal__body"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px">' +
        grid + '</div></div>' +
        '<div class="modal__foot"><span style="flex:1"></span>' +
        '<button class="abtn abtn--ghost" data-close>Annuler</button></div>', true);
      $$(".pt-img").forEach(function (b) {
        b.addEventListener("click", function () {
          var key = b.getAttribute("data-key");
          closeModal();
          onPick(key);
        });
      });
    }).catch(function (e) {
      openModal('<div class="modal__head"><h2>Photothèque indisponible</h2>' +
        '<button class="modal__x" data-close>&times;</button></div>' +
        '<div class="modal__body"><p class="muted">' + esc(e.message) + '</p></div>' +
        '<div class="modal__foot"><span style="flex:1"></span>' +
        '<button class="abtn abtn--ghost" data-close>Fermer</button></div>');
    });
  }

  /* ------------------------------ Liaisons -------------------------------- */

  function reload() {
    state.rows = null; A.refresh();
    load().catch(function (e) { state.error = e.message; }).then(function () { A.refresh(); });
  }

  function bind() {
    var lg = $("#pt-login");
    if (lg) {
      lg.addEventListener("click", function () {
        var m = $("#pt-msg");
        SB.signIn($("#pt-mail").value.trim(), $("#pt-pass").value)
          .then(function () { toast("Session ouverte."); return load().catch(function (e) { state.error = e.message; }); })
          .then(function () { A.refresh(); })
          .catch(function (e) { m.className = "ferr"; m.textContent = e.message; m.hidden = false; });
      });
      return;
    }
    var rt = $("#pt-retry"); if (rt) rt.addEventListener("click", reload);
    var add = $("#pt-add"); if (add) add.addEventListener("click", function () { form(null); });
    $$(".pt-edit").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id");
        var row = (state.rows || []).filter(function (r) { return String(r.id) === id; })[0];
        if (row) form(row);
      });
    });
    $$(".pt-del").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id");
        var row = (state.rows || []).filter(function (r) { return String(r.id) === id; })[0];
        var nom = row ? row.name : "ce partenaire";
        A.ui.openModal('<div class="modal__head"><h2>Confirmer</h2><button class="modal__x" data-close>&times;</button></div>' +
          '<div class="modal__body"><p>Retirer <b>' + esc(nom) + '</b> de la page « Nos partenaires » ? ' +
          'Le logo téléversé reste dans la photothèque. Irréversible.</p></div>' +
          '<div class="modal__foot"><span style="flex:1"></span>' +
          '<button class="abtn abtn--ghost" data-close>Annuler</button>' +
          '<button class="abtn abtn--danger" id="pt-yes">Retirer</button></div>');
        $("#pt-yes").addEventListener("click", function () {
          remove(id).then(function () { toast("Partenaire retiré."); closeModal(); return load(); })
            .then(function () { A.refresh(); })
            .catch(function (e) { toast(e.message, "err"); });
        });
      });
    });
  }

  A.register(
    { view: "partners", icon: "handshake", label: "Partenaires" },
    { title: "Partenaires ACCI", tabs: [{ id: "list", l: "Liste" }] },
    { "partners.list": { r: listHTML, b: bind } }
  );

  if (SB.session()) {
    load().catch(function (e) { state.error = e.message; }).then(function () { A.refresh(); });
  }
})();
