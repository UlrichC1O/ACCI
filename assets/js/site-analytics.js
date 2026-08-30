/* =========================================================================
   ACCI — Balises de mesure et de publicité
   -------------------------------------------------------------------------
   Les identifiants de Google Analytics, Google Tag Manager, Google Ads, du
   pixel Meta et de Search Console sont renseignés dans l'administration
   (« Identité du site » → « Mesure d'audience ») et lus ici, chez le
   visiteur. Le site est statique : sans ce fichier, il faudrait redéployer
   pour poser ou retirer une balise.

   Rien n'est chargé tant qu'un identifiant n'est pas renseigné. Un champ vide
   dans l'administration ne fait pas seulement disparaître la balise : aucune
   requête n'est émise vers le tiers concerné.

   Trois précautions, dans cet ordre :

     1. Le consentement du visiteur, recueilli par site-consent.js, commande
        tout. Une finalité non accordée ne monte rien, et l'absence de réponse
        vaut refus. Si site-consent.js ne se charge pas, rien n'est monté non
        plus : le défaut est le refus.
     2. Les identifiants sont vérifiés contre les mêmes motifs que dans
        l'administration. Une valeur détournée ne doit pas devenir l'adresse
        d'un script chargé sur les cinquante pages.
     3. Chaque balise n'est montée qu'une fois. Les réglages sont appliqués
        deux fois — le cache d'abord, le réseau ensuite — et un pixel compté
        deux fois fausserait la mesure.

   La balise de vérification Search Console échappe au consentement : c'est une
   balise meta, elle ne dépose rien et n'appelle personne.

   Aucun code n'est écrit en ligne dans la page : la politique de sécurité du
   site interdit les scripts en clair, et l'amorce de gtag comme celle de fbq
   sont donc définies ici, dans un fichier servi par le site lui-même. Seuls
   les scripts des tiers sont chargés à distance, depuis les domaines déclarés
   dans vercel.json.
   ========================================================================= */
(function () {
  "use strict";

  /* Mêmes motifs que admin/site-identity.js. Un identifiant accepté là-bas
     mais refusé ici resterait sans effet, sans que rien ne le signale. */
  var RE = {
    ga4:   /^G-[A-Z0-9]{4,15}$/i,
    gtm:   /^GTM-[A-Z0-9]{4,12}$/i,
    gads:  /^AW-[0-9]{6,15}$/i,
    pixel: /^[0-9]{8,20}$/,
    gsc:   /^[A-Za-z0-9_-]{20,120}$/
  };

  var mounted = {};

  function once(name) {
    if (mounted[name]) return false;
    mounted[name] = true;
    return true;
  }

  /* Le consentement est tenu par site-consent.js. Deux finalités distinctes :
     la mesure d'audience et la publicité ne s'accordent pas ensemble.

     Si ce fichier-là ne se charge pas, ACCI_CONSENT_STATE reste indéfini et
     rien n'est monté. C'est voulu : en l'absence de mécanisme de recueil, le
     défaut doit être le refus, jamais l'inverse. */
  function allowed(purpose) {
    if (window.ACCI_NO_TRACKING === true) return false;
    var c = window.ACCI_CONSENT_STATE;
    return !!(c && c[purpose] === true);
  }

  function loadScript(src) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  /* Amorce commune à Analytics et à Google Ads : les deux passent par gtag,
     et le script de googletagmanager.com n'est chargé qu'une fois même si les
     deux identifiants sont renseignés. */
  function gtagReady() {
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      /* arguments est poussé tel quel : gtag('config', id) cesse de
         fonctionner si l'on reconstruit un tableau à la place. */
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
    }
  }

  function gtagLoader(id) {
    if (once("gtag-js")) {
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id));
    }
  }

  function fbqReady() {
    if (window.fbq) return;
    var n = window.fbq = function () {
      if (n.callMethod) n.callMethod.apply(n, arguments);
      else n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
  }

  /* Le dernier état connu des réglages : le consentement peut arriver après
     eux — c'est même le cas courant, le visiteur mettant quelques secondes à
     répondre — et il faut alors monter les balises sans recharger la page. */
  var lastMap = null;

  function apply(map) {
    if (map) lastMap = map;
    map = lastMap;
    if (!map) return;

    var ga = map["analytics.ga4"] || "";
    var gtm = map["analytics.gtm"] || "";
    var ads = map["analytics.gads"] || "";
    var px = map["analytics.meta_pixel"] || "";
    var gsc = map["analytics.gsc"] || "";

    /* Search Console — une balise meta, aucun script.
       À noter : Google vérifie la propriété en lisant le code source servi et
       n'exécute pas ce fichier pour cela. La balise est posée quand même, elle
       ne coûte rien ; la vérification, elle, passe par l'enregistrement DNS ou
       par la variable d'environnement SITE_GSC lue à la compilation. */
    if (RE.gsc.test(gsc) && once("gsc")) {
      var meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "google-site-verification");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", gsc);
    }

    if (allowed("mesure") && RE.ga4.test(ga) && once("ga4")) {
      gtagReady();
      gtagLoader(ga);
      window.gtag("config", ga);
    }

    if (allowed("publicite") && RE.gads.test(ads) && once("gads")) {
      gtagReady();
      gtagLoader(ads);
      window.gtag("config", ads);
    }

    if (allowed("mesure") && RE.gtm.test(gtm) && once("gtm")) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(gtm));
    }

    if (allowed("publicite") && RE.pixel.test(px) && once("pixel")) {
      fbqReady();
      window.fbq("init", px);
      window.fbq("track", "PageView");
      loadScript("https://connect.facebook.net/en_US/fbevents.js");
    }
  }

  /* Les réglages sont chargés par site-settings.js, qui les publie ici plutôt
     que de les faire chercher une seconde fois. L'ordre des deux fichiers n'a
     pas d'importance : la valeur déjà posée est relue au démarrage, et
     l'événement rattrape les applications suivantes. */
  if (window.ACCI_SETTINGS) apply(window.ACCI_SETTINGS);
  document.addEventListener("acci:settings", function (ev) {
    apply(ev && ev.detail);
  });

  /* Le visiteur vient de répondre : on remonte ce qu'il autorise désormais.
     Une finalité retirée n'est en revanche pas démontée — un script tiers déjà
     chargé ne se décharge pas. Le refus prend effet au chargement suivant, et
     c'est ce que dit la politique de confidentialité. */
  document.addEventListener("acci:consent", function () { apply(null); });
})();
