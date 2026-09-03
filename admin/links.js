/* =========================================================================
   ACCI — Analyse de liens et registre de preuves
   -------------------------------------------------------------------------
   L'association reçoit des signalements qui tiennent en une adresse : un
   compte qui harcèle, une vidéo qui désinforme, une page qui escroque. Coller
   cette adresse doit renseigner ce qui peut l'être, et dire clairement ce qui
   ne le peut pas.

   CE QUE CE MODULE SAIT FAIRE, ET CE QU'IL NE PEUT PAS — à lire avant d'en
   attendre autre chose.

   1. L'ADRESSE ELLE-MÊME est analysée hors ligne, sans rien demander à
      personne : plateforme, compte, nature du contenu (profil, publication,
      vidéo, reel, story, groupe), identifiant de la publication, numéro de
      téléphone pour un lien wa.me. C'est immédiat, ça marche sans réseau, et
      ça ne dépend d'aucune plateforme qui pourrait fermer demain.

   2. LE TITRE ET LE COMPTE peuvent être demandés à la plateforme, mais
      seulement pour YouTube et TikTok, qui publient un point oEmbed ouvert.
      X ne répond plus, Instagram et Facebook exigent un jeton d'application.
      Et cet appel ne peut pas partir du navigateur : la politique de sécurité
      du site n'autorise de connexion que vers Supabase. Il passe donc par une
      fonction Edge (supabase/functions/link-preview), qui sert aussi de
      garde-fou — sans elle, ce serait un relais ouvert vers n'importe quelle
      adresse.

   3. LA DATE DE PUBLICATION ET LE LIEU NE SONT PAS RÉCUPÉRABLES. Aucun des
      points oEmbed ne les donne — vérifié, pas supposé — et les plateformes
      ont retiré les géo-étiquettes de leurs interfaces publiques il y a des
      années. Ces deux champs sont donc SAISIS À LA MAIN, et le registre
      distingue à l'écran ce qui a été lu de l'adresse, ce qui vient de la
      plateforme et ce qu'un membre du bureau a renseigné.

   POURQUOI CETTE DISTINCTION COMPTE. Ces fiches servent à instruire des
   signalements, parfois à saisir des autorités. Une date « constatée le » et
   une date de publication ne valent pas la même chose ; un lieu déduit et un
   lieu établi non plus. Un registre qui mélangerait les deux fabriquerait de
   fausses certitudes sur des dossiers qui touchent des personnes.

   LA PREUVE S'EFFACE. Un contenu signalé disparaît souvent dans les heures
   qui suivent. Le registre conserve donc l'adresse canonique, la date de
   constat et une capture d'écran facultative — c'est ce qui restera quand la
   page aura été retirée.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;
  var $ = A.ui.$, $$ = A.ui.$$, esc = A.ui.esc, toast = A.ui.toast;
  var openModal = A.ui.openModal, closeModal = A.ui.closeModal;

  var STORE = "acci_links";
  var MEMBERS = "acci_customers";
  var AUDIT = "acci_audit";

  var CATEGORIES = ["Désinformation", "Cyberharcèlement", "Escroquerie",
                    "Discours de haine", "Contenu explicite", "Atteinte à la vie privée",
                    "Usurpation d'identité", "Défi dangereux", "Autre"];
  var GRAVITES = ["À vérifier", "Faible", "Moyenne", "Élevée", "Urgente"];
  var SUIVI = ["Constaté", "En cours d'examen", "Signalé à la plateforme",
               "Transmis aux autorités", "Retiré", "Classé sans suite"];

  var state = { q: "", fCat: "", fSuivi: "", draft: null, busy: false };

  /* --------------------------------------------------------------------- */
  /* Feuille de style, chargée d'ici comme pieces.js                        */
  (function styles() {
    if (document.getElementById("acci-links-css")) return;
    var l = document.createElement("link");
    l.id = "acci-links-css";
    l.rel = "stylesheet";
    l.href = "/admin/links.css";
    document.head.appendChild(l);
  })();

  /* --------------------------------------------------------------------- */
  /* Stockage                                                               */
  /* --------------------------------------------------------------------- */
  function readJSON(k) {
    try { var v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function writeJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) {
      openModal('<div class="modal__head"><h2>Enregistrement impossible</h2>' +
        '<button class="modal__x" data-close>&times;</button></div>' +
        '<div class="modal__body"><p><b>La fiche n’a pas été enregistrée.</b></p>' +
        '<p class="muted">L’espace de stockage du navigateur est plein ou indisponible. ' +
        'Les fiches déjà enregistrées sont intactes.</p></div>' +
        '<div class="modal__foot"><span style="flex:1"></span>' +
        '<button class="abtn abtn--primary" data-close>J’ai compris</button></div>');
      return false;
    }
  }
  function links() { return readJSON(STORE); }
  function members() { return readJSON(MEMBERS); }

  function saveLink(rec) {
    var all = links(), i = -1;
    for (var k = 0; k < all.length; k++) if (all[k].id === rec.id) { i = k; break; }
    rec.updatedAt = new Date().toISOString();
    if (i < 0) { rec.createdAt = rec.createdAt || rec.updatedAt; all.unshift(rec); }
    else all[i] = rec;
    return writeJSON(STORE, all);
  }

  function alog(entityId, action, detail) {
    var e = readJSON(AUDIT);
    e.unshift({ id: "l" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
                entity: "lien", entityId: entityId, action: action,
                detail: detail || "", createdAt: new Date().toISOString() });
    if (e.length > 500) e = e.slice(0, 500);
    writeJSON(AUDIT, e);
  }

  function uid() { return "l" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36); }

  /* --------------------------------------------------------------------- */
  /* ANALYSE DE L'ADRESSE — entièrement hors ligne                          */
  /* --------------------------------------------------------------------- */
  /* Paramètres de suivi publicitaire et de provenance. Ils ne décrivent pas
     le contenu, changent à chaque partage, et rendraient deux copies du même
     lien impossibles à rapprocher. Ils sont donc retirés de l'adresse
     canonique — celle sur laquelle porte le contrôle de doublon. */
  var PARASITES = /^(utm_|fbclid$|gclid$|igshid$|igsh$|mibextid$|si$|_t$|_r$|is_from_webapp$|sender_device$|refsrc$|ref_src$|ref_url$|ref$|share_app_id$|share_link_id$|social_share|web_id$|checksum$|s$|t$)/i;

  /* Chaque plateforme : hôtes reconnus, puis règles de chemin appliquées dans
     l'ordre. La première qui correspond gagne — les règles les plus précises
     sont donc écrites avant les plus générales, sinon « /p/<code> » serait lu
     comme un nom de compte. */
  var PLATEFORMES = [
    { id: "facebook", nom: "Facebook", icone: "globe",
      hotes: ["facebook.com", "www.facebook.com", "m.facebook.com", "web.facebook.com", "fb.com", "fb.watch"],
      canon: "www.facebook.com",
      regles: [
        { re: /^\/(?:watch\/?)$/i, kind: "Vidéo", idParam: "v" },
        { re: /^\/reel\/([\w.-]+)/i, kind: "Reel", id: 1 },
        { re: /^\/permalink\.php$/i, kind: "Publication", idParam: "story_fbid" },
        { re: /^\/story\.php$/i, kind: "Publication", idParam: "story_fbid" },
        { re: /^\/([\w.-]+)\/(?:posts|videos|photos)\/([\w.-]+)/i, kind: "Publication", compte: 1, id: 2 },
        { re: /^\/groups\/([\w.-]+)/i, kind: "Groupe", compte: 1 },
        { re: /^\/profile\.php$/i, kind: "Profil", idParam: "id" },
        { re: /^\/([\w.-]+)\/?$/i, kind: "Profil", compte: 1 }
      ] },
    { id: "instagram", nom: "Instagram", icone: "camera",
      hotes: ["instagram.com", "www.instagram.com"], canon: "www.instagram.com",
      regles: [
        { re: /^\/p\/([\w-]+)/i, kind: "Publication", id: 1 },
        { re: /^\/reels?\/([\w-]+)/i, kind: "Reel", id: 1 },
        { re: /^\/tv\/([\w-]+)/i, kind: "Vidéo", id: 1 },
        { re: /^\/stories\/([\w.-]+)\/(\d+)/i, kind: "Story", compte: 1, id: 2 },
        { re: /^\/([\w.-]+)\/?$/i, kind: "Profil", compte: 1 }
      ] },
    { id: "tiktok", nom: "TikTok", icone: "play",
      hotes: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"], canon: "www.tiktok.com",
      regles: [
        { re: /^\/@([\w.-]+)\/video\/(\d+)/i, kind: "Vidéo", compte: 1, id: 2 },
        { re: /^\/@([\w.-]+)\/photo\/(\d+)/i, kind: "Publication", compte: 1, id: 2 },
        { re: /^\/@([\w.-]+)\/?$/i, kind: "Profil", compte: 1 },
        { re: /^\/([\w-]{5,})\/?$/i, kind: "Lien court", id: 1, court: true }
      ] },
    { id: "x", nom: "X (Twitter)", icone: "chat",
      hotes: ["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"],
      canon: "x.com",
      regles: [
        { re: /^\/([\w]+)\/status\/(\d+)/i, kind: "Publication", compte: 1, id: 2 },
        { re: /^\/([\w]+)\/?$/i, kind: "Profil", compte: 1 }
      ] },
    { id: "youtube", nom: "YouTube", icone: "play",
      hotes: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
      canon: "www.youtube.com", oembed: true,
      regles: [
        { re: /^\/watch$/i, kind: "Vidéo", idParam: "v" },
        { re: /^\/shorts\/([\w-]+)/i, kind: "Short", id: 1 },
        { re: /^\/live\/([\w-]+)/i, kind: "Direct", id: 1 },
        { re: /^\/@([\w.-]+)/i, kind: "Chaîne", compte: 1 },
        { re: /^\/channel\/([\w-]+)/i, kind: "Chaîne", compte: 1 },
        { re: /^\/c\/([\w.-]+)/i, kind: "Chaîne", compte: 1 }
      ] },
    { id: "linkedin", nom: "LinkedIn", icone: "network",
      hotes: ["linkedin.com", "www.linkedin.com", "fr.linkedin.com"], canon: "www.linkedin.com",
      regles: [
        { re: /^\/posts\/([\w-]+)/i, kind: "Publication", id: 1 },
        { re: /^\/in\/([\w-]+)/i, kind: "Profil", compte: 1 },
        { re: /^\/company\/([\w-]+)/i, kind: "Page", compte: 1 }
      ] },
    { id: "whatsapp", nom: "WhatsApp", icone: "phone",
      hotes: ["wa.me", "api.whatsapp.com", "chat.whatsapp.com", "whatsapp.com", "www.whatsapp.com"],
      canon: null,
      regles: [
        { re: /^\/channel\/([\w-]+)/i, kind: "Chaîne", id: 1 },
        { re: /^\/(\+?\d{6,15})\/?$/i, kind: "Numéro", tel: 1 },
        { re: /^\/([\w-]{10,})\/?$/i, kind: "Groupe", id: 1 }
      ] },
    { id: "telegram", nom: "Telegram", icone: "send",
      hotes: ["t.me", "telegram.me"], canon: "t.me",
      regles: [
        { re: /^\/([\w]+)\/(\d+)/i, kind: "Message", compte: 1, id: 2 },
        { re: /^\/([\w]+)\/?$/i, kind: "Canal", compte: 1 }
      ] },
    { id: "snapchat", nom: "Snapchat", icone: "camera",
      hotes: ["snapchat.com", "www.snapchat.com"], canon: "www.snapchat.com",
      regles: [
        { re: /^\/add\/([\w.-]+)/i, kind: "Profil", compte: 1 },
        { re: /^\/t\/([\w-]+)/i, kind: "Publication", id: 1 }
      ] }
  ];

  /* Suffixes à deux niveaux les plus courants ici. Sans cette liste,
     « ivoiriens.ac.ci » serait ramené à « ac.ci » — le suffixe lui-même — et
     la recherche porterait sur le registre au lieu du domaine. La liste
     complète des suffixes publics fait plusieurs milliers de lignes et se
     périme ; ces quelques-uns couvrent ce que l'association rencontre. */
  var SUFFIXES_COMPOSES = [
    "ac.ci", "co.ci", "com.ci", "or.ci", "net.ci", "org.ci", "go.ci", "ed.ci",
    "co.uk", "org.uk", "ac.uk", "com.ng", "com.gh", "co.za", "com.sn", "com.bf"
  ];

  /* Le domaine enregistrable, indépendamment des sous-domaines. Il sert ici
     à démasquer l'imitation : un lien qui se présente comme Facebook mais dont
     le domaine est « faceboook-ci.com » se reconnaît là, et nulle part
     ailleurs dans la fiche. */
  function domaineDe(hote) {
    hote = String(hote || "").toLowerCase().replace(/\.$/, "");
    var parts = hote.split(".");
    if (parts.length < 2) return hote;
    for (var i = 0; i < SUFFIXES_COMPOSES.length; i++) {
      var suf = SUFFIXES_COMPOSES[i];
      if (hote === suf) return hote;
      if (hote.slice(-(suf.length + 1)) === "." + suf) {
        return parts.slice(-(suf.split(".").length + 1)).join(".");
      }
    }
    return parts.slice(-2).join(".");
  }

  /* L'analyse ne devine jamais. Ce qu'elle ne reconnaît pas reste « inconnu »
     plutôt que d'être rangé de force dans une case : une fiche de signalement
     qui affirme une plateforme fausse est pire qu'une fiche qui ne dit rien. */
  function analyser(saisie) {
    var brut = String(saisie || "").trim();
    if (!brut) return null;

    /* Beaucoup d'adresses sont collées sans protocole. On l'ajoute pour
       pouvoir analyser, mais on garde trace de l'adresse d'origine. */
    var texte = /^[a-z][\w+.-]*:\/\//i.test(brut) ? brut : "https://" + brut.replace(/^\/+/, "");
    var u;
    try { u = new URL(texte); } catch (e) { return { erreur: "Ce texte n’est pas une adresse web exploitable.", saisie: brut }; }
    if (u.protocol !== "http:" && u.protocol !== "https:")
      return { erreur: "Seules les adresses http et https sont acceptées.", saisie: brut };

    var hote = u.hostname.toLowerCase();
    var plat = null;
    for (var i = 0; i < PLATEFORMES.length; i++) {
      if (PLATEFORMES[i].hotes.indexOf(hote) !== -1) { plat = PLATEFORMES[i]; break; }
    }

    /* Nettoyage des paramètres de suivi. */
    var retires = [];
    var params = new URLSearchParams(u.search);
    var garder = new URLSearchParams();
    params.forEach(function (v, k) {
      if (PARASITES.test(k)) retires.push(k); else garder.append(k, v);
    });

    var res = {
      saisie: brut,
      hote: hote,
      domaine: domaineDe(hote),
      plateforme: plat ? plat.nom : "Non reconnue",
      platId: plat ? plat.id : "",
      icone: plat ? plat.icone : "globe",
      kind: "", compte: "", contenuId: "", tel: "",
      court: false, retires: retires, oembed: !!(plat && plat.oembed)
    };

    if (plat) {
      var chemin = u.pathname.replace(/\/+$/, "") || "/";
      for (var r = 0; r < plat.regles.length; r++) {
        var rg = plat.regles[r], m = chemin.match(rg.re);
        if (!m) continue;
        res.kind = rg.kind;
        if (rg.compte) res.compte = m[rg.compte];
        if (rg.id) res.contenuId = m[rg.id];
        if (rg.tel) res.tel = m[rg.tel].replace(/^\+?/, "+");
        if (rg.idParam) res.contenuId = params.get(rg.idParam) || "";
        if (rg.court) res.court = true;
        break;
      }
    }

    /* Adresse canonique : hôte normalisé, paramètres de suivi retirés. C'est
       elle qui sert au rapprochement — deux personnes signalant le même
       contenu par deux liens partagés différemment doivent tomber sur la même
       fiche. */
    var hoteCanon = (plat && plat.canon) ? plat.canon : hote;
    var q = garder.toString();
    res.canonical = "https://" + hoteCanon + (u.pathname.replace(/\/+$/, "") || "/") + (q ? "?" + q : "");
    return res;
  }

  /* --------------------------------------------------------------------- */
  /* Enrichissement par la plateforme (facultatif, YouTube et TikTok)       */
  /* --------------------------------------------------------------------- */
  /* L'appel ne peut pas partir d'ici : la politique de sécurité du site
     n'autorise de connexion que vers Supabase. Il passe donc par la fonction
     Edge link-preview, qui limite les hôtes interrogeables — un relais qui
     accepterait n'importe quelle adresse serait un moyen de faire visiter au
     serveur des ressources internes. */
  function enrichir(url) {
    var SB = window.ACCI_SB;
    if (!SB || !SB.url) return Promise.reject(new Error("Service indisponible : module Supabase absent."));
    return SB.ensureSession().then(function () {
      return fetch(SB.url + "/functions/v1/link-preview", {
        method: "POST",
        headers: Object.assign(SB.authHeaders(true, true), { "Content-Type": "application/json" }),
        body: JSON.stringify({ url: url })
      });
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || "La plateforme n’a rien renvoyé.");
        return j;
      });
    });
  }

  /* Nombre de jours écoulés depuis une date ISO. Sert à dire depuis combien
     de temps un compte est suivi par l'association. */
  function ageJours(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }

  /* Adresses de profil construites pour un même pseudonyme. La plateforme
     d'origine est écartée : on y est déjà. */
  var GABARITS = [
    { id: "facebook",  nom: "Facebook",  icone: "globe",   u: "https://www.facebook.com/{h}" },
    { id: "instagram", nom: "Instagram", icone: "camera",  u: "https://www.instagram.com/{h}/" },
    { id: "tiktok",    nom: "TikTok",    icone: "play",    u: "https://www.tiktok.com/@{h}" },
    { id: "x",         nom: "X",         icone: "chat",    u: "https://x.com/{h}" },
    { id: "youtube",   nom: "YouTube",   icone: "play",    u: "https://www.youtube.com/@{h}" },
    { id: "telegram",  nom: "Telegram",  icone: "send",    u: "https://t.me/{h}" },
    { id: "snapchat",  nom: "Snapchat",  icone: "camera",  u: "https://www.snapchat.com/add/{h}" },
    { id: "linkedin",  nom: "LinkedIn",  icone: "network", u: "https://www.linkedin.com/in/{h}" }
  ];

  function profilsPossibles(compte, sauf) {
    var h = encodeURIComponent(String(compte).replace(/^@/, ""));
    return GABARITS.filter(function (g) { return g.id !== sauf; })
                   .map(function (g) { return { nom: g.nom, icone: g.icone, url: g.u.replace("{h}", h) }; });
  }

  /* Fiches déjà enregistrées pour le même compte. Le rapprochement se fait sur
     le pseudonyme seul, sans la plateforme : c'est justement le passage d'une
     plateforme à l'autre qu'il s'agit de voir. */
  function memeCompte(compte, platId) {
    var c = String(compte || "").toLowerCase().replace(/^@/, "");
    if (!c) return [];
    return links().filter(function (l) {
      return String(l.account || "").toLowerCase().replace(/^@/, "") === c;
    });
  }

  /* --------------------------------------------------------------------- */
  /* Onglet « Analyser »                                                    */
  /* --------------------------------------------------------------------- */
  function analyseHTML() {
    var d = state.draft;
    return '<section class="panel">' +
      '<div class="panel__head"><h2 class="panel__title">Analyser une adresse</h2></div>' +
      '<p class="muted">Collez le lien d’un compte ou d’une publication. Ce qui peut être lu ' +
      'dans l’adresse s’affiche aussitôt, sans rien demander à la plateforme.</p>' +
      '<div class="lk-input">' +
        '<input id="lk-url" type="url" placeholder="https://www.tiktok.com/@compte/video/123…" ' +
          'value="' + esc(d ? d.saisie : "") + '" autocomplete="off" spellcheck="false">' +
        '<button class="abtn abtn--primary" id="lk-go">Analyser</button>' +
      '</div>' +
      '<p class="ferr" id="lk-err" hidden></p>' +
      (d ? resultatHTML(d) : '') +
      '</section>';
  }

  function ligne(cle, valeur, origine) {
    /* L'origine de chaque valeur est écrite à côté d'elle. C'est le cœur du
       module : une fiche de signalement doit dire ce qu'elle sait de source
       sûre et ce qu'elle tient d'une saisie. */
    var pastilles = {
      url: '<span class="lk-src lk-src--url">lu dans l’adresse</span>',
      plateforme: '<span class="lk-src lk-src--api">fourni par la plateforme</span>',
      saisi: '<span class="lk-src lk-src--man">saisi</span>'
    };
    return '<div class="drow"><span class="dk">' + esc(cle) + '</span><span class="dv">' +
      valeur + ' ' + (pastilles[origine] || '') + '</span></div>';
  }

  function resultatHTML(d) {
    if (d.erreur) return '<p class="ferr" style="display:block;margin-top:14px">' + esc(d.erreur) + '</p>';

    var h = '<div class="lk-result">';
    h += '<div class="lk-head"><i data-ic=' + esc(d.icone) + ' data-sz=22></i><div>' +
         '<b>' + esc(d.plateforme) + '</b>' +
         (d.kind ? ' · <span class="lk-kind">' + esc(d.kind) + '</span>' : '') +
         '<br><span class="muted lk-canon">' + esc(d.canonical) + '</span></div></div>';

    if (d.platId === "") {
      h += '<p class="lk-warn"><i data-ic=alert></i> Plateforme non reconnue. L’adresse est ' +
           'conservée telle quelle ; le compte et la nature du contenu sont à renseigner à la main.</p>';
    }
    if (d.court) {
      h += '<p class="lk-warn"><i data-ic=alert></i> Lien raccourci : il masque l’adresse réelle. ' +
           'Ouvrez-le pour obtenir l’adresse complète, puis analysez celle-ci — le compte et ' +
           'l’identifiant du contenu ne peuvent pas être lus d’un lien court.</p>';
    }

    h += '<div class="lk-rows">';
    h += ligne("Plateforme", esc(d.plateforme), d.platId ? "url" : "saisi");
    if (d.kind) h += ligne("Nature", esc(d.kind), "url");
    if (d.compte) h += ligne("Compte", '<b>@' + esc(d.compte) + '</b>', "url");
    if (d.contenuId) h += ligne("Identifiant du contenu", '<code>' + esc(d.contenuId) + '</code>', "url");
    if (d.tel) h += ligne("Numéro", '<b>' + esc(d.tel) + '</b>', "url");
    if (d.titre) h += ligne("Titre", esc(d.titre), "plateforme");
    if (d.auteur) h += ligne("Nom du compte", esc(d.auteur), "plateforme");
    h += '</div>';

    /* DOSSIER DE COMPTE.
       Il n'existe pas de WHOIS des comptes de réseaux sociaux. Les domaines
       ont des registres publics imposés par l'ICANN ; les comptes n'en ont
       aucun, et les plateformes ne publient ni la date de création, ni le nom
       du titulaire, ni son téléphone, ni sa localisation. Ce n'est pas une
       lacune technique à contourner : c'est la même protection qui empêche
       qu'on retrouve l'adresse d'une victime de cyberharcèlement à partir de
       son compte.

       Ce qui remplace utilement une recherche automatique, c'est de VÉRIFIER
       LE MÊME IDENTIFIANT PARTOUT. Un compte qui escroque en ouvre rarement
       un seul : le même pseudonyme se retrouve d'une plateforme à l'autre, et
       c'est ce recoupement qui établit un faisceau. Aucune interface n'est
       nécessaire pour cela — l'adresse d'un profil se construit. */
    if (d.compte) {
      h += '<div class="lk-dom"><div class="lk-dom__head"><i data-ic=user></i> ' +
           '<b>Le même identifiant ailleurs</b> <code>@' + esc(d.compte) + '</code></div>' +
           '<p class="muted lk-note">Chaque lien ouvre le profil correspondant s’il existe. ' +
           'Un compte présent sous le même pseudonyme sur plusieurs plateformes, ou au contraire ' +
           'introuvable partout ailleurs, est un renseignement en soi.</p>' +
           '<div class="lk-alias">';
      profilsPossibles(d.compte, d.platId).forEach(function (p2) {
        h += '<a class="lk-alias__l" href="' + esc(p2.url) + '" target="_blank" rel="noopener noreferrer">' +
             '<i data-ic=' + esc(p2.icone) + '></i> ' + esc(p2.nom) + '</a>';
      });
      h += '</div>';

      var vus = memeCompte(d.compte, d.platId);
      if (vus.length) {
        h += '<p class="lk-alerte"><i data-ic=alert></i> <b>Déjà au registre :</b> ce compte ' +
             'figure dans ' + vus.length + ' fiche(s) — ' +
             esc(vus.slice(0, 3).map(function (v) {
               return (v.category || "sans catégorie") + " le " + (v.observedAt || "?");
             }).join(" ; ")) + '.</p>';
      }
      h += '</div>';
    }

    /* Ce que le module ne peut pas faire, dit là où on l'attend. */
    h += '<div class="lk-dom"><div class="lk-dom__head"><i data-ic=lock></i> ' +
         '<b>Ce qu’aucun outil ne peut établir</b></div>' +
         '<p class="muted lk-note">Il n’existe pas d’annuaire des comptes de réseaux sociaux. ' +
         'Ni la date de création du compte, ni le nom, le téléphone ou le lieu de son titulaire ' +
         'ne sont publiés — par aucune plateforme, à personne. Seule une réquisition judiciaire ' +
         'adressée à la plateforme peut les obtenir.<br>' +
         'Ce qui se constate à l’écran — nom affiché, biographie, nombre d’abonnés, badge de ' +
         'certification, date d’inscription lorsque le profil l’affiche — se relève à la main dans ' +
         'la fiche, daté du jour du constat. C’est cette date-là qui fait la preuve, ' +
         'car le profil peut changer demain.</p></div>';

    if (d.retires && d.retires.length) {
      h += '<p class="muted lk-note"><i data-ic=check></i> ' + d.retires.length +
           ' paramètre(s) de suivi retiré(s) de l’adresse (' + esc(d.retires.slice(0, 6).join(", ")) + ').</p>';
    }

    /* Ce qui ne peut pas être obtenu est dit ici, à l'endroit exact où on
       s'attendrait à le trouver. */
    h += '<p class="lk-none"><i data-ic=lock></i> <b>Date de publication et lieu ne sont pas ' +
         'récupérables.</b> Aucune plateforme ne les publie ouvertement. Ils se renseignent ' +
         'à la main dans la fiche, avec la date à laquelle le contenu a été constaté.</p>';

    h += '<div class="btnrow">';
    if (d.oembed) {
      h += '<button class="abtn abtn--ghost" id="lk-enrich"' + (state.busy ? " disabled" : "") + '>' +
           '<i data-ic=download></i> Demander le titre à la plateforme</button>';
    }
    h += '<button class="abtn abtn--primary" id="lk-save"><i data-ic=plus></i> Créer la fiche</button>';
    h += '<a class="abtn abtn--ghost" href="' + esc(d.canonical) + '" target="_blank" rel="noopener noreferrer">' +
         '<i data-ic=eye></i> Ouvrir</a>';
    h += '</div></div>';
    return h;
  }

  function bindAnalyse() {
    var go = $("#lk-go"), inp = $("#lk-url");
    function lancer() {
      var d = analyser(inp.value);
      state.draft = d;
      A.refresh();
    }
    if (go) go.addEventListener("click", lancer);
    if (inp) inp.addEventListener("keydown", function (e) {
      /* Entrée déclenche l'analyse : c'est le geste attendu après un collage,
         et le champ n'est pas dans un formulaire qui s'en chargerait. */
      if (e.key === "Enter") { e.preventDefault(); lancer(); }
    });

    var en = $("#lk-enrich");
    if (en) en.addEventListener("click", function () {
      if (state.busy || !state.draft) return;
      state.busy = true; en.disabled = true; en.textContent = "Interrogation…";
      enrichir(state.draft.canonical).then(function (j) {
        state.draft.titre = j.title || "";
        state.draft.auteur = j.author || "";
        state.draft.vignette = j.thumbnail || "";
        state.busy = false; A.refresh();
      }).catch(function (e) {
        state.busy = false;
        var err = $("#lk-err");
        if (err) { err.textContent = e.message; err.hidden = false; }
        var b = $("#lk-enrich");
        if (b) { b.disabled = false; b.innerHTML = "Demander le titre à la plateforme"; }
      });
    });

    var sv = $("#lk-save");
    if (sv) sv.addEventListener("click", function () { openFiche(null, state.draft); });
  }

  /* --------------------------------------------------------------------- */
  /* Fiche                                                                  */
  /* --------------------------------------------------------------------- */
  function openFiche(id, depuis) {
    var all = links(), x = null;
    if (id) { for (var i = 0; i < all.length; i++) if (all[i].id === id) { x = all[i]; break; } }
    if (!x) {
      var d = depuis || {};
      x = { id: "", url: d.saisie || "", canonical: d.canonical || "", platform: d.plateforme || "",
            platId: d.platId || "", kind: d.kind || "", account: d.compte || "",
            contentId: d.contenuId || "", tel: d.tel || "", title: d.titre || "", author: d.auteur || "",
            observedAt: new Date().toISOString().slice(0, 10), publishedAt: "", location: "",
            category: "", severity: "À vérifier", followUp: "Constaté",
            memberId: "", note: "", createdAt: "" };
    }

    /* Le doublon se cherche sur l'adresse canonique : deux signalements du
       même contenu partagé différemment doivent se rejoindre, pas se
       dédoubler. */
    var doublon = null;
    if (!id && x.canonical) {
      for (var k = 0; k < all.length; k++) {
        if (all[k].canonical && all[k].canonical === x.canonical) { doublon = all[k]; break; }
      }
    }

    var mopts = '<option value="">— Aucun —</option>' + members().map(function (m) {
      return '<option value="' + esc(m.id) + '"' + (m.id === x.memberId ? " selected" : "") + '>' + esc(m.name) + '</option>';
    }).join("");

    function sel(name, list, val) {
      return '<select name="' + name + '">' + list.map(function (o) {
        return '<option' + (o === val ? " selected" : "") + '>' + esc(o) + '</option>';
      }).join("") + '</select>';
    }
    function fld(l, c) { return '<label class="afield"><span>' + l + '</span>' + c + '</label>'; }

    openModal(
      '<div class="modal__head"><h2>' + (id ? "Fiche de lien" : "Nouvelle fiche") + '</h2>' +
      '<button class="modal__x" data-close>&times;</button></div>' +
      '<form id="lf" class="modal__body">' +
        (doublon ? '<p class="lk-warn" style="margin-top:0"><i data-ic=alert></i> ' +
          'Cette adresse figure déjà au registre (constatée le ' + esc(doublon.observedAt || "?") +
          '). Enregistrer créera une seconde fiche pour le même contenu.</p>' : '') +

        '<div class="lk-fixed">' +
          '<div class="drow"><span class="dk">Adresse</span><span class="dv">' +
            '<code class="lk-canon">' + esc(x.canonical || x.url) + '</code></span></div>' +
          (x.platform ? '<div class="drow"><span class="dk">Plateforme</span><span class="dv">' + esc(x.platform) +
            (x.kind ? ' · ' + esc(x.kind) : '') + ' <span class="lk-src lk-src--url">lu dans l’adresse</span></span></div>' : '') +
          (x.account ? '<div class="drow"><span class="dk">Compte</span><span class="dv"><b>@' + esc(x.account) +
            '</b> <span class="lk-src lk-src--url">lu dans l’adresse</span></span></div>' : '') +
          (x.title ? '<div class="drow"><span class="dk">Titre</span><span class="dv">' + esc(x.title) +
            ' <span class="lk-src lk-src--api">fourni par la plateforme</span></span></div>' : '') +
        '</div>' +

        '<p class="muted lk-sep">Ci-dessous : <b>relevé par l’ACCI</b>, à la date du constat. ' +
        'Aucun de ces champs n’est récupérable auprès des plateformes — et un profil se modifie ' +
        'du jour au lendemain. C’est la date de constat qui donne sa valeur au relevé.</p>' +
        '<div class="fgrid">' +
          fld("Constaté le *", '<input name="observedAt" type="date" value="' + esc(x.observedAt) + '">') +
          fld("Nom affiché sur le profil", '<input name="displayName" value="' + esc(x.displayName || "") + '">') +
          fld("Abonnés (au constat)", '<input name="followers" inputmode="numeric" value="' + esc(x.followers || "") + '">') +
          fld("Inscrit depuis (si le profil l’affiche)", '<input name="joined" placeholder="Ex. : mars 2024" value="' + esc(x.joined || "") + '">') +
          fld("Publié le (si connu)", '<input name="publishedAt" type="date" value="' + esc(x.publishedAt) + '">') +
          fld("Lieu (si établi)", '<input name="location" placeholder="Ex. : Abidjan, Cocody" value="' + esc(x.location) + '">') +
          fld("Catégorie", sel("category", [""].concat(CATEGORIES), x.category)) +
          fld("Gravité", sel("severity", GRAVITES, x.severity)) +
          fld("Suivi", sel("followUp", SUIVI, x.followUp)) +
          fld("Membre concerné", '<select name="memberId">' + mopts + '</select>') +
        '</div>' +
        fld("Biographie relevée sur le profil", '<textarea name="bio" rows="2" placeholder="Recopiez la bio telle qu’elle apparaît — elle change souvent.">' + esc(x.bio || "") + '</textarea>') +
        fld("Note", '<textarea name="note" rows="3" placeholder="Ce qui a été constaté, et par qui.">' + esc(x.note) + '</textarea>') +
        '<p class="ferr" id="lf-e" hidden></p>' +
      '</form>' +
      '<div class="modal__foot">' +
        (id ? '<button class="abtn abtn--danger abtn--sm" id="lf-del">Supprimer</button>' : '') +
        '<span style="flex:1"></span>' +
        '<button class="abtn abtn--ghost" data-close>Annuler</button>' +
        '<button class="abtn abtn--primary" id="lf-s">Enregistrer</button>' +
      '</div>', true);

    $("#lf-s").addEventListener("click", function () {
      var f = $("#lf");
      function v(n) { var el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; }
      var obs = v("observedAt");
      if (!obs) { var e = $("#lf-e"); e.textContent = "La date de constat est obligatoire : c’est elle qui date la preuve."; e.hidden = false; return; }

      var rec = Object.assign({}, x, {
        id: x.id || uid(),
        observedAt: obs, publishedAt: v("publishedAt"), location: v("location"),
        displayName: v("displayName"), followers: v("followers"), joined: v("joined"),
        bio: v("bio"),
        category: v("category"), severity: v("severity"), followUp: v("followUp"),
        memberId: v("memberId"), note: v("note"),
        createdAt: x.createdAt || new Date().toISOString()
      });
      if (!saveLink(rec)) return;
      alog(rec.id, id ? "fiche de lien modifiée" : "lien enregistré",
           (rec.platform || "?") + (rec.account ? " @" + rec.account : ""));
      state.draft = null;
      closeModal(); toast(id ? "Fiche mise à jour." : "Fiche créée."); A.refresh();
    });

    var del = $("#lf-del");
    if (del) del.addEventListener("click", function () {
      openModal('<div class="modal__head"><h2>Confirmer</h2>' +
        '<button class="modal__x" data-close>&times;</button></div>' +
        '<div class="modal__body"><p>Supprimer cette fiche ? L’adresse, la date de constat et ' +
        'la note seront perdues — si le contenu a été retiré depuis, rien ne permettra de les retrouver.</p></div>' +
        '<div class="modal__foot"><span style="flex:1"></span>' +
        '<button class="abtn abtn--ghost" id="lc-no">Annuler</button>' +
        '<button class="abtn abtn--danger" id="lc-yes">Supprimer</button></div>');
      $("#lc-yes").addEventListener("click", function () {
        if (!writeJSON(STORE, links().filter(function (l) { return l.id !== x.id; }))) return;
        alog(x.id, "fiche de lien supprimée", x.platform || "");
        closeModal(); toast("Fiche supprimée."); A.refresh();
      });
      $("#lc-no").addEventListener("click", function () { openFiche(x.id); });
    });
  }

  /* --------------------------------------------------------------------- */
  /* Onglet « Registre »                                                    */
  /* --------------------------------------------------------------------- */
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function registreHTML() {
    var all = links(), q = norm(state.q);
    var list = all.filter(function (l) {
      if (state.fCat && l.category !== state.fCat) return false;
      if (state.fSuivi && l.followUp !== state.fSuivi) return false;
      if (!q) return true;
      return norm([l.platform, l.account, l.canonical, l.title, l.location, l.note].join(" ")).indexOf(q) !== -1;
    });

    var byCat = {};
    all.forEach(function (l) { if (l.category) byCat[l.category] = (byCat[l.category] || 0) + 1; });
    var top = Object.keys(byCat).sort(function (a, b) { return byCat[b] - byCat[a]; })[0];

    var kpis = '<div class="kpis">' +
      kpi("network", String(all.length), "Liens au registre", all.length ? "ok" : "n") +
      kpi("alert", String(all.filter(function (l) { return l.severity === "Élevée" || l.severity === "Urgente"; }).length),
          "Gravité élevée ou urgente", "warn") +
      kpi("clock", String(all.filter(function (l) { return l.followUp === "Constaté" || l.followUp === "En cours d'examen"; }).length),
          "En attente de suite", "n") +
      kpi("chart", top ? top : "—", "Catégorie la plus fréquente", "n") +
      '</div>';

    if (!all.length) {
      return kpis + '<div class="empty-state"><div class="empty-state__ic"><i data-ic=network data-sz=34></i></div>' +
        '<h2>Aucun lien au registre. Analysez une adresse pour créer la première fiche.</h2></div>';
    }

    var bar = '<div class="filterbar">' +
      '<input id="lk-q" class="asearch-inline" type="search" placeholder="Rechercher…" value="' + esc(state.q) + '" style="margin-left:0">' +
      '<select id="lk-fc"><option value="">Toutes catégories</option>' +
        CATEGORIES.map(function (c) { return '<option' + (state.fCat === c ? " selected" : "") + '>' + esc(c) + '</option>'; }).join("") +
      '</select>' +
      '<select id="lk-fs"><option value="">Tous suivis</option>' +
        SUIVI.map(function (c) { return '<option' + (state.fSuivi === c ? " selected" : "") + '>' + esc(c) + '</option>'; }).join("") +
      '</select>' +
      '<span class="filterbar__count">' + list.length + ' fiche(s)</span>' +
      '<div class="filterbar__right"><button class="abtn abtn--ghost abtn--sm" id="lk-csv"><i data-ic=download></i> CSV</button></div>' +
      '</div>';

    var rows = list.length ? list.map(function (l) {
      return '<tr class="rowlink lk-row" data-id="' + esc(l.id) + '">' +
        '<td><i data-ic=' + esc(platIcon(l.platId)) + '></i> ' + esc(l.platform || "—") +
          (l.kind ? '<br><span class="muted">' + esc(l.kind) + '</span>' : '') + '</td>' +
        '<td>' + (l.account ? '<b>@' + esc(l.account) + '</b>' : '<span class="muted">—</span>') +
          (l.displayName ? '<br><span class="muted">' + esc(l.displayName) + '</span>' : '') + '</td>' +
        '<td class="lk-cell-url"><span>' + esc(l.title || l.canonical) + '</span></td>' +
        '<td>' + (l.category ? '<span class="tagmini">' + esc(l.category) + '</span>' : '<span class="muted">—</span>') + '</td>' +
        '<td>' + gravite(l.severity) + '</td>' +
        '<td>' + esc(l.observedAt || "—") + '</td>' +
        '<td>' + esc(l.followUp || "—") + '</td>' +
        '</tr>';
    }).join("") : '<tr><td colspan="7" class="empty">Aucune fiche ne correspond à ce filtre.</td></tr>';

    return kpis + bar + '<div class="dtable"><table><thead><tr>' +
      '<th>Plateforme</th><th>Compte</th><th>Contenu</th><th>Catégorie</th>' +
      '<th>Gravité</th><th>Constaté le</th><th>Suivi</th></tr></thead><tbody>' +
      rows + '</tbody></table></div>';
  }

  function platIcon(id) {
    for (var i = 0; i < PLATEFORMES.length; i++) if (PLATEFORMES[i].id === id) return PLATEFORMES[i].icone;
    return "globe";
  }
  function gravite(g) {
    var c = { "Urgente": "danger", "Élevée": "danger", "Moyenne": "warn", "Faible": "ok", "À vérifier": "n" }[g] || "n";
    return '<span class="lk-grav lk-grav--' + c + '">' + esc(g || "—") + '</span>';
  }
  function kpi(ic, val, label, cls) {
    return '<div class="kpi"><span class="kpi__icon kpi__icon--' + cls + '"><i data-ic=' + ic + '></i></span>' +
           '<span class="kpi__val">' + esc(val) + '</span><span class="kpi__label">' + esc(label) + '</span></div>';
  }

  function bindRegistre() {
    var q = $("#lk-q");
    if (q) q.addEventListener("input", function () {
      var pos = q.selectionStart; state.q = q.value; A.refresh();
      var n = $("#lk-q"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} }
    });
    var fc = $("#lk-fc"); if (fc) fc.addEventListener("change", function () { state.fCat = fc.value; A.refresh(); });
    var fs = $("#lk-fs"); if (fs) fs.addEventListener("change", function () { state.fSuivi = fs.value; A.refresh(); });
    $$(".lk-row").forEach(function (r) {
      r.addEventListener("click", function () { openFiche(r.getAttribute("data-id")); });
    });
    var csv = $("#lk-csv");
    if (csv) csv.addEventListener("click", exportCSV);
  }

  /* Une valeur commençant par =, +, - ou @ est interprétée comme une formule
     par les tableurs : l'apostrophe la neutralise. Les adresses de ce registre
     commencent justement souvent par @ (comptes). */
  function cell(v) {
    v = String(v == null ? "" : v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    v = v.replace(/"/g, '""');
    return /[",\n;]/.test(v) ? '"' + v + '"' : v;
  }
  function exportCSV() {
    var cols = ["platform", "kind", "account", "canonical", "title", "category", "severity",
                "observedAt", "publishedAt", "location", "followUp", "note"];
    var entetes = ["Plateforme", "Nature", "Compte", "Adresse", "Titre", "Catégorie", "Gravité",
                   "Constaté le", "Publié le", "Lieu", "Suivi", "Note"];
    var lignes = links().map(function (l) { return cols.map(function (c) { return cell(l[c]); }).join(","); });
    var contenu = "﻿" + entetes.join(",") + "\n" + lignes.join("\n");
    var b = new Blob([contenu], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "acci-liens-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast(links().length + " fiche(s) exportée(s).");
  }

  /* --------------------------------------------------------------------- */
  A.register(
    { view: "links", icon: "network", label: "Liens & preuves" },
    { title: "Analyse de liens et registre de preuves", tabs: [
      { id: "analyse", l: "Analyser" },
      { id: "registre", l: "Registre" }
    ] },
    {
      "links.analyse":  { r: analyseHTML,  b: bindAnalyse },
      "links.registre": { r: registreHTML, b: bindRegistre }
    }
  );

  /* Surface de lecture pour les autres modules, et pour les tests. */
  window.ACCI_LINKS = { analyser: analyser, all: function () { return links().slice(); } };
})();
