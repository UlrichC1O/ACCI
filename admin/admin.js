/* =========================================================================
   ACCI — CRM d'administration des membres
   Application monopage, sans serveur. Données stockées dans le navigateur
   (localStorage), avec import / export CSV & JSON pour la sauvegarde et la
   portabilité. Prêt à être branché sur une base cloud (voir DB.remote).
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------- Constantes ----------------------------- */
  var KEY_MEMBERS = "acci_crm_members";
  var KEY_INBOX = "acci_crm_inbox";
  var KEY_PASS = "acci_crm_pass";
  var KEY_SEED = "acci_crm_seeded";

  var CATEGORIES = ["Éducation", "Humour & divertissement", "Mode & lifestyle",
    "Cuisine", "Sport & santé", "Entrepreneuriat", "Culture & société",
    "Technologie", "Actualité & médias", "Autre"];
  var TYPES = ["Adhérent", "Actif", "Bienfaiteur", "Honneur"];
  var STATUSES = ["Prospect", "Actif", "Inactif"];

  /* ------------------------------- Outils ------------------------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid() { return "m_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36); }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function fmtDate(d) {
    if (!d) return "—";
    var x = new Date(d); if (isNaN(x)) return d;
    return x.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }
  function hash(str) { // non cryptographique — simple obfuscation locale
    var h = 5381, i = str.length;
    while (i) h = (h * 33) ^ str.charCodeAt(--i);
    return (h >>> 0).toString(16);
  }

  /* ----------------------------- Stockage ------------------------------- */
  var DB = {
    members: function () { try { return JSON.parse(localStorage.getItem(KEY_MEMBERS)) || []; } catch (e) { return []; } },
    saveMembers: function (arr) { localStorage.setItem(KEY_MEMBERS, JSON.stringify(arr)); },
    inbox: function () { try { return JSON.parse(localStorage.getItem(KEY_INBOX)) || []; } catch (e) { return []; } },
    saveInbox: function (arr) { localStorage.setItem(KEY_INBOX, JSON.stringify(arr)); },
    add: function (m) { var a = DB.members(); a.unshift(m); DB.saveMembers(a); },
    update: function (m) { var a = DB.members().map(function (x) { return x.id === m.id ? m : x; }); DB.saveMembers(a); },
    remove: function (id) { DB.saveMembers(DB.members().filter(function (x) { return x.id !== id; })); },
    get: function (id) { return DB.members().filter(function (x) { return x.id === id; })[0]; }
  };

  /* --------------------------- État de l'UI ----------------------------- */
  var state = { view: "dashboard", query: "", fStatus: "", fCat: "",
    sortKey: "createdAt", sortDir: -1, selection: {} };

  /* ----------------------------- Connexion ------------------------------ */
  function initAuth() {
    var loginEl = $("#login"), appEl = $("#app");
    var hasPass = !!localStorage.getItem(KEY_PASS);
    var creating = !hasPass;

    if (sessionStorage.getItem("acci_crm_auth") === "1") { showApp(); return; }

    if (creating) {
      $("#login-title").textContent = "Première connexion";
      $("#login-sub").textContent = "Créez un code d'accès pour protéger l'espace d'administration.";
      $("#login-label").textContent = "Nouveau code d'accès";
      $("#login-pass2").hidden = false;
      $("#login-btn").textContent = "Créer le code";
    }

    $("#login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("#login-err");
      var p1 = $("#login-pass").value.trim();
      if (creating) {
        var p2 = $("#login-pass2").value.trim();
        if (p1.length < 4) { return showErr(err, "Le code doit contenir au moins 4 caractères."); }
        if (p1 !== p2) { return showErr(err, "Les deux codes ne correspondent pas."); }
        localStorage.setItem(KEY_PASS, hash(p1));
        sessionStorage.setItem("acci_crm_auth", "1");
        showApp();
      } else {
        if (hash(p1) === localStorage.getItem(KEY_PASS)) {
          sessionStorage.setItem("acci_crm_auth", "1");
          err.hidden = true;
          showApp();
        } else { showErr(err, "Code d'accès incorrect."); }
      }
    });

    function showErr(el, m) { el.textContent = m; el.hidden = false; }
    function showApp() { loginEl.hidden = true; appEl.hidden = false; seedIfEmpty(); boot(); }
  }

  /* --------------------------- Données d'exemple ------------------------ */
  function seedIfEmpty() {
    if (localStorage.getItem(KEY_SEED)) return;
    if (DB.members().length === 0) {
      var samples = [
        ["Awa Koné", "awa.kone@exemple.ci", "+225 07 01 02 03", "Abidjan", "Éducation", "Actif", "Actif", true],
        ["Yao Brou", "yao.brou@exemple.ci", "+225 05 11 22 33", "Bouaké", "Humour & divertissement", "Adhérent", "Actif", true],
        ["Fatou Diarra", "fatou.d@exemple.ci", "+225 01 44 55 66", "Yamoussoukro", "Cuisine", "Adhérent", "Prospect", false],
        ["Koffi N'Guessan", "koffi.ng@exemple.ci", "+225 07 77 88 99", "San-Pédro", "Sport & santé", "Bienfaiteur", "Actif", true],
        ["Mariam Touré", "mariam.t@exemple.ci", "+225 05 22 33 44", "Korhogo", "Mode & lifestyle", "Adhérent", "Inactif", false]
      ];
      var arr = samples.map(function (s, i) {
        return { id: uid(), name: s[0], email: s[1], phone: s[2], city: s[3], category: s[4],
          type: s[5], status: s[6], charter: s[7], social: "", notes: "Membre de démonstration.",
          createdAt: new Date(Date.now() - i * 86400000 * 9).toISOString(), updatedAt: todayISO(), sample: true };
      });
      DB.saveMembers(arr);
    }
    localStorage.setItem(KEY_SEED, "1");
  }

  /* ------------------------------ Boot ---------------------------------- */
  function boot() {
    $$("#snav .snav").forEach(function (b) {
      b.addEventListener("click", function () { go(b.getAttribute("data-view")); closeSidebar(); });
    });
    $("#logout").addEventListener("click", function () {
      sessionStorage.removeItem("acci_crm_auth"); location.reload();
    });
    $("#add-btn").addEventListener("click", function () { openEdit(null); });
    $("#search").addEventListener("input", function () { state.query = this.value; if (state.view === "members") renderMembers(); else go("members"); });
    $("#atop-burger").addEventListener("click", function () { $(".sidebar").classList.toggle("is-open"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    go("dashboard");
  }
  function closeSidebar() { $(".sidebar").classList.remove("is-open"); }

  function go(view) {
    state.view = view;
    $$("#snav .snav").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-view") === view); });
    var titles = { dashboard: "Tableau de bord", members: "Membres", inbox: "Boîte de réception", data: "Import / Export", settings: "Réglages" };
    $("#view-title").textContent = titles[view] || "";
    updateInboxBadge();
    ({ dashboard: renderDashboard, members: renderMembers, inbox: renderInbox, data: renderData, settings: renderSettings }[view] || renderDashboard)();
  }

  function updateInboxBadge() {
    var n = DB.inbox().length, b = $("#inbox-count");
    b.textContent = n; b.hidden = n === 0;
  }

  /* --------------------------- Tableau de bord -------------------------- */
  function renderDashboard() {
    var m = DB.members();
    var actifs = m.filter(function (x) { return x.status === "Actif"; }).length;
    var prospects = m.filter(function (x) { return x.status === "Prospect"; }).length;
    var inactifs = m.filter(function (x) { return x.status === "Inactif"; }).length;
    var charte = m.filter(function (x) { return x.charter; }).length;
    var thisMonth = m.filter(function (x) {
      var d = new Date(x.createdAt); var n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).length;

    var kpis = [
      ["👥", m.length, "Membres au total", ""],
      ["✅", actifs, "Membres actifs", "ok"],
      ["🌱", prospects, "Prospects", "warn"],
      ["📝", charte, "Charte signée", "info"],
      ["📅", thisMonth, "Nouveaux ce mois", ""]
    ].map(function (k) {
      return '<div class="kpi"><span class="kpi__icon kpi__icon--' + (k[3] || "n") + '">' + k[0] + '</span>' +
        '<span class="kpi__val">' + k[1] + '</span><span class="kpi__label">' + k[2] + '</span></div>';
    }).join("");

    // Répartition par catégorie
    var byCat = {};
    CATEGORIES.forEach(function (c) { byCat[c] = 0; });
    m.forEach(function (x) { byCat[x.category] = (byCat[x.category] || 0) + 1; });
    var cats = Object.keys(byCat).filter(function (c) { return byCat[c] > 0; })
      .sort(function (a, b) { return byCat[b] - byCat[a]; });
    var maxCat = Math.max.apply(null, cats.map(function (c) { return byCat[c]; }).concat([1]));
    var palette = ["#F77F00", "#0B7A3B", "#0B3D2E", "#E16500", "#1b6ec2", "#c87f0a", "#7a8c83"];
    var catBars = cats.length ? cats.map(function (c, i) {
      return '<div class="cb"><span class="cb__label">' + esc(c) + '</span>' +
        '<span class="cb__track"><span class="cb__fill" style="width:' + Math.round(byCat[c] / maxCat * 100) + '%;background:' + palette[i % palette.length] + '"></span></span>' +
        '<span class="cb__val">' + byCat[c] + '</span></div>';
    }).join("") : '<p class="muted">Aucune donnée.</p>';

    // Statut (anneau simple en texte)
    var statusRows = STATUSES.map(function (s) {
      var n = m.filter(function (x) { return x.status === s; }).length;
      var pct = m.length ? Math.round(n / m.length * 100) : 0;
      return '<div class="cb"><span class="cb__label">' + badge(s) + '</span>' +
        '<span class="cb__track"><span class="cb__fill" style="width:' + pct + '%;background:' + statusColor(s) + '"></span></span>' +
        '<span class="cb__val">' + n + '</span></div>';
    }).join("");

    // Derniers membres
    var recent = m.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).slice(0, 6);
    var recentRows = recent.length ? recent.map(function (x) {
      return '<tr data-id="' + x.id + '" class="rowlink"><td>' + avatar(x) + '</td><td>' + esc(x.name) + '<br><span class="muted">' + esc(x.email) + '</span></td>' +
        '<td>' + esc(x.category) + '</td><td>' + badge(x.status) + '</td><td class="muted">' + fmtDate(x.createdAt) + '</td></tr>';
    }).join("") : '<tr><td colspan="5" class="muted" style="padding:20px">Aucun membre. Cliquez sur « Ajouter ».</td></tr>';

    var inboxN = DB.inbox().length;
    var inboxBanner = inboxN ? '<div class="banner banner--info">📥 <b>' + inboxN + '</b> nouvelle(s) demande(s) en attente dans la boîte de réception. <button class="link" data-go="inbox">Voir</button></div>' : "";

    $("#view").innerHTML =
      inboxBanner +
      '<div class="kpis">' + kpis + '</div>' +
      '<div class="cols">' +
        '<section class="panel"><div class="panel__head"><h2 class="panel__title">Répartition par domaine</h2></div><div class="chartbars">' + catBars + '</div></section>' +
        '<section class="panel"><div class="panel__head"><h2 class="panel__title">Par statut</h2></div><div class="chartbars">' + statusRows + '</div></section>' +
      '</div>' +
      '<section class="panel"><div class="panel__head"><h2 class="panel__title">Derniers membres</h2><button class="abtn abtn--ghost abtn--sm" data-go="members">Tout voir</button></div>' +
        '<div class="dtable"><table><thead><tr><th></th><th>Membre</th><th>Domaine</th><th>Statut</th><th>Inscrit le</th></tr></thead><tbody>' + recentRows + '</tbody></table></div></section>';

    $$('[data-go]').forEach(function (b) { b.addEventListener("click", function () { go(b.getAttribute("data-go")); }); });
    $$(".rowlink").forEach(function (r) { r.addEventListener("click", function () { openDetail(r.getAttribute("data-id")); }); });
  }

  /* ------------------------------ Membres ------------------------------- */
  function filtered() {
    var q = norm(state.query);
    return DB.members().filter(function (x) {
      if (state.fStatus && x.status !== state.fStatus) return false;
      if (state.fCat && x.category !== state.fCat) return false;
      if (!q) return true;
      return norm(x.name + " " + x.email + " " + x.phone + " " + x.city + " " + x.category + " " + x.notes).indexOf(q) !== -1;
    }).sort(function (a, b) {
      var k = state.sortKey, va = a[k], vb = b[k];
      if (k === "createdAt") { va = new Date(va); vb = new Date(vb); }
      else { va = norm(va); vb = norm(vb); }
      return (va < vb ? -1 : va > vb ? 1 : 0) * state.sortDir;
    });
  }

  function renderMembers() {
    var list = filtered();
    var selCount = Object.keys(state.selection).filter(function (k) { return state.selection[k]; }).length;

    var filters =
      '<div class="filterbar">' +
        '<select id="f-status"><option value="">Tous les statuts</option>' + STATUSES.map(function (s) { return '<option' + (state.fStatus === s ? ' selected' : '') + '>' + s + '</option>'; }).join("") + '</select>' +
        '<select id="f-cat"><option value="">Tous les domaines</option>' + CATEGORIES.map(function (c) { return '<option' + (state.fCat === c ? ' selected' : '') + '>' + c + '</option>'; }).join("") + '</select>' +
        '<span class="filterbar__count">' + list.length + ' membre(s)</span>' +
        '<div class="filterbar__right">' +
          (selCount ? '<button class="abtn abtn--ghost abtn--sm" id="bulk-status">Changer le statut (' + selCount + ')</button><button class="abtn abtn--danger abtn--sm" id="bulk-del">Supprimer (' + selCount + ')</button>' : '') +
          '<button class="abtn abtn--ghost abtn--sm" id="exp-csv">⬇ CSV</button>' +
        '</div>' +
      '</div>';

    var rows = list.length ? list.map(function (x) {
      return '<tr data-id="' + x.id + '">' +
        '<td><input type="checkbox" class="rowcheck" data-id="' + x.id + '"' + (state.selection[x.id] ? ' checked' : '') + '></td>' +
        '<td class="cell-name">' + avatar(x) + '<span><b>' + esc(x.name) + '</b>' + (x.sample ? ' <span class="tagmini">exemple</span>' : '') + '<br><span class="muted">' + esc(x.email || "—") + '</span></span></td>' +
        '<td>' + esc(x.phone || "—") + '</td>' +
        '<td>' + esc(x.city || "—") + '</td>' +
        '<td>' + esc(x.category || "—") + '</td>' +
        '<td>' + esc(x.type || "—") + '</td>' +
        '<td>' + badge(x.status) + '</td>' +
        '<td>' + (x.charter ? '<span class="check-yes">✓</span>' : '<span class="check-no">—</span>') + '</td>' +
        '<td class="rowact">' +
          '<button class="iact" data-edit="' + x.id + '" title="Modifier">✎</button>' +
          '<button class="iact iact--del" data-del="' + x.id + '" title="Supprimer">🗑</button>' +
        '</td></tr>';
    }).join("") : '<tr><td colspan="9" class="empty">Aucun membre ne correspond. <button class="link" id="empty-add">Ajouter un membre</button></td></tr>';

    function sortable(key, label) {
      var arrow = state.sortKey === key ? (state.sortDir === 1 ? " ▲" : " ▼") : "";
      return '<th class="th-sort" data-sort="' + key + '">' + label + arrow + '</th>';
    }

    $("#view").innerHTML = filters +
      '<div class="dtable"><table><thead><tr>' +
        '<th style="width:34px"><input type="checkbox" id="checkall"></th>' +
        sortable("name", "Membre") + '<th>Téléphone</th><th>Ville</th>' +
        sortable("category", "Domaine") + sortable("type", "Type") + sortable("status", "Statut") +
        '<th>Charte</th><th></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';

    // évènements
    var fs = $("#f-status"); if (fs) fs.addEventListener("change", function () { state.fStatus = this.value; renderMembers(); });
    var fc = $("#f-cat"); if (fc) fc.addEventListener("change", function () { state.fCat = this.value; renderMembers(); });
    $$(".th-sort").forEach(function (th) { th.addEventListener("click", function () {
      var k = th.getAttribute("data-sort");
      if (state.sortKey === k) state.sortDir *= -1; else { state.sortKey = k; state.sortDir = 1; }
      renderMembers();
    }); });
    $$("[data-edit]").forEach(function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); openEdit(b.getAttribute("data-edit")); }); });
    $$("[data-del]").forEach(function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); confirmDelete(b.getAttribute("data-del")); }); });
    $$(".cell-name").forEach(function (c) { c.addEventListener("click", function () { openDetail(c.parentNode.getAttribute("data-id")); }); c.style.cursor = "pointer"; });
    $$(".rowcheck").forEach(function (c) { c.addEventListener("change", function () { state.selection[c.getAttribute("data-id")] = c.checked; renderMembers(); }); });
    var ca = $("#checkall"); if (ca) ca.addEventListener("change", function () { list.forEach(function (x) { state.selection[x.id] = ca.checked; }); renderMembers(); });
    var ea = $("#empty-add"); if (ea) ea.addEventListener("click", function () { openEdit(null); });
    var ec = $("#exp-csv"); if (ec) ec.addEventListener("click", function () { exportCSV(list); });
    var bd = $("#bulk-del"); if (bd) bd.addEventListener("click", bulkDelete);
    var bs = $("#bulk-status"); if (bs) bs.addEventListener("click", bulkStatus);
  }

  /* --------------------------- Fiche / édition -------------------------- */
  function openDetail(id) {
    var x = DB.get(id); if (!x) return;
    var rows = [
      ["E-mail", x.email ? '<a href="mailto:' + esc(x.email) + '">' + esc(x.email) + '</a>' : "—"],
      ["Téléphone", x.phone ? '<a href="tel:' + esc(x.phone) + '">' + esc(x.phone) + '</a>' : "—"],
      ["Ville", esc(x.city || "—")],
      ["Domaine", esc(x.category || "—")],
      ["Type de membre", esc(x.type || "—")],
      ["Statut", badge(x.status)],
      ["Charte signée", x.charter ? "Oui ✓" : "Non"],
      ["Réseaux / lien", x.social ? '<a href="' + esc(x.social) + '" target="_blank" rel="noopener">' + esc(x.social) + '</a>' : "—"],
      ["Inscrit le", fmtDate(x.createdAt)]
    ].map(function (r) { return '<div class="drow"><span class="dk">' + r[0] + '</span><span class="dv">' + r[1] + '</span></div>'; }).join("");

    openModal(
      '<div class="modal__head"><div class="dhead">' + avatar(x, 48) + '<div><h2>' + esc(x.name) + '</h2><span class="muted">' + esc(x.category || "") + '</span></div></div>' +
      '<button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body">' + rows +
        (x.notes ? '<div class="dnotes"><span class="dk">Notes</span><p>' + esc(x.notes) + '</p></div>' : '') +
      '</div>' +
      '<div class="modal__foot"><button class="abtn abtn--danger abtn--sm" data-del="' + x.id + '">Supprimer</button>' +
      '<span style="flex:1"></span>' +
      '<button class="abtn abtn--ghost" data-close>Fermer</button>' +
      '<button class="abtn abtn--primary" data-edit="' + x.id + '">Modifier</button></div>'
    );
    $$("[data-edit]", $("#modal")).forEach(function (b) { b.addEventListener("click", function () { openEdit(x.id); }); });
    $$("[data-del]", $("#modal")).forEach(function (b) { b.addEventListener("click", function () { confirmDelete(x.id); }); });
  }

  function openEdit(id) {
    var x = id ? DB.get(id) : { id: "", name: "", email: "", phone: "", city: "", category: "Éducation", type: "Adhérent", status: "Prospect", charter: false, social: "", notes: "", createdAt: "" };
    function opt(arr, v) { return arr.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>'; }).join(""); }
    openModal(
      '<div class="modal__head"><h2>' + (id ? "Modifier le membre" : "Nouveau membre") + '</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<form id="mform" class="modal__body">' +
        '<div class="fgrid">' +
          ffield("Nom complet *", '<input name="name" required value="' + esc(x.name) + '">') +
          ffield("E-mail", '<input name="email" type="email" value="' + esc(x.email) + '">') +
          ffield("Téléphone", '<input name="phone" value="' + esc(x.phone) + '">') +
          ffield("Ville", '<input name="city" value="' + esc(x.city) + '">') +
          ffield("Domaine", '<select name="category">' + opt(CATEGORIES, x.category) + '</select>') +
          ffield("Type de membre", '<select name="type">' + opt(TYPES, x.type) + '</select>') +
          ffield("Statut", '<select name="status">' + opt(STATUSES, x.status) + '</select>') +
          ffield("Réseau / lien", '<input name="social" placeholder="https://…" value="' + esc(x.social) + '">') +
        '</div>' +
        '<label class="fcheck"><input type="checkbox" name="charter"' + (x.charter ? " checked" : "") + '> A signé la charte du créateur responsable</label>' +
        ffield("Notes", '<textarea name="notes" rows="3">' + esc(x.notes) + '</textarea>') +
        '<p class="ferr" id="mform-err" hidden></p>' +
      '</form>' +
      '<div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button>' +
      '<button class="abtn abtn--primary" id="mform-save">' + (id ? "Enregistrer" : "Créer le membre") + '</button></div>'
    );
    $("#mform-save").addEventListener("click", function () {
      var f = $("#mform");
      var name = f.name.value.trim();
      if (!name) { var er = $("#mform-err"); er.textContent = "Le nom est obligatoire."; er.hidden = false; f.name.focus(); return; }
      var rec = {
        id: x.id || uid(), name: name, email: f.email.value.trim(), phone: f.phone.value.trim(),
        city: f.city.value.trim(), category: f.category.value, type: f.type.value, status: f.status.value,
        charter: f.charter.checked, social: f.social.value.trim(), notes: f.notes.value.trim(),
        createdAt: x.createdAt || new Date().toISOString(), updatedAt: todayISO()
      };
      if (id) { DB.update(rec); toast("Membre mis à jour."); } else { DB.add(rec); toast("Membre ajouté."); }
      closeModal(); refresh();
    });
    setTimeout(function () { var n = $('#mform [name="name"]'); if (n) n.focus(); }, 50);
  }

  function confirmDelete(id) {
    var x = DB.get(id); if (!x) return;
    openModal(
      '<div class="modal__head"><h2>Supprimer ce membre ?</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body"><p>Voulez-vous vraiment supprimer <b>' + esc(x.name) + '</b> ? Cette action est irréversible.</p></div>' +
      '<div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button>' +
      '<button class="abtn abtn--danger" id="del-yes">Supprimer définitivement</button></div>'
    );
    $("#del-yes").addEventListener("click", function () { DB.remove(id); toast("Membre supprimé."); closeModal(); refresh(); });
  }

  function bulkDelete() {
    var ids = Object.keys(state.selection).filter(function (k) { return state.selection[k]; });
    if (!ids.length) return;
    openModal('<div class="modal__head"><h2>Supprimer ' + ids.length + ' membre(s) ?</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body"><p>Cette action est irréversible.</p></div>' +
      '<div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--danger" id="bd-yes">Supprimer</button></div>');
    $("#bd-yes").addEventListener("click", function () {
      DB.saveMembers(DB.members().filter(function (x) { return ids.indexOf(x.id) === -1; }));
      state.selection = {}; toast(ids.length + " membre(s) supprimé(s)."); closeModal(); refresh();
    });
  }

  function bulkStatus() {
    var ids = Object.keys(state.selection).filter(function (k) { return state.selection[k]; });
    if (!ids.length) return;
    openModal('<div class="modal__head"><h2>Changer le statut</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body">' + ffield("Nouveau statut pour " + ids.length + " membre(s)", '<select id="bs-val">' + STATUSES.map(function (s) { return '<option>' + s + '</option>'; }).join("") + '</select>') + '</div>' +
      '<div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--primary" id="bs-yes">Appliquer</button></div>');
    $("#bs-yes").addEventListener("click", function () {
      var v = $("#bs-val").value;
      DB.saveMembers(DB.members().map(function (x) { return ids.indexOf(x.id) !== -1 ? (x.status = v, x.updatedAt = todayISO(), x) : x; }));
      state.selection = {}; toast("Statut mis à jour."); closeModal(); refresh();
    });
  }

  /* --------------------------- Boîte de réception ----------------------- */
  function renderInbox() {
    var inbox = DB.inbox();
    if (!inbox.length) {
      $("#view").innerHTML = '<div class="empty-state"><div class="empty-state__ic">📥</div><h2>Aucune demande en attente</h2>' +
        '<p class="muted">Les demandes envoyées via le formulaire d\'adhésion ou de contact (sur ce navigateur) apparaissent ici. ' +
        'Vous pouvez aussi importer un fichier exporté depuis votre service de formulaire.</p>' +
        '<button class="abtn abtn--ghost" data-go="data">Aller à l\'import</button></div>';
      $$('[data-go]').forEach(function (b) { b.addEventListener("click", function () { go(b.getAttribute("data-go")); }); });
      return;
    }
    var rows = inbox.map(function (it, i) {
      return '<tr><td><b>' + esc(it.name || "—") + '</b><br><span class="muted">' + esc(it.email || "") + '</span></td>' +
        '<td>' + esc(it.subject || it.phone || "—") + '</td>' +
        '<td class="muted">' + esc((it.message || "").slice(0, 80)) + '</td>' +
        '<td class="muted">' + fmtDate(it.date) + '</td>' +
        '<td class="rowact"><button class="abtn abtn--primary abtn--sm" data-conv="' + i + '">Convertir</button>' +
        '<button class="iact iact--del" data-drop="' + i + '" title="Supprimer">🗑</button></td></tr>';
    }).join("");
    $("#view").innerHTML = '<div class="filterbar"><span class="filterbar__count">' + inbox.length + ' demande(s)</span>' +
      '<div class="filterbar__right"><button class="abtn abtn--ghost abtn--sm" id="inbox-clear">Vider la boîte</button></div></div>' +
      '<div class="dtable"><table><thead><tr><th>De</th><th>Objet</th><th>Message</th><th>Reçu</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    $$("[data-conv]").forEach(function (b) { b.addEventListener("click", function () { convertLead(+b.getAttribute("data-conv")); }); });
    $$("[data-drop]").forEach(function (b) { b.addEventListener("click", function () { var ix = DB.inbox(); ix.splice(+b.getAttribute("data-drop"), 1); DB.saveInbox(ix); refresh(); }); });
    $("#inbox-clear").addEventListener("click", function () { DB.saveInbox([]); toast("Boîte vidée."); refresh(); });
  }

  function convertLead(i) {
    var ix = DB.inbox(); var it = ix[i]; if (!it) return;
    var rec = { id: uid(), name: it.name || "", email: it.email || "", phone: it.phone || "", city: "",
      category: "Autre", type: "Adhérent", status: "Prospect", charter: false, social: "",
      notes: (it.subject ? "Objet : " + it.subject + "\n" : "") + (it.message || ""),
      createdAt: new Date().toISOString(), updatedAt: todayISO() };
    DB.add(rec); ix.splice(i, 1); DB.saveInbox(ix);
    toast("Demande convertie en membre (prospect)."); refresh();
  }

  /* ----------------------------- Import / Export ------------------------ */
  function renderData() {
    var n = DB.members().length;
    $("#view").innerHTML =
      '<div class="cols">' +
      '<section class="panel"><div class="panel__head"><h2 class="panel__title">Exporter</h2></div>' +
        '<p class="muted">Sauvegardez votre base de ' + n + ' membre(s). Le format CSV s\'ouvre dans Excel / Google Sheets ; le JSON sert de sauvegarde complète.</p>' +
        '<div class="btnrow"><button class="abtn abtn--primary" id="x-csv">⬇ Exporter en CSV</button>' +
        '<button class="abtn abtn--ghost" id="x-json">⬇ Exporter en JSON</button></div></section>' +
      '<section class="panel"><div class="panel__head"><h2 class="panel__title">Importer</h2></div>' +
        '<p class="muted">Ajoutez des membres depuis un fichier CSV ou JSON (ex. export de Formspree, Google Forms…). Les colonnes reconnues : name, email, phone, city, category, type, status, charter, notes.</p>' +
        '<div class="btnrow"><label class="abtn abtn--ghost">⬆ Importer un fichier<input type="file" id="imp-file" accept=".csv,.json" hidden></label>' +
        '<button class="abtn abtn--ghost" id="dl-template">Modèle CSV</button></div>' +
        '<p class="ferr" id="imp-msg" hidden></p></section>' +
      '</div>' +
      '<section class="panel panel--danger"><div class="panel__head"><h2 class="panel__title">Zone sensible</h2></div>' +
        '<p class="muted">Réinitialiser efface définitivement tous les membres de ce navigateur. Pensez à exporter avant.</p>' +
        '<button class="abtn abtn--danger" id="wipe">Tout réinitialiser</button></section>' +
      '<section class="panel panel--info"><div class="panel__head"><h2 class="panel__title">Passer à une base partagée (gratuit)</h2></div>' +
        '<p class="muted">Pour gérer les membres à plusieurs et en ligne (multi-appareils), connectez une base <b>Supabase</b> (offre gratuite) : créez un projet, une table <code>members</code>, puis renseignez l\'URL et la clé publique dans <code>admin.js</code> (section <code>DB.remote</code>). L\'interface reste identique.</p></section>';

    $("#x-csv").addEventListener("click", function () { exportCSV(DB.members()); });
    $("#x-json").addEventListener("click", exportJSON);
    $("#dl-template").addEventListener("click", downloadTemplate);
    $("#wipe").addEventListener("click", wipe);
    $("#imp-file").addEventListener("change", importFile);
  }

  var FIELDS = ["name", "email", "phone", "city", "category", "type", "status", "charter", "social", "notes", "createdAt"];

  function exportCSV(list) {
    var head = FIELDS.join(",");
    var lines = list.map(function (x) {
      return FIELDS.map(function (f) {
        var v = f === "charter" ? (x[f] ? "oui" : "non") : (x[f] == null ? "" : x[f]);
        v = String(v).replace(/"/g, '""');
        return /[",\n]/.test(v) ? '"' + v + '"' : v;
      }).join(",");
    });
    download("acci-membres-" + todayISO() + ".csv", "﻿" + head + "\n" + lines.join("\n"), "text/csv");
    toast(list.length + " membre(s) exporté(s) en CSV.");
  }
  function exportJSON() {
    download("acci-membres-" + todayISO() + ".json", JSON.stringify(DB.members(), null, 2), "application/json");
    toast("Export JSON téléchargé.");
  }
  function downloadTemplate() {
    download("modele-membres.csv", "﻿" + FIELDS.join(",") + "\nAwa Koné,awa@exemple.ci,+225...,Abidjan,Éducation,Adhérent,Prospect,oui,,Note libre,", "text/csv");
  }

  function importFile(e) {
    var file = e.target.files[0]; if (!file) return;
    var msg = $("#imp-msg"); msg.hidden = true;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var added = 0, txt = reader.result, recs = [];
        if (/\.json$/i.test(file.name)) {
          recs = JSON.parse(txt); if (!Array.isArray(recs)) throw 0;
        } else { recs = parseCSV(txt); }
        var cur = DB.members();
        recs.forEach(function (r) {
          if (!r.name && !r.email) return;
          cur.unshift({
            id: uid(), name: r.name || "", email: r.email || "", phone: r.phone || "", city: r.city || "",
            category: CATEGORIES.indexOf(r.category) !== -1 ? r.category : "Autre",
            type: TYPES.indexOf(r.type) !== -1 ? r.type : "Adhérent",
            status: STATUSES.indexOf(r.status) !== -1 ? r.status : "Prospect",
            charter: /^(oui|true|1|yes)$/i.test(String(r.charter || "")), social: r.social || "",
            notes: r.notes || "", createdAt: r.createdAt || new Date().toISOString(), updatedAt: todayISO()
          });
          added++;
        });
        DB.saveMembers(cur);
        msg.className = "ferr okmsg"; msg.textContent = "✓ " + added + " membre(s) importé(s)."; msg.hidden = false;
        toast(added + " membre(s) importé(s).");
        setTimeout(function () { go("members"); }, 600);
      } catch (err) {
        msg.className = "ferr"; msg.textContent = "Fichier illisible. Vérifiez le format (CSV ou JSON)."; msg.hidden = false;
      }
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  function parseCSV(text) {
    text = text.replace(/^﻿/, "");
    var rows = [], row = [], val = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { val += '"'; i++; }
        else if (c === '"') q = false;
        else val += c;
      } else {
        if (c === '"') q = true;
        else if (c === ",") { row.push(val); val = ""; }
        else if (c === "\n" || c === "\r") { if (val !== "" || row.length) { row.push(val); rows.push(row); row = []; val = ""; } if (c === "\r" && text[i + 1] === "\n") i++; }
        else val += c;
      }
    }
    if (val !== "" || row.length) { row.push(val); rows.push(row); }
    if (!rows.length) return [];
    var head = rows.shift().map(function (h) { return norm(h.trim()); });
    return rows.filter(function (r) { return r.some(function (c) { return c.trim(); }); }).map(function (r) {
      var o = {}; head.forEach(function (h, i) { o[h] = (r[i] || "").trim(); }); return o;
    });
  }

  function wipe() {
    openModal('<div class="modal__head"><h2>Tout réinitialiser ?</h2><button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body"><p>Tous les membres seront <b>définitivement supprimés</b> de ce navigateur. Exportez vos données avant si besoin.</p></div>' +
      '<div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--danger" id="wipe-yes">Tout effacer</button></div>');
    $("#wipe-yes").addEventListener("click", function () { DB.saveMembers([]); localStorage.removeItem(KEY_SEED); toast("Base réinitialisée."); closeModal(); refresh(); });
  }

  /* ------------------------------ Réglages ------------------------------ */
  function renderSettings() {
    $("#view").innerHTML =
      '<section class="panel"><div class="panel__head"><h2 class="panel__title">Code d\'accès</h2></div>' +
        '<form id="pass-form" class="fgrid">' +
          ffield("Code actuel", '<input type="password" name="cur" required>') +
          ffield("Nouveau code", '<input type="password" name="n1" required>') +
        '</form>' +
        '<div class="btnrow"><button class="abtn abtn--primary" id="pass-save">Modifier le code</button></div>' +
        '<p class="ferr" id="pass-msg" hidden></p></section>' +
      '<section class="panel panel--info"><div class="panel__head"><h2 class="panel__title">À propos de ce CRM</h2></div>' +
        '<p class="muted">CRM léger, gratuit et sans serveur. Les données sont stockées dans <b>ce navigateur</b> (localStorage). ' +
        'Pour ne pas les perdre : exportez régulièrement (CSV/JSON). Pour un accès partagé en ligne, connectez une base Supabase gratuite ' +
        '(voir l\'onglet Import / Export).</p>' +
        '<p class="muted">Sécurité : la protection par code est locale et ne remplace pas une authentification serveur. Ne stockez pas de données ultra-sensibles sans base sécurisée.</p></section>';
    $("#pass-save").addEventListener("click", function () {
      var f = $("#pass-form"), msg = $("#pass-msg");
      if (hash(f.cur.value) !== localStorage.getItem(KEY_PASS)) { msg.className = "ferr"; msg.textContent = "Code actuel incorrect."; msg.hidden = false; return; }
      if (f.n1.value.trim().length < 4) { msg.className = "ferr"; msg.textContent = "Le nouveau code doit faire au moins 4 caractères."; msg.hidden = false; return; }
      localStorage.setItem(KEY_PASS, hash(f.n1.value.trim()));
      msg.className = "ferr okmsg"; msg.textContent = "✓ Code mis à jour."; msg.hidden = false; f.reset();
      toast("Code d'accès modifié.");
    });
  }

  /* --------------------------- Composants UI ---------------------------- */
  function avatar(x, size) {
    var ini = (x.name || "?").split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
    var s = size || 36;
    return '<span class="avatar" style="width:' + s + 'px;height:' + s + 'px;font-size:' + (s / 2.6) + 'px">' + esc(ini) + '</span>';
  }
  function statusColor(s) { return { "Actif": "#0B7A3B", "Prospect": "#c87f0a", "Inactif": "#9aa6a0" }[s] || "#999"; }
  function badge(s) { return '<span class="badge badge--' + norm(s) + '">' + esc(s) + '</span>'; }
  function ffield(label, control) { return '<label class="afield"><span>' + label + '</span>' + control + '</label>'; }

  function openModal(html) { var m = $("#modal"); m.innerHTML = '<div class="modal__box">' + html + '</div>'; m.hidden = false;
    $$("[data-close]", m).forEach(function (b) { b.addEventListener("click", closeModal); });
    m.addEventListener("click", function (e) { if (e.target === m) closeModal(); });
  }
  function closeModal() { var m = $("#modal"); m.hidden = true; m.innerHTML = ""; }
  function refresh() { go(state.view); }

  var toastT;
  function toast(msg, kind) {
    var t = $("#toast"); t.textContent = msg; t.className = "toast toast--" + (kind || "ok"); t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
  }
  function download(name, content, mime) {
    var blob = new Blob([content], { type: mime + ";charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ------------------------------- Lancement ---------------------------- */
  initAuth();
})();
