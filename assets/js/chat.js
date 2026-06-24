/* =========================================================================
   ACCI — Assistant conversationnel (sans serveur)
   Petit agent à base de règles : il oriente vers les bonnes pages du site.
   ========================================================================= */
(function () {
  "use strict";

  var fab = document.getElementById("chat-fab");
  var panel = document.getElementById("chat-panel");
  var closeBtn = document.getElementById("chat-close");
  var body = document.getElementById("chat-body");
  var quick = document.getElementById("chat-quick");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  if (!fab || !panel) return;

  function norm(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  /* ---- Base de connaissances ---- */
  var INTENTS = [
    {
      keys: ["bonjour", "salut", "bonsoir", "coucou", "hello", "cc"],
      reply: "Bonjour et bienvenue 👋 Je suis l'assistant de l'ACCI. Comment puis-je vous aider aujourd'hui ?",
      links: []
    },
    {
      keys: ["adher", "membre", "rejoindre", "inscri", "adhesion", "cotisation"],
      reply: "Super ! Pour rejoindre l'ACCI, il suffit de lire la charte du créateur responsable puis de remplir le formulaire d'adhésion. C'est ouvert à tous les créateurs, débutants comme confirmés.",
      links: [["Devenir membre", "adhesion.html"], ["Lire la charte", "charte.html"]]
    },
    {
      keys: ["harcel", "harcele", "insult", "menace", "intimid", "raid", "attaque"],
      reply: "Je suis désolé que vous viviez cela. En cas de cyberharcèlement : ne répondez pas à l'agresseur, conservez les preuves (captures d'écran), bloquez et signalez. Vous n'êtes pas seul(e) — notre cellule d'écoute est confidentielle.",
      links: [["Cyberharcèlement", "cyberharcelement.html"], ["Cellule d'écoute", "cellule-ecoute.html"], ["Signaler", "signaler-abus.html"]]
    },
    {
      keys: ["signal", "denonc", "abus", "plainte", "contenu choquant"],
      reply: "Pour signaler un contenu ou un comportement abusif : conservez les preuves, signalez à la plateforme concernée, puis transmettez-nous la situation. Chaque signalement protège d'autres personnes.",
      links: [["Signaler un abus", "signaler-abus.html"]]
    },
    {
      keys: ["arnaq", "escroq", "fraude", "broute", "faux investiss", "argent facile", "phishing", "hameconn"],
      reply: "Méfiance : si une offre paraît trop belle pour être vraie, c'en est presque toujours une arnaque. Ne payez jamais d'avance et ne communiquez pas vos codes. Découvrez comment reconnaître et déjouer les escroqueries.",
      links: [["Arnaques en ligne", "cyber-escroquerie.html"], ["Signaler", "signaler-abus.html"]]
    },
    {
      keys: ["fake", "fausse", "rumeur", "desinform", "intox", "verifier", "verification", "fact"],
      reply: "Avant de partager : marquez une pause, vérifiez la source, recoupez l'information et vérifiez les images. Le doute ? On s'abstient. Voici nos guides anti fausses nouvelles.",
      links: [["Désinformation", "desinformation.html"], ["Vérifier l'information", "verification-information.html"]]
    },
    {
      keys: ["formation", "atelier", "apprendre", "former", "cours", "webinaire"],
      reply: "L'ACCI propose des formations pour les créateurs, les jeunes et le grand public : esprit critique, sécurité numérique, création responsable, parentalité numérique…",
      links: [["Nos formations", "formations.html"], ["Guide du débutant", "guide-debutant.html"]]
    },
    {
      keys: ["don", "donner", "soutenir", "financer", "contribuer", "aider l'acci"],
      reply: "Merci pour votre élan ! Vos dons financent nos campagnes, nos formations et la cellule d'écoute. Don ponctuel ou régulier, chaque contribution compte.",
      links: [["Faire un don", "faire-un-don.html"], ["Devenir partenaire", "partenaires.html"]]
    },
    {
      keys: ["enfant", "mineur", "ado", "parent", "ecole", "jeune"],
      reply: "La protection des plus jeunes est une priorité. Dialogue, contrôle parental, réglages de confidentialité et écoute sont vos meilleurs alliés. Nous proposons aussi des ressources pour les parents et les écoles.",
      links: [["Protection des mineurs", "protection-mineurs.html"], ["Ressources", "ressources.html"]]
    },
    {
      keys: ["sextorsion", "chantage", "photo intime", "nude", "image intime"],
      reply: "Si vous êtes victime de chantage à l'image : ne payez pas, ne renvoyez rien, conservez les preuves, bloquez et demandez de l'aide. Vous n'êtes pas coupable, et notre cellule d'écoute est là, en toute confidentialité.",
      links: [["Chantage & sextorsion", "sextorsion.html"], ["Cellule d'écoute", "cellule-ecoute.html"]]
    },
    {
      keys: ["securit", "mot de passe", "pirat", "hack", "compte vole", "2fa", "double authent", "proteger mon compte"],
      reply: "Pour sécuriser vos comptes : mots de passe longs et uniques, double authentification (2FA) partout, et méfiance face aux liens suspects. Voici notre guide de cybersécurité.",
      links: [["Sécurité numérique", "securite-numerique.html"], ["Vie privée", "vie-privee.html"]]
    },
    {
      keys: ["charte", "engagement", "deontolog", "ethique", "regles"],
      reply: "La Charte du créateur responsable, ce sont 10 engagements simples pour créer de façon éthique. Les signataires reçoivent le badge « Créateur responsable ACCI ».",
      links: [["La charte", "charte.html"], ["Code de déontologie", "deontologie.html"]]
    },
    {
      keys: ["qui", "acci", "association", "mission", "a propos", "presentation"],
      reply: "L'ACCI est l'Association des Créateurs de Contenu Ivoiriens : une initiative citoyenne et indépendante qui promeut un usage responsable des réseaux sociaux et lutte contre les dérives en ligne.",
      links: [["Qui sommes-nous", "a-propos.html"], ["Notre combat", "notre-combat.html"]]
    },
    {
      keys: ["contact", "joindre", "telephone", "email", "mail", "adresse", "ecrire"],
      reply: "Vous pouvez nous écrire via le formulaire de contact, par e-mail à contact@acci.ci ou nous appeler au +225 27 22 00 00 00.",
      links: [["Nous contacter", "contact.html"]]
    },
    {
      keys: ["merci", "thanks", "super", "parfait", "ok"],
      reply: "Avec plaisir 🙂 Je reste disponible si vous avez d'autres questions !",
      links: []
    }
  ];

  var QUICK = [
    ["Devenir membre", "Comment adhérer à l'ACCI ?"],
    ["Signaler un abus", "Je veux signaler un abus"],
    ["Victime de harcèlement", "Je suis victime de harcèlement"],
    ["Nos formations", "Quelles formations proposez-vous ?"],
    ["Faire un don", "Comment faire un don ?"]
  ];

  function findIntent(text) {
    var q = norm(text);
    var best = null, score = 0;
    INTENTS.forEach(function (it) {
      var s = 0;
      it.keys.forEach(function (k) { if (q.indexOf(norm(k)) !== -1) s++; });
      if (s > score) { score = s; best = it; }
    });
    return score > 0 ? best : null;
  }

  function searchFallback(text) {
    var idx = window.SEARCH_INDEX || [];
    var q = norm(text);
    var words = q.split(/\s+/).filter(function (w) { return w.length > 2; });
    var hits = idx.map(function (it) {
      var hay = norm(it.t + " " + it.d + " " + it.s);
      var s = 0;
      words.forEach(function (w) { if (hay.indexOf(w) !== -1) s++; if (norm(it.t).indexOf(w) !== -1) s++; });
      return { it: it, s: s };
    }).filter(function (h) { return h.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3);
    return hits.map(function (h) { return [h.it.t, h.it.u]; });
  }

  /* ---- Affichage ---- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addMsg(text, who, links) {
    var row = el("div", "cmsg cmsg--" + who);
    var bub = el("div", "cmsg__bubble", text);
    row.appendChild(bub);
    if (links && links.length) {
      var lk = el("div", "cmsg__links");
      links.forEach(function (l) {
        var a = el("a", "cmsg__link", l[0]);
        a.href = l[1];
        lk.appendChild(a);
      });
      bub.appendChild(lk);
    }
    body.appendChild(row);
    scrollDown();
  }

  function typing() {
    var row = el("div", "cmsg cmsg--bot cmsg--typing");
    row.innerHTML = '<div class="cmsg__bubble"><span class="ctyping"><i></i><i></i><i></i></span></div>';
    body.appendChild(row);
    scrollDown();
    return row;
  }

  function botRespond(text) {
    var t = typing();
    setTimeout(function () {
      t.remove();
      var intent = findIntent(text);
      if (intent) {
        addMsg(intent.reply, "bot", intent.links);
      } else {
        var hits = searchFallback(text);
        if (hits.length) {
          addMsg("Voici des pages qui pourraient répondre à votre question :", "bot", hits);
        } else {
          addMsg("Je n'ai pas trouvé de réponse précise. Vous pouvez consulter le plan du site ou nous écrire directement — notre équipe vous répondra.", "bot",
            [["Plan du site", "plan-du-site.html"], ["Nous contacter", "contact.html"]]);
        }
      }
    }, 650);
  }

  function renderQuick() {
    quick.innerHTML = "";
    QUICK.forEach(function (q) {
      var b = el("button", "chat__chip", q[0]);
      b.type = "button";
      b.addEventListener("click", function () { handleUser(q[1]); });
      quick.appendChild(b);
    });
  }

  function handleUser(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg(text, "user");
    botRespond(text);
  }

  /* ---- Ouverture / fermeture ---- */
  var started = false;
  function openChat() {
    panel.hidden = false;
    requestAnimationFrame(function () { panel.classList.add("is-open"); });
    fab.setAttribute("aria-expanded", "true");
    fab.classList.add("is-active");
    if (!started) {
      started = true;
      addMsg("Bonjour 👋 Je suis l'assistant de l'ACCI. Posez-moi votre question, ou choisissez un sujet ci-dessous.", "bot");
      renderQuick();
    }
    setTimeout(function () { input && input.focus(); }, 250);
  }
  function closeChat() {
    panel.classList.remove("is-open");
    fab.setAttribute("aria-expanded", "false");
    fab.classList.remove("is-active");
    setTimeout(function () { panel.hidden = true; }, 250);
  }

  fab.addEventListener("click", function () {
    fab.getAttribute("aria-expanded") === "true" ? closeChat() : openChat();
  });
  closeBtn.addEventListener("click", closeChat);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleUser(input.value);
    input.value = "";
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && fab.getAttribute("aria-expanded") === "true") closeChat();
  });
})();
