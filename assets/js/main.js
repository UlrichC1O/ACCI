/* =========================================================================
   ACCI — Scripts d'interaction
   Menu mobile, méga-menu, recherche, accordéon, révélations, compteurs.
   ========================================================================= */
(function () {
  "use strict";

  var ACCI = window.ACCI || {};

  /* ---------- En-tête « collé » ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 10);
    var top = document.getElementById("to-top");
    if (top) top.classList.toggle("is-visible", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Bouton retour en haut ---------- */
  var toTop = document.getElementById("to-top");
  if (toTop) toTop.addEventListener("click", function () {
    // Respecte prefers-reduced-motion : un défilement animé sur toute la
    // hauteur d'une page longue est précisément ce que ce réglage écarte.
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector(".burger");
  var mobileNav = document.getElementById("mobile-nav");
  var overlay = document.getElementById("overlay");

  var mobileOpen = false;          // état réel : le double-clic rapide laissait
                                   // auparavant la page bloquée en scroll-lock

  /* Maintient le focus clavier à l'intérieur d'un panneau ouvert (menu, chat) :
     sans cela, la tabulation part dans la page masquée derrière le panneau. */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(panel) {
    return function (e) {
      if (e.key !== "Tab") return;
      var items = Array.prototype.filter.call(
        panel.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
  }
  var mobileTrap = null;

  function openMobile() {
    if (!mobileNav || mobileOpen) return;
    mobileOpen = true;
    mobileNav.hidden = false; overlay.hidden = false;
    requestAnimationFrame(function () {
      mobileNav.classList.add("is-open");
      overlay.classList.add("is-open");
      var first = mobileNav.querySelector(FOCUSABLE);
      if (first) first.focus();
    });
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    mobileTrap = trapFocus(mobileNav);
    document.addEventListener("keydown", mobileTrap);
  }
  function closeMobile(returnFocus) {
    if (!mobileNav || !mobileOpen) return;
    mobileOpen = false;
    mobileNav.classList.remove("is-open");
    overlay.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (mobileTrap) { document.removeEventListener("keydown", mobileTrap); mobileTrap = null; }
    // Le focus doit revenir au bouton qui a ouvert le panneau, sinon il repart
    // au début du document et l'utilisateur clavier perd sa position.
    if (returnFocus !== false && burger) burger.focus();
    setTimeout(function () {
      if (!mobileOpen) { mobileNav.hidden = true; overlay.hidden = true; }
    }, 300);
  }
  if (burger) burger.addEventListener("click", function () {
    mobileOpen ? closeMobile() : openMobile();
  });
  if (overlay) overlay.addEventListener("click", function () { closeMobile(); });

  /* Sous-menus du menu mobile */
  document.querySelectorAll(".mnav__toggle").forEach(function (t) {
    t.addEventListener("click", function () {
      var open = t.getAttribute("aria-expanded") === "true";
      t.setAttribute("aria-expanded", String(!open));
      var sub = t.nextElementSibling;
      if (sub) sub.classList.toggle("is-open", !open);
    });
  });

  /* ---------- Méga-menu : accessibilité clavier ---------- */
  /* Ferme tous les méga-menus. Auparavant seul l'attribut aria-expanded des
     autres boutons était remis à false : leurs styles en ligne subsistaient,
     laissant le premier menu ouvert par-dessus le second. */
  /* L'état ouvert est porté par une classe, plus par des styles en ligne : la
     position du panneau appartient à la feuille de style, et aria-expanded ne
     peut plus diverger de ce qui est affiché. */
  function closeAllMega() {
    document.querySelectorAll(".megamenu").forEach(function (m) {
      m.classList.remove("is-open");
    });
    document.querySelectorAll(".nav__toggle").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll(".nav__toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var item = btn.closest(".nav__item");
      var menu = item ? item.querySelector(".megamenu") : null;
      var open = btn.getAttribute("aria-expanded") === "true";
      closeAllMega();
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        if (menu) menu.classList.add("is-open");
      }
    });
    /* Flèche bas : ouvrir et entrer dans le panneau, comme dans un menu. */
    btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown") return;
      e.preventDefault();
      var item = btn.closest(".nav__item");
      var menu = item ? item.querySelector(".megamenu") : null;
      if (btn.getAttribute("aria-expanded") !== "true") {
        closeAllMega();
        btn.setAttribute("aria-expanded", "true");
        if (menu) menu.classList.add("is-open");
      }
      var first = menu && menu.querySelector(".megamenu__link");
      if (first) first.focus();
    });
  });

  /* Échap ferme le panneau ouvert et ramène le focus sur son bouton, sinon il
     resterait dans un panneau qui vient de disparaître. */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    var open = document.querySelector('.nav__toggle[aria-expanded="true"]');
    if (!open) return;
    closeAllMega();
    open.focus();
  });

  /* Quitter le menu à la tabulation le referme. */
  document.addEventListener("focusin", function (e) {
    var open = document.querySelector('.nav__toggle[aria-expanded="true"]');
    if (open && !e.target.closest(".nav__item--has-children")) closeAllMega();
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav__item--has-children")) closeAllMega();
  });

  /* ---------- Recherche ---------- */
  var searchToggle = document.querySelector(".search-toggle");
  var searchbar = document.querySelector(".searchbar");
  var searchInput = document.getElementById("site-search");
  var searchResults = document.getElementById("search-results");
  var searchClose = document.querySelector(".searchbar__close");

  function setSearchExpanded(open) {
    if (searchToggle) searchToggle.setAttribute("aria-expanded", String(open));
    if (searchInput) searchInput.setAttribute("aria-expanded", String(open));
  }
  function openSearch() {
    if (!searchbar) return;
    searchbar.hidden = false;
    setSearchExpanded(true);
    setTimeout(function () { searchInput && searchInput.focus(); }, 50);
  }
  function closeSearch(returnFocus) {
    if (!searchbar || searchbar.hidden) return;
    searchbar.hidden = true;
    setSearchExpanded(false);
    if (searchResults) { searchResults.classList.remove("is-open"); searchResults.innerHTML = ""; }
    if (searchInput) searchInput.value = "";
    announce("");
    // Rendre le focus au bouton loupe plutôt que de le laisser sur un élément masqué.
    if (returnFocus !== false && searchToggle) searchToggle.focus();
  }
  if (searchToggle) searchToggle.addEventListener("click", function () {
    searchbar.hidden ? openSearch() : closeSearch();
  });
  if (searchClose) searchClose.addEventListener("click", function () { closeSearch(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    // Ne fermer que ce qui est réellement ouvert, pour ne pas voler le focus.
    if (searchbar && !searchbar.hidden) closeSearch();
    else if (mobileOpen) closeMobile();
    else closeAllMega();
  });

  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /* Échappe toute valeur avant insertion dans du HTML (saisie utilisateur
     comprise) — sans cela, taper « <img onerror=…> » exécuterait du script. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Annonce aux lecteurs d'écran le nombre de résultats trouvés. */
  var srStatus = document.getElementById("search-status");
  function announce(msg) { if (srStatus) srStatus.textContent = msg; }
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var q = normalize(searchInput.value.trim());
      var idx = window.SEARCH_INDEX || [];
      if (q.length < 2) {
        searchResults.classList.remove("is-open"); searchResults.innerHTML = "";
        searchInput.setAttribute("aria-expanded", "false"); announce("");
        return;
      }
      var hits = idx.map(function (it) {
        var hay = normalize(it.t + " " + it.d + " " + it.s);
        var score = 0;
        q.split(/\s+/).forEach(function (w) { if (hay.indexOf(w) !== -1) score++; if (normalize(it.t).indexOf(w) !== -1) score += 2; });
        return { it: it, score: score };
      }).filter(function (h) { return h.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 8);

      if (!hits.length) {
        searchResults.innerHTML =
          '<div class="sresult sresult--empty">Aucun résultat pour « ' +
          esc(searchInput.value) + ' ».</div>';
        announce("Aucun résultat.");
      } else {
        searchResults.innerHTML = hits.map(function (h) {
          var sec = h.it.s ? '<span class="sresult__sec">' + esc(h.it.s) + "</span>" : "";
          return '<a class="sresult" href="' + esc(h.it.u) + '">' + sec +
            '<span class="sresult__title">' + esc(h.it.t) + "</span>" +
            '<span class="sresult__desc">' + esc(h.it.d || "") + "</span></a>";
        }).join("");
        announce(hits.length + (hits.length > 1 ? " résultats disponibles." : " résultat disponible."));
      }
      searchResults.classList.add("is-open");
      searchInput.setAttribute("aria-expanded", "true");
    });
  }

  /* ---------- Accordéon ---------- */
  document.querySelectorAll(".accordion__trigger").forEach(function (t) {
    var panel = document.getElementById(t.getAttribute("aria-controls"));
    if (!panel) return;
    t.addEventListener("click", function () {
      var open = t.getAttribute("aria-expanded") === "true";
      t.setAttribute("aria-expanded", String(!open));
      if (open) {
        panel.style.maxHeight = "0";
        // `hidden` est reposé après la transition : un panneau replié doit
        // sortir de l'arbre d'accessibilité, sinon un lecteur d'écran lit des
        // réponses que le bouton annonce pourtant comme masquées.
        setTimeout(function () {
          if (t.getAttribute("aria-expanded") === "false") panel.hidden = true;
        }, 300);
      } else {
        panel.hidden = false;
        requestAnimationFrame(function () { panel.style.maxHeight = panel.scrollHeight + "px"; });
      }
    });
  });

  /* ---------- Révélation au défilement ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var sibs = Array.prototype.slice.call(el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : []);
          var i = sibs.indexOf(el);
          el.style.transitionDelay = (i > 0 ? Math.min(i * 70, 350) : 0) + "ms";
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }

  /* ---------- Compteurs animés ---------- */
  function animateCount(el) {
    var raw = el.getAttribute("data-count") || el.textContent;
    // Sans cette garde, le compteur défilait malgré prefers-reduced-motion.
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var match = String(raw).match(/[\d\s.,]+/);
    if (!match) return;
    var target = parseFloat(match[0].replace(/[\s.,]/g, ""));
    if (isNaN(target)) return;
    var prefix = raw.slice(0, match.index);
    var suffix = raw.slice(match.index + match[0].length);
    var dur = 1500, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.floor(eased * target);
      el.textContent = prefix + val.toLocaleString("fr-FR") + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll(".stat__value[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Année courante ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* =======================================================================
     FORMULAIRES — validation réelle + envoi fonctionnel
     -----------------------------------------------------------------------
     Deux modes d'envoi :
     1) Si ACCI_FORM_ENDPOINT est renseigné (Formspree, Web3Forms, etc.),
        le formulaire est envoyé en arrière-plan par fetch (AJAX).
     2) Sinon, on ouvre le client e-mail du visiteur, pré-rempli
        (mailto), vers l'adresse de contact — fonctionne sans serveur.
     Pour activer l'envoi automatique : remplacez la chaîne vide ci-dessous
     par votre URL de point de terminaison (ex. https://formspree.io/f/xxxx).
     ======================================================================= */
  var ACCI_FORM_ENDPOINT = "";              // ← coller ici votre endpoint
  if (!ACCI_FORM_ENDPOINT) {
    console.warn("[ACCI] Aucun ACCI_FORM_ENDPOINT configuré : les formulaires " +
      "basculent sur l’ouverture du client e-mail du visiteur. Renseignez un " +
      "service de formulaire (Formspree, Web3Forms) avant la mise en ligne " +
      "pour que les envois parviennent réellement à l’association.");
  }
  var ACCI_CONTACT_EMAIL = "contact@acci.ci";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(field, msg) {
    var label = field.closest("label") || field.parentElement;
    var slot = label ? label.querySelector(".cform__err") : null;
    field.classList.toggle("is-invalid", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (slot) slot.textContent = msg || "";
  }

  function validateField(field) {
    var v = (field.value || "").trim();
    var type = field.type;
    if (field.hasAttribute("required")) {
      if (type === "checkbox" && !field.checked) return "Veuillez cocher cette case.";
      if (type !== "checkbox" && !v) return "Ce champ est obligatoire.";
    }
    if (type === "email" && v && !EMAIL_RE.test(v)) return "Adresse e-mail invalide.";
    var min = parseInt(field.getAttribute("minlength") || "0", 10);
    if (min && v && v.length < min) return "Au moins " + min + " caractères.";
    return "";
  }

  function validateForm(form) {
    var ok = true, first = null;
    form.querySelectorAll("input, textarea, select").forEach(function (f) {
      if (f.name === "_hp" || f.type === "submit") return;
      var err = validateField(f);
      setError(f, err);
      if (err) { ok = false; if (!first) first = f; }
    });
    if (first) first.focus();
    return ok;
  }

  function note(el, msg, kind) {
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    el.className = (el.className.replace(/\s*is-(ok|err)/g, "")) + " is-" + (kind || "ok");
  }

  function mailtoFallback(subject, body) {
    var href = "mailto:" + ACCI_CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    window.location.href = href;
  }

  /* NOTE — les envois ne sont volontairement PAS conservés dans le navigateur.
     Une version antérieure écrivait chaque message (nom, e-mail, téléphone et
     contenu, y compris les signalements adressés à la cellule d'écoute) dans
     le localStorage du visiteur. Ces données restaient donc sur SON appareil,
     lisibles par la personne suivante à l'utiliser — un poste partagé, un
     cybercafé — sans jamais parvenir à l'ACCI : l'espace d'administration lit
     le localStorage de l'ordinateur de l'association, pas celui du visiteur.
     Aucun bénéfice, un risque réel pour des personnes vulnérables. Supprimé. */

  function postEndpoint(data) {
    return fetch(ACCI_FORM_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r; });
  }

  /* ---- Formulaire de contact ---- */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.querySelectorAll("input, textarea").forEach(function (f) {
      f.addEventListener("blur", function () { if (f.name !== "_hp") setError(f, validateField(f)); });
      f.addEventListener("input", function () { if (f.classList.contains("is-invalid")) setError(f, validateField(f)); });
    });
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var noteEl = document.getElementById("cform-note");
      if (contactForm.querySelector('[name="_hp"]').value) return; // anti-spam
      if (!validateForm(contactForm)) { note(noteEl, "Veuillez corriger les champs indiqués.", "err"); return; }

      var fd = new FormData(contactForm);
      var data = {
        name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone") || "—",
        subject: fd.get("subject"), message: fd.get("message"), _source: "Site ACCI"
      };
      var btn = document.getElementById("contact-submit");
      var orig = btn.textContent;

      if (ACCI_FORM_ENDPOINT) {
        btn.disabled = true; btn.textContent = "Envoi en cours…";
        postEndpoint(data).then(function () {
          note(noteEl, "Merci " + data.name + " ! Votre message a bien été envoyé. Nous vous répondrons rapidement.", "ok");
          contactForm.reset();
        }).catch(function () {
          note(noteEl, "L’envoi automatique a échoué : votre messagerie s’ouvre avec le message pré-rempli. " +
                       "Si rien ne s’ouvre, écrivez à " + ACCI_CONTACT_EMAIL + ".", "err");
          mailtoFallback("Contact ACCI — " + data.subject, contactBody(data));
        }).finally(function () { btn.disabled = false; btn.textContent = orig; });
      } else {
        mailtoFallback("Contact ACCI — " + data.subject, contactBody(data));
        // Le formulaire n'est volontairement PAS réinitialisé : tant que le
        // visiteur n'a pas cliqué « Envoyer » dans sa messagerie, rien n'est
        // parti. Effacer sa saisie lui ferait perdre son message si aucun
        // client e-mail n'est configuré — courant sur Android.
        note(noteEl, "Votre messagerie s’ouvre avec le message pré-rempli : il reste à cliquer sur « Envoyer » pour finaliser. " +
                     "Si rien ne s’ouvre, écrivez directement à " + ACCI_CONTACT_EMAIL + " — votre message est conservé ci-dessus.", "ok");
      }
    });
  }

  function contactBody(d) {
    return "Nom : " + d.name + "\nE-mail : " + d.email + "\nTéléphone : " + d.phone +
      "\nObjet : " + d.subject + "\n\nMessage :\n" + d.message + "\n\n— Envoyé depuis le site de l’ACCI";
  }

  /* ---- Formulaire newsletter ---- */
  var newsForm = document.getElementById("newsletter-form");
  if (newsForm) {
    var newsInput = newsForm.querySelector('input[type="email"]');
    if (newsInput) newsInput.addEventListener("input", function () {
      if (!newsInput.classList.contains("is-invalid")) return;
      if (EMAIL_RE.test(newsInput.value.trim())) {
        newsInput.classList.remove("is-invalid");
        newsInput.setAttribute("aria-invalid", "false");
        var n = document.getElementById("newsletter-note");
        if (n) n.hidden = true;
      }
    });
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsForm.querySelector('input[type="email"]');
      var noteEl = document.getElementById("newsletter-note");
      var email = (input.value || "").trim();
      if (!EMAIL_RE.test(email)) {
        input.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        if (noteEl && noteEl.id) input.setAttribute("aria-describedby", noteEl.id);
        note(noteEl, "Veuillez saisir une adresse e-mail valide.", "err");
        input.focus();
        return;
      }
      input.classList.remove("is-invalid");
      input.setAttribute("aria-invalid", "false");
      var btn = newsForm.querySelector("button");
      if (ACCI_FORM_ENDPOINT) {
        btn.disabled = true; btn.textContent = "…";
        postEndpoint({ email: email, _form: "newsletter", _source: "Site ACCI" }).then(function () {
          note(noteEl, "Merci ! Votre inscription est confirmée.", "ok"); newsForm.reset();
        }).catch(function () {
          mailtoFallback("Inscription à la newsletter de l’ACCI", "Je souhaite m’abonner à la newsletter avec l’adresse : " + email);
          note(noteEl, "Ouverture de votre messagerie pour confirmer l’inscription.", "ok");
        }).finally(function () { btn.disabled = false; btn.textContent = "S’abonner"; });
      } else {
        mailtoFallback("Inscription à la newsletter de l’ACCI", "Je souhaite m’abonner à la newsletter avec l’adresse : " + email);
        // Idem : l'inscription n'est effective qu'une fois l'e-mail envoyé.
        note(noteEl, "Votre messagerie s’ouvre pour confirmer l’inscription : il reste à cliquer sur « Envoyer ».", "ok");
      }
    });
  }

  window.ACCI = ACCI;
})();
