/* =========================================================================
   ACCI — Logo vectoriel, tampon officiel, attestation et badge social
   -------------------------------------------------------------------------
   L'ACCI promet à ses membres un « Badge Créateur responsable » et une
   validation formelle de l'adhésion. Ce module produit les pièces qui
   matérialisent cette promesse :

     ACCI_CERT.logo(opts)     — le logo de l'ACCI, en tracés
     ACCI_CERT.seal(opts)     — le tampon rond officiel
     ACCI_CERT.html(data)     — l'attestation A4 prête à imprimer
     ACCI_CERT.badge(data)    — le badge carré à publier sur les réseaux
     ACCI_CERT.download(data) — l'enregistrement du badge en PNG

   Tout est dessiné en SVG : aucune bibliothèque PDF ne peut être installée
   ici, l'impression du navigateur produit un PDF de qualité équivalente sur
   un tracé vectoriel, et le badge se rastérise à la taille voulue sans que
   rien ne se pixelise. C'est aussi la raison pour laquelle le logo est
   redessiné en tracés plus bas plutôt que chargé depuis le PNG livré : au
   format du tampon comme à l'impression, un logo bitmap se serait vu.

   Le module ne touche pas aux données : admin.js délivre et révoque, ce
   fichier ne fait que dessiner. Les valeurs affichées sont échappées, car
   elles proviennent de fiches saisies ou importées.
   ========================================================================= */
(function () {
  "use strict";

  var A = window.ACCI_ADMIN;
  if (!A) return;
  var esc = A.ui.esc;

  /* Couleurs relevées dans assets/img/logo-wordmark-480.png : ce sont celles
     du logo lui-même, non celles de la charte du site, qui en diffèrent
     légèrement. Un logo doit rester identique à lui-même. */
  var ORANGE = "#FF7105";
  var GREEN  = "#03976B";
  var SLATE  = "#363636";

  var INK   = "#0B7A3B";        /* le tampon s'encre d'une seule couleur */
  var PAPER = "#0B3D2E";        /* vert sombre des titres de l'attestation */

  var uid = 0;

  /* --------------------------------------------------------------------- */
  /* Logo                                                                  */
  /* --------------------------------------------------------------------- */
  /* Géométrie relevée au pixel sur le PNG livré (480 × 293) :
       A       sommet (134,28), pieds (14,269) et (247,269), creux (133,116)
       C vert  centre (321,146), rayons 133 et 99, ouverture de 90° à l'est
       C orange même centre, rayons 80 et 45, même ouverture
       I       rectangle (430,68) de 38 × 168
     Le « A » passe derrière le C vert : il est détouré par un masque, et non
     recouvert d'un disque blanc, sans quoi le disque se verrait dès que le
     logo est posé sur autre chose que du blanc — le badge social, justement,
     a un fond vert sombre. */
  var LOGO_BOX = { x: 14, y: 13, w: 454, h: 266, cx: 241, cy: 146 };

  function logoParts(c) {
    var id = "acci-cut-" + (++uid);
    return '<defs><mask id="' + id + '">' +
        '<rect x="0" y="0" width="480" height="293" fill="#fff"/>' +
        '<circle cx="321" cy="146" r="147" fill="#000"/>' +
      '</mask></defs>' +
      '<path d="M134 28 247 269 203 269 133 116 57 269 14 269Z" ' +
            'fill="' + c.a + '" mask="url(#' + id + ')"/>' +
      '<path d="M415.05 240.05A133 133 0 1 1 415.05 51.95L391 76A99 99 0 1 0 391 216Z" ' +
            'fill="' + c.c1 + '"/>' +
      '<path d="M377.57 202.57A80 80 0 1 1 377.57 89.43L352.82 114.18A45 45 0 1 0 352.82 177.82Z" ' +
            'fill="' + c.c2 + '"/>' +
      '<rect x="430" y="68" width="38" height="168" fill="' + c.i + '"/>';
  }

  function colours(o) {
    return o.ink
      ? { a: o.ink, c1: o.ink, c2: o.ink, i: o.ink }
      : { a: o.a || ORANGE, c1: o.c1 || GREEN, c2: o.c2 || ORANGE, i: o.i || SLATE };
  }

  /* opts : {a, c1, c2, i} couleurs — {ink} pour une version d'une seule encre
     (tampon, télécopie, photocopie) — {width, height, cls} pour la mise en page. */
  function logo(opts) {
    var o = opts || {};
    return '<svg class="' + (o.cls || "acci-logo") + '" ' +
        'viewBox="' + LOGO_BOX.x + ' ' + LOGO_BOX.y + ' ' + LOGO_BOX.w + ' ' + LOGO_BOX.h + '" ' +
        (o.width ? 'width="' + o.width + '" ' : '') +
        (o.height ? 'height="' + o.height + '" ' : '') +
        'role="img" aria-label="ACCI">' + logoParts(colours(o)) + '</svg>';
  }

  /* Le même logo posé dans un dessin plus grand : largeur voulue, centre
     voulu, et le facteur d'échelle qui va avec. */
  function logoAt(cx, cy, width, col) {
    var s = width / LOGO_BOX.w;
    return '<g transform="translate(' + (cx - LOGO_BOX.cx * s).toFixed(2) + ',' +
        (cy - LOGO_BOX.cy * s).toFixed(2) + ') scale(' + s.toFixed(5) + ')">' +
      logoParts(col) + '</g>';
  }

  /* --------------------------------------------------------------------- */
  /* Guillochis                                                            */
  /* --------------------------------------------------------------------- */
  /* Le fond ondé des documents officiels : des anneaux dont le rayon oscille,
     décalés les uns des autres, qui finissent par se tisser. Il est calculé
     et non dessiné à la main — c'est ce qui permet de le réaccorder à
     n'importe quel format sans le refaire. */
  function guilloche(cx, cy, o) {
    o = o || {};
    var rings = o.rings || 6, r0 = o.r || 300, step = o.step || 17;
    var amp = o.amp || 24, lobes = o.lobes || 22, phase = o.phase || 0.5;
    var n = o.n || 240, out = "", j, i, t, r, pts;
    for (j = 0; j < rings; j++) {
      pts = [];
      for (i = 0; i <= n; i++) {
        t = i / n * Math.PI * 2;
        r = r0 - j * step + amp * Math.cos(lobes * t + j * phase);
        pts.push((i ? "L" : "M") + (cx + r * Math.cos(t)).toFixed(1) +
                 " " + (cy + r * Math.sin(t)).toFixed(1));
      }
      out += '<path d="' + pts.join("") + 'Z"/>';
    }
    return '<g fill="none" stroke="' + (o.stroke || INK) + '" ' +
        'stroke-width="' + (o.sw || 0.8) + '" opacity="' + (o.opacity || 0.075) + '">' +
      out + '</g>';
  }

  /* --------------------------------------------------------------------- */
  /* Tampon                                                                */
  /* --------------------------------------------------------------------- */
  /* Un sceau officiel se lit sur deux arcs : la raison sociale en couronne
     haute, le pays en couronne basse. L'arc bas est tracé dans le sens
     inverse (drapeau de balayage 0, de 9 h vers 3 h en passant par 6 h) sans
     quoi les lettres sortent la tête en bas — le défaut qui trahit
     immédiatement un faux tampon. Deux étoiles ferment la couronne à 9 h et
     3 h, et le logo occupe le cœur, d'une seule encre. */
  function seal(opts) {
    opts = opts || {};
    var size = opts.size || 190;
    var number = opts.number || "";
    var date = opts.date || "";
    var ink = opts.ink || INK;
    /* Le tampon porte le niveau : « CRÉATEUR RESPONSABLE » n'est que le
       premier des trois. Le mot CRÉATEUR est fixe, seul le rang change. */
    var label = "CRÉATEUR " + (opts.label || "RESPONSABLE");
    var rot = opts.rotate === undefined ? -7 : opts.rotate;
    var n = ++uid;                /* les identifiants d'arc doivent rester
                                     uniques : plusieurs tampons cohabitent
                                     sur la même page (attestation + badge). */

    return '' +
    '<svg class="seal" viewBox="0 0 240 240" width="' + size + '" height="' + size + '" ' +
        'role="img" aria-label="Tampon officiel de l\'ACCI" ' +
        'style="transform:rotate(' + rot + 'deg)">' +
      '<defs>' +
        /* Couronne haute : 9 h vers 3 h par le haut. */
        '<path id="seal-top-' + n + '" d="M 120,120 m -87,0 a 87,87 0 1,1 174,0" fill="none"/>' +
        /* Couronne basse : 9 h vers 3 h par le bas, lettres à l\'endroit. */
        '<path id="seal-bot-' + n + '" d="M 120,120 m -96,0 a 96,96 0 1,0 192,0" fill="none"/>' +
      '</defs>' +

      /* Trois filets : le trait fort porte le sceau, les deux fins encadrent
         la couronne et isolent le cœur. */
      '<g fill="none" stroke="' + ink + '">' +
        '<circle cx="120" cy="120" r="116" stroke-width="4.5"/>' +
        '<circle cx="120" cy="120" r="107" stroke-width="1.3"/>' +
        '<circle cx="120" cy="120" r="74"  stroke-width="1.6"/>' +
      '</g>' +

      '<g font-family="Georgia,&quot;Times New Roman&quot;,serif" fill="' + ink + '">' +
        /* La couronne haute est calée à la main plutôt que centrée par
           text-anchor : WebKit combine mal « startOffset 50 % + text-anchor
           middle + textLength » et décale le texte d'un caractère vers la
           gauche, le « A » d'ASSOCIATION disparaissant sous l'étoile de 9 h.
           L'arc mesure π × 87 ≈ 273 unités ; pour un texte ramené à 250, il
           reste 23 unités à répartir, soit 4,3 % de part et d'autre.
           textLength est porté par le textPath et non par le text : sur le
           parent, WebKit l'ignore également. */
        '<text font-size="9.4" font-weight="700">' +
          '<textPath href="#seal-top-' + n + '" startOffset="4.3%" ' +
              'textLength="250" lengthAdjust="spacing">' +
            'ASSOCIATION DES CRÉATEURS DE CONTENU IVOIRIENS' +
          '</textPath>' +
        '</text>' +
        '<text font-size="10" font-weight="700" letter-spacing="3">' +
          '<textPath href="#seal-bot-' + n + '" startOffset="50%" text-anchor="middle">' +
            'CÔTE D\'IVOIRE' +
          '</textPath>' +
        '</text>' +
      '</g>' +

      /* Étoiles de fermeture, au milieu de la bande des couronnes */
      star(29, 120, 6.5, ink) + star(211, 120, 6.5, ink) +

      /* Le logo de l'ACCI, d'une seule encre, au cœur du sceau */
      logoAt(120, 78, 76, { a: ink, c1: ink, c2: ink, i: ink }) +

      '<g text-anchor="middle" fill="' + ink + '" ' +
          'font-family="Georgia,&quot;Times New Roman&quot;,serif">' +
        '<text x="120" y="122" font-size="16" font-weight="700" letter-spacing="3.8">CERTIFIÉ</text>' +
        '<text x="120" y="144" font-size="' + (label.length > 20 ? 8.2 : 9) + '" ' +
            'font-weight="700" letter-spacing="0.9">' + esc(label) + '</text>' +
        (number
          ? '<text x="120" y="160" font-size="7.8" letter-spacing="0.4" opacity=".85">' +
            'N° ' + esc(number) + '</text>' : '') +
        (date
          ? '<text x="120" y="172" font-size="7.2" letter-spacing="0.3" opacity=".72">' +
            esc(date) + '</text>' : '') +
      '</g>' +
      '<line x1="86" y1="129" x2="154" y2="129" stroke="' + ink + '" stroke-width="1.1"/>' +
    '</svg>';
  }

  /* Étoile à cinq branches, centrée en (cx, cy). Calculée plutôt que recopiée :
     le tampon en place deux, à la même taille. */
  function star(cx, cy, r, fill) {
    var pts = [], i, ang, rad;
    for (i = 0; i < 10; i++) {
      ang = (Math.PI / 5) * i - Math.PI / 2;
      rad = i % 2 ? r * 0.42 : r;
      pts.push((cx + rad * Math.cos(ang)).toFixed(2) + "," + (cy + rad * Math.sin(ang)).toFixed(2));
    }
    return '<polygon points="' + pts.join(" ") + '" fill="' + (fill || INK) + '"/>';
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
    return d.getDate() + " " + MOIS[d.getMonth()] + " " + d.getFullYear();
  }

  function yearOf(iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? "" : String(d.getFullYear());
  }

  /* data : {name, type, city, number, date, expiry, president} */
  function html(data) {
    data = data || {};
    injectStyles();
    var qualite = data.type === "Entreprise" ? "Structure de création de contenu"
                                             : "Créateur de contenu";
    var ref = data.number || "—";
    var payload = encodeURIComponent(JSON.stringify({
      name: data.name || "", type: data.type || "",
      number: data.number || "", date: data.date || ""
    }));

    return '' +
    '<div class="cert" id="cert-sheet">' +
      '<div class="cert__frame">' +
        /* Fond ondé : imprimé, il donne au document sa texture de pièce
           officielle ; à l'écran il reste assez pâle pour ne rien gêner. */
        '<div class="cert__ground" aria-hidden="true">' +
          '<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">' +
            guilloche(500, 500, { r: 430, rings: 11, step: 15, amp: 13, lobes: 52,
                                  n: 470, sw: 0.55, opacity: 0.085 }) +
          '</svg>' +
        '</div>' +

        '<div class="cert__inner">' +
          '<header class="cert__head">' +
            logo({ cls: "cert__logo", height: 62 }) +
            '<p class="cert__org">Association des Créateurs de Contenu Ivoiriens</p>' +
            '<p class="cert__country">République de Côte d\'Ivoire</p>' +
          '</header>' +

          '<span class="cert__fleuron" aria-hidden="true"><i></i><b></b><i></i></span>' +

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
            '<div class="cert__seal">' +
              seal({ number: data.number, date: fmtLong(data.date) }) +
            '</div>' +
            '<div class="cert__meta">' +
              '<p><span>Délivrée le</span><b>' + fmtLong(data.date) + '</b></p>' +
              (data.expiry ? '<p><span>Valable jusqu\'au</span><b>' + fmtLong(data.expiry) + '</b></p>' : '') +
              '<p><span>Référence</span><b>' + esc(ref) + '</b></p>' +
            '</div>' +
          '</div>' +

          '<p class="cert__verify">' +
            'L\'authenticité de cette attestation se vérifie auprès de l\'ACCI, ' +
            'sur présentation de la référence ' + esc(ref) + '.' +
          '</p>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Le badge n'appartient pas à l'attestation : il ne s'imprime pas, il se
       télécharge. Il est présenté ici parce que c'est là que l'on vient
       chercher les pièces d'un membre. */
    badgePanel(data, { level: "certifie" });
  }

  /* --------------------------------------------------------------------- */
  /* Badges sociaux                                                        */
  /* --------------------------------------------------------------------- */
  /* Deux modèles, trois teintes, trois niveaux : dix-huit pièces, toutes
     tirées des mêmes tracés. Le carré traverse le fil d'actualité et la
     story ; le rond est fait pour la photo de profil, que les plateformes
     détourent en cercle de toute façon.

     Chaque teinte porte les trois couleurs de l'ACCI — vert, orange, blanc.
     Ce qui change d'une variante à l'autre est celle qui domine, et c'est
     elle qui lui donne son nom. Aucun texte n'est posé sur un fond qui ne
     lui donne pas 4,5:1 : le fond orange est #B34F00 et non l'orange de
     marque, sur lequel du blanc ne donnerait que 2,63:1. */
  var BADGE = 1200;

  var MODELS = { carre: "Carré", rond: "Rond" };

  /* Les trois rangs de l'adhésion. Les étoiles ne décorent pas : elles
     comptent le niveau, et c'est le seul repère lisible quand le badge est
     réduit à une vignette. */
  var LEVELS = {
    responsable:   { l: "Responsable",   t: "RESPONSABLE",   k: "SIGNATAIRE DE LA CHARTE", s: 1 },
    certifie:      { l: "Certifié",      t: "CERTIFIÉ",      k: "MEMBRE CERTIFIÉ",         s: 2 },
    professionnel: { l: "Professionnel", t: "PROFESSIONNEL", k: "MEMBRE PROFESSIONNEL",    s: 3 }
  };

  var PALETTES = {
    vert: {
      l: "Vert", bg: "#07301F", outer: "#EAF3EE",
      logo: { a: ORANGE, c1: "#2FBF8D", c2: ORANGE, i: "#FFFFFF" },
      frame: ORANGE, hair: "#FFFFFF", eyebrow: ORANGE, title: "#FFFFFF",
      name: "#EAF3EE", dim: "#96BBA8", rule: ORANGE, ink: "#EAF3EE", grid: "#FFFFFF"
    },
    orange: {
      l: "Orange", bg: "#B34F00", outer: "#FFF1E4",
      logo: { a: "#FFFFFF", c1: "#07301F", c2: "#FFFFFF", i: "#07301F" },
      frame: "#07301F", hair: "#FFFFFF", eyebrow: "#0B3D2E", title: "#FFFFFF",
      name: "#FFF1E4", dim: "#FFE0C2", rule: "#07301F", ink: "#FFFFFF", grid: "#FFFFFF"
    },
    blanc: {
      l: "Blanc", bg: "#FFFFFF", outer: "#0B3D2E",
      logo: { a: ORANGE, c1: GREEN, c2: ORANGE, i: SLATE },
      frame: GREEN, hair: ORANGE, eyebrow: "#A34700", title: "#0B3D2E",
      name: "#14201B", dim: "#55625B", rule: ORANGE, ink: INK, grid: INK
    }
  };

  function pick(map, key, fallback) {
    return Object.prototype.hasOwnProperty.call(map, String(key)) ? String(key) : fallback;
  }

  /* Rangée d'étoiles centrée : une, deux ou trois selon le rang. */
  function rank(cx, cy, count, r, fill) {
    var gap = r * 2.7, out = "", i, x0 = cx - (count - 1) * gap / 2;
    for (i = 0; i < count; i++) out += star(x0 + i * gap, cy, r, fill);
    return out;
  }

  /* Un nom long rétrécit plutôt que de déborder du cadre. */
  function nameSizeFor(name, base) {
    var n = name.length;
    return n > 30 ? base - 22 : n > 22 ? base - 14 : n > 15 ? base - 7 : base;
  }

  function squareBody(name, yr, ref, p, lv) {
    return '<rect width="1200" height="1200" fill="' + p.bg + '"/>' +
      guilloche(600, 600, { r: 545, rings: 12, step: 22, amp: 22, lobes: 40,
                            n: 480, stroke: p.grid, opacity: 0.07, sw: 1 }) +
      '<rect x="40" y="40" width="1120" height="1120" rx="26" fill="none" ' +
          'stroke="' + p.frame + '" stroke-width="3" opacity=".65"/>' +
      '<rect x="54" y="54" width="1092" height="1092" rx="18" fill="none" ' +
          'stroke="' + p.hair + '" stroke-width="1" opacity=".2"/>' +

      logoAt(600, 228, 356, p.logo) +
      rank(600, 348, lv.s, 17, p.rule) +

      '<g text-anchor="middle" font-family="Georgia,&quot;Times New Roman&quot;,serif">' +
        '<text x="600" y="412" font-size="25" letter-spacing="8" fill="' + p.eyebrow + '">' +
          esc(lv.k) + (yr ? " · " + esc(yr) : "") + '</text>' +
        '<text x="600" y="526" font-size="96" font-weight="700" fill="' + p.title + '">CRÉATEUR</text>' +
        '<text x="600" y="626" font-size="96" font-weight="700" fill="' + p.title + '">' + lv.t + '</text>' +
        (name ? '<text x="600" y="728" font-size="' + nameSizeFor(name, 58) + '" fill="' + p.name + '">' +
          esc(name) + '</text>' : '') +
      '</g>' +
      '<line x1="470" y1="774" x2="730" y2="774" stroke="' + p.rule + '" ' +
          'stroke-width="2" opacity=".75"/>' +

      '<g transform="translate(475,817)">' +
        seal({ size: 250, ink: p.ink, rotate: 0, label: lv.t }) +
      '</g>' +

      '<text x="600" y="1132" text-anchor="middle" fill="' + p.dim + '" font-size="22" ' +
          'letter-spacing="3" font-family="Georgia,&quot;Times New Roman&quot;,serif">' +
        'ivoiriens.ac.ci' + (ref ? "  ·  " + esc(ref) : "") + '</text>';
  }

  /* Le modèle rond est un médaillon : le disque porte le dessin, et le carré
     qui l'entoure prend la couleur complémentaire de la teinte, pour que la
     pièce reste lisible aussi bien sur un fond clair que sombre. Les deux
     couronnes suivent la même règle que le tampon — l'arc bas est tracé à
     l'envers pour que les lettres restent à l'endroit. */
  function roundBody(name, yr, ref, p, lv) {
    var n = ++uid;
    return '<defs>' +
        '<clipPath id="rb-disc-' + n + '"><circle cx="600" cy="600" r="576"/></clipPath>' +
        '<path id="rb-top-' + n + '" d="M 600,600 m -490,0 a 490,490 0 1,1 980,0" fill="none"/>' +
        '<path id="rb-bot-' + n + '" d="M 600,600 m -520,0 a 520,520 0 1,0 1040,0" fill="none"/>' +
      '</defs>' +

      '<rect width="1200" height="1200" fill="' + p.outer + '"/>' +
      '<circle cx="600" cy="600" r="576" fill="' + p.bg + '"/>' +
      '<g clip-path="url(#rb-disc-' + n + ')">' +
        guilloche(600, 600, { r: 520, rings: 11, step: 26, amp: 20, lobes: 38,
                              n: 460, stroke: p.grid, opacity: 0.07, sw: 1 }) +
      '</g>' +
      '<circle cx="600" cy="600" r="556" fill="none" stroke="' + p.frame + '" stroke-width="7"/>' +
      '<circle cx="600" cy="600" r="538" fill="none" stroke="' + p.hair + '" ' +
          'stroke-width="1.5" opacity=".3"/>' +

      '<g font-family="Georgia,&quot;Times New Roman&quot;,serif" fill="' + p.dim + '">' +
        '<text font-size="34" font-weight="700">' +
          '<textPath href="#rb-top-' + n + '" startOffset="11.7%" ' +
              'textLength="1180" lengthAdjust="spacing">' +
            'ASSOCIATION DES CRÉATEURS DE CONTENU IVOIRIENS' +
          '</textPath></text>' +
        '<text font-size="29" font-weight="700" letter-spacing="9">' +
          '<textPath href="#rb-bot-' + n + '" startOffset="50%" text-anchor="middle">' +
            'CÔTE D\'IVOIRE · ACCI.CI' +
          '</textPath></text>' +
      '</g>' +
      star(95, 600, 16, p.rule) + star(1105, 600, 16, p.rule) +

      logoAt(600, 392, 316, p.logo) +
      rank(600, 504, lv.s, 16, p.rule) +

      '<g text-anchor="middle" font-family="Georgia,&quot;Times New Roman&quot;,serif">' +
        '<text x="600" y="562" font-size="23" letter-spacing="7" fill="' + p.eyebrow + '">' +
          esc(lv.k) + (yr ? " · " + esc(yr) : "") + '</text>' +
        '<text x="600" y="668" font-size="88" font-weight="700" fill="' + p.title + '">CRÉATEUR</text>' +
        '<text x="600" y="758" font-size="88" font-weight="700" fill="' + p.title + '">' + lv.t + '</text>' +
        (name ? '<text x="600" y="850" font-size="' + nameSizeFor(name, 52) + '" fill="' + p.name + '">' +
          esc(name) + '</text>' : '') +
        (ref ? '<text x="600" y="922" font-size="21" letter-spacing="3" fill="' + p.dim + '">' +
          'RÉF. ' + esc(ref) + '</text>' : '') +
      '</g>' +
      '<line x1="505" y1="888" x2="695" y2="888" stroke="' + p.rule + '" ' +
          'stroke-width="2" opacity=".75"/>';
  }

  function badgeSVG(data, opts) {
    data = data || {};
    opts = opts || {};
    var model = pick(MODELS, opts.model, "carre");
    var p  = PALETTES[pick(PALETTES, opts.palette, "vert")];
    var lv = LEVELS[pick(LEVELS, opts.level, "certifie")];
    var name = String(data.name || "").trim();
    var yr = yearOf(data.date);
    var ref = data.number || "";

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" ' +
        'width="' + BADGE + '" height="' + BADGE + '" ' +
        (opts.forExport ? '' : 'class="badge-svg" ') +
        'role="img" aria-label="Badge ACCI, créateur ' + esc(lv.t.toLowerCase()) +
        (name ? ", " + esc(name) : "") + '">' +
      (model === "rond" ? roundBody(name, yr, ref, p, lv)
                        : squareBody(name, yr, ref, p, lv)) +
    '</svg>';
  }

  function badge(data, opts) { return badgeSVG(data, opts); }

  /* --------------------------------------------------------------------- */
  /* Téléchargement                                                        */
  /* --------------------------------------------------------------------- */
  /* Le SVG est rastérisé par le navigateur puis enregistré. Deux précautions :
     le dessin ne doit dépendre d'aucune police chargée à distance — une image
     rastérisée n'emporte pas les feuilles de style de la page, et le texte
     retomberait sur une police par défaut ; et chaque blob doit être libéré,
     sans quoi l'image reste en mémoire après chaque téléchargement. */
  function slug(s) {
    var v = String(s || "").toLowerCase();
    if (v.normalize) v = v.normalize("NFD").replace(/[̀-ͯ]/g, "");
    v = v.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
    return v || "membre";
  }

  function download(data, opts, done) {
    if (typeof opts === "function") { done = opts; opts = {}; }
    opts = opts || {};
    var svg = badgeSVG(data, {
      model: opts.model, palette: opts.palette, level: opts.level, forExport: true
    });
    var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var img = new Image();

    img.onload = function () {
      var c = document.createElement("canvas");
      c.width = BADGE; c.height = BADGE;
      var ctx = c.getContext("2d");
      /* Le canevas est transparent par défaut : sans ce fond, le PNG sortirait
         noir dans les applications qui aplatissent la couche alpha. */
      ctx.fillStyle = "#07301F";
      ctx.fillRect(0, 0, BADGE, BADGE);
      ctx.drawImage(img, 0, 0, BADGE, BADGE);
      URL.revokeObjectURL(url);

      c.toBlob(function (out) {
        if (!out) { done && done("Le navigateur n'a pas pu produire l'image."); return; }
        var href = URL.createObjectURL(out);
        var a = document.createElement("a");
        a.href = href;
        /* Le nom de fichier dit ce qu'il contient : six pièces peuvent
           cohabiter dans le même dossier de téléchargement. */
        a.download = ["badge-acci", slug(data && data.name),
                      pick(MODELS, opts.model, "carre"),
                      pick(PALETTES, opts.palette, "vert"),
                      pick(LEVELS, opts.level, "certifie")].join("-") + ".png";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(href); a.remove(); }, 2000);
        done && done(null);
      }, "image/png");
    };

    img.onerror = function () {
      URL.revokeObjectURL(url);
      done && done("Le badge n'a pas pu être rendu par ce navigateur.");
    };

    img.src = url;
  }

  /* --------------------------------------------------------------------- */
  /* Panneau de sélection                                                  */
  /* --------------------------------------------------------------------- */
  function optBtn(kind, key, label, on, swatch) {
    return '<button type="button" class="badge-opt' + (on ? " is-on" : "") + '" ' +
        'data-' + kind + '="' + key + '" aria-pressed="' + (on ? "true" : "false") + '">' +
      (swatch ? '<i class="badge-opt__dot" style="background:' + swatch + '"></i>' : '') +
      esc(label) + '</button>';
  }

  function pickRow(label, kind, map, current, swatchOf, labelOf) {
    var keys = Object.keys(map), i, out = '';
    for (i = 0; i < keys.length; i++) {
      out += optBtn(kind, keys[i], labelOf(map[keys[i]]), keys[i] === current,
                    swatchOf ? swatchOf(map[keys[i]]) : null);
    }
    return '<div class="badge-pick__row"><span class="badge-pick__lbl">' + label + '</span>' +
      out + '</div>';
  }

  /* L'état vit sur la section elle-même : la modale peut être refermée et
     rouverte sans qu'aucune variable de module ne se désynchronise. */
  function badgePanel(data, opts) {
    injectStyles();
    data = data || {};
    opts = opts || {};
    var model = pick(MODELS, opts.model, "carre");
    var palk  = pick(PALETTES, opts.palette, "vert");
    var lvl   = pick(LEVELS, opts.level, "certifie");
    var payload = encodeURIComponent(JSON.stringify({
      name: data.name || "", number: data.number || "", date: data.date || ""
    }));

    return '<section class="badge-block" data-badge="' + payload + '" ' +
        'data-model="' + model + '" data-pal="' + palk + '" data-lvl="' + lvl + '">' +
      '<div class="badge-block__head"><div>' +
        '<h3>Badges pour les réseaux sociaux</h3>' +
        '<p>Deux modèles, trois teintes, trois niveaux. Image de 1200 × 1200, à publier ' +
           'en photo de profil, en story ou dans le fil. Le fichier est enregistré sur ' +
           'cet appareil ; rien n\'est envoyé.</p>' +
      '</div></div>' +
      '<div class="badge-pick">' +
        pickRow("Modèle", "model", MODELS, model, null, function (v) { return v; }) +
        pickRow("Couleur", "pal", PALETTES, palk,
                function (v) { return v.bg; }, function (v) { return v.l; }) +
        pickRow("Niveau", "lvl", LEVELS, lvl, null, function (v) { return v.l; }) +
      '</div>' +
      '<div class="badge-block__preview" data-badge-preview>' +
        badgeSVG(data, { model: model, palette: palk, level: lvl }) +
      '</div>' +
      '<div class="badge-block__act">' +
        '<button type="button" class="abtn abtn--primary badge-dl">' +
          'Télécharger ce badge (PNG)</button>' +
      '</div>' +
      '<p class="badge-block__err" hidden></p>' +
    '</section>';
  }

  /* Ouvre les badges dans leur propre fenêtre, sans passer par l'attestation :
     un membre peut vouloir son badge sans réimprimer son attestation. */
  function openBadges(data) {
    if (!A.ui.openModal) return;
    data = data || {};
    A.ui.openModal(
      '<div class="modal__head"><h2>Badges — ' + esc(data.name || "membre") + '</h2>' +
        '<button class="modal__x" data-close>&times;</button></div>' +
      '<div class="modal__body">' + badgePanel(data, { level: opts0(data) }) + '</div>' +
      '<div class="modal__foot"><span style="flex:1"></span>' +
        '<button class="abtn abtn--ghost" data-close>Fermer</button></div>', true);
  }

  /* Un membre certifié ouvre sur « Certifié », les autres sur « Responsable » :
     le rang proposé par défaut doit être celui que le membre détient. */
  function opts0(data) { return data && data.number ? "certifie" : "responsable"; }

  function boxState(box) {
    var data;
    try { data = JSON.parse(decodeURIComponent(box.getAttribute("data-badge") || "{}")); }
    catch (e) { data = {}; }
    return { data: data, opts: {
      model: box.getAttribute("data-model"),
      palette: box.getAttribute("data-pal"),
      level: box.getAttribute("data-lvl")
    } };
  }

  function renderPreview(box) {
    var host = box.querySelector("[data-badge-preview]");
    if (!host) return;
    var st = boxState(box);
    host.innerHTML = badgeSVG(st.data, st.opts);
  }

  /* Les commandes sont produites par ce module, donc écoutées par ce module :
     passer par admin.js obligerait à retoucher la fenêtre modale à chaque
     pièce nouvelle. La délégation survit à la fermeture et à la réouverture. */
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;

    /* Choix d'un modèle, d'une teinte ou d'un niveau */
    var opt = t.closest(".badge-opt");
    if (opt) {
      var obox = opt.closest(".badge-block");
      if (!obox) return;
      var kind = opt.hasAttribute("data-model") ? "model"
               : opt.hasAttribute("data-pal") ? "pal" : "lvl";
      obox.setAttribute("data-" + kind, opt.getAttribute("data-" + kind));
      /* Une seule option allumée par rangée. */
      var sibs = opt.parentNode.querySelectorAll(".badge-opt"), i;
      for (i = 0; i < sibs.length; i++) {
        if (sibs[i] === opt) sibs[i].classList.add("is-on");
        else sibs[i].classList.remove("is-on");
        sibs[i].setAttribute("aria-pressed", sibs[i] === opt ? "true" : "false");
      }
      renderPreview(obox);
      return;
    }

    /* Téléchargement de la pièce affichée */
    var btn = t.closest(".badge-dl");
    if (!btn) return;
    var box = btn.closest(".badge-block");
    if (!box) return;
    var err = box.querySelector(".badge-block__err");
    var st = boxState(box);

    var was = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Préparation…";
    if (err) err.hidden = true;

    download(st.data, st.opts, function (msg) {
      btn.disabled = false;
      btn.textContent = was;
      if (msg) {
        if (err) { err.textContent = msg; err.hidden = false; }
        return;
      }
      if (A.ui.toast) A.ui.toast("Badge enregistré.");
    });
  });

  /* --------------------------------------------------------------------- */
  /* Styles                                                                */
  /* --------------------------------------------------------------------- */
  /* Posés par le module plutôt que dans admin.css : l'attestation et le badge
     forment une pièce à part, et les garder ici évite de toucher une feuille
     de style que tous les autres écrans se partagent. Le bloc est injecté
     après admin.css, il l'emporte donc à spécificité égale. */
  var styled = false;
  function injectStyles() {
    if (styled) return;
    styled = true;
    var css = [
      '.cert{background:#fff;color:#14201b;padding:6px;}',
      '.cert__frame{position:relative;display:flex;flex-direction:column;overflow:hidden;',
        'border:1px solid rgba(11,61,46,.55);padding:5px;background:#fff;}',
      '.cert__inner{position:relative;z-index:1;display:flex;flex-direction:column;flex:1;',
        'border:2px solid ' + PAPER + ';padding:34px 44px 24px;text-align:center;}',
      '.cert__ground{position:absolute;inset:0;z-index:0;pointer-events:none;}',
      '.cert__ground svg{width:100%;height:100%;display:block;}',

      '.cert__head{margin-bottom:10px;}',
      '.cert__logo{height:62px;width:auto;display:block;margin:0 auto;}',
      '.cert__org{margin:12px 0 0;font-size:11px;letter-spacing:.17em;text-transform:uppercase;',
        'color:' + PAPER + ';font-weight:600;}',
      '.cert__country{margin:4px 0 0;font-size:10px;letter-spacing:.22em;',
        'text-transform:uppercase;color:#8a968f;}',

      '.cert__fleuron{display:flex;align-items:center;justify-content:center;gap:10px;',
        'margin:16px auto 4px;width:210px;}',
      '.cert__fleuron i{flex:1;height:1px;background:linear-gradient(90deg,transparent,' + PAPER + ');opacity:.5;}',
      '.cert__fleuron i:last-child{background:linear-gradient(90deg,' + PAPER + ',transparent);}',
      '.cert__fleuron b{width:7px;height:7px;transform:rotate(45deg);background:' + ORANGE + ';}',

      '.cert__title{font-family:Georgia,"Times New Roman",serif;font-size:30px;font-weight:700;',
        'margin:10px 0 3px;color:' + PAPER + ';}',
      '.cert__sub{margin:0 0 20px;font-size:11.5px;letter-spacing:.24em;',
        'text-transform:uppercase;color:#A34700;}',
      '.cert__lead{margin:0;font-size:13px;color:#3d4a44;font-style:italic;}',
      '.cert__name{font-family:Georgia,"Times New Roman",serif;font-size:33px;font-weight:700;',
        'margin:10px 0 3px;color:#14201b;line-height:1.15;}',
      '.cert__qual{margin:0 0 18px;font-size:12.5px;color:#6b776f;}',
      '.cert__body{max-width:500px;margin:0 auto;font-size:13px;line-height:1.7;color:#3d4a44;}',
      '.cert__body b{color:' + PAPER + ';}',

      '.cert__foot{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;',
        'margin-top:auto;padding-top:34px;text-align:left;}',
      '.cert__sig{flex:1;min-width:0;}',
      '.cert__sigline{border-bottom:1px solid #14201b;height:32px;max-width:168px;}',
      '.cert__signame{margin:6px 0 0;font-size:12.5px;font-weight:700;}',
      '.cert__sigrole{margin:1px 0 0;font-size:11px;color:#6b776f;}',
      '.cert__seal{flex:0 0 auto;}',
      '.seal{display:block;}',
      '.cert__meta{flex:1;text-align:right;font-size:11px;color:#3d4a44;}',
      '.cert__meta p{margin:0 0 8px;display:flex;flex-direction:column;gap:1px;}',
      '.cert__meta span{color:#8a968f;letter-spacing:.09em;text-transform:uppercase;font-size:8.5px;}',
      '.cert__meta b{font-size:12px;}',
      '.cert__verify{margin:22px 0 0;font-size:9.5px;color:#93a09a;',
        'border-top:1px solid rgba(11,61,46,.14);padding-top:10px;}',

      '.badge-block{margin:22px 0 0;border-top:1px solid var(--line,#e4eae6);padding-top:20px;}',
      '.badge-block__head{display:flex;align-items:flex-start;justify-content:space-between;',
        'gap:18px;flex-wrap:wrap;}',
      '.badge-block__head h3{margin:0 0 4px;font-size:15px;}',
      '.badge-block__head p{margin:0;font-size:12.5px;color:var(--muted,#6b776f);max-width:48ch;}',
      '.badge-pick{display:flex;flex-direction:column;gap:9px;margin-top:16px;}',
      '.badge-pick__row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}',
      '.badge-pick__lbl{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;',
        'color:var(--muted,#6b776f);width:62px;flex:none;}',
      '.badge-opt{display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:12.5px;',
        'padding:6px 13px;border-radius:999px;border:1px solid var(--line,#e4eae6);',
        'background:#fff;color:var(--ink,#14201b);cursor:pointer;}',
      '.badge-opt:hover{border-color:var(--muted,#6b776f);}',
      '.badge-opt:focus-visible{outline:2px solid ' + ORANGE + ';outline-offset:2px;}',
      '.badge-opt.is-on{background:' + PAPER + ';border-color:' + PAPER + ';color:#fff;}',
      '.badge-opt__dot{width:11px;height:11px;border-radius:50%;flex:none;',
        'box-shadow:inset 0 0 0 1px rgba(0,0,0,.22);}',
      '.badge-block__act{margin-top:16px;display:flex;justify-content:center;}',
      '.badge-block__preview{margin-top:16px;display:flex;justify-content:center;}',
      '.badge-svg{width:100%;max-width:330px;height:auto;display:block;border-radius:12px;',
        'box-shadow:0 8px 26px -12px rgba(7,48,31,.55);}',
      '.badge-block__err{margin:12px 0 0;font-size:12.5px;color:#8f2a20;}',

      '@media print{',
        /* Sous la feuille, le fond gris de l'interface débordait en bas de
           page : la zone imprimée doit être blanche jusqu'au bord. */
        'html,body{background:#fff!important;}',
        '.badge-block{display:none!important;}',
        '.cert{padding:0;}',
        '.cert__frame{min-height:236mm;}',
        /* Les aplats et le fond ondé ne s'impriment pas par défaut. */
        '.cert__frame,.cert__inner,.cert__ground{-webkit-print-color-adjust:exact;print-color-adjust:exact;}',
      '}'
    ].join("");
    var el = document.createElement("style");
    el.setAttribute("data-acci-cert", "");
    el.textContent = css;
    document.head.appendChild(el);
  }

  window.ACCI_CERT = {
    logo: logo, seal: seal, html: html,
    badge: badge, badgePanel: badgePanel, openBadges: openBadges,
    download: download, fmtLong: fmtLong,
    MODELS: MODELS, PALETTES: PALETTES, LEVELS: LEVELS
  };
})();
