/* =========================================================================
   ACCI — Consentement aux cookies de mesure et de publicité
   -------------------------------------------------------------------------
   Rien de ce que pose site-analytics.js n'est nécessaire au fonctionnement du
   site : ni Google Analytics, ni Google Ads, ni le pixel Meta. Ces balises
   observent le visiteur, et son accord doit donc être recueilli avant qu'elles
   ne se chargent — non après.

   Le choix est demandé une fois, puis conservé dans le navigateur du visiteur.
   Tant qu'il n'a pas répondu, aucune balise n'est montée : c'est l'absence de
   décision qui vaut refus, jamais l'inverse.

   Deux finalités distinctes, parce qu'elles n'engagent pas la même chose :

     mesure     — Google Analytics, Google Tag Manager : combien de visites,
                  quelles pages, d'où viennent les gens.
     publicite  — Google Ads, pixel Meta : suivi du visiteur d'un site à
                  l'autre, à des fins de ciblage publicitaire.

   Refuser doit être aussi simple qu'accepter : les deux boutons sont côte à
   côte, de même poids, et leurs intitulés ne sont pas réglables. Un bandeau
   qui rend le refus laborieux ne recueille pas un consentement, il l'extorque
   — et ce site est consacré à la protection des personnes en ligne.

   Le texte, lui, se règle depuis l'administration (« Identité du site » →
   « Consentement »), comme le reste de l'identité du site.

   Le bandeau attend les réglages avant de s'afficher : il faut savoir s'il y a
   seulement quelque chose à accepter. Sans identifiant renseigné, le visiteur
   n'est pas dérangé ; et si les réglages ne parviennent jamais, aucune balise
   ne se charge non plus — le silence est cohérent des deux côtés.

   Le signal de refus du navigateur (Global Privacy Control) est traité comme
   un refus déjà exprimé : le bandeau ne s'affiche pas, et rien n'est chargé.
   Insister après un refus explicite serait malhonnête.
   ========================================================================= */
(function () {
  "use strict";

  var KEY = "acci_consent";
  var VERSION = 1;

  /* Textes d'origine. Ce sont eux que l'administration montre en repère de
     chaque champ : un champ vide y revient. */
  var TEXTS = {
    title: "Cookies de mesure et de publicité",
    text: "Ce site fonctionne sans aucun cookie de suivi. Nous aimerions en déposer " +
          "pour mesurer l’audience, et le cas échéant pour nos campagnes de " +
          "sensibilisation. Vous pouvez refuser : le site fonctionne à l’identique.",
    measure_label: "Mesure d’audience",
    measure_desc: "Nombre de visites, pages consultées, provenance. Google Analytics.",
    ads_label: "Publicité",
    ads_desc: "Suivi d’un site à l’autre pour cibler nos campagnes. Google Ads, pixel Meta."
  };

  /* Les balises qui exigent un accord. La vérification Search Console n'en est
     pas : c'est une balise meta, elle ne dépose rien et n'appelle personne. */
  var TAG_KEYS = ["analytics.ga4", "analytics.gtm", "analytics.gads", "analytics.meta_pixel"];

  /* ---- Mémoire du choix (peut être refusée : navigation privée, quota) ---- */

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || c.v !== VERSION) return null;     // question reposée si elle a changé
      return { mesure: c.mesure === true, publicite: c.publicite === true };
    } catch (e) { return null; }
  }

  function write(choice) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: VERSION, mesure: choice.mesure === true,
        publicite: choice.publicite === true, at: Date.now()
      }));
    } catch (e) { /* refus du stockage : le choix ne vaut que pour cette page */ }
  }

  function signalRefusal() {
    try { return navigator.globalPrivacyControl === true; } catch (e) { return false; }
  }

  /* ---- État ---- */

  var stored = signalRefusal() ? { mesure: false, publicite: false } : read();
  var forced = signalRefusal();     /* refus imposé : signal du navigateur, ou bandeau désactivé */
  var settings = null;
  var texts = TEXTS;

  function get() {
    if (forced || !stored) return { mesure: false, publicite: false };
    return { mesure: stored.mesure, publicite: stored.publicite };
  }

  function decided() { return forced || !!stored; }

  function publish() {
    window.ACCI_CONSENT_STATE = get();
    try {
      document.dispatchEvent(new CustomEvent("acci:consent", { detail: get() }));
    } catch (e) { /* le relais par window suffit */ }
  }

  function set(choice) {
    stored = { mesure: choice.mesure === true, publicite: choice.publicite === true };
    write(stored);
    publish();
    close();
  }

  /* ---- Bandeau ---- */

  var el = null;

  function close() {
    if (!el) return;
    if (el.parentNode) el.parentNode.removeChild(el);
    el = null;
  }

  function t(key) {
    var v = settings && settings["consent." + key];
    return (typeof v === "string" && v !== "") ? v : TEXTS[key];
  }

  function build(choice) {
    var wrap = document.createElement("section");
    wrap.className = "consent";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "false");
    wrap.setAttribute("aria-label", "Choix relatif aux cookies");

    var doc = document;
    function el2(tag, cls, txt) {
      var n = doc.createElement(tag);
      if (cls) n.className = cls;
      if (txt != null) n.textContent = txt;   // texte réglé depuis l'administration : jamais interprété comme du balisage
      return n;
    }

    var inner = el2("div", "container consent__inner");
    var textCol = el2("div", "consent__text");
    textCol.appendChild(el2("h2", "consent__title", t("title")));

    var p = el2("p", null, t("text") + " ");
    var link = doc.createElement("a");
    link.href = "confidentialite.html";
    link.textContent = "Politique de confidentialité";
    p.appendChild(link);
    textCol.appendChild(p);

    var opts = el2("div", "consent__opts");
    opts.hidden = true;
    [["mesure", "measure_label", "measure_desc"],
     ["publicite", "ads_label", "ads_desc"]].forEach(function (row) {
      var lab = el2("label", "consent__opt");
      var box = doc.createElement("input");
      box.type = "checkbox";
      box.setAttribute("data-purpose", row[0]);
      box.checked = choice[row[0]] === true;
      var span = doc.createElement("span");
      span.appendChild(el2("b", null, t(row[1])));
      span.appendChild(doc.createTextNode(t(row[2])));
      lab.appendChild(box);
      lab.appendChild(span);
      opts.appendChild(lab);
    });
    textCol.appendChild(opts);

    var acts = el2("div", "consent__acts");
    function btn(cls, act, label) {
      var b = doc.createElement("button");
      b.type = "button";
      b.className = cls;
      b.setAttribute("data-act", act);
      b.textContent = label;
      return b;
    }
    var all = btn("btn btn--light", "all", "Tout accepter");
    var none = btn("btn btn--light", "none", "Tout refuser");
    var more = btn("consent__more", "more", "Personnaliser");
    var save = btn("btn btn--light consent__save", "save", "Enregistrer mes choix");
    save.hidden = true;
    acts.appendChild(all); acts.appendChild(none);
    acts.appendChild(more); acts.appendChild(save);

    inner.appendChild(textCol);
    inner.appendChild(acts);
    wrap.appendChild(inner);

    wrap.addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("[data-act]") : null;
      if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "all") return set({ mesure: true, publicite: true });
      if (act === "none") return set({ mesure: false, publicite: false });
      if (act === "more") {
        opts.hidden = false;
        more.hidden = true;
        save.hidden = false;
        opts.querySelector("input").focus();
        return;
      }
      if (act === "save") {
        var picked = {};
        var boxes = opts.querySelectorAll("[data-purpose]");
        for (var j = 0; j < boxes.length; j++) {
          picked[boxes[j].getAttribute("data-purpose")] = boxes[j].checked;
        }
        return set(picked);
      }
    });

    return wrap;
  }

  function open(refresh) {
    if (!document.body) return;
    /* Le nœud a pu être retiré du document sans passer par close() : sans ce
       contrôle, le module se croirait ouvert et n'afficherait plus rien. */
    if (el && !el.parentNode) el = null;
    if (el) {
      /* Déjà ouvert. On ne le reconstruit que pour rafraîchir un texte, et
         seulement si le visiteur n'a pas commencé à choisir : lui escamoter
         ses cases à demi cochées parce que les réglages viennent d'arriver
         serait pire que de lui laisser un texte vieux d'une minute. */
      if (!refresh || !el.querySelector(".consent__opts").hidden) return;
      close();
    }
    el = build(get());
    document.body.appendChild(el);
  }

  /* ---- Décision, une fois les réglages connus ---- */

  function hasTags() {
    if (!settings) return false;
    for (var i = 0; i < TAG_KEYS.length; i++) {
      if (settings[TAG_KEYS[i]]) return true;
    }
    return false;
  }

  /* Le lien « Cookies » du pied de page n'a de sens que s'il y a un choix à
     reprendre. Sans balise renseignée, ou après un refus imposé, il ouvrirait
     une fenêtre sans objet : il est retiré. */
  function syncFooterLink(usable) {
    var links = document.querySelectorAll("[data-consent-open]");
    for (var i = 0; i < links.length; i++) links[i].hidden = !usable;
  }

  function decide() {
    /* « Désactivé » ne veut pas dire « suivre sans demander » : le bandeau
       disparaît et les balises avec lui. C'est le seul sens défendable. */
    if (settings && settings["consent.mode"] === "off") {
      forced = true;
      close();
      publish();
      syncFooterLink(false);
      return;
    }
    var usable = hasTags() && !signalRefusal();
    syncFooterLink(usable);
    publish();
    /* open(true) : les réglages arrivent deux fois — le cache d'abord, le
       réseau ensuite — et le texte du bandeau peut différer entre les deux. */
    if (usable && !decided()) open(true);
  }

  /* ---- Démarrage ---- */

  /* L'état est publié tout de suite, y compris « pas de décision » : c'est ce
     qui permet à site-analytics.js de savoir qu'il ne doit rien monter, plutôt
     que d'attendre un événement qui pourrait ne jamais venir. */
  publish();
  syncFooterLink(false);

  if (window.ACCI_SETTINGS) { settings = window.ACCI_SETTINGS; decide(); }
  document.addEventListener("acci:settings", function (ev) {
    settings = (ev && ev.detail) || settings;
    decide();
  });

  /* Reprendre son choix : un consentement qu'on ne peut pas retirer n'en est
     pas un. Le lien vit dans le pied de page. */
  document.addEventListener("click", function (ev) {
    var target = ev.target.closest ? ev.target.closest("[data-consent-open]") : null;
    if (!target) return;
    ev.preventDefault();
    open();
  });

  window.ACCI_CONSENT = { get: get, set: set, open: open, decided: decided };
})();
