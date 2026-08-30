/* =========================================================================
   ACCI — Sélecteur d'image partagé
   -------------------------------------------------------------------------
   Choisir une image se fait de deux façons dans l'administration :
     * dans la photothèque du site — les déclinaisons responsives (640, 1024,
       1600) existent déjà, rien n'est téléversé ni recompilé ;
     * par envoi d'un fichier, réduit puis déposé dans le dépôt site-images.

   POURQUOI UN MODULE À PART. partners.js portait déjà ce sélecteur, et la
   rubrique Galerie en avait besoin à son tour. La deuxième copie aurait
   divergé de la première au premier correctif — c'est exactement ce que le
   commentaire de gallery.js redoutait. Le sélecteur vit donc ici, et les
   rubriques l'appellent.

   CE QUE RENVOIE LE SÉLECTEUR. Toujours l'une des deux formes que le site
   sait résoudre (voir assets/js/site-gallery.js et site-partners.js) :
     * une CLÉ de photothèque   → "formation.jpg"
     * une URL https complète   → dépôt public site-images
   Rien d'autre. Le champ texte reste accessible dessous : coller une adresse
   doit rester possible sans passer par la fenêtre.

   TAILLE. Un fichier envoyé est réduit à 1600 px de côté avant l'envoi. Un
   appareil récent produit des photos de plusieurs mégaoctets, alors que la
   plus grande déclinaison servie par le site fait 1600 px : téléverser
   l'original coûterait le stockage au bureau et le forfait de données au
   visiteur, sans un pixel visible de plus.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;
  var esc = A.ui.esc, toast = A.ui.toast;

  var MAX_SIDE = 1600;
  var inventory = null;

  (function styles() {
    if (document.getElementById("acci-picker-css")) return;
    var l = document.createElement("link");
    l.id = "acci-picker-css";
    l.rel = "stylesheet";
    l.href = "/admin/image-picker.css";
    document.head.appendChild(l);
  })();

  function isURL(v) { return /^https?:\/\//i.test(String(v || "")); }

  /* Adresse d'aperçu côté administration. Les pages d'admin vivent dans
     /admin/, d'où le préfixe relatif. */
  function src(image, width) {
    if (!image) return "";
    if (isURL(image)) return image;
    var stem = String(image).replace(/\.[a-z0-9]+$/i, "");
    return "../assets/img/" + stem + "-" + (width || 640) + ".webp";
  }

  /* La photothèque n'est chargée qu'à l'ouverture : c'est le plus gros
     fichier de l'interface, et la plupart des écrans n'en ont pas besoin. */
  function load() {
    if (inventory) return Promise.resolve(inventory);
    return fetch("../assets/img/inventory.json").then(function (r) {
      if (!r.ok) throw new Error("Photothèque introuvable — recompilez le site.");
      return r.json();
    }).then(function (j) {
      inventory = (j && Array.isArray(j.images)) ? j.images : [];
      return inventory;
    });
  }

  /* --------------------------------------------------------------------- */
  /* Fenêtre de choix                                                      */
  /* --------------------------------------------------------------------- */
  /* Volontairement PAS openModal() : l'administration n'a qu'un seul
     conteneur #modal, et openModal() en remplace le contenu. Ouvrir la
     photothèque par-dessus un formulaire détruisait donc ce formulaire, et le
     refermer ne laissait plus rien — la photo choisie était écrite dans un
     nœud détaché que personne ne revoyait. Le sélecteur pose sa propre
     surcouche au-dessus, et le formulaire reste intact dessous. */
  function choose(onPick) {
    var back = document.createElement("div");
    back.className = "ip-modal";
    back.setAttribute("role", "dialog");
    back.setAttribute("aria-modal", "true");
    back.setAttribute("aria-label", "Photothèque du site");
    back.innerHTML = '<div class="ip-modal__box"><div class="ip-modal__head">' +
      "<h2>Photothèque du site</h2>" +
      '<button type="button" class="ip-modal__x" aria-label="Fermer">&times;</button></div>' +
      '<div class="ip-modal__body"><p class="muted">Chargement…</p></div></div>';
    document.body.appendChild(back);

    var body = back.querySelector(".ip-modal__body");
    var head = back.querySelector(".ip-modal__head h2");

    function close() {
      document.removeEventListener("keydown", onKey);
      if (back.parentNode) back.parentNode.removeChild(back);
    }
    function onKey(e) { if (e.key === "Escape" || e.key === "Esc") { e.stopPropagation(); close(); } }
    document.addEventListener("keydown", onKey);
    back.querySelector(".ip-modal__x").addEventListener("click", close);
    back.addEventListener("click", function (e) { if (e.target === back) close(); });

    load().then(function (imgs) {
      head.textContent = "Photothèque du site (" + imgs.length + ")";
      body.innerHTML =
        '<input type="search" class="ip-q" placeholder="Filtrer par nom de fichier…" autocomplete="off">' +
        '<div class="ip-grid">' + imgs.map(function (im) {
          var k = String(im.key);
          return '<button type="button" class="ip-img" data-key="' + esc(k) + '" title="' + esc(k) + '">' +
            '<img src="' + esc(src(k)) + '" alt="" loading="lazy">' +
            "<span>" + esc(k) + "</span></button>";
        }).join("") + "</div>" +
        '<p class="muted ip-none" hidden>Aucune image ne correspond.</p>';

      var q = body.querySelector(".ip-q");
      var tiles = body.querySelectorAll(".ip-img");
      var none = body.querySelector(".ip-none");
      q.addEventListener("input", function () {
        var v = q.value.trim().toLowerCase(), shown = 0;
        Array.prototype.forEach.call(tiles, function (b) {
          var hit = !v || b.getAttribute("data-key").toLowerCase().indexOf(v) >= 0;
          b.hidden = !hit;
          if (hit) shown++;
        });
        none.hidden = shown > 0;
      });
      q.focus();
      Array.prototype.forEach.call(tiles, function (b) {
        b.addEventListener("click", function () {
          var key = b.getAttribute("data-key");
          close();
          onPick(key);
        });
      });
    }).catch(function (e) {
      head.textContent = "Photothèque indisponible";
      body.innerHTML = '<p class="muted">' + esc(e.message) + "</p>";
    });
  }

  /* --------------------------------------------------------------------- */
  /* Téléversement                                                         */
  /* --------------------------------------------------------------------- */
  function upload(file, folder) {
    var SB = window.ACCI_SB, PH = window.ACCI_PHOTO;
    if (!SB || !SB.upload) return Promise.reject(new Error("Module de dépôt indisponible."));
    if (!PH || !PH.shrink) return Promise.reject(new Error("Module de réduction indisponible."));
    if (!/^image\//.test(file.type)) return Promise.reject(new Error("Ce fichier n’est pas une image."));

    return PH.shrink(file, MAX_SIDE).then(function (out) {
      /* Nom neuf à chaque envoi : un nom stable serait resservi depuis le
         cache du visiteur, et l'ancienne image resterait affichée. */
      var name = "";
      var AL = "abcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 16; i++) name += AL.charAt(Math.floor(Math.random() * AL.length));
      var path = (folder || "site") + "/" + name + out.ext;
      return SB.upload(path, out.blob).then(function () { return SB.publicUrl(path); });
    });
  }

  /* --------------------------------------------------------------------- */
  /* Champ prêt à l'emploi                                                 */
  /* --------------------------------------------------------------------- */
  /* Rend un bloc « aperçu + boutons + champ texte » et renvoie de quoi le
     brancher. Le champ texte reste la source de vérité : les boutons ne font
     que le remplir, ce qui garde le collage d'adresse possible et évite un
     état caché qui divergerait de ce qui est affiché. */
  function fieldHTML(id, value, label, hint) {
    return '<div class="ip-field">' +
      '<span class="afield__label">' + esc(label || "Image") + "</span>" +
      '<div class="ip-row">' +
        '<span class="ip-preview" id="' + id + '-prev">' +
          (value ? '<img src="' + esc(src(value)) + '" alt="">' : '<i>aucune</i>') +
        "</span>" +
        '<div class="ip-actions">' +
          '<button type="button" class="abtn abtn--ghost abtn--sm" id="' + id + '-pick">Choisir dans la photothèque</button>' +
          '<label class="abtn abtn--ghost abtn--sm ip-up">Téléverser une image' +
            '<input type="file" id="' + id + '-file" accept="image/*" hidden></label>' +
          '<input type="text" id="' + id + '" value="' + esc(value || "") + '" ' +
            'placeholder="formation.jpg ou https://…">' +
        "</div>" +
      "</div>" +
      (hint ? '<small class="muted">' + hint + "</small>" : "") +
    "</div>";
  }

  function bindField(id, folder) {
    var input = document.getElementById(id);
    var prev = document.getElementById(id + "-prev");
    if (!input) return;

    function set(v) {
      input.value = v;
      if (!prev) return;
      prev.innerHTML = "";
      if (!v) { prev.innerHTML = "<i>aucune</i>"; return; }
      var im = document.createElement("img");
      im.src = src(v);
      im.alt = "";
      /* Une clé inexistante afficherait une icône cassée : on le dit. */
      im.addEventListener("error", function () { prev.innerHTML = "<i>introuvable</i>"; });
      prev.appendChild(im);
    }

    input.addEventListener("input", function () { set(input.value.trim()); });

    var pick = document.getElementById(id + "-pick");
    if (pick) pick.addEventListener("click", function () { choose(set); });

    var file = document.getElementById(id + "-file");
    if (file) file.addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      toast("Téléversement…");
      upload(f, folder).then(function (url) {
        set(url);
        toast("Image téléversée.");
      }).catch(function (err) { toast(err.message, "err"); });
      file.value = "";        /* réenvoyer le même fichier doit rester possible */
    });
  }

  window.ACCI_PICK = {
    choose: choose,
    upload: upload,
    src: src,
    isURL: isURL,
    fieldHTML: fieldHTML,
    bindField: bindField,
    MAX_SIDE: MAX_SIDE
  };
})();
