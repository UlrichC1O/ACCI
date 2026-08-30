/* =========================================================================
   ACCI — Service worker de l'application CRM
   -------------------------------------------------------------------------
   Rend l'administration installable et utilisable hors connexion. Il ne met
   en cache QUE le code de l'application — jamais une donnée de membre.

   CE QUI N'EST JAMAIS MIS EN CACHE, ET POURQUOI
   Tout ce qui n'est pas servi par ce domaine passe directement au réseau et
   n'est jamais conservé. Cela vise Supabase : les fiches membres, les
   demandes reçues, les pièces d'identité y transitent, et une copie dans le
   cache du navigateur les laisserait sur l'appareil après une déconnexion,
   hors de portée du CRM qui ne saurait même pas qu'elle existe. Les requêtes
   autres que GET ne sont pas interceptées non plus.

   POURQUOI « RÉSEAU D'ABORD » ET NON « CACHE D'ABORD »
   Le cache classique d'une application installée sert d'abord la copie locale
   et rafraîchit ensuite. Ici, le code de l'administration change plusieurs
   fois par jour et plusieurs fichiers doivent s'accorder entre eux
   (admin.js, admin.css, les modules). Servir une copie locale ferait tourner
   des versions dépareillées, et un correctif de sécurité pourrait rester sans
   effet pendant des jours sur l'appareil de quelqu'un. En ligne, on sert donc
   toujours la version du serveur ; le cache n'intervient que si le réseau ne
   répond pas — c'est-à-dire hors connexion, ce pour quoi il est fait.

   Un délai borne l'attente : sur une connexion mobile qui traîne sans jamais
   échouer, une requête réseau peut rester en suspens indéfiniment, et l'écran
   serait resté vide alors qu'une copie utilisable existait.
   ========================================================================= */
"use strict";

var VERSION = "acci-crm-2026-08-30-a";
var CACHE = "acci-crm-" + VERSION;
var TIMEOUT = 4000;

/* Le strict nécessaire pour ouvrir l'application hors connexion. La liste est
   volontairement courte : chaque entrée qui n'existe plus ferait échouer
   l'installation entière du service worker, et l'application cesserait d'être
   installable sans que rien ne l'explique. Les autres fichiers entrent dans le
   cache d'eux-mêmes, à la première visite qui les demande. */
var SHELL = [
  "/admin/index.html",
  "/admin/admin.css",
  "/assets/css/fonts.css",
  "/assets/img/app-icon-192.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* addAll échoue en bloc à la moindre absence ; chaque entrée est donc
         ajoutée séparément et un manque n'empêche pas l'installation. */
      return Promise.all(SHELL.map(function (u) {
        return c.add(new Request(u, { cache: "reload" })).catch(function () {});
      }));
    })
  );
  /* La nouvelle version prend la place de l'ancienne sans attendre la
     fermeture de tous les onglets : c'est pwa.js qui préviendra et proposera
     de recharger, plutôt que de laisser une version périmée en service. */
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE && k.indexOf("acci-crm-") === 0) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Le réseau, mais pas indéfiniment. */
function fromNetwork(req) {
  return new Promise(function (resolve, reject) {
    var done = false;
    var timer = setTimeout(function () { if (!done) { done = true; reject(new Error("timeout")); } }, TIMEOUT);
    fetch(req).then(function (res) {
      if (done) return;
      done = true; clearTimeout(timer); resolve(res);
    }, function (err) {
      if (done) return;
      done = true; clearTimeout(timer); reject(err);
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;

  /* Seules les lectures sont concernées : une écriture rejouée depuis un cache
     enregistrerait deux fois la même chose. */
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  /* Hors de ce domaine — Supabase au premier chef — on ne touche à rien. */
  if (url.origin !== self.location.origin) return;

  /* Le service worker ne sert que l'administration. Le site public a son
     propre fonctionnement et n'a pas à passer par ici. */
  if (url.pathname.indexOf("/admin/") !== 0 && url.pathname.indexOf("/assets/") !== 0) return;

  e.respondWith(
    fromNetwork(req).then(function (res) {
      /* Une réponse d'erreur n'écrase pas une copie valide : sur un 502 du
         serveur, l'application aurait remplacé son code par une page
         d'erreur, et l'aurait servie hors connexion. */
      if (res && res.ok && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        /* Navigation hors connexion sans copie de la page demandée : on rend
           la page d'accueil de l'administration, qui est l'application. */
        if (req.mode === "navigate") return caches.match("/admin/index.html");
        return new Response("", { status: 504, statusText: "Hors connexion" });
      });
    })
  );
});

/* pwa.js demande le remplacement immédiat quand l'utilisateur accepte de
   recharger. */
self.addEventListener("message", function (e) {
  if (e.data === "acci-skip-waiting") self.skipWaiting();
});
