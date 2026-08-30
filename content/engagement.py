# -*- coding: utf-8 -*-
"""Pages 45 à 50 — Engagement, contact & mentions légales."""

from content.site import SITE

SEC_E = "Engagement"
SEC_L = "Informations légales"

PAGES = [

# 45 — ANNUAIRE -------------------------------------------------------------
{
  "slug": "annuaire",
  "title": "Annuaire des créateurs",
  "section": SEC_E,
  "description": "L’annuaire des créateurs de contenu membres de l’ACCI, signataires de la charte du créateur responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "La communauté",
     "title": "Annuaire des créateurs",
     "subtitle": "Découvrez les créateurs membres de l’ACCI, signataires de la charte et engagés pour un numérique responsable."},

    {"type": "section", "title": "Des créateurs qui s’engagent",
     "lead": "L’annuaire valorise les créateurs qui ont signé la charte du créateur responsable.",
     "body": [
       "Y figurer, c’est rendre son engagement visible et rejoindre un réseau de confiance reconnu par le public, les médias et les partenaires.",
       "L’annuaire est organisé par domaines de création : éducation, humour, mode, cuisine, sport, technologie, culture, entrepreneuriat et bien d’autres.",
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

    {"type": "callout", "variant": "success", "title": "Vous êtes créateur et membre ?",
     "text": ["La signature de la charte et l’adhésion à l’ACCI ouvrent l’accès à l’annuaire et au réseau des créateurs responsables."]},

    {"type": "cta", "title": "Rejoindre l’annuaire",
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
  "description": "Témoignages de créateurs, de personnes accompagnées et de partenaires sur l’action de l’ACCI pour un numérique responsable.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Ils en parlent",
     "title": "Témoignages",
     "subtitle": "Des voix qui racontent ce qu’un numérique responsable change concrètement au quotidien."},

    {"type": "quote",
     "text": "Quand j’ai été harcelée en ligne, je me sentais seule au monde. La cellule d’écoute de l’ACCI m’a aidée à reprendre pied et à agir.",
     "author": "Une personne accompagnée", "role": "Abidjan"},

    {"type": "quote",
     "text": "Signer la charte a changé ma façon de créer. Aujourd’hui, je vérifie tout avant de publier et ma communauté me fait davantage confiance.",
     "author": "Un créateur membre", "role": "Annuaire ACCI"},

    {"type": "quote",
     "text": "Les ateliers de l’ACCI dans notre école ont éclairé nos élèves sur les risques comme sur les opportunités du numérique.",
     "author": "Une enseignante partenaire", "role": "Établissement scolaire"},

    {"type": "cards", "columns": 3, "title": "Ce que notre action permet",
     "items": [
       {"icon": "heart", "title": "Des personnes soutenues", "text": "Un accompagnement humain pour se reconstruire."},
       {"icon": "graduation", "title": "Des jeunes outillés", "text": "Un esprit critique renforcé face aux écrans."},
       {"icon": "users", "title": "Des créateurs valorisés", "text": "Une profession qui gagne en crédibilité."},
     ]},

    {"type": "callout", "variant": "info", "title": "Partager votre histoire",
     "text": ["Votre témoignage peut aider d’autres personnes à franchir le pas. Nous vous invitons à nous écrire pour le partager, anonymement si vous le souhaitez."]},

    {"type": "cta", "title": "Votre témoignage compte",
     "buttons": [{"label": "Partager mon témoignage", "href": "contact", "style": "btn--light", "arrow": True}]},
  ],
},

# 47 — FAIRE UN DON ---------------------------------------------------------
{
  "slug": "faire-un-don",
  "title": "Faire un don",
  "section": SEC_E,
  "description": "Soutenir l’ACCI par un don pour financer ses campagnes, ses formations et la cellule d’écoute des victimes.",
  "blocks": [
    {"type": "hero", "variant": "default",
     "image": "solidarite.jpg",
     "kicker": "Nous soutenir",
     "title": "Faites un don, **soutenez notre action**",
     "subtitle": "Votre soutien finance nos campagnes, nos formations et la cellule d’écoute qui accompagne les victimes. Chaque contribution compte.",
     "cta": [{"label": "Soutenir l’ACCI", "href": "contact", "style": "btn--primary", "arrow": True}]},

    {"type": "section", "title": "Pourquoi donner ?",
     "lead": "L’ACCI est une association à but non lucratif portée par des bénévoles. Les dons lui donnent les moyens d’agir.",
     "body": [
       "Mener des campagnes d’envergure, former des milliers de jeunes, faire fonctionner une cellule d’écoute, produire des ressources gratuites : tout cela a un coût.",
       "En soutenant l’ACCI, vous contribuez à un espace numérique plus sûr pour toute la Côte d’Ivoire.",
     ]},

    {"type": "cards", "columns": 3, "title": "À quoi sert votre don",
     "items": [
       {"icon": "megaphone", "title": "Des campagnes", "text": "Sensibiliser un large public aux bonnes pratiques."},
       {"icon": "graduation", "title": "Des formations", "text": "Outiller les jeunes et les créateurs partout dans le pays."},
       {"icon": "heart", "title": "La cellule d’écoute", "text": "Accompagner les victimes de dérives numériques."},
       {"icon": "download", "title": "Des ressources", "text": "Produire et diffuser des guides gratuits."},
       {"icon": "child", "title": "La protection des mineurs", "text": "Des actions dédiées aux plus jeunes."},
       {"icon": "globe", "title": "Le déploiement régional", "text": "Porter notre action dans toutes les régions."},
     ]},

    {"type": "callout", "variant": "success", "title": "Don ponctuel ou régulier",
     "text": ["Chaque don, quel qu’en soit le montant, contribue à nos actions. Le soutien peut être ponctuel ou régulier : n’hésitez pas à nous écrire pour connaître les modalités."]},

    {"type": "cta", "title": "Soutenir notre action",
     "text": "Ensemble, œuvrons pour un numérique plus sûr.",
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
  "description": "Contacter l’ACCI : adhésion, signalement, presse, partenariats ou demande d’information.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Restons en lien",
     "title": "Nous contacter",
     "subtitle": "Une question, une adhésion, un signalement, un partenariat ? Notre équipe est à votre écoute."},

    {"type": "contact", "title": "Écrivez-nous",
     "lead": "Le formulaire ci-dessous et nos coordonnées sont à votre disposition. Nous vous répondrons dans les meilleurs délais.",
     "info": [
       {"icon": "map", "label": "Adresse", "value": SITE["address"], "field": "address"},
       {"icon": "mail", "label": "E-mail", "value": SITE["email"], "field": "email"},
       {"icon": "phone", "label": "Téléphone", "value": SITE["phone"], "field": "phone"},
       {"icon": "clock", "label": "Horaires", "value": "Du lundi au vendredi, 9h – 17h"},
     ]},

    {"type": "cards", "columns": 3, "title": "Le bon interlocuteur",
     "items": [
       {"icon": "users", "title": "Adhésion", "text": "Pour devenir membre et rejoindre la communauté.", "href": "adhesion"},
       {"icon": "alert", "title": "Signalement", "text": "Pour signaler un contenu ou un comportement abusif.", "href": "signaler-abus"},
       {"icon": "heart", "title": "Cellule d’écoute", "text": "Pour un soutien confidentiel en tant que victime.", "href": "cellule-ecoute"},
       {"icon": "megaphone", "title": "Presse", "text": "Pour les demandes des médias et journalistes.", "href": "espace-presse"},
       {"icon": "handshake", "title": "Partenariats", "text": "Pour collaborer avec l’association ou la soutenir.", "href": "partenaires"},
       {"icon": "graduation", "title": "Formations", "text": "Pour organiser une intervention chez vous.", "href": "formations"},
     ]},
  ],
},

# 49 — MENTIONS LÉGALES -----------------------------------------------------
{
  "slug": "mentions-legales",
  "title": "Mentions légales",
  "section": SEC_L,
  "description": "Mentions légales du site de l’Association des Créateurs de Contenu Ivoiriens (ACCI).",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Informations légales",
     "title": "Mentions légales",
     "subtitle": "Informations relatives à l’éditeur et à l’hébergement de ce site."},

    {"type": "richtext", "html": """
      <h2>Éditeur du site</h2>
      <p>Le présent site est édité par l’<strong>Association des Créateurs de Contenu Ivoiriens (ACCI)</strong>, association à but non lucratif dont le siège est situé à Abidjan, Côte d’Ivoire.</p>
      <p><strong>Contact :</strong> contact@ivoiriens.ac.ci — +225 27 22 00 00 00</p>

      <h2>Directeur de la publication</h2>
      <p>Le directeur de la publication est le représentant légal de l’association (Présidence du Bureau exécutif).</p>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par un prestataire technique. Les informations relatives à l’hébergeur peuvent être obtenues sur demande auprès de l’association.</p>

      <h2>Propriété intellectuelle</h2>
      <p>L’ensemble des contenus de ce site (textes, visuels, logos, éléments graphiques) est, sauf mention contraire, la propriété de l’ACCI. Toute reproduction est soumise à autorisation préalable. Nos ressources de sensibilisation peuvent toutefois être partagées librement à des fins non commerciales.</p>

      <h2>Responsabilité</h2>
      <p>L’ACCI s’efforce d’assurer l’exactitude des informations diffusées sur ce site. Les contenus à caractère pédagogique ne constituent pas un avis juridique. Pour toute situation particulière, il est recommandé de consulter un professionnel ou les autorités compétentes.</p>

      <h2>Liens externes</h2>
      <p>Ce site peut contenir des liens vers des sites tiers. L’ACCI n’exerce aucun contrôle sur ces sites et ne saurait être tenue responsable de leur contenu.</p>

      <h2>Contact</h2>
      <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous écrire à contact@ivoiriens.ac.ci.</p>
    """},
  ],
},

# 50 — CONFIDENTIALITÉ ------------------------------------------------------
{
  "slug": "confidentialite",
  "title": "Politique de confidentialité",
  "section": SEC_L,
  "description": "La politique de confidentialité de l’ACCI : comment nous collectons, utilisons et protégeons vos données personnelles.",
  "blocks": [
    {"type": "hero", "variant": "compact",
     "kicker": "Protection des données",
     "title": "Politique de confidentialité",
     "subtitle": "Nous nous engageons à protéger vos données personnelles et à respecter votre vie privée."},

    {"type": "richtext", "html": """
      <h2>Notre engagement</h2>
      <p>La protection de la vie privée est au cœur de la mission de l’ACCI. L’association applique à son propre fonctionnement les principes qu’elle promeut. Cette politique explique comment nous traitons vos données.</p>

      <h2>Données collectées</h2>
      <p>Nous collectons uniquement les données que vous nous communiquez volontairement, par exemple via nos formulaires de contact, d’adhésion ou d’abonnement à la lettre d’information : nom, adresse e-mail, numéro de téléphone et message.</p>

      <h2>Utilisation des données</h2>
      <p>Vos données sont utilisées exclusivement pour : répondre à vos demandes, gérer votre adhésion, vous envoyer nos actualités si vous y avez consenti, et améliorer nos services. Nous ne vendons ni ne louons vos données à des tiers.</p>

      <h2>Conservation</h2>
      <p>Vos données sont conservées le temps nécessaire aux finalités pour lesquelles elles ont été collectées, puis supprimées ou anonymisées.</p>

      <h2>Vos droits</h2>
      <p>Vous disposez d’un droit d’accès, de rectification et de suppression de vos données. Vous pouvez également retirer votre consentement à tout moment. Pour exercer ces droits, il vous suffit de nous écrire à contact@ivoiriens.ac.ci.</p>

      <h2>Sécurité</h2>
      <p>Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos données contre tout accès non autorisé, perte ou divulgation.</p>

      <h2>Cookies et mesure d’audience</h2>
      <p>Ce site fonctionne sans aucun cookie de suivi. Rien de ce qui sert à mesurer l’audience ou à diffuser nos campagnes n’est nécessaire à sa consultation : vous pouvez tout refuser, le site est identique.</p>
      <p>Nous distinguons deux finalités, que vous acceptez ou refusez séparément :</p>
      <ul>
        <li><b>Mesure d’audience</b> — nombre de visites, pages consultées, provenance. Ces informations nous disent quels contenus de prévention atteignent réellement leur public. Outil utilisé : Google Analytics.</li>
        <li><b>Publicité</b> — suivi d’un site à l’autre, afin de cibler nos campagnes de sensibilisation. Outils utilisés : Google Ads et le pixel Meta.</li>
      </ul>
      <p><b>Aucun de ces outils n’est chargé avant votre accord.</b> Tant que vous n’avez pas répondu, rien n’est déposé et aucune requête n’est envoyée à ces tiers. L’absence de réponse vaut refus.</p>
      <p>Vous pouvez revenir sur votre choix à tout moment : le lien <b>« Cookies »</b>, en bas de chaque page, rouvre la fenêtre de choix. Un refus prend effet au chargement de page suivant, le temps que les outils déjà chargés cessent de l’être.</p>
      <p>Si votre navigateur émet un signal de refus du suivi (<i>Global Privacy Control</i>), nous le traitons comme un refus déjà exprimé : la fenêtre ne vous est pas présentée et rien n’est déposé.</p>

      <h2>Contact</h2>
      <p>Pour toute question relative à cette politique de confidentialité, contactez-nous à contact@ivoiriens.ac.ci.</p>
    """},
  ],
},

]
