/* =========================================================================
   ACCI — Graphiques et assistant, modifiables depuis l'administration
   -------------------------------------------------------------------------
   Le site est compilé : ses graphiques et la base de connaissances de son
   assistant sont figés dans les fichiers produits par build.py. Ce module les
   rend modifiables sans recompilation, selon le même principe que les photos et
   les textes — une surcharge enregistrée dans Supabase, appliquée chez le
   visiteur par assets/js/site-settings.js.

   Deux règles valent pour tout ce qui est écrit ici :

   1. Une surcharge illisible ne casse rien. Le site relit chaque valeur et, au
      moindre doute, garde ce qui a été compilé. Un graphique vidé par erreur
      réapparaît donc tel qu'il était, plutôt que de laisser un cadre blanc.

   2. L'écriture exige une session Supabase. Le code d'accès de /admin/ masque
      l'interface, il n'autorise rien : c'est la politique RLS de la base qui
      décide, et elle refuse les anonymes (vérifié).
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;
  var SB = window.ACCI_SB;
  var $ = A.ui.$, $$ = A.ui.$$, esc = A.ui.esc, toast = A.ui.toast;

  var TABLE = "site_settings";

  var state = {
    charts: null,      // inventaire compilé (assets/charts.json)
    map: {},           // surcharges enregistrées
    loaded: false,
    error: null,
    draft: {},         // séries en cours d'édition, par clé de graphique
    chat: null         // { intents: [...], quick: [...] } en cours d'édition
  };

  /* ------------------------------ Données -------------------------------- */

  function loadAll() {
    if (state.loaded) return Promise.resolve();
    var charts = fetch("/assets/charts.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("Inventaire des graphiques introuvable — relancez la compilation.");
        return r.json();
      });
    var settings = fetch(SB.url + "/rest/v1/" + TABLE + "?select=key,value", {
      headers: SB.authHeaders(false, false)
    }).then(function (r) {
      if (!r.ok) throw new Error("Lecture des réglages refusée (" + r.status + ").");
      return r.json();
    });
    return Promise.all([charts, settings]).then(function (res) {
      state.charts = Array.isArray(res[0]) ? res[0] : [];
      var m = {};
      (Array.isArray(res[1]) ? res[1] : []).forEach(function (row) {
        if (row && typeof row.key === "string") m[row.key] = row.value == null ? "" : String(row.value);
      });
      state.map = m;
      state.loaded = true;
      state.error = null;
    }).catch(function (err) {
      state.error = err.message || String(err);
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
        state.map[key] = value;
        return j;
      });
    });
  }

  /* Effacer la ligne, et non enregistrer une valeur vide : le site distingue
     « pas de surcharge » (il affiche ce qui a été compilé) de « surcharge
     vide », qu'il refuserait de toute façon. Supprimer est donc la seule façon
     de revenir réellement à l'état d'origine. */
  function clear(key) {
    return SB.ensureSession().then(function () {
      return fetch(SB.url + "/rest/v1/" + TABLE + "?key=eq." + encodeURIComponent(key), {
        method: "DELETE",
        headers: Object.assign(SB.authHeaders(true, true), { Prefer: "return=representation" })
      });
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.message || "Suppression refusée");
        delete state.map[key];
        return j;
      });
    });
  }

  /* Publier un graphique ou une base de connaissances, c'est écrire dans la base
     que lisent toutes les pages publiques : cela demande une session Supabase.
     Le code d'accès de /admin/ ne vaut pas autorisation — il est vérifié dans le
     navigateur, et la politique RLS ne le connaît pas.

     Sans cet écran, la rubrique affichait les tableaux puis refusait
     l'enregistrement par « Session expirée, reconnectez-vous » — un message
     exact, mais sans nulle part où se reconnecter. La session est la même que
     celle de « Images du site » : s'y être connecté suffit ici aussi. */
  function needLogin() {
    return '<section class="panel"><div class="panel__head">' +
      '<h2 class="panel__title">Connexion requise</h2></div>' +
      '<p class="muted">Les graphiques et l\'assistant sont lus par toutes les pages du site. ' +
      'Les modifier demande une session authentifiée — la même que celle de « Images du site ».</p>' +
      '<div class="fgrid">' +
        '<div class="afield"><label>Adresse e-mail</label>' +
          '<input id="sd-mail" type="email" autocomplete="username"></div>' +
        '<div class="afield"><label>Mot de passe</label>' +
          '<input id="sd-pass" type="password" autocomplete="current-password"></div>' +
      '</div><div class="btnrow"><button class="abtn abtn--primary" id="sd-login">Se connecter</button></div>' +
      '<p class="ferr" id="sd-msg" hidden></p></section>';
  }

  function bindLogin() {
    var b = $("#sd-login");
    if (!b) return false;
    b.addEventListener("click", function () {
      var m = $("#sd-msg");
      m.className = "ferr"; m.textContent = "Connexion…"; m.hidden = false;
      SB.signIn($("#sd-mail").value.trim(), $("#sd-pass").value).then(function () {
        toast("Session ouverte.");
        /* Les données sont rechargées avec la nouvelle session avant de rendre :
           sinon la rubrique s'afficherait vide jusqu'au prochain passage. */
        state.loaded = false; state.error = null;
        return loadAll();
      }).then(function () { A.refresh(); }).catch(function (e) {
        m.className = "ferr"; m.textContent = e.message || String(e); m.hidden = false;
      });
    });
    return true;
  }

  function shell(body) {
    /* La connexion est demandée avant tout le reste : afficher des tableaux
       modifiables à qui ne peut rien enregistrer serait une promesse fausse. */
    if (!SB || !SB.session()) return needLogin();
    if (state.error) {
      return '<section class="panel"><div class="panel__head">' +
        '<h2 class="panel__title">Réglages indisponibles</h2></div>' +
        '<p class="muted">' + esc(state.error) + '</p>' +
        '<div class="btnrow"><button class="abtn abtn--ghost" id="sd-retry">Réessayer</button></div></section>';
    }
    if (!state.loaded) {
      return '<section class="panel"><p class="muted">Chargement…</p></section>';
    }
    return body();
  }

  /* Un échec d'écriture pour cause de session perdue en cours de route ramène à
     l'écran de connexion, plutôt que de laisser un message d'erreur sur un
     bouton qui ne marchera plus. */
  function handleWriteError(e, msgEl) {
    if (e && e.auth) { A.refresh(); return; }
    if (msgEl) { msgEl.className = "ferr"; msgEl.textContent = e.message || String(e); msgEl.hidden = false; }
  }

  /* Le rendu est synchrone : au premier passage les données ne sont pas là, on
     affiche « Chargement… » puis on redemande un rendu une fois arrivées. */
  function ensure() {
    if (!SB || !SB.session()) return;      // l'écran de connexion est rendu à la place
    if (state.loaded || state.error) return;
    loadAll().then(function () { A.refresh(); });
  }

  /* ----------------------------- Graphiques ------------------------------ */

  var COLOR_RE = /^#[0-9a-f]{3,8}$/i;

  /* Série affichée pour un graphique : la version en cours d'édition si elle
     existe, sinon la surcharge enregistrée, sinon la version compilée. */
  function seriesOf(c) {
    if (state.draft[c.k]) return state.draft[c.k];
    var raw = state.map["chart." + c.k];
    if (raw) {
      try {
        var doc = JSON.parse(raw);
        if (doc && Array.isArray(doc.items) && doc.items.length) {
          return doc.items.map(function (it) {
            return {
              label: String(it.label == null ? "" : it.label),
              value: Number(it.value) || 0,
              suffix: String(it.suffix == null ? "" : it.suffix),
              color: String(it.color == null ? "" : it.color)
            };
          });
        }
      } catch (e) { /* illisible : on repart de la version compilée */ }
    }
    return c.items.map(function (it) {
      return { label: it.label, value: it.value, suffix: it.suffix || "", color: it.color || "" };
    });
  }

  function rowHTML(c, s, i) {
    return '<tr data-ck="' + esc(c.k) + '" data-i="' + i + '">' +
      '<td><input class="sd-label" value="' + esc(s.label) + '" placeholder="Intitulé"></td>' +
      '<td style="width:110px"><input class="sd-value" type="number" step="any" min="0" value="' + esc(String(s.value)) + '"></td>' +
      '<td style="width:90px"><input class="sd-suffix" value="' + esc(s.suffix) + '" placeholder="%"></td>' +
      '<td style="width:110px"><input class="sd-color" type="text" value="' + esc(s.color) + '" placeholder="auto"></td>' +
      '<td class="rowact">' +
        '<button class="iact sd-up" title="Monter">↑</button>' +
        '<button class="iact sd-down" title="Descendre">↓</button>' +
        '<button class="iact iact--del sd-del" title="Retirer">✕</button>' +
      '</td></tr>';
  }

  function chartsHTML() {
    ensure();
    return shell(function () {
      if (!state.charts.length) {
        return '<section class="panel"><p class="muted">Aucun graphique dans le site.</p></section>';
      }
      var html = '<p class="muted" style="margin-bottom:12px">' +
        'Les valeurs et les intitulés des graphiques du site. « Enregistrer » les publie ; ' +
        '« Rétablir » supprime la surcharge et le graphique revient à la version compilée. ' +
        'Une couleur vide suit la palette du site.</p>';
      state.charts.forEach(function (c) {
        var ser = seriesOf(c);
        var overridden = !!state.map["chart." + c.k];
        html += '<section class="panel" data-chart-panel="' + esc(c.k) + '">' +
          '<div class="panel__head"><h2 class="panel__title">' + esc(c.title || c.k) + '</h2>' +
          '<span class="muted">' + esc(c.page) + ' · ' + esc(c.kind === "donut" ? "anneau" : "barres") + '</span></div>' +
          (overridden ? '<p class="muted"><b>Modifié</b> — le site affiche la version ci-dessous.</p>' : '') +
          '<div class="dtable"><table><thead><tr><th>Intitulé</th><th>Valeur</th><th>Suffixe</th><th>Couleur</th><th></th></tr></thead>' +
          '<tbody class="sd-rows">' +
          ser.map(function (s, i) { return rowHTML(c, s, i); }).join("") +
          '</tbody></table></div>' +
          '<div class="btnrow">' +
            '<button class="abtn abtn--ghost abtn--sm sd-add">+ Ajouter une série</button>' +
            '<button class="abtn abtn--primary abtn--sm sd-save">Enregistrer</button>' +
            (overridden ? '<button class="abtn abtn--danger abtn--sm sd-reset">Rétablir</button>' : '') +
          '</div><p class="ferr sd-msg" hidden></p></section>';
      });
      return html;
    });
  }

  function readRows(panel) {
    /* Uniquement les lignes du corps du tableau : « tr » seul attrape aussi la
       ligne d'en-têtes, qui ne porte aucun champ — la lecture s'interrompait
       alors sur elle, et la saisie en cours était perdue à chaque ajout. */
    return $$(".sd-rows tr", panel).map(function (tr) {
      return {
        label: $(".sd-label", tr).value.trim(),
        value: Number($(".sd-value", tr).value),
        suffix: $(".sd-suffix", tr).value.trim(),
        color: $(".sd-color", tr).value.trim()
      };
    });
  }

  function bindCharts() {
    if (bindLogin()) return;
    var rt = $("#sd-retry");
    if (rt) return rt.addEventListener("click", function () {
      state.loaded = false; state.error = null; loadAll().then(function () { A.refresh(); });
    });
    $$("[data-chart-panel]").forEach(function (panel) {
      var key = panel.getAttribute("data-chart-panel");
      var c = state.charts.filter(function (x) { return x.k === key; })[0];
      if (!c) return;
      var msg = $(".sd-msg", panel);

      /* Toute frappe est retenue dans l'état : sans cela, le moindre rendu
         (ajout d'une ligne, passage à un autre onglet) rejetterait la saisie en
         cours sans rien dire. */
      function sync() { state.draft[key] = readRows(panel); }
      panel.addEventListener("input", sync);

      $$(".sd-up, .sd-down, .sd-del", panel).forEach(function (btn) {
        btn.addEventListener("click", function () {
          sync();
          var i = +btn.closest("tr").getAttribute("data-i");
          var arr = state.draft[key];
          if (btn.classList.contains("sd-del")) arr.splice(i, 1);
          else {
            var j = btn.classList.contains("sd-up") ? i - 1 : i + 1;
            if (j < 0 || j >= arr.length) return;
            var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
          }
          A.refresh();
        });
      });

      var add = $(".sd-add", panel);
      if (add) add.addEventListener("click", function () {
        sync();
        state.draft[key].push({ label: "", value: 0, suffix: "", color: "" });
        A.refresh();
      });

      var saveBtn = $(".sd-save", panel);
      if (saveBtn) saveBtn.addEventListener("click", function () {
        sync();
        var items = state.draft[key];
        /* Les mêmes refus que côté site, énoncés ici pendant qu'il est encore
           possible de corriger : sur la page publique, une série invalide est
           silencieusement ignorée et l'opérateur croirait son travail publié. */
        if (!items.length) return fail("Il faut au moins une série.");
        for (var i = 0; i < items.length; i++) {
          if (!items[i].label) return fail("Ligne " + (i + 1) + " : intitulé obligatoire.");
          if (!isFinite(items[i].value) || items[i].value < 0) return fail("Ligne " + (i + 1) + " : valeur numérique positive attendue.");
          if (items[i].color && !COLOR_RE.test(items[i].color)) return fail("Ligne " + (i + 1) + " : couleur au format #RRGGBB, ou vide.");
        }
        if (items.length > 12) return fail("12 séries au maximum.");
        var total = items.reduce(function (t, x) { return t + x.value; }, 0);
        if (c.kind === "donut" && !total) return fail("Un anneau demande au moins une valeur non nulle.");

        msg.className = "ferr"; msg.textContent = "Enregistrement…"; msg.hidden = false;
        save("chart." + key, JSON.stringify({ kind: c.kind, items: items })).then(function () {
          delete state.draft[key];
          toast("Graphique publié.");
          A.refresh();
        }).catch(function (e) { handleWriteError(e, msg); });

        function fail(t) { msg.className = "ferr"; msg.textContent = t; msg.hidden = false; }
      });

      var reset = $(".sd-reset", panel);
      if (reset) reset.addEventListener("click", function () {
        clear("chart." + key).then(function () {
          delete state.draft[key];
          toast("Graphique rétabli.");
          A.refresh();
        }).catch(function (e) { handleWriteError(e, msg); });
      });
    });
  }

  /* ------------------------------ Assistant ------------------------------ */

  /* Même grammaire d'adresse que chat.js : une page du site, une adresse
     électronique ou un numéro. Refusée ici avec un message, plutôt que
     silencieusement écartée à l'affichage. */
  var SAFE_HREF = /^(?!\/\/)[A-Za-z0-9._~\/-]+\.html(?:#[\w-]*)?$|^mailto:[^\s:]+$|^tel:\+?[0-9 ]+$/;

  var CHAT_FALLBACK = { intents: [], quick: [] };

  function chatState() {
    if (state.chat) return state.chat;
    var out = { intents: [], quick: [] };
    try {
      var i = JSON.parse(state.map["chat.intents"] || "[]");
      if (Array.isArray(i)) out.intents = i;
    } catch (e) { /* illisible : on repart d'une base vide */ }
    try {
      var q = JSON.parse(state.map["chat.quick"] || "[]");
      if (Array.isArray(q)) out.quick = q;
    } catch (e) { /* idem */ }
    state.chat = out;
    return out;
  }

  function chatHTML() {
    ensure();
    return shell(function () {
      var cs = chatState();
      var live = !!state.map["chat.intents"];
      var html = '<section class="panel"><div class="panel__head">' +
        '<h2 class="panel__title">Base de connaissances de l\'assistant</h2></div>' +
        '<p class="muted">Chaque intention associe des mots-clés à une réponse. ' +
        'L\'assistant compare la question du visiteur aux mots-clés et retient la meilleure correspondance. ' +
        (live
          ? '<b>Une base enregistrée est actuellement utilisée par le site.</b>'
          : 'Aucune base enregistrée : le site utilise celle compilée avec lui. Enregistrer ici la remplacera entièrement.') +
        '</p>';

      html += '<div class="dtable"><table><thead><tr><th style="width:26%">Mots-clés (virgules)</th>' +
        '<th>Réponse</th><th style="width:24%">Liens — Intitulé|page.html</th><th></th></tr></thead><tbody id="ch-rows">';
      cs.intents.forEach(function (it, i) {
        var keys = Array.isArray(it.keys) ? it.keys.join(", ") : "";
        var links = Array.isArray(it.links)
          ? it.links.map(function (l) { return (l[0] || "") + "|" + (l[1] || ""); }).join("\n") : "";
        html += '<tr data-i="' + i + '">' +
          '<td><textarea class="ch-keys" rows="3">' + esc(keys) + '</textarea></td>' +
          '<td><textarea class="ch-reply" rows="3">' + esc(it.reply || "") + '</textarea></td>' +
          '<td><textarea class="ch-links" rows="3" placeholder="Adhérer|adhesion.html">' + esc(links) + '</textarea></td>' +
          '<td class="rowact"><button class="iact iact--del ch-del">✕</button></td></tr>';
      });
      html += '</tbody></table></div>' +
        '<div class="btnrow"><button class="abtn abtn--ghost abtn--sm" id="ch-add">+ Ajouter une intention</button></div>' +
        '<p class="ferr" id="ch-msg" hidden></p></section>';

      html += '<section class="panel"><div class="panel__head">' +
        '<h2 class="panel__title">Suggestions rapides</h2></div>' +
        '<p class="muted">Les boutons proposés à l\'ouverture de l\'assistant. Intitulé, puis la question envoyée. Huit au maximum.</p>' +
        '<div class="dtable"><table><thead><tr><th>Intitulé du bouton</th><th>Question envoyée</th><th></th></tr></thead><tbody id="qk-rows">';
      cs.quick.forEach(function (q, i) {
        html += '<tr data-i="' + i + '">' +
          '<td><input class="qk-label" value="' + esc(q[0] || "") + '"></td>' +
          '<td><input class="qk-q" value="' + esc(q[1] || "") + '"></td>' +
          '<td class="rowact"><button class="iact iact--del qk-del">✕</button></td></tr>';
      });
      html += '</tbody></table></div>' +
        '<div class="btnrow"><button class="abtn abtn--ghost abtn--sm" id="qk-add">+ Ajouter</button></div></section>';

      html += '<section class="panel"><div class="btnrow">' +
        '<button class="abtn abtn--primary abtn--sm" id="ch-save">Publier l\'assistant</button>' +
        (live ? '<button class="abtn abtn--danger abtn--sm" id="ch-reset">Rétablir la base compilée</button>' : '') +
        '</div><p class="ferr" id="ch-msg2" hidden></p></section>';
      return html;
    });
  }

  function readChat() {
    var intents = $$("#ch-rows tr").map(function (tr) {
      var links = [];
      $(".ch-links", tr).value.split("\n").forEach(function (line) {
        line = line.trim();
        if (!line) return;
        var bar = line.lastIndexOf("|");
        if (bar < 0) { links.push([line, ""]); return; }
        links.push([line.slice(0, bar).trim(), line.slice(bar + 1).trim()]);
      });
      return {
        keys: $(".ch-keys", tr).value.split(",").map(function (k) { return k.trim(); }).filter(Boolean),
        reply: $(".ch-reply", tr).value.trim(),
        links: links
      };
    });
    var quick = $$("#qk-rows tr").map(function (tr) {
      return [$(".qk-label", tr).value.trim(), $(".qk-q", tr).value.trim()];
    });
    return { intents: intents, quick: quick };
  }

  function bindChat() {
    if (bindLogin()) return;
    var rt = $("#sd-retry");
    if (rt) return rt.addEventListener("click", function () {
      state.loaded = false; state.error = null; loadAll().then(function () { A.refresh(); });
    });
    if (!$("#ch-rows")) return;
    var msg = $("#ch-msg2") || $("#ch-msg");
    function sync() { state.chat = readChat(); }
    document.addEventListener("input", sync);

    $$(".ch-del").forEach(function (b) {
      b.addEventListener("click", function () {
        sync();
        state.chat.intents.splice(+b.closest("tr").getAttribute("data-i"), 1);
        A.refresh();
      });
    });
    $$(".qk-del").forEach(function (b) {
      b.addEventListener("click", function () {
        sync();
        state.chat.quick.splice(+b.closest("tr").getAttribute("data-i"), 1);
        A.refresh();
      });
    });
    var add = $("#ch-add");
    if (add) add.addEventListener("click", function () {
      sync(); state.chat.intents.push({ keys: [], reply: "", links: [] }); A.refresh();
    });
    var qadd = $("#qk-add");
    if (qadd) qadd.addEventListener("click", function () {
      sync(); state.chat.quick.push(["", ""]); A.refresh();
    });

    var saveBtn = $("#ch-save");
    if (saveBtn) saveBtn.addEventListener("click", function () {
      sync();
      var cs = state.chat;
      function fail(t) { msg.className = "ferr"; msg.textContent = t; msg.hidden = false; }
      if (!cs.intents.length) return fail("Il faut au moins une intention, sinon l'assistant n'aurait rien à répondre.");
      for (var i = 0; i < cs.intents.length; i++) {
        var it = cs.intents[i];
        if (!it.keys.length) return fail("Intention " + (i + 1) + " : au moins un mot-clé.");
        if (!it.reply) return fail("Intention " + (i + 1) + " : réponse obligatoire.");
        for (var j = 0; j < it.links.length; j++) {
          if (!it.links[j][0]) return fail("Intention " + (i + 1) + " : un lien sans intitulé.");
          if (!SAFE_HREF.test(it.links[j][1])) {
            return fail("Intention " + (i + 1) + " : « " + it.links[j][1] +
              " » n'est pas une page du site. Attendu : page.html, mailto:… ou tel:…");
          }
        }
      }
      var qk = cs.quick.filter(function (q) { return q[0] && q[1]; });
      if (qk.length > 8) return fail("Huit suggestions au maximum.");

      msg.className = "ferr"; msg.textContent = "Enregistrement…"; msg.hidden = false;
      save("chat.intents", JSON.stringify(cs.intents))
        .then(function () { return qk.length ? save("chat.quick", JSON.stringify(qk)) : clear("chat.quick"); })
        .then(function () { state.chat = null; toast("Assistant publié."); A.refresh(); })
        .catch(function (e) { handleWriteError(e, msg); });
    });

    var reset = $("#ch-reset");
    if (reset) reset.addEventListener("click", function () {
      clear("chat.intents")
        .then(function () { return clear("chat.quick"); })
        .then(function () { state.chat = null; toast("Base compilée rétablie."); A.refresh(); })
        .catch(function (e) { handleWriteError(e, msg); });
    });
  }

  /* --------------------------- Enregistrement ----------------------------- */

  A.register(
    { view: "sitedata", icon: "chart", label: "Graphiques & assistant" },
    { title: "Graphiques & assistant", tabs: [
      { id: "charts", l: "Graphiques" },
      { id: "chat",   l: "Assistant" }
    ] },
    {
      "sitedata.charts": { r: chartsHTML, b: bindCharts },
      "sitedata.chat":   { r: chatHTML,   b: bindChat }
    }
  );
})();
