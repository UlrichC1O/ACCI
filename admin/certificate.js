/* =========================================================================
   ACCI — Tampon officiel et attestation de certification
   -------------------------------------------------------------------------
   L'ACCI promet à ses membres un « Badge Créateur responsable » et une
   validation formelle de l'adhésion. Ce module produit les deux pièces qui
   matérialisent cette promesse :

     ACCI_CERT.seal(opts)  — le tampon rond officiel, en SVG
     ACCI_CERT.html(data)  — l'attestation A4 prête à imprimer

   Tout est dessiné en SVG et en HTML : aucune bibliothèque PDF ne peut être
   installée ici, et l'impression du navigateur produit un PDF de qualité
   équivalente sur un tracé vectoriel — là où une image bitmap se serait vue.

   Le module ne touche pas aux données : admin.js délivre et révoque, ce
   fichier ne fait que dessiner. Les valeurs affichées sont échappées, car
   elles proviennent de fiches saisies ou importées.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;
  var esc = A.ui.esc;

  var INK = "#0B7A3B";          /* vert ACCI — un tampon officiel s'encre d'une seule couleur */

  /* --------------------------------------------------------------------- */
  /* Tampon                                                                */
  /* --------------------------------------------------------------------- */
  /* Le texte circulaire n'est posé qu'en haut. En bas, il est écrit droit :
     un textPath suivant l'arc inférieur rend les lettres à l'envers sauf à
     inverser le sens du tracé, subtilité qui se voit immédiatement sur un
     document officiel et que rien ici ne permettrait de vérifier avant
     impression. Deux étoiles ferment la couronne, comme sur un sceau. */
  function seal(opts) {
    opts = opts || {};
    var size = opts.size || 190;
    var number = opts.number || "";
    var date = opts.date || "";
    var rot = opts.rotate === undefined ? -7 : opts.rotate;

    /* La couronne est contrainte par textLength : le libellé complet dépasse
       naturellement la longueur de l'arc et se retrouvait tronqué en son
       milieu, « ASSOCIATION » et « IVOIRIENS » passant sous les étoiles.
       L'arc d'un demi-cercle de rayon 84 mesure environ 264 unités ; le texte
       est ramené à 250 pour laisser respirer les deux extrémités. */
    return '' +
    '<svg class="seal" viewBox="0 0 220 220" width="' + size + '" height="' + size + '" ' +
        'role="img" aria-label="Tampon officiel de l\'ACCI" ' +
        'style="transform:rotate(' + rot + 'deg)">' +
      '<defs>' +
        '<path id="seal-arc" d="M 110,110 m -84,0 a 84,84 0 1,1 168,0" fill="none"/>' +
      '</defs>' +
      '<g fill="none" stroke="' + INK + '">' +
        '<circle cx="110" cy="110" r="105" stroke-width="3.5"/>' +
        '<circle cx="110" cy="110" r="96"  stroke-width="1.1"/>' +
        '<circle cx="110" cy="110" r="64"  stroke-width="1.1"/>' +
      '</g>' +

      /* Couronne : raison sociale complète, ajustée à l'arc */
      '<text font-family="Georgia,serif" font-size="8.4" font-weight="700" ' +
            'fill="' + INK + '" textLength="252" lengthAdjust="spacing">' +
        '<textPath href="#seal-arc" startOffset="50%" text-anchor="middle">' +
          'ASSOCIATION DES CRÉATEURS DE CONTENU IVOIRIENS' +
        '</textPath>' +
      '</text>' +

      /* Étoiles de fermeture de la couronne, à 9 h et 3 h */
      star(24, 112, 6) + star(196, 112, 6) +

      /* Cœur du tampon */
      '<g text-anchor="middle" fill="' + INK + '" font-family="Georgia,serif">' +
        star(110, 70, 7) +
        '<text x="110" y="99" font-size="15.5" font-weight="700" letter-spacing="3.4">CERTIFIÉ</text>' +
        '<text x="110" y="120" font-size="13" font-weight="700" letter-spacing="0.6">CRÉATEUR</text>' +
        '<text x="110" y="135" font-size="13" font-weight="700" letter-spacing="0.6">RESPONSABLE</text>' +
      '</g>' +
      '<line x1="78" y1="142" x2="142" y2="142" stroke="' + INK + '" stroke-width="1.1"/>' +
      (number
        ? '<text x="110" y="156" text-anchor="middle" font-family="Georgia,serif" font-size="7.6" ' +
          'letter-spacing="0.3" fill="' + INK + '" opacity=".85">N° ' + esc(number) + '</text>' : '') +

      /* Pied, dans la bande entre les deux cercles : à l'intérieur du cercle
         central il chevauchait le tracé. */
      '<text x="110" y="182" text-anchor="middle" font-family="Georgia,serif" ' +
            'font-size="11.5" font-weight="700" letter-spacing="2.2" fill="' + INK + '">' +
        'CÔTE D\'IVOIRE</text>' +
      (date
        ? '<text x="110" y="196" text-anchor="middle" font-family="Georgia,serif" font-size="8" ' +
          'letter-spacing="0.5" fill="' + INK + '" opacity=".7">' + esc(date) + '</text>' : '') +
    '</svg>';
  }

  /* Étoile à cinq branches, centrée en (cx, cy). Calculée plutôt que recopiée :
     le tampon en place quatre à des tailles différentes. */
  function star(cx, cy, r) {
    var pts = [], i, ang, rad;
    for (i = 0; i < 10; i++) {
      ang = (Math.PI / 5) * i - Math.PI / 2;
      rad = i % 2 ? r * 0.42 : r;
      pts.push((cx + rad * Math.cos(ang)).toFixed(2) + "," + (cy + rad * Math.sin(ang)).toFixed(2));
    }
    return '<polygon points="' + pts.join(" ") + '" fill="' + INK + '"/>';
  }

  /* --------------------------------------------------------------------- */
  /* Attestation                                                           */
  /* --------------------------------------------------------------------- */
  function fmtLong(iso) {
    if (!iso) return "—";
    var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                "août", "septembre", "octobre", "novembre", "décembre"];
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.getDate() + " " + MOIS[d.getMonth()] + " " + d.getFullYear();
  }

  /* data : {name, type, city, number, date, expiry, president} */
  function html(data) {
    data = data || {};
    var qualite = data.type === "Entreprise" ? "Structure de création de contenu"
                                             : "Créateur de contenu";
    return '' +
    '<div class="cert" id="cert-sheet">' +
      '<div class="cert__frame">' +
        '<header class="cert__head">' +
          '<img class="cert__logo" src="../assets/img/logo-wordmark-480.png" alt="ACCI">' +
          '<p class="cert__org">Association des Créateurs de Contenu Ivoiriens</p>' +
        '</header>' +

        '<h1 class="cert__title">Attestation de certification</h1>' +
        '<p class="cert__sub">Charte du créateur responsable</p>' +

        '<p class="cert__lead">L\'Association des Créateurs de Contenu Ivoiriens certifie que</p>' +
        '<p class="cert__name">' + esc(data.name || "—") + '</p>' +
        '<p class="cert__qual">' + esc(qualite) +
          (data.city ? ' — ' + esc(data.city) : '') + '</p>' +

        '<p class="cert__body">' +
          'a souscrit à la <b>Charte du créateur responsable</b> et s\'engage à en respecter ' +
          'les principes : véracité de l\'information, respect de la dignité des personnes, ' +
          'protection des mineurs et usage éthique des réseaux sociaux en Côte d\'Ivoire.' +
        '</p>' +

        '<div class="cert__foot">' +
          '<div class="cert__sig">' +
            '<div class="cert__sigline"></div>' +
            '<p class="cert__signame">' + esc(data.president || "Le Président") + '</p>' +
            '<p class="cert__sigrole">Pour l\'ACCI</p>' +
          '</div>' +
          '<div class="cert__seal">' + seal({ number: data.number, date: fmtLong(data.date) }) + '</div>' +
          '<div class="cert__meta">' +
            '<p><span>Délivrée le</span><br><b>' + fmtLong(data.date) + '</b></p>' +
            (data.expiry ? '<p><span>Valable jusqu\'au</span><br><b>' + fmtLong(data.expiry) + '</b></p>' : '') +
            '<p><span>Référence</span><br><b>' + esc(data.number || "—") + '</b></p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  window.ACCI_CERT = { seal: seal, html: html, fmtLong: fmtLong };
})();
