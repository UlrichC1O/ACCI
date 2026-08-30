/* =========================================================================
   ACCI — Identité du site
   -------------------------------------------------------------------------
   Le site public est statique : son nom, ses coordonnées, son logo et sa
   favicon sont figés à la compilation. Ce module permet de les corriger sans
   redéploiement. Les valeurs sont écrites dans Supabase (table site_settings)
   et appliquées chez le visiteur par assets/js/site-settings.js.

   Un champ laissé vide n'écrase rien : la valeur compilée reprend sa place.
   C'est ce qui permet de revenir en arrière sans savoir ce qui avait été
   écrit dans content/site.py.

   Les liens sociaux, eux, ne sont pas compilés du tout : cette page en est la
   seule source. Un réseau qui n'y est pas renseigné n'affiche aucune icône sur
   le site — mieux vaut pas d'icône qu'une icône menant à un compte inexistant.

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
    "site.address": "Cocody, Riviera Golf — Abidjan, Côte d’Ivoire"
  };

  var GENERAL = [
    { k: "site.name",      l: "Nom court",     t: "text" },
    { k: "site.long_name", l: "Nom complet",   t: "text" },
    { k: "site.tagline",   l: "Slogan",        t: "textarea" },
    { k: "site.email",     l: "Adresse e-mail", t: "email" },
    { k: "site.phone",     l: "Téléphone",     t: "tel" },
    { k: "site.address",   l: "Adresse postale", t: "text" }
  ];

  /* Aucune adresse n'est compilée pour les réseaux : le repère de chaque champ
     montre donc le format attendu, et non un compte qui existerait déjà. */
  var SOCIALS = [
    { k: "social.facebook",  l: "Facebook",    ph: "https://www.facebook.com/…" },
    { k: "social.x",         l: "X (Twitter)", ph: "https://x.com/…" },
    { k: "social.instagram", l: "Instagram",   ph: "https://www.instagram.com/…" },
    { k: "social.tiktok",    l: "TikTok",      ph: "https://www.tiktok.com/@…" },
    { k: "social.youtube",   l: "YouTube",     ph: "https://www.youtube.com/@…" },
    { k: "social.linkedin",  l: "LinkedIn",    ph: "https://www.linkedin.com/company/…" }
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

  /* Couleurs exposées : celles qui portent l'identité visuelle. Les variantes
     accessibles sont signalées — l'orange de marque ne peut pas porter de texte
     blanc (2,63:1), c'est --orange-solid qui sert de fond aux boutons. */
  var COLORS = [
    { k: "theme.color.orange",       l: "Orange de marque",     d: "#F77F00" },
    { k: "theme.color.orange-solid", l: "Orange des boutons",   d: "#B34F00", n: "Porte du texte blanc : doit rester foncé." },
    { k: "theme.color.orange-text",  l: "Orange en texte",      d: "#A34700", n: "Utilisé comme texte sur fond clair." },
    { k: "theme.color.green",        l: "Vert principal",       d: "#0B7A3B" },
    { k: "theme.color.green-d",      l: "Vert foncé",           d: "#0B3D2E" },
    { k: "theme.color.green-deep",   l: "Vert du pied de page", d: "#07301F" },
    { k: "theme.color.ink",          l: "Texte des titres",     d: "#14201b" },
    { k: "theme.color.body",         l: "Texte courant",        d: "#3d4a44" },
    { k: "theme.color.bg",           l: "Fond des pages",       d: "#ffffff" },
    { k: "theme.color.bg-soft",      l: "Fond des sections",    d: "#f6f9f7" },
    { k: "theme.color.danger",       l: "Alerte",               d: "#c0392b" },
    { k: "theme.color.info",         l: "Information",          d: "#1b6ec2" }
  ];

  /* La politique de sécurité du site n'autorise que des polices servies depuis
     son propre domaine (font-src 'self') : seules Inter et Sora, déjà
     embarquées, et les polices présentes sur l'appareil sont proposées. Une
     police Google serait bloquée et la page retomberait sur la police système
     sans le dire. */
  var FONTS = [
    { v: '"Sora", system-ui, sans-serif',  l: "Sora (fournie)" },
    { v: '"Inter", system-ui, sans-serif', l: "Inter (fournie)" },
    { v: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', l: "Police du système" },
    { v: 'Georgia, "Times New Roman", serif', l: "Georgia (avec empattements)" }
  ];

  var COMPILED_FONT = { "theme.font.head": '"Sora", system-ui, sans-serif',
                        "theme.font.body": '"Inter", system-ui, sans-serif' };

  /* partners : brouillon de la liste des partenaires crédités. null tant que
     rien n'a été retouché — la liste est alors relue depuis les réglages. */
  var state = { map: {}, loaded: false, error: null, busy: false,
               index: null, page: "", q: "", partners: null };

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
     alors que l'intention est de revenir à ce qui a été compilé.

     Pour un réseau social, ce qui a été compilé est justement l'absence
     d'adresse : supprimer la ligne retire l'icône du site, ce qui est bien
     l'effet attendu. Le site traite de la même façon une clé supprimée et une
     clé jamais créée — il n'a aucun moyen de les distinguer. */
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
    if (!v) return null;                       // vide = valeur compilée, et aucune icône pour un réseau
    if (key === "site.email" && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v))
      return "Adresse e-mail invalide.";
    if (key.indexOf("theme.color.") === 0 && !/^#[0-9a-f]{3,8}$/i.test(v))
      return "Couleur invalide : notation hexadécimale attendue, par exemple #F77F00.";
    if (key.indexOf("social.") === 0) {
      /* Même exigence que le site public, qui n'affiche que ce qu'il reconnaît :
         une adresse incomplète serait enregistrée ici et resterait invisible. */
      if (!/^https:\/\/\S+$/.test(v))
        return "L'adresse du compte doit être complète et commencer par https:// — par exemple https://www.facebook.com/votre-page.";
    }
    if (key.indexOf("brand.") === 0) {
      if (!/^https:\/\/\S+$/.test(v))
        return "L'adresse doit commencer par https:// — un lien en http est bloqué par la politique de sécurité du site.";
    }
    /* Un crédit est un lien posé au bas des cinquante pages du site, à
       l'endroit où le visiteur accorde le plus de confiance à ce qu'il lit.
       Le site public n'y affichera que du https ; le refuser ici évite
       d'enregistrer une adresse qui resterait silencieusement inerte. */
    if (key === "credits.dev.url") {
      if (!/^https:\/\/\S+$/.test(v))
        return "L'adresse du réalisateur doit être complète et commencer par https:// — par exemple https://studio.example.ci.";
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

  function delay(last) {
    return '<p class="muted" style="margin-top:14px">Les modifications apparaissent sur le site public ' +
      'dans un délai maximum de 5 minutes (durée du cache navigateur). ' +
      (last || 'Un champ vidé rétablit la valeur d\'origine.') + '</p>';
  }

  function fieldRow(f) {
    var v = state.map[f.k] || "";
    var social = f.k.indexOf("social.") === 0;
    /* Le repère montre ce à quoi le champ revient s'il est vidé. Pour un
       réglage sans valeur compilée — un réseau social, un crédit — il n'y a
       rien à montrer : f.ph donne alors le format attendu, et non un exemple
       qu'on pourrait prendre pour une valeur en place. */
    var ph = social ? (f.ph || "") : (COMPILED[f.k] || f.ph || "");
    var input = f.t === "textarea"
      ? '<textarea class="si-in" data-k="' + esc(f.k) + '" rows="2" placeholder="' + esc(ph) + '">' + esc(v) + '</textarea>'
      : '<input class="si-in" data-k="' + esc(f.k) + '" type="' + (f.t || "text") + '" value="' + esc(v) + '" placeholder="' + esc(ph) + '">';
    /* Les intitulés de pastille sont réglables : « valeur d'origine » n'aurait
       aucun sens pour un champ dont rien n'est compilé. */
    var on = f.on || (social ? "affiché" : "modifié");
    var off = f.off || (social ? "icône masquée" : "valeur d'origine");
    var badge = v
      ? '<span class="tag" style="background:#dcfce7;color:#166534">' + esc(on) + '</span>'
      : '<span class="tag muted">' + esc(off) + '</span>';
    return '<div class="afield">' +
      '<label>' + esc(f.l) + ' ' + badge + '</label>' + input +
      (f.note ? '<span class="muted" style="font-size:11.5px">' + esc(f.note) + '</span>' : '') +
      '</div>';
  }

  function panel(title, fields, lead, last) {
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">' + esc(title) + '</h2></div>' +
      (lead ? '<p class="muted">' + esc(lead) + '</p>' : '') +
      '<div class="fgrid">' + fields.map(fieldRow).join("") + '</div>' +
      '<div class="btnrow"><button class="abtn abtn--primary si-save">Enregistrer</button>' +
      '<button class="abtn abtn--ghost si-reload">Recharger</button></div>' +
      '<p class="ferr" id="si-err" hidden></p>' + delay(last) + '</section>';
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
      "Cette page est la seule source des liens sociaux du site : aucune adresse n'est écrite dans les " +
      "pages. Un réseau renseigné ici fait apparaître son icône dans la barre supérieure et dans le pied " +
      "de page ; un réseau laissé vide n'affiche aucune icône, plutôt qu'une icône menant à un compte qui " +
      "n'existe pas.",
      "Un champ vidé retire l'icône du site.");
  });

  /* -------------------- Crédits & partenaires ---------------------------- */

  /* Le pied de page crédite deux choses de nature différente : qui a réalisé
     le site, et qui soutient l'association. Le premier est unique et se prête
     à des champs fixes ; les seconds forment une liste dont la longueur n'a
     pas à être décidée à la compilation — d'où un seul réglage en JSON plutôt
     que des emplacements numérotés.

     Rien n'apparaît sur le site tant qu'un nom n'est pas renseigné : une
     attribution engage l'association vis-à-vis d'un tiers, et un pied de page
     créditant un prestataire qui n'a pas travaillé pour elle est plus
     dommageable qu'un pied de page sans crédit. */
  var CREDIT_FIELDS = [
    { k: "credits.dev.prefix", l: "Intitulé", t: "text",
      ph: "Conception & développement", on: "personnalisé", off: "intitulé par défaut",
      note: "Le texte qui introduit le nom. Par défaut : « Conception & développement »." },
    { k: "credits.dev.name", l: "Réalisation du site", t: "text",
      ph: "Nom de la personne ou du studio", on: "affiché", off: "aucun crédit affiché",
      note: "Tant que ce champ est vide, aucune ligne de crédit n'apparaît sur le site." },
    { k: "credits.dev.url", l: "Lien du réalisateur", t: "url",
      ph: "https://…", on: "lien actif", off: "nom sans lien",
      note: "Facultatif. Le nom reste affiché sans lien si l'adresse est absente." },
    { k: "credits.partners.title", l: "Intitulé des partenaires", t: "text",
      ph: "Avec le soutien de", on: "personnalisé", off: "intitulé par défaut" }
  ];

  function partnersDraft() {
    if (state.partners) return state.partners;
    var raw = state.map["credits.partners"] || "", list = [];
    if (raw) {
      try {
        var p = JSON.parse(raw);
        if (Array.isArray(p)) {
          list = p.filter(function (o) { return o && typeof o === "object"; })
                  .map(function (o) {
                    return { label: String(o.label == null ? "" : o.label),
                             url: String(o.url == null ? (o.href == null ? "" : o.href) : o.url) };
                  });
        }
      } catch (e) { /* réglage illisible : on repart d'une liste vide plutôt
                       que de bloquer l'écran sur une donnée corrompue */ }
    }
    state.partners = list;
    return list;
  }

  /* Le formulaire est reconstruit à chaque ajout ou retrait de ligne : sans
     cette relecture, la saisie en cours des autres lignes serait perdue à
     chaque clic sur « Ajouter ». */
  function syncPartners() {
    var rows = $$(".si-prow");
    if (!rows.length && !$("#si-plist")) return partnersDraft();
    state.partners = rows.map(function (r) {
      return { label: r.querySelector(".si-plabel").value.trim(),
               url: r.querySelector(".si-purl").value.trim() };
    });
    return state.partners;
  }

  /* La ligne porte la classe afield pour que ses champs héritent du style des
     formulaires de l'administration, et repasse en disposition horizontale :
     rien n'est ajouté à admin.css pour trois lignes de mise en page.
     min-width:0 est indispensable — sans lui, un champ flex refuse de
     descendre sous la largeur de son contenu et la ligne déborde du panneau. */
  function partnerRow(p, i) {
    return '<div class="afield si-prow" data-i="' + i + '" ' +
        'style="flex-direction:row;align-items:center;gap:8px;margin-bottom:8px">' +
      '<input class="si-plabel" type="text" placeholder="Nom du partenaire" ' +
        'style="flex:1 1 38%;min-width:0" value="' + esc(p.label || "") + '">' +
      '<input class="si-purl" type="url" placeholder="https://… (facultatif)" ' +
        'style="flex:1 1 62%;min-width:0" value="' + esc(p.url || "") + '">' +
      '<button class="abtn abtn--danger abtn--sm si-pdel" data-i="' + i + '" ' +
        'title="Retirer ce partenaire" aria-label="Retirer ce partenaire">&times;</button>' +
      '</div>';
  }

  var creditsHTML = guard(function () {
    var list = partnersDraft();
    return '<section class="panel">' +
      '<div class="panel__head"><h2 class="panel__title">Réalisation du site</h2></div>' +
      '<p class="muted">Cette mention apparaît au bas de chaque page, au-dessus de la ligne de copyright. ' +
      'Elle n\'est écrite nulle part dans les pages compilées : ce réglage en est la seule source.</p>' +
      '<div class="fgrid">' + CREDIT_FIELDS.slice(0, 3).map(fieldRow).join("") + '</div>' +
      '<div class="btnrow"><button class="abtn abtn--primary si-csave">Enregistrer</button>' +
      '<button class="abtn abtn--ghost si-reload">Recharger</button></div>' +
      '<p class="ferr" id="si-err" hidden></p>' +
      delay('Un champ vidé retire la mention du site.') +
      '</section>' +

      '<section class="panel">' +
      '<div class="panel__head"><h2 class="panel__title">Partenaires crédités</h2></div>' +
      '<p class="muted">Les organisations que l\'association souhaite créditer avec un lien, au bas de chaque page. ' +
      'Cette liste est distincte de la page « Nos partenaires », qui décrit les types de partenariats : ' +
      'ici, on nomme et on lie. Un partenaire sans adresse est affiché sans lien.</p>' +
      '<div class="fgrid" style="margin-bottom:14px">' + fieldRow(CREDIT_FIELDS[3]) + '</div>' +
      '<div id="si-plist" class="si-plist">' +
        (list.length ? list.map(partnerRow).join("")
                     : '<p class="muted" id="si-pempty">Aucun partenaire crédité. Le bloc n\'apparaît pas sur le site.</p>') +
      '</div>' +
      '<div class="btnrow"><button class="abtn abtn--ghost abtn--sm" id="si-padd">+ Ajouter un partenaire</button></div>' +
      '<div class="btnrow"><button class="abtn abtn--primary si-csave">Enregistrer</button>' +
      '<button class="abtn abtn--ghost si-reload">Recharger</button></div>' +
      '<p class="ferr" id="si-perr" hidden></p>' +
      delay('Retirer toutes les lignes fait disparaître le bloc du site.') +
      '</section>';
  });

  function bindCredits() {
    if ($("#si-login")) return bindLogin();
    bindCommon();

    var add = $("#si-padd");
    if (add) add.addEventListener("click", function () {
      syncPartners().push({ label: "", url: "" });
      A.refresh();
    });

    $$(".si-pdel").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-i"), 10);
        var l = syncPartners();
        if (i >= 0 && i < l.length) l.splice(i, 1);
        A.refresh();
      });
    });

    /* Les deux panneaux enregistrent ensemble : les champs de crédit et la
       liste de partenaires forment un seul bloc de pied de page, et un
       opérateur qui remplit les deux puis clique sur l'un des boutons ne doit
       pas découvrir que la moitié de sa saisie a été ignorée. */
    $$(".si-csave").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (state.busy) return;
        var err = $("#si-err") || $("#si-perr");
        var perr = $("#si-perr");
        var jobs = [], bad = null;

        $$(".si-in").forEach(function (el) {
          var k = el.getAttribute("data-k"), v = el.value.trim();
          var msg = invalid(k, v);
          if (msg) { if (!bad) bad = msg; return; }
          if (v === (state.map[k] || "")) return;
          jobs.push(v ? save(k, v) : clear(k));
        });

        /* Un partenaire nommé sans adresse est légitime ; une adresse sans nom
           ne l'est pas — il n'y aurait rien à cliquer. La ligne entièrement
           vide, elle, est simplement ignorée : c'est celle qu'on vient
           d'ajouter et qu'on n'a pas remplie. */
        var list = syncPartners().filter(function (p) { return p.label || p.url; });
        for (var i = 0; i < list.length; i++) {
          if (!list[i].label) { bad = bad || "Ligne " + (i + 1) + " : un partenaire doit avoir un nom."; break; }
          if (list[i].url && !/^https:\/\/\S+$/.test(list[i].url))
            { bad = bad || "« " + list[i].label + " » : l'adresse doit commencer par https://."; break; }
        }

        if (bad) {
          var box = perr && /partenaire|adresse doit/.test(bad) ? perr : err;
          box.className = "ferr"; box.textContent = bad; box.hidden = false;
          return;
        }

        var json = list.length ? JSON.stringify(list) : "";
        if (json !== (state.map["credits.partners"] || "")) {
          jobs.push(json ? save("credits.partners", json) : clear("credits.partners"));
        }

        if (!jobs.length) { toast("Aucune modification."); return; }

        state.busy = true; btn.disabled = true;
        Promise.all(jobs).then(function () {
          toast(jobs.length + " réglage(s) enregistré(s).");
          /* Le brouillon est relâché : la liste doit se reconstruire depuis ce
             qui a réellement été enregistré, sinon un échec partiel resterait
             affiché comme s'il avait abouti. */
          state.partners = null;
          return load();
        }).then(function () {
          state.busy = false; A.refresh();
        }).catch(function (e) {
          state.busy = false; btn.disabled = false;
          var b2 = $("#si-err") || $("#si-perr");
          b2.className = "ferr"; b2.textContent = e.message; b2.hidden = false;
        });
      });
    });
  }

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
    /* Le brouillon des partenaires est abandonné : « Recharger » doit remettre
       l'écran sur ce qui est enregistré, sinon une liste retouchée puis
       rechargée réapparaîtrait telle quelle et passerait pour la version
       en ligne. */
    state.partners = null;
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

  /* ----------------------------- Apparence -------------------------------- */

  function colorRow(c) {
    var v = state.map[c.k] || "";
    var shown = v || c.d;
    return '<div class="afield">' +
      '<label>' + esc(c.l) + (v ? ' <span class="tag" style="background:#dcfce7;color:#166534">modifié</span>' : '') + '</label>' +
      '<div style="display:flex;gap:8px;align-items:center">' +
        '<input type="color" class="si-swatch" data-for="' + esc(c.k) + '" value="' + esc(shown) + '" style="width:44px;height:34px;padding:2px;border:1px solid var(--line);border-radius:8px;background:#fff">' +
        '<input class="si-in" data-k="' + esc(c.k) + '" type="text" value="' + esc(v) + '" placeholder="' + esc(c.d) + '" style="flex:1">' +
      '</div>' +
      (c.n ? '<span class="muted" style="font-size:11.5px">' + esc(c.n) + '</span>' : '') +
      '</div>';
  }

  function fontRow(k, label) {
    var v = state.map[k] || "";
    var opts = '<option value="">— Police d\'origine —</option>' + FONTS.map(function (f) {
      return '<option value="' + esc(f.v) + '"' + (f.v === v ? " selected" : "") + '>' + esc(f.l) + '</option>';
    }).join("");
    return '<div class="afield"><label>' + esc(label) + '</label>' +
      '<select class="si-in" data-k="' + esc(k) + '">' + opts + '</select></div>';
  }

  var themeHTML = guard(function () {
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Couleurs</h2></div>' +
      '<p class="muted">Ces couleurs se propagent à l\'ensemble du site. Un champ vidé rétablit la teinte d\'origine.</p>' +
      '<div class="fgrid">' + COLORS.map(colorRow).join("") + '</div>' +
      '<div class="btnrow"><button class="abtn abtn--primary si-save">Enregistrer</button>' +
      '<button class="abtn abtn--ghost si-reload">Recharger</button>' +
      '<button class="abtn abtn--danger si-reset-theme">Tout rétablir</button></div>' +
      '<p class="ferr" id="si-err" hidden></p>' +
      '</section>' +
      '<section class="panel"><div class="panel__head"><h2 class="panel__title">Typographie</h2></div>' +
      '<p class="muted">Seules les polices livrées avec le site et celles présentes sur l\'appareil du visiteur sont proposées : ' +
      'la politique de sécurité du site interdit d\'en charger depuis un autre domaine.</p>' +
      '<div class="fgrid">' + fontRow("theme.font.head", "Police des titres") +
                              fontRow("theme.font.body", "Police du texte") + '</div>' +
      '<div class="btnrow"><button class="abtn abtn--primary si-save">Enregistrer</button></div>' +
      delay() + '</section>';
  });

  /* ------------------------------ Contenu --------------------------------- */

  function loadIndex() {
    if (state.index) return Promise.resolve(state.index);
    return fetch("/assets/content-index.json").then(function (r) {
      if (!r.ok) throw new Error("Inventaire de contenu introuvable — relancez la compilation du site.");
      return r.json();
    }).then(function (j) { state.index = Array.isArray(j) ? j : []; return state.index; });
  }

  var FIELD_LABEL = { title: "Titre", subtitle: "Sous-titre", kicker: "Surtitre",
                      lead: "Chapô", q: "Question", a: "Réponse", text: "Texte",
                      body: "Paragraphe", icon: "Icône" };

  function fieldLabel(f) {
    var base = f.split(".").pop();
    if (/^\d+$/.test(base)) base = f.split(".").slice(-2)[0];
    return FIELD_LABEL[base] || base;
  }

  var contentHTML = guard(function () {
    if (!state.index) return '<section class="panel"><p class="muted">Chargement de l\'inventaire…</p></section>';

    var pages = [], seen = {};
    state.index.forEach(function (x) {
      if (!seen[x.slug]) { seen[x.slug] = 1; pages.push({ slug: x.slug, title: x.page }); }
    });
    var cur = state.page || pages[0] && pages[0].slug || "";
    var q = state.q.toLowerCase();

    var rows = state.index.filter(function (x) {
      if (q) return (x.v || "").toLowerCase().indexOf(q) !== -1;
      return x.slug === cur;
    });
    var shown = rows.slice(0, 120);

    var opts = pages.map(function (p) {
      return '<option value="' + esc(p.slug) + '"' + (p.slug === cur ? " selected" : "") + '>' +
        esc(p.title || p.slug) + '</option>';
    }).join("");

    var edited = Object.keys(state.map).filter(function (k) { return k.indexOf("content.") === 0; }).length;

    var body = shown.map(function (x) {
      var k = "content." + x.k;
      var v = state.map[k] || "";
      var badge = v ? ' <span class="tag" style="background:#dcfce7;color:#166534">modifié</span>' : '';
      return '<div class="afield">' +
        '<label>' + esc(fieldLabel(x.f)) + ' <span class="muted" style="font-weight:400">· ' + esc(x.type) +
        (q ? ' · ' + esc(x.page || x.slug) : '') + '</span>' + badge + '</label>' +
        '<textarea class="si-in" data-k="' + esc(k) + '" rows="2" placeholder="' + esc(x.v) + '">' + esc(v) + '</textarea>' +
        '</div>';
    }).join("");

    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Textes du site</h2></div>' +
      '<p class="muted">' + state.index.length + ' textes repérés sur l\'ensemble du site, ' + edited + ' modifié(s). ' +
      'Un champ vidé rétablit le texte d\'origine. La mise en gras s\'écrit **entre deux paires d\'astérisques**.</p>' +
      '<div class="fgrid">' +
        '<div class="afield"><label>Page</label><select id="si-page">' + opts + '</select></div>' +
        '<div class="afield"><label>Rechercher dans tout le site</label>' +
          '<input id="si-q" type="search" value="' + esc(state.q) + '" placeholder="un mot du texte…"></div>' +
      '</div>' +
      (rows.length > shown.length
        ? '<p class="muted">' + rows.length + ' résultats — les ' + shown.length + ' premiers sont affichés.</p>' : '') +
      (shown.length ? body : '<p class="muted">Aucun texte pour ce filtre.</p>') +
      '<div class="btnrow"><button class="abtn abtn--primary si-save">Enregistrer</button>' +
      '<button class="abtn abtn--ghost si-reload">Recharger</button></div>' +
      '<p class="ferr" id="si-err" hidden></p>' + delay() + '</section>';
  });

  function bindTheme() {
    if ($("#si-login")) return bindLogin();
    bindForm();
    /* Le sélecteur de couleur alimente le champ texte, qui reste la source :
       c'est lui que la sauvegarde relit. */
    $$(".si-swatch").forEach(function (sw) {
      sw.addEventListener("input", function () {
        var t = document.querySelector('.si-in[data-k="' + sw.getAttribute("data-for") + '"]');
        if (t) t.value = sw.value;
      });
    });
    var rt = $(".si-reset-theme");
    if (rt) rt.addEventListener("click", function () {
      var keys = Object.keys(state.map).filter(function (k) { return k.indexOf("theme.") === 0; });
      if (!keys.length) { toast("Aucune personnalisation à rétablir."); return; }
      Promise.all(keys.map(clear)).then(function () {
        toast("Apparence d'origine rétablie."); return load();
      }).then(function () { A.refresh(); }).catch(function (e) { toast(e.message, "err"); });
    });
  }

  function bindContent() {
    if ($("#si-login")) return bindLogin();
    if (!state.index) {
      loadIndex().catch(function (e) { state.error = e.message; })
                 .then(function () { A.refresh(); });
      return;
    }
    bindForm();
    var sp = $("#si-page");
    if (sp) sp.addEventListener("change", function () { state.page = sp.value; state.q = ""; A.refresh(); });
    var sq = $("#si-q");
    if (sq) sq.addEventListener("change", function () { state.q = sq.value.trim(); A.refresh(); });
  }

  /* --------------------------- Enregistrement ----------------------------- */

  A.register(
    { view: "identity", icon: "palette", label: "Identité du site" },
    { title: "Identité du site", tabs: [
      { id: "general", l: "Identité & contact" },
      { id: "social",  l: "Réseaux sociaux" },
      { id: "brand",   l: "Logo & favicon" },
      { id: "content", l: "Textes du site" },
      { id: "theme",   l: "Couleurs & polices" },
      { id: "credits", l: "Crédits & partenaires" }
    ] },
    {
      "identity.general": { r: generalHTML, b: bindForm },
      "identity.social":  { r: socialHTML,  b: bindForm },
      "identity.brand":   { r: brandHTML,   b: bindBrand },
      "identity.content": { r: contentHTML, b: bindContent },
      "identity.theme":   { r: themeHTML,   b: bindTheme },
      "identity.credits": { r: creditsHTML, b: bindCredits }
    }
  );

  if (SB.session()) {
    load().catch(function (e) { state.error = e.message; })
          .then(function () { A.refresh(); });
  }
})();
