/* =========================================================================
   ACCI — Installation de l'application et mises à jour
   -------------------------------------------------------------------------
   Rend le CRM installable sur téléphone et sur ordinateur, et signale les
   nouvelles versions. Ce fichier ne dépend d'aucun autre module : il agit sur
   le balisage d'index.html, et se tait si le navigateur ne sait pas installer.

   TROIS SITUATIONS, TROIS COMPORTEMENTS — c'est tout l'objet de ce fichier.

   1. Android, Chrome, Edge, ordinateurs. Le navigateur émet
      « beforeinstallprompt ». On retient l'événement et on montre un bouton :
      l'invite native ne peut être ouverte que depuis un geste de
      l'utilisateur, et déclenchée d'office elle serait ignorée.

   2. iPhone et iPad. Safari n'émet rien et n'expose aucune interface
      d'installation : l'ajout à l'écran d'accueil passe obligatoirement par
      le menu Partager. Sans un mot d'explication, un utilisateur d'iPhone
      cherche un bouton qui n'existera jamais. On affiche donc la marche à
      suivre, et seulement sur ces appareils.

   3. Application déjà installée. Le bouton n'a plus d'objet et disparaît.

   MISES À JOUR. Le service worker prend la main dès son installation, mais la
   page ouverte continue de faire tourner l'ancien code. Plutôt que de la
   recharger d'autorité — ce qui perdrait un formulaire en cours de saisie —
   on propose de le faire.
   ========================================================================= */
(function () {
  "use strict";

  if (!("serviceWorker" in navigator)) return;

  var deferred = null;             /* l'invite native retenue, si elle existe */

  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
           window.navigator.standalone === true;
  }

  /* iPadOS se présente comme un Mac depuis 2020 : le seul indice fiable est
     l'écran tactile joint à un moteur WebKit. */
  function isIOS() {
    var ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) ||
           (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  }

  /* ------------------------------ Styles -------------------------------- */
  /* Portés par ce fichier, comme pour pieces.js : la rubrique s'ajoute et se
     retire d'un seul bloc, sans toucher à admin.css. */
  function styles() {
    if (document.getElementById("acci-pwa-css")) return;
    var s = document.createElement("style");
    s.id = "acci-pwa-css";
    s.textContent =
      ".pwa-install{display:inline-flex;align-items:center;gap:7px;justify-content:center;" +
        "width:100%;margin-top:12px;padding:10px 14px;border-radius:10px;cursor:pointer;" +
        "font:inherit;font-size:13.5px;font-weight:600;border:1.5px solid rgba(255,255,255,.28);" +
        "background:rgba(255,255,255,.10);color:#fff;transition:.18s}" +
      ".pwa-install:hover{background:rgba(255,255,255,.18)}" +
      ".pwa-hint{margin-top:12px;padding:10px 12px;border-radius:10px;font-size:12.5px;line-height:1.6;" +
        "background:rgba(255,255,255,.08);color:#dbe8e1;border:1px solid rgba(255,255,255,.16)}" +
      ".pwa-hint b{color:#fff}" +
      /* Dans la barre latérale, le fond est déjà sombre : le bouton reprend la
         même teinte que les autres commandes du pied de barre. */
      ".sidebar__foot .pwa-install{margin-top:8px;font-size:12.5px}" +
      ".pwa-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:22px;z-index:9999;" +
        "display:flex;align-items:center;gap:12px;max-width:92vw;" +
        "padding:12px 16px;border-radius:12px;background:#0B3D2E;color:#fff;" +
        "box-shadow:0 14px 34px -12px rgba(0,0,0,.55);font-size:13.5px}" +
      ".pwa-toast button{font:inherit;font-weight:700;font-size:13px;cursor:pointer;" +
        "padding:7px 12px;border-radius:8px;border:none;background:#B34F00;color:#fff}" +
      ".pwa-toast .pwa-later{background:transparent;color:#bcd2c7;font-weight:600}";
    document.head.appendChild(s);
  }

  /* --------------------------- Points d'accroche ------------------------- */
  /* L'écran de connexion et le pied de la barre latérale : le premier est vu
     par tout le monde avant d'entrer, le second reste atteignable ensuite. */
  function slots() {
    var out = [];
    var login = document.querySelector(".login__note");
    if (login && login.parentNode) out.push({ el: login, where: "before" });
    var foot = document.querySelector(".sidebar__foot");
    if (foot) out.push({ el: foot, where: "append" });
    return out;
  }

  function place(node, slot) {
    if (slot.where === "before") slot.el.parentNode.insertBefore(node, slot.el);
    else slot.el.appendChild(node);
  }

  function clear() {
    var old = document.querySelectorAll(".pwa-install,.pwa-hint");
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
  }

  function render() {
    if (isStandalone()) { clear(); return; }     /* déjà installée */
    styles();
    clear();

    slots().forEach(function (slot, i) {
      if (deferred) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pwa-install";
        b.textContent = "⬇  Installer l’application";
        b.addEventListener("click", function () {
          if (!deferred) return;
          var evt = deferred;
          deferred = null;                        /* une invite ne sert qu'une fois */
          evt.prompt();
          evt.userChoice.then(function () { render(); });
        });
        place(b, slot);
      } else if (isIOS() && i === 0) {
        /* Une seule fois, sur l'écran de connexion : répétée dans la barre
           latérale, l'explication devient du bruit. */
        var h = document.createElement("p");
        h.className = "pwa-hint";
        h.innerHTML = "<b>Installer sur iPhone ou iPad :</b> touchez " +
          "<b>Partager</b> en bas de Safari, puis <b>Sur l’écran d’accueil</b>. " +
          "Le CRM s’ouvrira ensuite comme une application, sans barre d’adresse.";
        place(h, slot);
      }
    });
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    /* Sans preventDefault, Chrome affiche sa propre bannière et l'événement
       ne peut plus être rejoué au moment choisi. */
    e.preventDefault();
    deferred = e;
    render();
  });

  window.addEventListener("appinstalled", function () {
    deferred = null;
    clear();
  });

  /* L'application se dessine après la connexion : la barre latérale n'existe
     pas au chargement. On repasse donc quand le DOM bouge, sans plus de
     cérémonie qu'il n'en faut. */
  function watch() {
    var app = document.getElementById("app");
    if (!app || !window.MutationObserver) return;
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; if (deferred || isIOS()) render(); }, 400);
    }).observe(app, { attributes: true, attributeFilter: ["hidden"] });
  }

  /* ----------------------------- Mise à jour ----------------------------- */
  function updateToast(worker) {
    if (document.querySelector(".pwa-toast")) return;
    styles();
    var t = document.createElement("div");
    t.className = "pwa-toast";
    t.setAttribute("role", "status");
    t.innerHTML = "<span>Une nouvelle version du CRM est disponible.</span>";

    var go = document.createElement("button");
    go.type = "button";
    go.textContent = "Recharger";
    go.addEventListener("click", function () {
      /* Le rechargement suit la prise de fonction du nouveau service worker,
         sinon la page repartirait sur l'ancien code et le message
         reviendrait aussitôt. */
      navigator.serviceWorker.addEventListener("controllerchange", function once() {
        navigator.serviceWorker.removeEventListener("controllerchange", once);
        window.location.reload();
      });
      if (worker) worker.postMessage("acci-skip-waiting");
      else window.location.reload();
    });

    var later = document.createElement("button");
    later.type = "button";
    later.className = "pwa-later";
    later.textContent = "Plus tard";
    later.addEventListener("click", function () { t.parentNode.removeChild(t); });

    t.appendChild(go);
    t.appendChild(later);
    document.body.appendChild(t);
  }

  /* ---------------------------- Enregistrement --------------------------- */
  function start() {
    render();
    watch();

    navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" })
      .then(function (reg) {
        /* Un worker déjà en attente : la mise à jour a été téléchargée lors
           d'une visite précédente et n'a jamais été appliquée. */
        if (reg.waiting && navigator.serviceWorker.controller) updateToast(reg.waiting);

        reg.addEventListener("updatefound", function () {
          var sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", function () {
            /* controller absent = première installation : il n'y a rien à
               remplacer et proposer un rechargement n'aurait aucun sens. */
            if (sw.state === "installed" && navigator.serviceWorker.controller) updateToast(sw);
          });
        });
      })
      .catch(function (e) {
        /* Un échec d'enregistrement ne doit rien empêcher : le CRM fonctionne
           sans être installé, exactement comme avant. */
        try { console.warn("[ACCI] service worker non enregistré :", e && e.message); } catch (_) {}
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
