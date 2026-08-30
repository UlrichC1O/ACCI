-- =========================================================================
-- ACCI — Demandes déposées depuis le site public
-- -------------------------------------------------------------------------
-- Les formulaires du site (contact, adhésion, signalement, cellule d'écoute,
-- lettre d'information) n'avaient aucune destination : faute de point de
-- terminaison, ils ouvraient la messagerie du visiteur et rien ne parvenait
-- à l'association. Cette table est cette destination, et la « Réception » du
-- CRM la lit.
--
-- SÉCURITÉ — LE POINT À NE PAS MANQUER
-- La clé publiable (sb_publishable_…) est distribuée dans le bundle
-- JavaScript public : n'importe qui peut la lire. Le rôle « anon » doit donc
-- pouvoir INSÉRER une demande et RIEN D'AUTRE. Aucune politique SELECT ne lui
-- est accordée : une lecture anonyme exposerait le nom, le téléphone et le
-- message de chaque visiteur — y compris ceux adressés à la cellule d'écoute
-- par des personnes en situation de vulnérabilité.
--
-- À appliquer sur le projet Supabase du site (SQL Editor, ou `supabase db push`).
-- =========================================================================

create table if not exists public.form_requests (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),

  -- Quel formulaire a été envoyé. Texte + contrainte plutôt qu'un type enum :
  -- ajouter un formulaire ne demandera pas de migration de type.
  kind        text not null default 'contact'
              check (kind in ('contact','adhesion','signalement','ecoute','newsletter')),

  name        text,
  email       text,
  phone       text,
  subject     text,
  message     text,
  page        text,          -- page d'origine, pour savoir d'où vient la demande

  -- Renseigné par l'administration quand la demande a été traitée. La
  -- Réception ne redescend que les demandes dont ce champ est nul.
  handled_at  timestamptz,

  -- Bornes de taille : le rôle anon écrit sans authentification, et rien
  -- côté client n'empêche d'envoyer un message d'un mégaoctet.
  constraint form_requests_len check (
    coalesce(length(name),0)    <= 200 and
    coalesce(length(email),0)   <= 200 and
    coalesce(length(phone),0)   <= 60  and
    coalesce(length(subject),0) <= 300 and
    coalesce(length(message),0) <= 5000 and
    coalesce(length(page),0)    <= 300
  )
);

alter table public.form_requests enable row level security;
alter table public.form_requests force row level security;

-- Le visiteur dépose une demande…
drop policy if exists form_requests_insert_anon on public.form_requests;
create policy form_requests_insert_anon
  on public.form_requests
  for insert
  to anon
  with check (handled_at is null);

-- …et ne relit jamais rien. Absence volontaire de politique SELECT pour anon.

-- L'administration authentifiée lit et marque comme traité.
drop policy if exists form_requests_select_auth on public.form_requests;
create policy form_requests_select_auth
  on public.form_requests
  for select
  to authenticated
  using (true);

drop policy if exists form_requests_update_auth on public.form_requests;
create policy form_requests_update_auth
  on public.form_requests
  for update
  to authenticated
  using (true)
  with check (true);

-- La Réception ne demande que les demandes non traitées, les plus récentes
-- d'abord : index partiel, il ne porte que sur ces lignes-là.
create index if not exists form_requests_pending_idx
  on public.form_requests (created_at desc)
  where handled_at is null;

comment on table public.form_requests is
  'Demandes déposées depuis les formulaires du site public. anon insère, seul un compte authentifié lit.';
