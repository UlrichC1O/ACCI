/* =========================================================================
   ACCI — Primitives cryptographiques de l'espace d'administration
   -------------------------------------------------------------------------
   Ce module fabrique et vérifie les secrets de connexion : codes des portails
   Membre et Artiste Pro, mots de passe administrateurs.

   Trois principes, chacun en réponse à un défaut constaté :

   1. L'aléa vient de crypto.getRandomValues, jamais de Math.random. Le
      générateur de Math.random (xorshift128+) n'est pas conçu pour cela : la
      connaissance de quelques tirages suffit à reconstituer son état interne,
      donc à prédire tous les codes suivants. Un membre qui reçoit son propre
      code pouvait ainsi deviner celui des autres.

   2. Le code n'est jamais conservé. Seuls sont enregistrés un sel et une
      empreinte PBKDF2-HMAC-SHA-256. Le fichier des membres, ses exports CSV et
      JSON, ses sauvegardes et le journal d'audit cessent donc de contenir les
      identifiants eux-mêmes : les lire ne permet plus de se connecter ailleurs.

   3. La vérification ne dépend pas d'un contexte sécurisé. crypto.subtle
      n'existe qu'en https ou sur localhost ; un dossier dist/ ouvert en file://
      ne l'a pas. Le repli est une implémentation JavaScript du MÊME algorithme
      et des MÊMES paramètres — une empreinte calculée sur un poste reste donc
      vérifiable sur l'autre. Sans cela, migrer d'un mode à l'autre aurait
      invalidé tous les codes existants.
   ========================================================================= */
(function () {
  "use strict";

  /* Paramètres de dérivation. Ils sont inscrits dans chaque fiche (champ
     codeAlgo / passAlgo) : les faire évoluer plus tard n'invalidera pas les
     empreintes déjà calculées, qui resteront vérifiables avec les leurs. */
  var ITER = 100000;
  var ALGO = "pbkdf2-sha256-100000";

  /* Alphabet des codes : base 32 sans I, L, O ni U. Les quatre lettres
     retirées sont celles que l'on confond en lisant un code à voix haute ou en
     le recopiant depuis un message — et une lettre mal recopiée est un appel de
     plus au secrétariat, pas une tentative d'intrusion. */
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var ID_LEN = 4;      /* partie publique : retrouve la fiche, ne prouve rien   */
  var SECRET_LEN = 8;  /* partie secrète : 40 bits, vérifiée contre l'empreinte */

  /* ------------------------------ SHA-256 -------------------------------- */
  /* Repli pur JavaScript, utilisé quand crypto.subtle est absent. */

  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

  var W = new Int32Array(64);

  function sha256(msg) {
    var H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a,
        H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;
    var l = msg.length;
    var withOne = l + 1;
    var padLen = (withOne % 64 <= 56) ? (56 - withOne % 64) : (120 - withOne % 64);
    var total = withOne + padLen + 8;
    var m = new Uint8Array(total);
    m.set(msg);
    m[l] = 0x80;
    /* Longueur en bits sur 64 bits. Les messages traités ici tiennent très en
       deçà de 2^29 octets, mais la partie haute est écrite tout de même : une
       longueur tronquée donnerait une empreinte fausse plutôt qu'une erreur. */
    var hi = Math.floor(l / 536870912);
    var lo = (l * 8) >>> 0;
    m[total - 8] = (hi >>> 24) & 255; m[total - 7] = (hi >>> 16) & 255;
    m[total - 6] = (hi >>> 8) & 255;  m[total - 5] = hi & 255;
    m[total - 4] = (lo >>> 24) & 255; m[total - 3] = (lo >>> 16) & 255;
    m[total - 2] = (lo >>> 8) & 255;  m[total - 1] = lo & 255;

    for (var i = 0; i < total; i += 64) {
      var t;
      for (t = 0; t < 16; t++) {
        W[t] = (m[i + 4 * t] << 24) | (m[i + 4 * t + 1] << 16) | (m[i + 4 * t + 2] << 8) | m[i + 4 * t + 3];
      }
      for (t = 16; t < 64; t++) {
        var x = W[t - 15], y = W[t - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
      }
      var a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;
      for (t = 0; t < 64; t++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + W[t]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0;
        d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H0 = (H0 + a) | 0; H1 = (H1 + b) | 0; H2 = (H2 + c) | 0; H3 = (H3 + d) | 0;
      H4 = (H4 + e) | 0; H5 = (H5 + f) | 0; H6 = (H6 + g) | 0; H7 = (H7 + h) | 0;
    }
    var out = new Uint8Array(32), hs = [H0, H1, H2, H3, H4, H5, H6, H7];
    for (var j = 0; j < 8; j++) {
      out[4 * j] = (hs[j] >>> 24) & 255; out[4 * j + 1] = (hs[j] >>> 16) & 255;
      out[4 * j + 2] = (hs[j] >>> 8) & 255; out[4 * j + 3] = hs[j] & 255;
    }
    return out;
  }

  function hmacSha256(key, msg) {
    var k = key.length > 64 ? sha256(key) : key;
    var ipad = new Uint8Array(64 + msg.length);
    var opad = new Uint8Array(64 + 32);
    for (var n = 0; n < 64; n++) {
      var kb = n < k.length ? k[n] : 0;
      ipad[n] = kb ^ 0x36;
      opad[n] = kb ^ 0x5c;
    }
    ipad.set(msg, 64);
    opad.set(sha256(ipad), 64);
    return sha256(opad);
  }

  /* PBKDF2-HMAC-SHA-256, longueur de sortie 32 octets — soit exactement un bloc,
     ce qui évite la boucle sur les blocs de la spécification. */
  function pbkdf2JS(pwBytes, saltBytes, iter) {
    var block = new Uint8Array(saltBytes.length + 4);
    block.set(saltBytes);
    block[saltBytes.length + 3] = 1;
    var u = hmacSha256(pwBytes, block);
    var acc = new Uint8Array(32);
    acc.set(u);
    for (var i = 1; i < iter; i++) {
      u = hmacSha256(pwBytes, u);
      for (var j = 0; j < 32; j++) acc[j] ^= u[j];
    }
    return acc;
  }

  /* ------------------------------ Outils --------------------------------- */

  function subtle() {
    /* Absent hors contexte sécurisé (file://, http:// autre que localhost). */
    return (typeof crypto !== "undefined" && crypto.subtle) ? crypto.subtle : null;
  }

  function randomBytes(n) {
    var b = new Uint8Array(n);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      /* getRandomValues, contrairement à crypto.subtle, existe aussi hors
         contexte sécurisé : la génération n'a donc jamais besoin de repli. */
      crypto.getRandomValues(b);
      return b;
    }
    /* Aucun générateur sûr : mieux vaut refuser d'émettre un code que d'en
       émettre un prévisible en laissant croire qu'il protège quelque chose. */
    throw new Error("acci-no-csprng");
  }

  function toHex(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
    return s;
  }

  function fromHex(hex) {
    var n = Math.floor(String(hex || "").length / 2), b = new Uint8Array(n);
    for (var i = 0; i < n; i++) b[i] = parseInt(hex.substr(2 * i, 2), 16) || 0;
    return b;
  }

  function utf8(str) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(String(str));
    var s = unescape(encodeURIComponent(String(str))), b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255;
    return b;
  }

  /* Comparaison à durée constante. Le gain est théorique dans un navigateur,
     mais elle coûte une ligne et supprime la question. */
  function equalHex(a, b) {
    a = String(a || ""); b = String(b || "");
    if (a.length !== b.length || !a.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  /* --------------------------- Dérivation -------------------------------- */

  /* Rend toujours une promesse, que le calcul soit délégué à crypto.subtle ou
     mené en JavaScript : les appelants n'ont qu'un seul chemin à écrire. */
  function derive(secret, saltHex) {
    var pw = utf8(secret), salt = fromHex(saltHex), sub = subtle();
    if (!sub) {
      /* Le calcul pur JavaScript bloque le fil d'exécution : compter ~0,7 s sur
         un ordinateur de bureau, et jusqu'à 3 à 4 s sur un téléphone d'entrée
         de gamme. Ce chemin ne sert qu'en dehors d'un contexte sécurisé — un
         dist/ ouvert en file:// — ; en https et sur localhost, crypto.subtle
         rend la vérification instantanée. Le report d'un tour de boucle laisse
         au bouton le temps d'afficher son état « Vérification… » : sans cela
         l'interface paraît figée sans raison. */
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          try { resolve(toHex(pbkdf2JS(pw, salt, ITER))); } catch (e) { reject(e); }
        }, 0);
      });
    }
    return sub.importKey("raw", pw, { name: "PBKDF2" }, false, ["deriveBits"])
      .then(function (key) {
        return sub.deriveBits({ name: "PBKDF2", salt: salt, iterations: ITER, hash: "SHA-256" }, key, 256);
      })
      .then(function (bits) { return toHex(new Uint8Array(bits)); });
  }

  /* Fabrique { salt, hash, algo } pour un secret donné. */
  function hashSecret(secret) {
    var saltHex = toHex(randomBytes(16));
    return derive(secret, saltHex).then(function (h) {
      return { salt: saltHex, hash: h, algo: ALGO };
    });
  }

  /* Vérifie un secret contre { salt, hash }. Résout à true / false, et ne
     rejette que si la dérivation elle-même échoue. */
  function verifySecret(secret, saltHex, hashHex) {
    if (!saltHex || !hashHex) return Promise.resolve(false);
    return derive(secret, saltHex).then(function (h) { return equalHex(h, hashHex); });
  }

  /* ----------------------------- Codes ----------------------------------- */

  function pick(n) {
    /* Le rejet des tirages ≥ 256 - (256 % 32) écarte le biais de modulo. Avec
       un alphabet de 32 il est nul (256 est un multiple de 32), mais la borne
       est calculée plutôt qu'admise : changer l'alphabet ne doit pas
       introduire silencieusement un biais. */
    var limit = 256 - (256 % ALPHABET.length), out = "";
    while (out.length < n) {
      var b = randomBytes(n * 2);
      for (var i = 0; i < b.length && out.length < n; i++) {
        if (b[i] < limit) out += ALPHABET.charAt(b[i] % ALPHABET.length);
      }
    }
    return out;
  }

  /* Un code se lit « IIII-SSSSSSSS » : les quatre premiers caractères sont un
     identifiant public, les huit suivants le secret.

     Cette coupure n'est pas cosmétique. Une empreinte PBKDF2 coûte ~0,1 s à
     vérifier : parcourir tout le fichier des membres à chaque connexion aurait
     rendu le portail inutilisable dès quelques dizaines de fiches. L'identifiant
     désigne la fiche en une lecture, le secret seul est vérifié — une seule
     dérivation par tentative, quel que soit le nombre de membres. */
  function newCode() {
    return { id: pick(ID_LEN), secret: pick(SECRET_LEN) };
  }

  function formatCode(id, secret) {
    return String(id || "") + "-" + String(secret || "");
  }

  /* Normalise une saisie : majuscules, séparateurs retirés, et les caractères
     absents de l'alphabet ramenés à celui qu'on a voulu écrire. Un code recopié
     avec un O au lieu d'un zéro était rejeté sans que rien ne l'explique. */
  function normalizeCode(input) {
    return String(input == null ? "" : input)
      .toUpperCase()
      .replace(/[\s\-_.]/g, "")
      /* Seules sont réécrites les lettres absentes de l'alphabet : O, I, L et U.
         Q en fait partie et doit rester tel quel — le confondre avec 0 rejetait
         un code sur huit, en affirmant qu'il était invalide. */
      .replace(/O/g, "0")
      .replace(/[IL]/g, "1")
      .replace(/U/g, "V")
      .replace(new RegExp("[^" + ALPHABET + "]", "g"), "");
  }

  /* Découpe une saisie normalisée en { id, secret }. Rend null si la longueur
     ne correspond pas au format actuel — l'appelant peut alors tenter le
     format hérité (8 caractères, code en clair). */
  function splitCode(normalized) {
    if (!normalized || normalized.length !== ID_LEN + SECRET_LEN) return null;
    return { id: normalized.slice(0, ID_LEN), secret: normalized.slice(ID_LEN) };
  }

  /* Masque un code pour l'affichage : « K7M2-••••••3B ». Les portails montraient
     le code en entier dans leur en-tête, donc sur toute capture d'écran, toute
     photo et tout partage d'écran. Ce qui reste visible suffit à reconnaître son
     propre code sans permettre de le rejouer. */
  function maskCode(id, tail) {
    var t = String(tail || "");
    return String(id || "????") + "-" + new Array(SECRET_LEN - t.length + 1).join("•") + t;
  }

  window.ACCI_CRYPTO = {
    ALGO: ALGO,
    ID_LEN: ID_LEN,
    SECRET_LEN: SECRET_LEN,
    CODE_LEN: ID_LEN + SECRET_LEN,
    hasSubtle: function () { return !!subtle(); },
    hashSecret: hashSecret,
    verifySecret: verifySecret,
    newCode: newCode,
    formatCode: formatCode,
    normalizeCode: normalizeCode,
    splitCode: splitCode,
    maskCode: maskCode,
    randomHex: function (n) { return toHex(randomBytes(n)); },
    /* Exposés pour les vérifications ponctuelles (voir tools/test-crypto.html). */
    _sha256Hex: function (s) { return toHex(sha256(utf8(s))); },
    _pbkdf2Hex: function (pw, saltHex, iter) { return toHex(pbkdf2JS(utf8(pw), fromHex(saltHex), iter)); }
  };
})();
