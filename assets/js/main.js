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
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector(".burger");
  var mobileNav = document.getElementById("mobile-nav");
  var overlay = document.getElementById("overlay");

  function openMobile() {
    if (!mobileNav) return;
    mobileNav.hidden = false; overlay.hidden = false;
    requestAnimationFrame(function () {
      mobileNav.classList.add("is-open");
      overlay.classList.add("is-open");
    });
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMobile() {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    overlay.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(function () { mobileNav.hidden = true; overlay.hidden = true; }, 300);
  }
  if (burger) burger.addEventListener("click", function () {
    burger.getAttribute("aria-expanded") === "true" ? closeMobile() : openMobile();
  });
  if (overlay) overlay.addEventListener("click", closeMobile);

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
  document.querySelectorAll(".nav__toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var item = btn.closest(".nav__item");
      var menu = item.querySelector(".megamenu");
      var open = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".nav__toggle").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      btn.setAttribute("aria-expanded", String(!open));
      if (menu) {
        menu.style.opacity = open ? "" : "1";
        menu.style.visibility = open ? "" : "visible";
        menu.style.transform = open ? "" : "translateX(-50%) translateY(0)";
      }
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav__item--has-children")) {
      document.querySelectorAll(".megamenu").forEach(function (m) {
        m.style.opacity = ""; m.style.visibility = ""; m.style.transform = "";
      });
      document.querySelectorAll(".nav__toggle").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    }
  });

  /* ---------- Recherche ---------- */
  var searchToggle = document.querySelector(".search-toggle");
  var searchbar = document.querySelector(".searchbar");
  var searchInput = document.getElementById("site-search");
  var searchResults = document.getElementById("search-results");
  var searchClose = document.querySelector(".searchbar__close");

  function openSearch() {
    if (!searchbar) return;
    searchbar.hidden = false;
    setTimeout(function () { searchInput && searchInput.focus(); }, 50);
  }
  function closeSearch() {
    if (!searchbar) return;
    searchbar.hidden = true;
    if (searchResults) { searchResults.classList.remove("is-open"); searchResults.innerHTML = ""; }
    if (searchInput) searchInput.value = "";
  }
  if (searchToggle) searchToggle.addEventListener("click", function () {
    searchbar.hidden ? openSearch() : closeSearch();
  });
  if (searchClose) searchClose.addEventListener("click", closeSearch);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeSearch(); closeMobile(); } });

  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var q = normalize(searchInput.value.trim());
      var idx = window.SEARCH_INDEX || [];
      if (q.length < 2) { searchResults.classList.remove("is-open"); searchResults.innerHTML = ""; return; }
      var hits = idx.map(function (it) {
        var hay = normalize(it.t + " " + it.d + " " + it.s);
        var score = 0;
        q.split(/\s+/).forEach(function (w) { if (hay.indexOf(w) !== -1) score++; if (normalize(it.t).indexOf(w) !== -1) score += 2; });
        return { it: it, score: score };
      }).filter(function (h) { return h.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 8);

      if (!hits.length) {
        searchResults.innerHTML = '<div class="sresult sresult--empty">Aucun résultat pour « ' + searchInput.value + ' ».</div>';
      } else {
        searchResults.innerHTML = hits.map(function (h) {
          var sec = h.it.s ? '<span class="sresult__sec">' + h.it.s + "</span>" : "";
          return '<a class="sresult" href="' + h.it.u + '">' + sec +
            '<span class="sresult__title">' + h.it.t + "</span>" +
            '<span class="sresult__desc">' + (h.it.d || "") + "</span></a>";
        }).join("");
      }
      searchResults.classList.add("is-open");
    });
  }

  /* ---------- Accordéon ---------- */
  document.querySelectorAll(".accordion__trigger").forEach(function (t) {
    t.addEventListener("click", function () {
      var open = t.getAttribute("aria-expanded") === "true";
      var panel = t.nextElementSibling;
      t.setAttribute("aria-expanded", String(!open));
      panel.style.maxHeight = open ? "0" : panel.scrollHeight + "px";
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

  function saveToCrmInbox(rec) {
    // Enregistre la demande dans la boîte de réception du CRM (même navigateur)
    try {
      var k = "acci_crm_inbox";
      var arr = JSON.parse(localStorage.getItem(k) || "[]");
      arr.unshift(rec);
      localStorage.setItem(k, JSON.stringify(arr.slice(0, 500)));
    } catch (e) {}
  }

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
      saveToCrmInbox({ name: data.name, email: data.email, phone: fd.get("phone") || "",
        subject: data.subject, message: data.message, date: new Date().toISOString() });
      var btn = document.getElementById("contact-submit");
      var orig = btn.textContent;

      if (ACCI_FORM_ENDPOINT) {
        btn.disabled = true; btn.textContent = "Envoi en cours…";
        postEndpoint(data).then(function () {
          note(noteEl, "Merci " + data.name + " ! Votre message a bien été envoyé. Nous vous répondrons rapidement.", "ok");
          contactForm.reset();
        }).catch(function () {
          note(noteEl, "L'envoi automatique a échoué. Ouverture de votre messagerie…", "err");
          mailtoFallback("Contact ACCI — " + data.subject, contactBody(data));
        }).finally(function () { btn.disabled = false; btn.textContent = orig; });
      } else {
        mailtoFallback("Contact ACCI — " + data.subject, contactBody(data));
        note(noteEl, "Votre messagerie s'ouvre avec le message pré-rempli. Cliquez sur « Envoyer » pour finaliser.", "ok");
        contactForm.reset();
      }
    });
  }

  function contactBody(d) {
    return "Nom : " + d.name + "\nE-mail : " + d.email + "\nTéléphone : " + d.phone +
      "\nObjet : " + d.subject + "\n\nMessage :\n" + d.message + "\n\n— Envoyé depuis le site de l'ACCI";
  }

  /* ---- Formulaire newsletter ---- */
  var newsForm = document.getElementById("newsletter-form");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsForm.querySelector('input[type="email"]');
      var noteEl = document.getElementById("newsletter-note");
      var email = (input.value || "").trim();
      if (!EMAIL_RE.test(email)) {
        input.classList.add("is-invalid");
        note(noteEl, "Veuillez saisir une adresse e-mail valide.", "err");
        input.focus();
        return;
      }
      input.classList.remove("is-invalid");
      saveToCrmInbox({ name: "", email: email, phone: "", subject: "Inscription newsletter", message: "", date: new Date().toISOString() });
      var btn = newsForm.querySelector("button");
      if (ACCI_FORM_ENDPOINT) {
        btn.disabled = true; btn.textContent = "…";
        postEndpoint({ email: email, _form: "newsletter", _source: "Site ACCI" }).then(function () {
          note(noteEl, "Merci ! Votre inscription est confirmée.", "ok"); newsForm.reset();
        }).catch(function () {
          mailtoFallback("Inscription à la newsletter de l'ACCI", "Je souhaite m'abonner à la newsletter avec l'adresse : " + email);
          note(noteEl, "Ouverture de votre messagerie pour confirmer l'inscription.", "ok");
        }).finally(function () { btn.disabled = false; btn.textContent = "S'abonner"; });
      } else {
        mailtoFallback("Inscription à la newsletter de l'ACCI", "Je souhaite m'abonner à la newsletter avec l'adresse : " + email);
        note(noteEl, "Merci ! Votre messagerie s'ouvre pour confirmer l'inscription.", "ok");
        newsForm.reset();
      }
    });
  }

  window.ACCI = ACCI;
})();
