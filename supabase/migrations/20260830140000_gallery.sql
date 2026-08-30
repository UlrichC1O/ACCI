-- =========================================================================
-- ACCI — Galerie photos administrable
-- -------------------------------------------------------------------------
-- La page « Galerie photos » porte deux sections figées dans build.py :
--   « Nos temps forts » — six photos avec légende
--   « Nos albums »      — six albums présentés en cartes
-- Ajouter une photo après un événement demandait donc de modifier le code et
-- de recompiler le site. Ces deux tables les rendent modifiables depuis le CRM.
--
-- ACCÈS — différent de form_requests, et volontairement
-- Ici le contenu est PUBLIC par destination : c'est ce que le visiteur doit
-- voir. La lecture est donc ouverte au rôle anon (comme pour « partners »),
-- et seule l'écriture exige une session authentifiée.
-- Le contraste avec form_requests est délibéré : là-bas anon écrit sans lire,
-- ici anon lit sans écrire.
--
-- À appliquer sur le projet Supabase du site (SQL Editor, ou `supabase db push`).
-- =========================================================================

-- ---------------------------------------------------------------- photos --
create table if not exists public.gallery_photos (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),

  -- Clé de photothèque ("formation.jpg") ou URL https complète : les deux
  -- formes que site-images.js et site-partners.js savent déjà résoudre.
  image       text not null,
  alt         text not null default '',   -- description pour les lecteurs d'écran
  caption     text not null default '',   -- légende affichée sous la photo

  position    integer not null default 0, -- ordre d'affichage
  active      boolean not null default true,

  constraint gallery_photos_len check (
    length(image) <= 500 and
    coalesce(length(alt),0) <= 300 and
    coalesce(length(caption),0) <= 300
  )
);

-- ---------------------------------------------------------------- albums --
create table if not exists public.gallery_albums (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),

  title       text not null,
  text        text not null default '',
  icon        text not null default 'camera',  -- clé du jeu d'icônes du site
  href        text,                            -- page ou URL, facultatif
  image       text,                            -- vignette, facultative

  position    integer not null default 0,
  active      boolean not null default true,

  constraint gallery_albums_len check (
    length(title) <= 200 and
    coalesce(length(text),0)  <= 500 and
    coalesce(length(icon),0)  <= 40  and
    coalesce(length(href),0)  <= 300 and
    coalesce(length(image),0) <= 500
  )
);

-- ------------------------------------------------------------------- RLS --
alter table public.gallery_photos enable row level security;
alter table public.gallery_photos force row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_albums force row level security;

-- Lecture publique : c'est le contenu de la page.
drop policy if exists gallery_photos_read on public.gallery_photos;
create policy gallery_photos_read
  on public.gallery_photos for select to anon, authenticated using (true);

drop policy if exists gallery_albums_read on public.gallery_albums;
create policy gallery_albums_read
  on public.gallery_albums for select to anon, authenticated using (true);

-- Écriture réservée à une session authentifiée. « for all » couvre insert,
-- update et delete ; anon n'est pas concerné faute de politique pour lui.
drop policy if exists gallery_photos_write on public.gallery_photos;
create policy gallery_photos_write
  on public.gallery_photos for all to authenticated
  using (true) with check (true);

drop policy if exists gallery_albums_write on public.gallery_albums;
create policy gallery_albums_write
  on public.gallery_albums for all to authenticated
  using (true) with check (true);

-- ----------------------------------------------------------------- index --
-- Le site ne demande que les entrées actives, dans l'ordre d'affichage :
-- index partiel, il ne porte que sur ces lignes-là.
create index if not exists gallery_photos_active_idx
  on public.gallery_photos (position, id) where active;
create index if not exists gallery_albums_active_idx
  on public.gallery_albums (position, id) where active;

comment on table public.gallery_photos is
  'Section « Nos temps forts » de la page Galerie photos. Lecture publique, écriture authentifiée.';
comment on table public.gallery_albums is
  'Section « Nos albums » de la page Galerie photos. Lecture publique, écriture authentifiée.';
