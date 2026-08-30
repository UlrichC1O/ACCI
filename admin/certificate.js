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
  /* Un sceau officiel se lit sur deux arcs : la raison sociale en couronne
     haute, le pays en couronne basse. L'arc bas est tracé dans le sens
     inverse (drapeau de balayage 0, de 9 h vers 3 h en passant par 6 h) sans
     quoi les lettres sortent la tête en bas — le défaut qui trahit
     immédiatement un faux tampon. Deux étoiles ferment la couronne à 9 h et
     3 h, et l'emblème de l'ACCI occupe le cœur.

     L'emblème est repris tel quel de assets/img/favicon.svg, mais redessiné
     d'un seul trait : un tampon s'encre d'une seule couleur, et le dégradé
     orange-vert de l'original n'aurait aucun sens sur un document tamponné.
     Il reste vectoriel, donc net à l'impression, là où le logo en PNG se
     serait vu pixelisé au format du sceau. */
  function seal(opts) {
    opts = opts || {};
    var size = opts.size || 190;
    var number = opts.number || "";
    var date = opts.date || "";
    var rot = opts.rotate === undefined ? -7 : opts.rotate;

    /* La couronne haute est contrainte par textLength : le libellé complet
       dépasse la longueur de l'arc et se retrouvait tronqué en son milieu.
       Le demi-arc de rayon 87 mesure environ 273 unités ; le texte est ramené
       à 248 pour laisser respirer les deux extrémités. */
    return '' +
    '<svg class="seal" viewBox="0 0 240 240" width="' + size + '" height="' + size + '" ' +
        'role="img" aria-label="Tampon officiel de l\'ACCI" ' +
        'style="transform:rotate(' + rot + 'deg)">' +
      '<defs>' +
        /* Couronne haute : 9 h vers 3 h par le haut. */
        '<path id="seal-top" d="M 120,120 m -87,0 a 87,87 0 1,1 174,0" fill="none"/>' +
        /* Couronne basse : 9 h vers 3 h par le bas, lettres à l\'endroit. */
        '<path id="seal-bot" d="M 120,120 m -96,0 a 96,96 0 1,0 192,0" fill="none"/>' +
      '</defs>' +

      /* Trois filets : le trait fort porte le sceau, les deux fins encadrent
         la couronne et isolent le cœur. */
      '<g fill="none" stroke="' + INK + '">' +
        '<circle cx="120" cy="120" r="116" stroke-width="4.5"/>' +
        '<circle cx="120" cy="120" r="107" stroke-width="1.3"/>' +
        '<circle cx="120" cy="120" r="74"  stroke-width="1.6"/>' +
      '</g>' +

      '<g font-family="Georgia,&quot;Times New Roman&quot;,serif" fill="' + INK + '">' +
        /* La couronne haute est calée à la main plutôt que centrée par
           text-anchor : WebKit combine mal « startOffset 50 % + text-anchor
           middle + textLength » et décalait le texte d'un caractère vers la
           gauche, le « A » d'ASSOCIATION disparaissant sous l'étoile de 9 h.
           L'arc mesure π × 87 ≈ 273 unités ; pour un texte ramené à 250, il
           reste 23 unités à répartir, soit 4,3 % de part et d'autre.
           textLength est porté par le textPath, pas par le text : sur le
           parent, WebKit l'ignore aussi. */
        '<text font-size="9.4" font-weight="700">' +
          '<textPath href="#seal-top" startOffset="4.3%" ' +
              'textLength="250" lengthAdjust="spacing">' +
            'ASSOCIATION DES CRÉATEURS DE CONTENU IVOIRIENS' +
          '</textPath>' +
        '</text>' +
        '<text font-size="10" font-weight="700" letter-spacing="3">' +
          '<textPath href="#seal-bot" startOffset="50%" text-anchor="middle">' +
            'CÔTE D\'IVOIRE' +
          '</textPath>' +
        '</text>' +
      '</g>' +

      /* Étoiles de fermeture, au milieu de la bande des couronnes */
      star(29, 120, 6.5) + star(211, 120, 6.5) +

      /* Emblème de l\'ACCI : bouclier, ondes et point, d\'un seul trait */
      '<g transform="translate(92.4,52.5) scale(1.15)" fill="none" stroke="' + INK + '" ' +
          'stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M24 7l13 5v9c0 8.2-5.5 14.4-13 16.4C16.5 35.4 11 29.2 11 21v-9l13-5z"/>' +
        '<path d="M16.5 18a11 11 0 0 1 15 0"/>' +
        '<path d="M19.5 21.5a6.5 6.5 0 0 1 9 0"/>' +
        '<circle cx="24" cy="26" r="2.2" fill="' + INK + '" stroke="none"/>' +
      '</g>' +

      /* Cœur du tampon */
      '<g text-anchor="middle" fill="' + INK + '" ' +
          'font-family="Georgia,&quot;Times New Roman&quot;,serif">' +
        '<text x="120" y="117" font-size="16.5" font-weight="700" letter-spacing="4">CERTIFIÉ</text>' +
        '<text x="120" y="140" font-size="9.2" font-weight="700" letter-spacing="0.9">' +
          'CRÉATEUR RESPONSABLE</text>' +
        (number
          ? '<text x="120" y="157" font-size="8" letter-spacing="0.4" opacity=".85">' +
            'N° ' + esc(number) + '</text>' : '') +
        (date
          ? '<text x="120" y="170" font-size="7.4" letter-spacing="0.3" opacity=".72">' +
            esc(date) + '</text>' : '') +
      '</g>' +
      '<line x1="84" y1="125" x2="156" y2="125" stroke="' + INK + '" stroke-width="1.1"/>' +
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
