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
   côte, de même poids. Un bandeau qui rend le refus laborieux ne recueille pas
   un consentement, il l'extorque — et ce site est consacré à la protection des
   personnes en ligne.

   Le signal de refus du navigateur (Global Privacy Control) est traité comme
   un refus déjà exprimé : le bandeau ne s'affiche pas, et rien n'est chargé.
   Insister après un refus explicite serait malhonnête.
   ========================================================================= */
(function () {
  "use strict";

  var KEY = "acci_consent";
  var VERSION = 1;
  var PURPOSES = ["mesure", "publicite"];

  /* ---- Mémoire du choix (peut être refusée : navigation privée, quota) ---- */

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || c.v !== VERSION) return null;     // question reposée si elle a changé
      return { mesure: c.mesure === true, publicite: c.publicite === true, at: c.at };
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

  function refusedBySignal() {
    try { return navigator.globalPrivacyControl === true; } catch (e) { return false; }
  }

  /* ---- État ---- */

  var current = refusedBySignal()
    ? { mesure: false, publicite: false, signal: true }
    : read();

  function get() {
    return current
      ? { mesure: current.mesure, publicite: current.publicite }
      : { mesure: false, publicite: false };
  }

  function decided() { return !!current; }

  function publish() {
    window.ACCI_CONSENT_STATE = get();
    try {
      document.dispatchEvent(new CustomEvent("acci:consent", { detail: get() }));
    } catch (e) { /* le relais par window suffit */ }
  }

  function set(choice, remember) {
    current = { mesure: choice.mesure === true, publicite: choice.publicite === true };
    if (remember !== false) write(current);
    publish();
    close();
  }

  /* ---- Bandeau ---- */

  var el = null;

  function close() {
    if (!el) return;
    el.parentNode.removeChild(el);
    el = null;
  }

  function build(choice) {
    var wrap = document.createElement("section");
    wrap.className = "consent";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "false");
    wrap.setAttribute("aria-label", "Choix relatif aux cookies");

    wrap.innerHTML =
      '<div class="container consent__inner">' +
        '<div class="consent__text">' +
          '<h2 class="consent__title">Cookies de mesure et de publicité</h2>' +
          '<p>Ce site fonctionne sans aucun cookie de suivi. Nous aimerions en déposer ' +
             'pour mesurer l\'audience, et le cas échéant pour nos campagnes de ' +
             'sensibilisation. Vous pouvez refuser : le site fonctionne à l\'identique. ' +
             '<a href="confidentialite.html">Politique de confidentialité</a></p>' +
          '<div class="consent__opts" hidden>' +
            '<label class="consent__opt">' +
              '<input type="checkbox" data-purpose="mesure">' +
              '<span><b>Mesure d\'audience</b>' +
              'Nombre de visites, pages consultées, provenance. Google Analytics.</span>' +
            '</label>' +
            '<label class="consent__opt">' +
              '<input type="checkbox" data-purpose="publicite">' +
              '<span><b>Publicité</b>' +
              'Suivi d\'un site à l\'autre pour cibler nos campagnes. Google Ads, pixel Meta.</span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="consent__acts">' +
          '<button type="button" class="btn btn--light" data-act="all">Tout accepter</button>' +
          '<button type="button" class="btn btn--light" data-act="none">Tout refuser</button>' +
          '<button type="button" class="consent__more" data-act="more">Personnaliser</button>' +
          '<button type="button" class="btn btn--light consent__save" data-act="save" hidden>' +
            'Enregistrer mes choix</button>' +
        '</div>' +
      '</div>';

    var opts = wrap.querySelector(".consent__opts");
    var more = wrap.querySelector('[data-act="more"]');
    var save = wrap.querySelector('[data-act="save"]');
    var boxes = wrap.querySelectorAll("[data-purpose]");
    var i;
    for (i = 0; i < boxes.length; i++) {
      boxes[i].checked = choice ? choice[boxes[i].getAttribute("data-purpose")] === true : false;
    }

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
        boxes[0].focus();
        return;
      }
      if (act === "save") {
        var picked = {};
        for (var j = 0; j < boxes.length; j++) {
          picked[boxes[j].getAttribute("data-purpose")] = boxes[j].checked;
        }
        return set(picked);
      }
    });

    return wrap;
  }

  function open() {
    if (el) return;
    el = build(get());
    document.body.appendChild(el);
  }

  /* ---- Démarrage ---- */

  /* L'état est publié dans tous les cas, y compris « pas de décision » : c'est
     ce qui permet à site-analytics.js de savoir qu'il ne doit rien monter,
     plutôt que de rester à attendre un événement qui ne viendrait jamais. */
  publish();

  function start() {
    if (!decided()) open();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  /* Le choix doit pouvoir être repris : un consentement qu'on ne peut pas
     retirer n'en est pas un. Le lien vit dans le pied de page. */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest ? ev.target.closest("[data-consent-open]") : null;
    if (!t) return;
    ev.preventDefault();
    if (refusedBySignal()) {
      /* Rouvrir le bandeau donnerait à croire que le choix est encore ouvert,
         alors que le navigateur a déjà tranché. */
      window.alert("Votre navigateur émet un signal de refus du suivi (Global Privacy "
        + "Control). Aucun cookie de mesure ni de publicité n'est déposé sur ce site.");
      return;
    }
    open();
  });

  window.ACCI_CONSENT = { get: get, set: set, open: open, decided: decided };
})();
