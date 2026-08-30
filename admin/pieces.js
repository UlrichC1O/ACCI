/* =========================================================================
   ACCI — Photos des membres et pièces d'identité
   -------------------------------------------------------------------------
   L'association demande une photo et un numéro de pièce (CNI, passeport…)
   pour deux raisons : reconnaître un membre au guichet, et garantir qu'une
   même personne ne détient qu'une seule adhésion. Ce module tient ce registre.

   POURQUOI UN MAGASIN SÉPARÉ (acci_member_pieces) ET NON DES CHAMPS SUR LA
   FICHE MEMBRE — trois raisons, chacune vérifiée dans le code existant :

   1. Lecture. Store.all() relit et analyse le tableau acci_customers ENTIER à
      chaque appel, et rien ne le met en cache. Une photo en base64 pèse
      cinquante fois le reste d'une fiche : posée là, elle serait ré-analysée
      à chaque rendu de la liste, de chaque tableau de bord et des portails.
   2. Fuite. La vue « Réseau » de l'espace Artiste remet à un membre la fiche
      COMPLÈTE de tous les autres membres Premium. Un numéro de pièce sur la
      fiche membre ne serait qu'à une ligne de gabarit d'être diffusé à tout
      l'espace Premium. Hors de acci_customers, cette fuite est impossible.
   3. Écrasement. Le formulaire membre reconstruit la fiche à partir des seuls
      champs qu'il affiche : tout champ qu'il ignore disparaît à chaque
      enregistrement. Un numéro de pièce y serait effacé sans un mot.

   Ce module n'écrit donc jamais dans acci_customers : il n'y lit que le nom.

   POURQUOI UN FICHIER À PART. admin.js expose window.ACCI_ADMIN précisément
   pour cela (voir images.js, site-identity.js). Aucune ligne d'admin.js n'est
   modifiée ici, et la feuille de style est chargée par ce fichier lui-même :
   la rubrique s'ajoute et se retire d'un seul bloc.

   LIMITE ASSUMÉE (1) — STOCKAGE. localStorage offre environ 5 Mo par origine,
   partagés avec les soixante autres magasins du CRM. Les photos sont donc
   ramenées à 256 px et le registre affiche ce qu'il consomme. Au-delà de ~120
   photos, il faudra les déposer dans Supabase Storage — la chaîne existe déjà
   dans images.js.

   LIMITE ASSUMÉE (2) — CE QUE LE MASQUAGE PROTÈGE, ET CE QU'IL NE PROTÈGE PAS.
   Il n'y a pas de serveur : tout vit dans le navigateur de la personne
   connectée, et les trois interfaces (Admin, Membre, Artiste) partagent une
   même origine. Le masquage, la réserve au Super Admin et le journal d'audit
   sont donc des garde-fous d'INTERFACE. Ils empêchent qu'un numéro s'affiche à
   l'écran, parte dans un export ou traîne dans un journal — c'est-à-dire tout
   ce qui quitte la machine. Ils n'empêchent pas quelqu'un qui a déjà la main
   sur ce navigateur de lire acci_member_pieces depuis la console.

   Ce n'est pas un défaut de ce module mais du modèle sans serveur, et c'est
   dit à l'écran plutôt que tu. La seule correction réelle est de déplacer le
   registre dans Supabase avec des règles RLS — le chemin déjà emprunté par
   images.js pour les écritures d'images. Tant que ce n'est pas fait, le
   registre ne doit vivre que sur un poste de l'association.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;                                   /* admin.js absent */
  var $ = A.ui.$, $$ = A.ui.$$, esc = A.ui.esc, toast = A.ui.toast;
  var openModal = A.ui.openModal, closeModal = A.ui.closeModal;

  var STORE   = "acci_member_pieces";
  var MEMBERS = "acci_customers";
  var AUDIT   = "acci_audit";

  var TYPES = ["CNI", "Passeport", "Attestation d'identité", "Permis de conduire", "Carte consulaire"];

  /* Cible de compression. 256 px suffisent à reconnaître un visage et à le
     comparer à une pièce ; au-delà, le registre remplit le stockage sans rien
     apporter à l'usage qu'on en fait. */
  var PHOTO_PX    = 256;
  var PHOTO_MAX   = 18000;                          /* caractères de l'URL de données */
  var LADDER      = [[256, 0.72], [256, 0.6], [224, 0.6], [192, 0.55]];
  var FILE_MAX    = 12 * 1024 * 1024;               /* refusé avant décodage */
  var BUDGET      = 4 * 1024 * 1024;                /* budget prudent de l'origine */

  var state = { q: "", filter: "", shown: {} };

  /* --------------------------------------------------------------------- */
  /* Feuille de style                                                       */
  /* --------------------------------------------------------------------- */
  /* Chargée d'ici plutôt que déclarée dans index.html : le module reste un
     ajout d'un seul tenant, et rien d'autre n'a à connaître son existence. */
  (function styles() {
    if (document.getElementById("acci-pieces-css")) return;
    var l = document.createElement("link");
    l.id = "acci-pieces-css";
    l.rel = "stylesheet";
    l.href = "/admin/pieces.css";
    document.head.appendChild(l);
  })();

  /* --------------------------------------------------------------------- */
  /* Stockage                                                               */
  /* --------------------------------------------------------------------- */
  function readJSON(key) {
    try { var v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }

  /* Le quota est la panne ordinaire de ce module, pas un cas limite : chaque
     photo consomme du stockage partagé avec tout le CRM. L'échec est donc
     annoncé pour ce qu'il est, avec la marche à suivre — et surtout, il rend
     false, pour qu'aucun appelant n'annonce un enregistrement qui n'a pas eu
     lieu. Les données déjà en place sont intactes : un setItem refusé laisse
     l'ancienne valeur telle quelle. */
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) {
      openModal(
        '<div class="modal__head"><h2>Enregistrement impossible</h2>' +
        '<button class="modal__x" data-close>&times;</button></div>' +
        '<div class="modal__body"><p><b>La pièce n’a pas été enregistrée.</b></p>' +
        '<p class="muted">L’espace de stockage du navigateur est plein ou indisponible ' +
        '(navigation privée). Les pièces déjà enregistrées sont intactes.</p>' +
        '<p class="muted">Le registre indique ce qu’il consomme dans l’onglet ' +
        '« Contrôles ». Retirez quelques photos, ou exportez puis purgez le registre ' +
        'avant de recommencer.</p></div>' +
        '<div class="modal__foot"><span style="flex:1"></span>' +
        '<button class="abtn abtn--primary" data-close>J’ai compris</button></div>');
      return false;
    }
  }

  function members() { return readJSON(MEMBERS); }
  function member(id) { var m = members(); for (var i = 0; i < m.length; i++) if (m[i].id === id) return m[i]; return null; }
  function pieces() { return readJSON(STORE); }
  function piece(id) { var p = pieces(); for (var i = 0; i < p.length; i++) if (p[i].id === id) return p[i]; return null; }

  function savePiece(rec) {
    var all = pieces(), i = -1, k;
    for (k = 0; k < all.length; k++) if (all[k].id === rec.id) { i = k; break; }
    rec.updatedAt = new Date().toISOString();
    if (i < 0) { rec.createdAt = rec.createdAt || rec.updatedAt; all.unshift(rec); }
    else all[i] = rec;
    return writeJSON(STORE, all);
  }

  function dropPiece(id) {
    return writeJSON(STORE, pieces().filter(function (p) { return p.id !== id; }));
  }

  /* --------------------------------------------------------------------- */
  /* Identité de l'administrateur connecté                                  */
  /* --------------------------------------------------------------------- */
  /* window.ACCI_ADMIN n'expose rien de l'authentification : les droits sont
     donc relus ici, à la source, exactement comme le fait admin.js — jamais
     depuis la copie figée de la session. Un compte rétrogradé, suspendu ou
     supprimé perd ses droits à la lecture suivante, y compris dans un onglet
     resté ouvert. */
  function currentAdmin() {
    var s;
    try { s = JSON.parse(sessionStorage.getItem("acci_admin")); } catch (e) { return null; }
    if (!s) return null;
    var list = readJSON("acci_admins");
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (s.id ? a.id === s.id : a.username === s.username) return a.approved ? a : null;
    }
    return null;
  }
  function isSuper() { var a = currentAdmin(); return !!(a && a.role === "super_admin"); }
  function whoami() { var a = currentAdmin(); return a ? (a.username || a.name || "?") : "?"; }

  /* --------------------------------------------------------------------- */
  /* Journal d'audit                                                        */
  /* --------------------------------------------------------------------- */
  /* Même forme et même magasin que le journal d'admin.js, pour que ces
     événements apparaissent dans Membres ▸ Historique et dans Administration
     ▸ Audit sans rien y ajouter. Le détail ne porte QUE le nom du membre :
     le journal est relu et affiché en clair dans quatre écrans, et un numéro
     de pièce recopié là annulerait tout le masquage. */
  function alog(memberId, action, detail) {
    var e = readJSON(AUDIT);
    e.unshift({ id: "p" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
                entity: "client", entityId: memberId, action: action,
                detail: detail || "", createdAt: new Date().toISOString() });
    if (e.length > 500) e = e.slice(0, 500);
    writeJSON(AUDIT, e);
  }

  /* --------------------------------------------------------------------- */
  /* Numéro de pièce                                                        */
  /* --------------------------------------------------------------------- */
  /* Un même numéro saisi « C 012 345 678 » et « c012345678 » doit être reconnu
     comme un seul et même numéro, sans quoi le contrôle de doublon — la raison
     d'être du registre — laisserait passer une seconde adhésion. */
  function normCni(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }

  function cniValid(s) { var n = normCni(s); return n.length >= 6 && n.length <= 20; }

  /* Les formats ivoiriens courants : NNI à onze chiffres, numéro de carte
     ONECI commençant par une lettre. Ce qui sort de ces formes n'est pas
     refusé — une carte consulaire ou un passeport étranger sont légitimes —
     mais signalé, car c'est le plus souvent une faute de frappe. */
  function cniUsual(s) { var n = normCni(s); return /^\d{11}$/.test(n) || /^[A-Z]{1,2}\d{6,12}$/.test(n); }

  function maskCni(s) {
    var n = normCni(s);
    if (!n) return "";
    if (n.length <= 4) return new Array(n.length + 1).join("•");
    return new Array(n.length - 3).join("•") + n.slice(-4);
  }

  /* Regroupé par quatre : un numéro à onze ou douze caractères se relit et se
     compare à la carte sans perdre sa place. */
  function groupCni(s) { return normCni(s).replace(/(.{4})/g, "$1 ").trim(); }

  /* --------------------------------------------------------------------- */
  /* Photo                                                                  */
  /* --------------------------------------------------------------------- */
  function loadBitmap(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Fichier illisible — ce n’est pas une image exploitable.")); };
      img.src = url;
    });
  }

  /* Recadrage carré centré puis réduction. Le carré est imposé parce que la
     vignette est ronde partout dans le CRM : une photo laissée en 3/2 s'y
     verrait rognée au hasard de ses proportions, et un visage décentré
     disparaîtrait à moitié. */
  function squareURL(img, size, quality) {
    var s = Math.min(img.naturalWidth, img.naturalHeight);
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    /* Le JPEG de repli n'a pas de couche alpha : sans ce fond, une image
       transparente (PNG détouré) ressortait sur du noir. */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
    /* Un navigateur sans WebP ne renvoie pas d'erreur : il rend un PNG, dont
       le poids ferait échouer tout le budget en silence. Le préfixe est donc
       vérifié, et le JPEG demandé explicitement. */
    var d = c.toDataURL("image/webp", quality);
    if (d.indexOf("data:image/webp") !== 0) d = c.toDataURL("image/jpeg", quality);
    return d;
  }

  /* Le budget prime sur la définition : une photo qui ne tient pas est réduite
     par paliers plutôt que refusée. Refuser aurait laissé l'opérateur devant
     un fichier d'appareil photo sans aucun moyen de le préparer. */
  function shrink(img) {
    var best = null;
    for (var i = 0; i < LADDER.length; i++) {
      best = squareURL(img, LADDER[i][0], LADDER[i][1]);
      if (best.length <= PHOTO_MAX) return { data: best, px: LADDER[i][0] };
    }
    return { data: best, px: LADDER[LADDER.length - 1][0] };
  }

  function readPhoto(file) {
    if (!file) return Promise.reject(new Error("Aucun fichier."));
    if (!/^image\//.test(file.type)) return Promise.reject(new Error("Ce fichier n’est pas une image."));
    if (file.size > FILE_MAX) return Promise.reject(new Error("Image trop lourde (" + kb(file.size) + "). Maximum 12 Mo."));
    return loadBitmap(file).then(shrink);
  }

  function kb(n) {
    if (n < 1024) return n + " o";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace(".", ",") + " Ko";
    return (n / 1048576).toFixed(1).replace(".", ",") + " Mo";
  }

  /* --------------------------------------------------------------------- */
  /* Mesure du stockage                                                     */
  /* --------------------------------------------------------------------- */
  /* Les chaînes sont comptées en UTF-16 par les navigateurs : deux octets par
     caractère. Annoncer la longueur brute aurait montré la moitié de ce que le
     registre consomme réellement, et le quota serait tombé sans prévenir. */
  function bytesOf(key) { var v = localStorage.getItem(key); return v ? v.length * 2 : 0; }
  function totalBytes() {
    var t = 0;
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("acci_") === 0) t += bytesOf(k) + k.length * 2;
    }
    return t;
  }

  /* --------------------------------------------------------------------- */
  /* Vignette                                                               */
  /* --------------------------------------------------------------------- */
  function initials(name) {
    return String(name || "?").split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase();
  }
  function thumb(m, p, sz) {
    var s = sz || 40;
    var box = 'width:' + s + 'px;height:' + s + 'px';
    if (p && p.photo) {
      return '<img class="pthumb" src="' + esc(p.photo) + '" alt="" style="' + box + '">';
    }
    return '<span class="avatar" style="' + box + ';font-size:' + (s / 2.6) + 'px">' + esc(initials(m && m.name)) + '</span>';
  }

  /* --------------------------------------------------------------------- */
  /* Registre — rendu                                                       */
  /* --------------------------------------------------------------------- */
  function rows() {
    var ps = {}, all = pieces();
    all.forEach(function (p) { ps[p.id] = p; });
    var q = String(state.q || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return members().map(function (m) { return { m: m, p: ps[m.id] || null }; }).filter(function (r) {
      var p = r.p;
      if (state.filter === "nophoto" && p && p.photo) return false;
      if (state.filter === "nocni" && p && p.cni) return false;
      if (state.filter === "unverified" && (!p || !p.cni || p.verified)) return false;
      if (state.filter === "done" && !(p && p.photo && p.cni && p.verified)) return false;
      if (!q) return true;
      var hay = (r.m.name + " " + (r.m.email || "") + " " + (r.m.city || "")).toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      /* Le numéro de pièce n'entre PAS dans la botte de foin : rendu
         cherchable par fragment, il se retrouverait par tâtonnement depuis la
         barre de recherche, et le masquage n'aurait plus aucun effet. */
      return hay.indexOf(q) !== -1;
    });
  }

  function registerHTML() {
    var list = rows(), ps = pieces();
    var withPhoto = ps.filter(function (p) { return !!p.photo; }).length;
    var withCni   = ps.filter(function (p) { return !!p.cni; }).length;
    var verified  = ps.filter(function (p) { return !!p.verified; }).length;
    var total     = members().length;

    var kpis =
      '<div class="kpis">' +
      kpi("camera", withPhoto + " / " + total, "Photos enregistrées", withPhoto ? "ok" : "n") +
      kpi("shield", withCni + " / " + total, "Pièces renseignées", withCni ? "ok" : "n") +
      kpi("check", verified + " / " + (withCni || 0), "Pièces vérifiées", verified === withCni && withCni ? "ok" : "warn") +
      kpi("chart", kb(bytesOf(STORE)), "Poids du registre", "n") +
      '</div>';

    if (!total) {
      return kpis + '<div class="empty-state"><div class="empty-state__ic"><i data-ic=users data-sz=34></i></div>' +
        '<h2>Aucun membre enregistré. Créez d’abord une fiche dans « Membres & Partenaires ».</h2></div>';
    }

    var bar =
      '<div class="filterbar">' +
      '<input id="p-q" class="asearch-inline" type="search" placeholder="Rechercher un membre…" value="' + esc(state.q) + '" style="margin-left:0">' +
      '<select id="p-f">' +
        opt("", "Tous les membres") + opt("nophoto", "Sans photo") + opt("nocni", "Sans pièce") +
        opt("unverified", "Pièce non vérifiée") + opt("done", "Dossier complet") +
      '</select>' +
      '<span class="filterbar__count">' + list.length + ' membre(s)</span>' +
      '</div>';

    var trs = list.length ? list.map(function (r) {
      var m = r.m, p = r.p;
      var num = p && p.cni
        ? '<code class="pnum">' + esc(state.shown[m.id] ? groupCni(p.cni) : maskCni(p.cni)) + '</code>' +
          (isSuper() ? ' <button class="iact preveal" data-id="' + esc(m.id) + '" title="' +
                       (state.shown[m.id] ? "Masquer" : "Révéler le numéro") + '"><i data-ic=' +
                       (state.shown[m.id] ? "lock" : "eye") + '></i></button>' : '')
        : '<span class="muted">—</span>';
      var st = !p || (!p.photo && !p.cni) ? '<span class="pstate pstate--none">Rien</span>'
             : (p.photo && p.cni && p.verified) ? '<span class="pstate pstate--ok"><i data-ic=check></i> Complet</span>'
             : '<span class="pstate pstate--part">Incomplet</span>';
      return '<tr class="rowlink pr" data-id="' + esc(m.id) + '">' +
        '<td class="cell-name">' + thumb(m, p, 36) + '<span><b>' + esc(m.name) + '</b>' +
          (m.city ? '<br><span class="muted">' + esc(m.city) + '</span>' : '') + '</span></td>' +
        '<td>' + (p && p.cni ? esc(p.type || "CNI") : '<span class="muted">—</span>') + '</td>' +
        '<td>' + num + '</td>' +
        '<td>' + (p && p.cni ? (p.verified
            ? '<span style="color:var(--green);font-weight:700"><i data-ic=check></i> Vérifiée</span>'
            : '<span class="muted">À vérifier</span>') : '<span class="muted">—</span>') + '</td>' +
        '<td>' + st + '</td>' +
        '<td class="rowact"><button class="iact pe" data-id="' + esc(m.id) + '" title="Ouvrir le dossier"><i data-ic=pencil></i></button></td>' +
      '</tr>';
    }).join("") : '<tr><td colspan="6" class="empty">Aucun membre ne correspond à ce filtre.</td></tr>';

    return kpis + bar +
      '<div class="dtable"><table><thead><tr><th>Membre</th><th>Type de pièce</th><th>Numéro</th>' +
      '<th>Vérification</th><th>Dossier</th><th></th></tr></thead><tbody>' + trs + '</tbody></table></div>' +
      '<p class="pnote"><i data-ic=lock></i> Les numéros sont masqués par défaut. ' +
      (isSuper()
        ? 'Votre compte Super Admin peut les révéler ; chaque révélation est inscrite au journal d’audit.'
        : 'Seul un Super Admin peut les révéler.') +
      ' Ce que ce masquage protège — et ce qu’il ne protège pas — est expliqué dans l’onglet « Contrôles ».</p>';
  }

  function kpi(ic, val, label, cls) {
    return '<div class="kpi"><span class="kpi__icon kpi__icon--' + cls + '"><i data-ic=' + ic + '></i></span>' +
           '<span class="kpi__val">' + esc(val) + '</span><span class="kpi__label">' + esc(label) + '</span></div>';
  }
  function opt(v, l) { return '<option value="' + v + '"' + (state.filter === v ? " selected" : "") + '>' + l + '</option>'; }

  function bindRegister() {
    var q = $("#p-q");
    if (q) q.addEventListener("input", function () {
      state.q = q.value;
      /* Le champ est reconstruit à chaque rendu : sans ce report du curseur,
         la frappe repartait au début du mot à chaque lettre. */
      var pos = q.selectionStart; A.refresh();
      var n = $("#p-q"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} }
    });
    var f = $("#p-f");
    if (f) f.addEventListener("change", function () { state.filter = f.value; A.refresh(); });

    $$(".preveal").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = b.getAttribute("data-id");
        /* Le droit est revérifié au clic, jamais au rendu seul : un compte
           rétrogradé pendant que l'écran est ouvert ne doit pas conserver le
           bouton hérité du rendu précédent. */
        if (!isSuper()) { toast("Réservé au Super Admin.", "err"); return; }
        if (state.shown[id]) { delete state.shown[id]; }
        else {
          state.shown[id] = true;
          var m = member(id);
          alog(id, "consultation du numéro de pièce", m ? m.name : "");
        }
        A.refresh();
      });
    });
    $$(".pe").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); openPiece(b.getAttribute("data-id")); });
    });
    $$(".pr").forEach(function (r) {
      r.addEventListener("click", function (e) {
        if (e.target.closest(".iact")) return;
        openPiece(r.getAttribute("data-id"));
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* Dossier d'un membre                                                    */
  /* --------------------------------------------------------------------- */
  function openPiece(id) {
    var m = member(id);
    if (!m) { toast("Membre introuvable.", "err"); return; }
    var p = piece(id) || { id: id, photo: "", px: 0, cni: "", type: "CNI", verified: false, verifiedAt: "", verifiedBy: "", note: "" };
    var draft = { photo: p.photo, px: p.px };

    openModal(
      '<div class="modal__head"><div class="dhead">' + thumb(m, p, 40) +
        '<div><h2>' + esc(m.name) + '</h2><span class="muted">Photo & pièce d’identité</span></div>' +
      '</div><button class="modal__x" data-close>&times;</button></div>' +
      '<form id="pf" class="modal__body">' +
        '<div class="pgrid">' +
          '<div class="pphoto">' +
            '<div class="pphoto__box" id="p-prev">' + (p.photo
              ? '<img src="' + esc(p.photo) + '" alt="">'
              : '<span class="avatar" style="width:118px;height:118px;font-size:44px">' + esc(initials(m.name)) + '</span>') + '</div>' +
            '<div class="btnrow">' +
              '<label class="abtn abtn--ghost abtn--sm" for="p-file"><i data-ic=camera></i> Choisir une photo</label>' +
              '<button type="button" class="abtn abtn--ghost abtn--sm" id="p-clear"' + (p.photo ? '' : ' hidden') + '><i data-ic=trash></i> Retirer</button>' +
            '</div>' +
            '<input type="file" id="p-file" accept="image/*" hidden>' +
            '<p class="muted pphoto__hint" id="p-info">' +
              (p.photo ? esc(kb(p.photo.length * 2)) + ' · ' + esc(String(p.px || PHOTO_PX)) + ' px'
                       : 'JPEG, PNG ou WebP. Cadrée sur le visage.') + '</p>' +
          '</div>' +
          '<div class="pform">' +
            fld("Type de pièce", '<select name="type">' + TYPES.map(function (t) {
              return '<option' + (t === (p.type || "CNI") ? " selected" : "") + '>' + esc(t) + '</option>';
            }).join("") + '</select>') +
            fld("Numéro de la pièce", '<input name="cni" autocomplete="off" spellcheck="false" placeholder="C0123456789" value="' +
              esc(p.cni ? groupCni(p.cni) : "") + '">') +
            '<p class="muted pform__hint" id="p-cnih">Le numéro est enregistré sans espaces et masqué dans le registre.</p>' +
            '<label class="fcheck"><input type="checkbox" name="verified"' + (p.verified ? " checked" : "") + '> ' +
              'Pièce vue et vérifiée par l’ACCI</label>' +
            (p.verified && p.verifiedAt
              ? '<p class="muted pform__hint">Vérifiée le ' + esc(fdate(p.verifiedAt)) + ' par ' + esc(p.verifiedBy || "?") + '.</p>'
              : '') +
            fld("Note interne", '<textarea name="note" rows="2" placeholder="Ex. : pièce expirée, à renouveler.">' + esc(p.note || "") + '</textarea>') +
          '</div>' +
        '</div>' +
        '<p class="ferr" id="pf-e" hidden></p>' +
      '</form>' +
      '<div class="modal__foot">' +
        (p.photo || p.cni ? '<button class="abtn abtn--danger abtn--sm" id="pf-del">Vider le dossier</button>' : '') +
        '<span style="flex:1"></span>' +
        '<button class="abtn abtn--ghost" data-close>Annuler</button>' +
        '<button class="abtn abtn--primary" id="pf-s">Enregistrer</button>' +
      '</div>', true);

    var file = $("#p-file"), prev = $("#p-prev"), info = $("#p-info"), clear = $("#p-clear");

    file.addEventListener("change", function () {
      var f = file.files && file.files[0];
      file.value = "";                                   /* même fichier re-sélectionnable */
      if (!f) return;
      info.textContent = "Traitement…";
      readPhoto(f).then(function (r) {
        draft.photo = r.data; draft.px = r.px;
        prev.innerHTML = '<img src="' + esc(r.data) + '" alt="">';
        clear.hidden = false;
        info.textContent = kb(r.data.length * 2) + " · " + r.px + " px" +
          (r.data.length > PHOTO_MAX ? " — au-delà de la cible, le registre grossira vite" : "");
      }).catch(function (e) {
        info.textContent = "";
        err(e.message || "Image illisible.");
      });
    });

    clear.addEventListener("click", function () {
      draft.photo = ""; draft.px = 0;
      prev.innerHTML = '<span class="avatar" style="width:118px;height:118px;font-size:44px">' + esc(initials(m.name)) + '</span>';
      clear.hidden = true;
      info.textContent = "JPEG, PNG ou WebP. Cadrée sur le visage.";
    });

    var cniIn = $("#pf").querySelector('[name="cni"]');
    cniIn.addEventListener("blur", function () { if (cniIn.value.trim()) cniIn.value = groupCni(cniIn.value); });
    cniIn.addEventListener("input", function () {
      var h = $("#p-cnih"), v = cniIn.value.trim();
      if (!v) { h.textContent = "Le numéro est enregistré sans espaces et masqué dans le registre."; h.className = "muted pform__hint"; return; }
      if (!cniValid(v)) { h.textContent = "Un numéro compte entre 6 et 20 caractères."; h.className = "muted pform__hint pform__hint--warn"; return; }
      if (!cniUsual(v)) { h.textContent = "Format inhabituel pour une pièce ivoirienne — vérifiez la saisie."; h.className = "muted pform__hint pform__hint--warn"; return; }
      h.textContent = normCni(v).length + " caractères · format reconnu."; h.className = "muted pform__hint";
    });

    function err(t) { var e = $("#pf-e"); if (e) { e.textContent = t; e.hidden = false; } }

    var del = $("#pf-del");
    if (del) del.addEventListener("click", function () {
      if (!dropPiece(id)) return;
      alog(id, "dossier d’identité vidé", m.name);
      delete state.shown[id];
      closeModal(); toast("Dossier vidé."); A.refresh();
    });

    $("#pf-s").addEventListener("click", function () {
      var f = $("#pf");
      var raw = f.querySelector('[name="cni"]').value.trim();
      var cni = normCni(raw);
      var type = f.querySelector('[name="type"]').value;
      var ver = f.querySelector('[name="verified"]').checked;
      var note = f.querySelector('[name="note"]').value.trim();

      if (raw && !cniValid(raw)) return err("Le numéro doit compter entre 6 et 20 lettres ou chiffres.");
      if (ver && !cni) return err("Impossible de déclarer vérifiée une pièce dont le numéro n’est pas renseigné.");

      /* Contrôle de doublon — la raison d'être du registre. Deux adhésions
         sous une même pièce, c'est une double voix en assemblée et une
         certification délivrée deux fois à la même personne. Le membre en
         cause est nommé : sans son nom, l'opérateur ne pourrait ni corriger
         sa saisie ni instruire le cas. */
      if (cni) {
        var clash = null, ps = pieces();
        for (var i = 0; i < ps.length; i++) {
          if (ps[i].id !== id && normCni(ps[i].cni) === cni) { clash = ps[i]; break; }
        }
        if (clash) {
          var other = member(clash.id);
          return err("Ce numéro est déjà enregistré pour " +
            (other ? other.name : "un autre membre") + ". Une pièce ne peut valoir que pour une seule adhésion.");
        }
      }

      var rec = {
        id: id, photo: draft.photo || "", px: draft.px || 0,
        cni: cni, type: type, note: note,
        verified: !!(ver && cni),
        verifiedAt: (ver && cni) ? (p.verified && p.verifiedAt ? p.verifiedAt : new Date().toISOString()) : "",
        verifiedBy: (ver && cni) ? (p.verified && p.verifiedBy ? p.verifiedBy : whoami()) : "",
        createdAt: p.createdAt || ""
      };

      /* Rien n'est journalisé avant que l'écriture ait réussi : sur un quota
         plein, le journal aurait attesté d'un enregistrement qui n'a pas eu
         lieu. */
      if (!savePiece(rec)) return;

      if (!!rec.photo !== !!p.photo) alog(id, rec.photo ? "photo enregistrée" : "photo retirée", m.name);
      else if (rec.photo && rec.photo !== p.photo) alog(id, "photo remplacée", m.name);
      if (rec.cni !== normCni(p.cni)) alog(id, rec.cni ? "numéro de pièce enregistré" : "numéro de pièce effacé", m.name);
      if (rec.verified && !p.verified) alog(id, "pièce vérifiée", m.name);
      if (!rec.verified && p.verified) alog(id, "vérification retirée", m.name);

      closeModal(); toast("Dossier enregistré."); A.refresh();
    });
  }

  function fld(l, c) { return '<label class="afield"><span>' + l + '</span>' + c + '</label>'; }
  function fdate(d) {
    var x = new Date(d);
    if (isNaN(x)) return String(d).slice(0, 40);
    return x.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }

  /* --------------------------------------------------------------------- */
  /* Contrôles                                                              */
  /* --------------------------------------------------------------------- */
  function controlsHTML() {
    var ps = pieces(), ms = members(), ids = {};
    ms.forEach(function (m) { ids[m.id] = m; });

    /* Fiches orphelines : la suppression d'un membre passe par admin.js, qui
       ignore ce registre. Elles ne sont pas effacées d'office — une photo et
       un numéro de pièce ne se retrouvent pas, et une suppression accidentelle
       de membre doit rester rattrapable. */
    var orphans = ps.filter(function (p) { return !ids[p.id]; });

    var seen = {}, dups = [];
    ps.forEach(function (p) {
      var n = normCni(p.cni);
      if (!n) return;
      if (seen[n]) dups.push([seen[n], p.id, n]); else seen[n] = p.id;
    });

    var used = bytesOf(STORE), all = totalBytes();
    var pct = Math.min(100, Math.round(all / BUDGET * 100));

    var h = '<div class="ppanel"><h3><i data-ic=chart></i> Stockage</h3>' +
      '<p class="muted">Le registre partage les 5 Mo du navigateur avec toutes les autres données du CRM. ' +
      'Il n’existe que dans ce navigateur : une sauvegarde exportée est la seule copie.</p>' +
      '<div class="pgauge"><span class="pgauge__fill' + (pct > 75 ? ' pgauge__fill--warn' : '') + '" style="width:' + pct + '%"></span></div>' +
      '<p class="muted">' + kb(all) + ' utilisés sur ~' + kb(BUDGET) + ' prudents (' + pct + ' %) · ' +
      'dont ' + kb(used) + ' de photos et pièces.</p>' +
      (pct > 75 ? '<p class="ferr" style="display:block">Au-delà de 75 %, une écriture peut échouer à tout moment. ' +
        'Exportez le registre, puis allégez-le.</p>' : '') +
      '<div class="btnrow"><button class="abtn abtn--ghost abtn--sm" id="p-exp"><i data-ic=download></i> Exporter le registre (JSON)</button></div>' +
      '<p class="muted">' + (isSuper()
        ? 'L’export contient les numéros en clair : il vaut la pièce elle-même. Ne le laissez pas sur un poste partagé.'
        : 'L’export réservé au Super Admin contient les numéros en clair ; le vôtre les remplace par leur forme masquée.') + '</p>' +
      '</div>';

    /* Dit à l'écran, et pas seulement en commentaire : un registre de pièces
       d'identité qui laisserait croire à une protection qu'il n'offre pas
       serait plus dangereux que pas de registre du tout. */
    h += '<div class="ppanel"><h3><i data-ic=shield></i> Ce que ce registre protège</h3>' +
      '<p>Le masquage, la réserve au Super Admin et le journal d’audit portent sur ce qui ' +
      '<b>quitte la machine</b> : l’affichage à l’écran, les exports, le journal. ' +
      'C’est là que les numéros fuient en pratique.</p>' +
      '<p class="muted">Ils ne protègent pas contre quelqu’un qui a déjà accès à ce navigateur : ' +
      'le CRM n’a pas de serveur, et toutes les données vivent ici, dans ce poste. ' +
      'Ce registre ne doit donc exister que sur un ordinateur de l’association, ' +
      'et sa sauvegarde être traitée comme les pièces elles-mêmes.</p>' +
      '<p class="muted">La seule correction de fond est de déplacer le registre dans Supabase ' +
      'avec des règles d’accès par rôle — le chemin déjà utilisé pour les images du site.</p>' +
      '</div>';

    h += '<div class="ppanel"><h3><i data-ic=alert></i> Doublons de pièce</h3>';
    if (!dups.length) h += '<p class="muted">Aucun numéro n’est enregistré deux fois. Une pièce, une adhésion.</p>';
    else h += '<ul class="plist">' + dups.map(function (d) {
      var a = ids[d[0]], b = ids[d[1]];
      return '<li><b>' + esc(a ? a.name : d[0]) + '</b> et <b>' + esc(b ? b.name : d[1]) +
             '</b> portent le même numéro (' + esc(maskCni(d[2])) + ').</li>';
    }).join("") + '</ul>';
    h += '</div>';

    h += '<div class="ppanel"><h3><i data-ic=trash></i> Fiches orphelines</h3>';
    if (!orphans.length) h += '<p class="muted">Chaque dossier correspond à un membre existant.</p>';
    else h += '<p>' + orphans.length + ' dossier(s) se rattachent à un membre qui n’existe plus. ' +
      'Ils occupent ' + kb(orphans.reduce(function (t, p) { return t + JSON.stringify(p).length * 2; }, 0)) + '.</p>' +
      '<div class="btnrow"><button class="abtn abtn--danger abtn--sm" id="p-orph">Supprimer ces ' + orphans.length + ' dossier(s)</button></div>';
    h += '</div>';

    return h;
  }

  function bindControls() {
    var e = $("#p-exp");
    if (e) e.addEventListener("click", function () {
      var su = isSuper();
      var ms = {}; members().forEach(function (m) { ms[m.id] = m; });
      /* Un administrateur ordinaire n'emporte pas les numéros en clair : le
         masquage de l'écran ne servirait à rien si un bouton d'export le
         contournait. */
      var out = pieces().map(function (p) {
        return { id: p.id, membre: ms[p.id] ? ms[p.id].name : "(membre supprimé)",
                 type: p.type || "", numero: su ? normCni(p.cni) : maskCni(p.cni),
                 verifiee: !!p.verified, verifieeLe: p.verifiedAt || "", verifieePar: p.verifiedBy || "",
                 photo: p.photo ? true : false, note: p.note || "", maj: p.updatedAt || "" };
      });
      var name = "acci-pieces-" + new Date().toISOString().slice(0, 10) + (su ? "" : "-masque") + ".json";
      var b = new Blob([JSON.stringify(out, null, 2)], { type: "application/json;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      alog("", "export du registre des pièces", out.length + " dossier(s)" + (su ? "" : ", numéros masqués"));
      toast(out.length + " dossier(s) exporté(s).");
    });

    var o = $("#p-orph");
    if (o) o.addEventListener("click", function () {
      var ids = {}; members().forEach(function (m) { ids[m.id] = true; });
      var keep = pieces().filter(function (p) { return ids[p.id]; });
      var n = pieces().length - keep.length;
      if (!writeJSON(STORE, keep)) return;
      alog("", "purge des dossiers orphelins", n + " dossier(s)");
      toast(n + " dossier(s) supprimé(s)."); A.refresh();
    });
  }

  /* --------------------------------------------------------------------- */
  /* Enregistrement de la rubrique                                          */
  /* --------------------------------------------------------------------- */
  A.register(
    { view: "pieces", icon: "camera", label: "Photos & pièces" },
    { title: "Photos & pièces d’identité", tabs: [
      { id: "register", l: "Registre" },
      { id: "controls", l: "Contrôles" }
    ] },
    {
      "pieces.register": { r: registerHTML, b: bindRegister },
      "pieces.controls": { r: controlsHTML, b: bindControls }
    }
  );

  /* Surface de lecture pour les autres modules du CRM : la vignette d'un
     membre, et rien d'autre. Le numéro de pièce n'est volontairement pas
     exposé — un module tiers qui l'obtiendrait le rendrait tôt ou tard. */
  window.ACCI_PIECES = {
    photo: function (memberId) { var p = piece(memberId); return p && p.photo ? p.photo : ""; }
  };
})();
