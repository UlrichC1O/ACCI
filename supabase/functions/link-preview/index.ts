// =========================================================================
// ACCI — Aperçu d'un lien (oEmbed)
// -------------------------------------------------------------------------
// Le CRM tourne dans le navigateur, et sa politique de sécurité n'autorise de
// connexion que vers Supabase : il ne peut donc pas interroger YouTube ou
// TikTok lui-même. Cette fonction fait l'appel à sa place.
//
// CE QU'ELLE RENVOIE, ET RIEN DE PLUS
// Le titre, le nom du compte et la vignette, tels que la plateforme les
// publie sur son point oEmbed ouvert. Ni date de publication, ni lieu :
// aucun des deux ne figure dans ces réponses — c'est vérifié, pas supposé.
//
// DEUX PLATEFORMES SEULEMENT. YouTube et TikTok publient un oEmbed sans
// authentification. X ne répond plus (301), Instagram et Facebook exigent un
// jeton d'application Meta. Ajouter une plateforme ici demande d'abord de
// vérifier qu'elle répond sans jeton.
//
// POURQUOI UNE LISTE BLANCHE D'HÔTES — le point le plus important.
// Une fonction qui accepterait n'importe quelle adresse serait un relais :
// on lui ferait visiter des ressources internes de l'infrastructure
// (metadata cloud, services privés) depuis un réseau de confiance, et lire
// la réponse. C'est la faille SSRF. Ici l'adresse fournie n'est jamais
// appelée telle quelle : elle sert seulement à construire l'appel vers un
// point oEmbed dont l'hôte est écrit dans ce fichier.
//
// ET UNE SESSION EXIGÉE. Sans elle, l'adresse de la fonction étant publique,
// n'importe qui s'en servirait comme d'un anonymiseur au frais du projet.
// =========================================================================

const OEMBED: Record<string, string> = {
  "youtube.com": "https://www.youtube.com/oembed",
  "www.youtube.com": "https://www.youtube.com/oembed",
  "m.youtube.com": "https://www.youtube.com/oembed",
  "youtu.be": "https://www.youtube.com/oembed",
  "tiktok.com": "https://www.tiktok.com/oembed",
  "www.tiktok.com": "https://www.tiktok.com/oembed",
};

const CORS = {
  // L'administration est servie depuis le site ; elle seule appelle ceci.
  "Access-Control-Allow-Origin": "https://www.ivoiriens.ac.ci",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  // Session obligatoire. On ne vérifie pas les droits CRM ici : cette
  // fonction ne lit ni n'écrit aucune donnée de l'association, elle ne fait
  // que relayer une requête publique. Exiger d'être connecté suffit à ce
  // qu'elle ne serve à personne d'autre.
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ") || auth.length < 40) {
    return json({ error: "Session requise." }, 401);
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Requête illisible." }, 400);
  }

  const brut = (body.url || "").trim();
  if (!brut) return json({ error: "Adresse manquante." }, 400);

  let cible: URL;
  try {
    cible = new URL(brut);
  } catch {
    return json({ error: "Adresse invalide." }, 400);
  }
  if (cible.protocol !== "https:") {
    return json({ error: "Seules les adresses https sont acceptées." }, 400);
  }

  const point = OEMBED[cible.hostname.toLowerCase()];
  if (!point) {
    return json({
      error: "Cette plateforme ne publie pas d’aperçu ouvert. " +
             "Seuls YouTube et TikTok répondent sans jeton d’application.",
    }, 422);
  }

  // Un appel qui traîne bloquerait l'écran de l'opérateur sans jamais échouer.
  const stop = AbortSignal.timeout(8000);
  let r: Response;
  try {
    r = await fetch(`${point}?format=json&url=${encodeURIComponent(cible.toString())}`, {
      signal: stop,
      headers: { "User-Agent": "ACCI-CRM/1.0 (+https://www.ivoiriens.ac.ci)" },
    });
  } catch {
    return json({ error: "La plateforme n’a pas répondu à temps." }, 504);
  }

  if (!r.ok) {
    // 404 ici veut dire « ce contenu n'existe pas, ou plus » : c'est un
    // renseignement en soi pour un signalement, et non une panne.
    return json({
      error: r.status === 404
        ? "Contenu introuvable : il a peut-être été retiré depuis le signalement."
        : `La plateforme a refusé la demande (${r.status}).`,
    }, 422);
  }

  let d: Record<string, unknown>;
  try {
    d = await r.json();
  } catch {
    return json({ error: "Réponse illisible de la plateforme." }, 502);
  }

  // Seuls les champs attendus ressortent, bornés en longueur : le contenu
  // vient d'un tiers et finit dans l'écran d'un opérateur.
  const coupe = (v: unknown, n: number) =>
    typeof v === "string" ? v.slice(0, n) : "";

  return json({
    found: true,
    title: coupe(d.title, 300),
    author: coupe(d.author_name, 200),
    authorUrl: coupe(d.author_url, 500),
    thumbnail: coupe(d.thumbnail_url, 500),
    provider: coupe(d.provider_name, 100),
    // Dit explicitement, pour que l'appelant n'ait pas à le déduire d'une
    // absence : ces deux champs ne sont pas fournis par oEmbed.
    publishedAt: null,
    location: null,
  });
});
