# -*- coding: utf-8 -*-
"""Pages 45 à 50 — Engagement, contact & mentions légales."""

SEC_E = "Engagement"
SEC_L = "Informations légales"

PAGES = [

# 45 — ANNUAIRE -------------------------------------------------------------
{
  "slug": "annuaire",
  "title": "Annuaire des créateurs",
  "section": SEC_E,
  "description": "L'annuaire des créateurs de contenu membres de l'ACCI, signataires de la charte du créateur responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "La communauté",
     "title": "Annuaire des créateurs",
     "subtitle": "Découvrez les créateurs membres de l'ACCI, signataires de la charte et engagés pour un numérique responsable."},

    {"type": "section", "title": "Des créateurs qui s'engagent",
     "lead": "L'annuaire valorise les créateurs qui ont signé la charte du créateur responsable.",
     "body": [
       "Y figurer, c'est afficher publiquement son engagement et rejoindre un réseau de confiance reconnu par le public, les médias et les partenaires.",
       "L'annuaire est organisé par domaines de création : éducation, humour, mode, cuisine, sport, technologie, culture, entrepreneuriat et bien d'autres.",
     ]},

    {"type": "cards", "columns": 3, "title": "Explorer par domaine",
     "items": [
       {"icon": "graduation", "title": "Éducation & savoir", "text": "Vulgarisation, conseils, tutoriels."},
       {"icon": "star", "title": "Humour & divertissement", "text": "Sketchs, créativité, bonne humeur."},
       {"icon": "heart", "title": "Lifestyle & mode", "text": "Beauté, mode, art de vivre."},
       {"icon": "money", "title": "Entrepreneuriat", "text": "Business, finances, innovation."},
       {"icon": "globe", "title": "Culture & société", "text": "Patrimoine, débats, engagement."},
       {"icon": "play", "title": "Sport & santé", "text": "Bien-être, performance, motivation."},
     ]},

    {"type": "callout", "variant": "success", "title": "Vous êtes créateur et membre ?",
     "text": ["Signez la charte et adhérez à l'ACCI pour figurer dans l'annuaire et rejoindre le réseau des créateurs responsables."]},

    {"type": "cta", "title": "Rejoignez l'annuaire",
     "buttons": [
       {"label": "Adhérer & signer la charte", "href": "adhesion", "style": "btn--light", "arrow": True},
       {"label": "Voir la charte", "href": "charte", "style": "btn--outline-light"},
     ]},
  ],
},

# 46 — TÉMOIGNAGES ----------------------------------------------------------
{
  "slug": "temoignages",
  "title": "Témoignages",
  "section": SEC_E,
  "description": "Témoignages de créateurs, de victimes et de partenaires sur l'action de l'ACCI pour un numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Ils en parlent",
     "title": "Témoignages",
     "subtitle": "Des voix qui racontent pourquoi un numérique responsable change concrètement des vies."},

    {"type": "quote",
     "text": "Quand j'ai été harcelée en ligne, je me sentais seule au monde. La cellule d'écoute de l'ACCI m'a aidée à reprendre pied et à agir.",
     "author": "Une victime accompagnée", "role": "Abidjan"},

    {"type": "quote",
     "text": "Signer la charte a changé ma façon de créer. Aujourd'hui, je vérifie tout avant de publier et ma communauté me fait davantage confiance.",
     "author": "Un créateur membre", "role": "Annuaire ACCI"},

    {"type": "quote",
     "text": "Les ateliers de l'ACCI dans notre école ont ouvert les yeux de nos élèves sur les dangers comme sur les opportunités du numérique.",
     "author": "Une enseignante partenaire", "role": "Établissement scolaire"},

    {"type": "cards", "columns": 3, "title": "Ce que notre action permet",
     "items": [
       {"icon": "heart", "title": "Des victimes soutenues", "text": "Un accompagnement humain qui aide à se relever."},
       {"icon": "graduation", "title": "Des jeunes outillés", "text": "Un esprit critique renforcé face aux écrans."},
       {"icon": "users", "title": "Des créateurs valorisés", "text": "Une profession qui gagne en crédibilité."},
     ]},

    {"type": "callout", "variant": "info", "title": "Partagez votre histoire",
     "text": ["Votre témoignage peut aider d'autres personnes à franchir le pas. Contactez-nous pour le partager, anonymement si vous le souhaitez."]},

    {"type": "cta", "title": "Vous aussi, témoignez",
     "buttons": [{"label": "Partager mon témoignage", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 47 — FAIRE UN DON ---------------------------------------------------------
{
  "slug": "faire-un-don",
  "title": "Faire un don",
  "section": SEC_E,
  "description": "Soutenir l'ACCI par un don pour financer ses campagnes, formations et la cellule d'écoute des victimes.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "image": "solidarite.jpg",
     "kicker": "Nous soutenir",
     "title": "Faites un don, **soutenez le combat**",
     "subtitle": "Votre soutien finance nos campagnes, nos formations et la cellule d'écoute qui accompagne les victimes. Chaque contribution compte.",
     "cta": [{"label": "Soutenir l'ACCI", "href": "contact", "style": "btn--primary", "arrow": True}]},

    {"type": "section", "title": "Pourquoi donner ?",
     "lead": "L'ACCI est une association à but non lucratif portée par des bénévoles. Vos dons donnent les moyens d'agir.",
     "body": [
       "Mener des campagnes d'envergure, former des milliers de jeunes, faire fonctionner une cellule d'écoute, produire des ressources gratuites : tout cela a un coût.",
       "En soutenant l'ACCI, vous investissez dans un espace numérique plus sûr pour toute la Côte d'Ivoire.",
     ]},

    {"type": "cards", "columns": 3, "title": "À quoi sert votre don",
     "items": [
       {"icon": "megaphone", "title": "Des campagnes", "text": "Sensibiliser un large public aux bonnes pratiques."},
       {"icon": "graduation", "title": "Des formations", "text": "Outiller les jeunes et les créateurs partout dans le pays."},
       {"icon": "heart", "title": "La cellule d'écoute", "text": "Accompagner les victimes de dérives numériques."},
       {"icon": "download", "title": "Des ressources", "text": "Produire et diffuser des guides gratuits."},
       {"icon": "child", "title": "La protection des mineurs", "text": "Des actions dédiées aux plus jeunes."},
       {"icon": "globe", "title": "Le déploiement régional", "text": "Porter notre action dans toutes les régions."},
     ]},

    {"type": "callout", "variant": "success", "title": "Don ponctuel ou régulier",
     "text": ["Quel que soit son montant, votre don a un impact. Vous pouvez soutenir l'ACCI ponctuellement ou devenir donateur régulier. Contactez-nous pour connaître les modalités."]},

    {"type": "cta", "title": "Donnez du pouvoir à l'action",
     "text": "Ensemble, faisons reculer les mauvaises pratiques.",
     "buttons": [
       {"label": "Faire un don", "href": "contact", "style": "btn--light", "arrow": True},
       {"label": "Devenir partenaire", "href": "partenaires", "style": "btn--outline-light"},
     ]},
  ],
},

# 48 — CONTACT --------------------------------------------------------------
{
  "slug": "contact",
  "title": "Nous contacter",
  "section": SEC_E,
  "description": "Contactez l'ACCI : adhésion, signalement, presse, partenariats ou demande d'information.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Restons en lien",
     "title": "Nous contacter",
     "subtitle": "Une question, une adhésion, un signalement, un partenariat ? Notre équipe est à votre écoute."},

    {"type": "contact", "title": "Écrivez-nous",
     "lead": "Remplissez le formulaire ou utilisez nos coordonnées. Nous vous répondrons dans les meilleurs délais.",
     "info": [
       {"icon": "map", "label": "Adresse", "value": "Cocody, Riviera Golf — Abidjan, Côte d'Ivoire"},
       {"icon": "mail", "label": "E-mail", "value": "contact@acci.ci"},
       {"icon": "phone", "label": "Téléphone", "value": "+225 27 22 00 00 00"},
       {"icon": "clock", "label": "Horaires", "value": "Du lundi au vendredi, 9h – 17h"},
     ]},

    {"type": "cards", "columns": 3, "title": "Le bon interlocuteur",
     "items": [
       {"icon": "users", "title": "Adhésion", "text": "Pour devenir membre et rejoindre la communauté.", "href": "adhesion"},
       {"icon": "alert", "title": "Signalement", "text": "Pour dénoncer un contenu ou un comportement abusif.", "href": "signaler-abus"},
       {"icon": "heart", "title": "Cellule d'écoute", "text": "Pour un soutien confidentiel en tant que victime.", "href": "cellule-ecoute"},
       {"icon": "megaphone", "title": "Presse", "text": "Pour les demandes des médias et journalistes.", "href": "espace-presse"},
       {"icon": "handshake", "title": "Partenariats", "text": "Pour collaborer ou soutenir l'association.", "href": "partenaires"},
       {"icon": "graduation", "title": "Formations", "text": "Pour organiser une intervention chez vous.", "href": "formations"},
     ]},
  ],
},

# 49 — MENTIONS LÉGALES -----------------------------------------------------
{
  "slug": "mentions-legales",
  "title": "Mentions légales",
  "section": SEC_L,
  "description": "Mentions légales du site de l'Association des Créateurs de Contenu Ivoiriens (ACCI).",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Informations légales",
     "title": "Mentions légales",
     "subtitle": "Informations relatives à l'éditeur et à l'hébergement de ce site."},

    {"type": "richtext", "html": """
      <h2>Éditeur du site</h2>
      <p>Le présent site est édité par l'<strong>Association des Créateurs de Contenu Ivoiriens (ACCI)</strong>, association à but non lucratif dont le siège est situé à Abidjan, Côte d'Ivoire.</p>
      <p><strong>Contact :</strong> contact@acci.ci — +225 27 22 00 00 00</p>

      <h2>Directeur de la publication</h2>
      <p>Le directeur de la publication est le représentant légal de l'association (Présidence du Bureau exécutif).</p>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par un prestataire technique. Les informations relatives à l'hébergeur peuvent être obtenues sur demande auprès de l'association.</p>

      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble des contenus de ce site (textes, visuels, logos, éléments graphiques) est, sauf mention contraire, la propriété de l'ACCI. Toute reproduction sans autorisation est interdite. Nos ressources de sensibilisation peuvent toutefois être partagées librement à des fins non commerciales.</p>

      <h2>Responsabilité</h2>
      <p>L'ACCI s'efforce d'assurer l'exactitude des informations diffusées sur ce site. Les contenus à caractère pédagogique ne constituent pas un avis juridique. Pour toute situation particulière, il convient de consulter un professionnel ou les autorités compétentes.</p>

      <h2>Liens externes</h2>
      <p>Ce site peut contenir des liens vers des sites tiers. L'ACCI n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>

      <h2>Contact</h2>
      <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous écrire à contact@acci.ci.</p>
    """},
  ],
},

# 50 — CONFIDENTIALITÉ ------------------------------------------------------
{
  "slug": "confidentialite",
  "title": "Politique de confidentialité",
  "section": SEC_L,
  "description": "La politique de confidentialité de l'ACCI : comment nous collectons, utilisons et protégeons vos données personnelles.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Protection des données",
     "title": "Politique de confidentialité",
     "subtitle": "Nous nous engageons à protéger vos données personnelles et à respecter votre vie privée."},

    {"type": "richtext", "html": """
      <h2>Notre engagement</h2>
      <p>La protection de la vie privée est au cœur de la mission de l'ACCI. Il serait incohérent de défendre un numérique respectueux sans appliquer nous-mêmes les meilleures pratiques. Cette politique explique comment nous traitons vos données.</p>

      <h2>Données collectées</h2>
      <p>Nous collectons uniquement les données que vous nous communiquez volontairement, par exemple via nos formulaires de contact, d'adhésion ou d'abonnement à la lettre d'information : nom, adresse e-mail, numéro de téléphone et message.</p>

      <h2>Utilisation des données</h2>
      <p>Vos données sont utilisées exclusivement pour&nbsp;: répondre à vos demandes, gérer votre adhésion, vous envoyer nos actualités si vous y avez consenti, et améliorer nos services. Nous ne vendons ni ne louons vos données à des tiers.</p>

      <h2>Conservation</h2>
      <p>Vos données sont conservées le temps nécessaire aux finalités pour lesquelles elles ont été collectées, puis supprimées ou anonymisées.</p>

      <h2>Vos droits</h2>
      <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez également retirer votre consentement à tout moment. Pour exercer ces droits, écrivez-nous à contact@acci.ci.</p>

      <h2>Sécurité</h2>
      <p>Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos données contre tout accès non autorisé, perte ou divulgation.</p>

      <h2>Cookies</h2>
      <p>Ce site limite l'usage des cookies au strict nécessaire à son bon fonctionnement et, le cas échéant, à la mesure d'audience anonyme. Vous pouvez configurer votre navigateur pour les refuser.</p>

      <h2>Contact</h2>
      <p>Pour toute question relative à cette politique de confidentialité, contactez-nous à contact@acci.ci.</p>
    """},
  ],
},

]
