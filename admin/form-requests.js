/* =========================================================================
   ACCI — Demandes du site public → Réception du CRM
   -------------------------------------------------------------------------
   La Réception affichait « Les demandes du site web ACCI apparaissent ici »
   alors que rien ne les y amenait : les formulaires du site n'avaient aucune
   destination et ouvraient la messagerie du visiteur. Ce module est le
   chaînon manquant.

   POURQUOI PASSER PAR SUPABASE. La Réception lit acci_inbox, dans le
   localStorage du navigateur de l'association. Le visiteur, lui, remplit le
   formulaire dans SON navigateur. Aucun des deux ne voit le stockage de
   l'autre : il faut un point de rencontre, et c'est la table form_requests.
   Le site y dépose (rôle anon, insertion seule) ; ce module y lit avec la
   session authentifiée de l'administrateur.

   POURQUOI NE PAS TOUCHER À renderInbox(). La Réception est dans admin.js et
   fonctionne. Plutôt que de la réécrire, ce module verse les demandes dans
   acci_inbox au format qu'elle attend déjà : elle les affiche, les convertit
   en membre et les supprime sans une ligne de changement.

   POURQUOI UN REGISTRE DES DEMANDES DÉJÀ VUES. Supprimer une demande de la
   Réception ne supprime rien à distance. Sans registre, la synchronisation
   suivante la ferait réapparaître, et une demande écartée reviendrait
   indéfiniment. acci_form_seen retient les identifiants déjà versés.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;
  var esc = A.ui.esc, $ = A.ui.$, toast = A.ui.toast;

  var TABLE = "form_requests";
  var INBOX_KEY = "acci_inbox";
  var SEEN_KEY = "acci_form_seen";
  var PAGE = 200;

  var state = { pending: null, last: null, error: null, busy: false };

  /* --------------------------------------------------------------------- */
  /* Stockage local                                                        */
  /* --------------------------------------------------------------------- */
  function readArr(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function seen() {
    var o = {};
    readArr(SEEN_KEY).forEach(function (id) { o[id] = 1; });
    return o;
  }

  /* Le registre est borné : sans cela il grossirait indéfiniment dans un
     stockage déjà partagé avec les membres, les photos et les factures. */
  function remember(ids) {
    var all = readArr(SEEN_KEY).concat(ids);
    if (all.length > 5000) all = all.slice(all.length - 5000);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(all)); } catch (e) { /* plein */ }
  }

  /* --------------------------------------------------------------------- */
  /* Mise au format attendu par renderInbox()                              */
  /* --------------------------------------------------------------------- */
  var KIND_LABEL = {
    contact: "Contact",
    adhesion: "Demande d’adhésion",
    signalement: "Signalement d’abus",
    ecoute: "Cellule d’écoute",
    newsletter: "Lettre d’information"
  };

  function toInbox(row) {
    var kind = KIND_LABEL[row.kind] || "Contact";
    /* La Réception affiche « subject » en deuxième colonne : y placer le type
       de formulaire rend la liste lisible d'un coup d'œil, l'objet saisi par
       le visiteur venant ensuite. */
    var subject = row.subject ? kind + " — " + row.subject : kind;
    return {
      _rid: row.id,
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      subject: subject,
      message: row.message || "",
      date: row.created_at || ""
    };
  }

  /* --------------------------------------------------------------------- */
  /* Synchronisation                                                       */
  /* --------------------------------------------------------------------- */
  function sync(silent) {
    var SB = window.ACCI_SB;
    if (!SB || !SB.url) {
      state.error = "Module Supabase indisponible.";
      return Promise.resolve(0);
    }
    if (!SB.session || !SB.session()) {
      state.error = "Connectez-vous à Supabase (rubrique Images) pour relever les demandes.";
      return Promise.resolve(0);
    }
    state.busy = true; state.error = null;

    var url = SB.url + "/rest/v1/" + TABLE +
      "?select=id,created_at,kind,name,email,phone,subject,message" +
      "&handled_at=is.null&order=created_at.desc&limit=" + PAGE;

    return fetch(url, { headers: SB.authHeaders() })
      .then(function (r) {
        if (r.status === 404) throw new Error(
          "La table « " + TABLE + " » n’existe pas encore. Appliquez " +
          "supabase/migrations/20260830120000_form_requests.sql.");
        if (!r.ok) throw new Error("Lecture refusée (" + r.status + ").");
        return r.json();
      })
      .then(function (rows) {
        rows = Array.isArray(rows) ? rows : [];
        state.pending = rows.length;

        var known = seen();
        var fresh = rows.filter(function (r) { return !known[r.id]; });
        if (!fresh.length) {
          state.busy = false; state.last = new Date();
          if (!silent) toast("Aucune nouvelle demande.");
          return 0;
        }

        /* Une seule écriture : Store.add() relit et réécrit tout le tableau
           à chaque appel, et la Réception peut déjà en contenir. */
        var inbox = readArr(INBOX_KEY);
        var merged = fresh.map(toInbox).concat(inbox);
        try {
          localStorage.setItem(INBOX_KEY, JSON.stringify(merged));
        } catch (e) {
          state.busy = false;
          state.error = "Stockage local plein : les demandes n’ont pas pu être enregistrées.";
          toast(state.error, "err");
          return 0;
        }
        remember(fresh.map(function (r) { return r.id; }));

        state.busy = false; state.last = new Date();
        toast(fresh.length + " demande(s) versée(s) dans la Réception.");
        A.refresh();
        return fresh.length;
      })
      .catch(function (e) {
        state.busy = false;
        state.error = e.message || "Relève impossible.";
        if (!silent) toast(state.error, "err");
        return 0;
      });
  }

  /* Marque à distance les demandes déjà relevées, pour qu'un autre poste ne
     les redescende pas. N'efface rien : handled_at est une date, pas une
     suppression, et la demande reste consultable dans la base. */
  function markHandled() {
    var SB = window.ACCI_SB;
    if (!SB || !SB.session || !SB.session()) { toast("Session Supabase requise.", "err"); return; }
    var ids = readArr(SEEN_KEY);
    if (!ids.length) { toast("Rien à marquer."); return; }
    var list = ids.slice(-PAGE).join(",");
    fetch(SB.url + "/rest/v1/" + TABLE + "?id=in.(" + list + ")&handled_at=is.null", {
      method: "PATCH",
      headers: Object.assign(SB.authHeaders(true, true), { Prefer: "return=minimal" }),
      body: JSON.stringify({ handled_at: new Date().toISOString() })
    }).then(function (r) {
      if (!r.ok) throw new Error("Écriture refusée (" + r.status + ").");
      toast("Demandes marquées comme traitées.");
      return sync(true);
    }).catch(function (e) { toast(e.message, "err"); });
  }

  /* --------------------------------------------------------------------- */
  /* Rubrique                                                              */
  /* --------------------------------------------------------------------- */
  function html() {
    var s = "";
    if (state.error) {
      s += '<p class="ferr" style="display:block">' + esc(state.error) + "</p>";
    }
    s += '<div class="stat-row">' +
      '<div class="stat-box"><div class="stat-box__val">' +
        (state.pending === null ? "—" : state.pending) +
      '</div><div class="stat-box__label">En attente à distance</div></div>' +
      '<div class="stat-box"><div class="stat-box__val">' + readArr(INBOX_KEY).length +
      '</div><div class="stat-box__label">Dans la Réception</div></div>' +
      '<div class="stat-box"><div class="stat-box__val">' + readArr(SEEN_KEY).length +
      '</div><div class="stat-box__label">Déjà relevées</div></div>' +
    "</div>";

    return '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title">Demandes déposées sur le site</h2></div>' +
      '<p class="muted">Les formulaires du site — contact, adhésion, signalement, ' +
        'cellule d’écoute, lettre d’information — déposent leurs demandes dans la base. ' +
        'La relève les verse dans la <b>Réception</b>, où elles se convertissent en membre ' +
        'comme n’importe quelle demande.</p>' +
      s +
      '<div class="btnrow" style="margin-top:16px">' +
        '<button class="abtn abtn--primary abtn--sm" id="fr-sync">Relever les demandes</button>' +
        '<button class="abtn abtn--ghost abtn--sm" id="fr-mark">Marquer les relevées comme traitées</button>' +
      "</div>" +
      (state.last ? '<p class="muted" style="margin-top:12px">Dernière relève : ' +
        esc(state.last.toLocaleString("fr-FR")) + "</p>" : "") +
      '<p class="muted" style="margin-top:12px">La relève demande une session Supabase ' +
        '(la même que la rubrique Images). Une demande écartée de la Réception ne revient pas : ' +
        'les identifiants déjà relevés sont conservés localement.</p>' +
    "</section>";
  }

  function bind() {
    var b = $("#fr-sync");
    if (b) b.addEventListener("click", function () { sync(false); });
    var m = $("#fr-mark");
    if (m) m.addEventListener("click", markHandled);
  }

  A.register(
    { view: "formreq", icon: "inbox", label: "Demandes du site" },
    { title: "Demandes du site public", tabs: [{ id: "sync", l: "Relève" }] },
    { "formreq.sync": { r: html, b: bind } }
  );

  /* Relève automatique au chargement : la Réception se remplit sans qu'on ait
     à y penser. Silencieuse — au démarrage, une erreur de session n'a pas à
     interrompre l'administrateur. */
  if (window.ACCI_SB && window.ACCI_SB.session && window.ACCI_SB.session()) {
    sync(true);
  }

  window.ACCI_FORMS = { sync: sync, pending: function () { return state.pending; } };
})();
