/* =========================================================================
   ACCI — Photo de profil d'un membre
   -------------------------------------------------------------------------
   Prépare puis dépose la photo d'un membre, et rend son adresse.

   La photo est réduite avant l'envoi : un appareil récent produit des fichiers
   de plusieurs mégaoctets, alors qu'elle ne s'affiche jamais au-delà d'une
   centaine de pixels. La téléverser telle quelle coûterait au bureau son
   espace de stockage, et au membre son forfait de données à chaque affichage
   de la liste.

   Le dépôt site-images est public : toute personne connaissant l'adresse d'une
   photo peut l'ouvrir. Le nom du fichier est donc tiré au sort plutôt que
   dérivé du nom du membre, ce qui évite qu'une adresse se devine — mais cela
   ne remplace pas un contrôle d'accès. Une photo de profil n'est pas une
   pièce d'identité : ne pas y déposer de document personnel.
   ========================================================================= */
(function () {
  "use strict";

  var MAX = 400;                 /* côté maximal, en pixels */
  var QUALITY = 0.85;

  function fail(msg) { var e = new Error(msg); e.photo = true; return e; }

  /* Réduction par canvas. Le rapport est conservé : une photo déformée sur une
     fiche de membre se remarque immédiatement. */
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) return reject(fail("Ce fichier n'est pas une image."));
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) return reject(fail("Image illisible."));
        var scale = Math.min(1, MAX / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var cv = document.createElement("canvas");
        cv.width = cw; cv.height = ch;
        var cx = cv.getContext("2d");
        if (!cx) return reject(fail("Redimensionnement indisponible sur ce navigateur."));
        cx.drawImage(img, 0, 0, cw, ch);
        /* WebP quand le navigateur sait l'écrire, JPEG sinon : toBlob rend null
           pour un type qu'il ne gère pas, et l'envoi partirait vide. */
        cv.toBlob(function (blob) {
          if (blob) return resolve({ blob: blob, ext: ".webp" });
          cv.toBlob(function (b2) {
            if (!b2) return reject(fail("Conversion de l'image impossible."));
            resolve({ blob: b2, ext: ".jpg" });
          }, "image/jpeg", QUALITY);
        }, "image/webp", QUALITY);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(fail("Image illisible ou format non pris en charge."));
      };
      img.src = url;
    });
  }

  /* Nom imprévisible : le dépôt est public, et un chemin dérivé du nom du
     membre se devinerait. */
  function randomName(ext) {
    var s = "";
    var AL = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 16; i++) s += AL.charAt(Math.floor(Math.random() * AL.length));
    return "members/" + s + ext;
  }

  function upload(file) {
    var SB = window.ACCI_SB;
    if (!SB) return Promise.reject(fail("Module de dépôt indisponible."));
    if (!SB.session()) return Promise.reject(fail("Session expirée : reconnectez-vous dans « Images du site »."));
    return shrink(file).then(function (out) {
      var path = randomName(out.ext);
      return SB.upload(path, out.blob).then(function () { return SB.publicUrl(path); });
    });
  }

  window.ACCI_PHOTO = { upload: upload, shrink: shrink, MAX: MAX };
})();
