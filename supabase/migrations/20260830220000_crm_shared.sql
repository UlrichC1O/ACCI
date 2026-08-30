-- =========================================================================
-- ACCI — Données partagées du CRM
-- -------------------------------------------------------------------------
-- Jusqu'ici le CRM vivait entièrement dans le localStorage du navigateur :
-- installer l'application sur deux téléphones donnait deux bases distinctes
-- qui ne se voyaient pas. Ces tables sont la base commune. Le CRM installé
-- sur chaque appareil lit et écrit ici ; c'est ce qui permet à plusieurs
-- personnes de travailler sur le même annuaire.
--
-- PÉRIMÈTRE. Seules les données réellement partagées sont remontées :
-- membres, photos, pièces d'identité, demandes, cotisations, journal d'audit.
-- Les autres magasins (notes personnelles, préférences d'affichage, brouillons)
-- restent locaux — les partager n'apporterait rien et multiplierait les
-- conflits d'écriture.
--
-- POURQUOI LE NUMÉRO DE PIÈCE EST DANS SA PROPRE TABLE
-- C'est le point le plus important de cette migration. Côté navigateur, le
-- masquage du numéro de CNI et sa réserve au Super Admin sont des garde-fous
-- d'interface : quiconque ouvre la console lit le magasin. En le plaçant dans
-- une table à part, dotée de sa propre politique, c'est le SERVEUR qui refuse
-- de l'envoyer à un administrateur ordinaire. Il ne s'agit plus de masquer une
-- valeur reçue : elle n'est pas transmise. Une table par niveau de
-- confidentialité est le seul découpage que Postgres sait faire respecter,
-- RLS étant une sécurité par ligne et non par colonne.
--
-- IDENTIFIANTS. Contrairement à l'usage (bigint generated always as identity),
-- la clé primaire est le texte produit par le navigateur. C'est délibéré :
-- les fiches existent déjà sur les postes avant d'être remontées, et une clé
-- attribuée par le serveur obligerait à tenir une table de correspondance sur
-- chaque appareil. Avec l'identifiant du client comme clé, la remontée est un
-- simple upsert, rejouable sans jamais créer de doublon.
--
-- À appliquer sur le projet Supabase du site (SQL Editor, ou `supabase db push`).
-- =========================================================================

-- ---------------------------------------------------------------------------
-- Schéma privé : fonctions d'aide aux politiques
-- ---------------------------------------------------------------------------
create schema if not exists private;
-- USAGE est indispensable : l'expression d'une politique est évaluée avec les
-- droits de celui qui interroge. Sans elle, chaque requête d'un administrateur
-- échouait sur « permission denied for schema private » — toutes les tables
-- devenaient inaccessibles d'un coup.
-- Cela n'expose rien pour autant : PostgREST ne publie que le schéma public,
-- ces fonctions restent donc inappelables depuis l'API.
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Comptes d'administration
-- ---------------------------------------------------------------------------
-- Un compte Supabase (auth.users) ne dit rien des droits dans le CRM : cette
-- table les porte. Elle est le pivot de toutes les politiques ci-dessous.
create table if not exists public.crm_admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  name        text not null default '',
  -- 'super_admin' ouvre la gestion des comptes ET la lecture des numéros de
  -- pièce ; 'admin' est le rôle courant.
  role        text not null default 'admin'
              check (role in ('admin', 'super_admin')),
  -- Un compte créé mais pas encore validé n'accède à rien. C'est ce qui permet
  -- d'inviter quelqu'un sans lui ouvrir la base dans la seconde.
  approved    boolean not null default false,

  constraint crm_admins_name_len check (length(name) <= 200)
);

alter table public.crm_admins enable row level security;
alter table public.crm_admins force row level security;

-- Les fonctions sont SECURITY DEFINER : elles doivent lire crm_admins sans
-- repasser par la politique de crm_admins, sous peine de récursion infinie.
-- search_path vide : sans lui, un schéma placé en tête par l'appelant
-- pourrait substituer sa propre table crm_admins à celle-ci.
create or replace function private.is_crm_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.crm_admins
    where user_id = (select auth.uid()) and approved
  );
$$;

create or replace function private.is_crm_super()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.crm_admins
    where user_id = (select auth.uid()) and approved and role = 'super_admin'
  );
$$;

revoke execute on function private.is_crm_admin() from public, anon;
revoke execute on function private.is_crm_super() from public, anon;
grant execute on function private.is_crm_admin() to authenticated;
grant execute on function private.is_crm_super() to authenticated;

-- Chacun lit sa propre fiche (pour connaître son rôle au démarrage) ; un
-- Super Admin lit et gère toutes les autres.
drop policy if exists crm_admins_select_self on public.crm_admins;
create policy crm_admins_select_self on public.crm_admins
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_crm_super()));

drop policy if exists crm_admins_write_super on public.crm_admins;
create policy crm_admins_write_super on public.crm_admins
  for all to authenticated
  using ((select private.is_crm_super()))
  with check ((select private.is_crm_super()));

-- ---------------------------------------------------------------------------
-- updated_at : horodatage tenu par le serveur
-- ---------------------------------------------------------------------------
-- La synchronisation départage deux versions d'une même fiche par leur date de
-- modification. Laissée au client, cette date dépendrait de l'horloge du
-- téléphone : un appareil en retard de deux heures verrait ses modifications
-- systématiquement écartées, sans que rien ne le signale.
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Membres
-- ---------------------------------------------------------------------------
create table if not exists public.crm_members (
  id          text primary key,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,          -- suppression douce : voir plus bas

  name        text not null default '',
  company     text not null default '',
  kind        text not null default 'Individuel',   -- « type » est réservé
  email       text not null default '',
  phone       text not null default '',
  address     text not null default '',
  city        text not null default '',
  country     text not null default '',
  status      text not null default 'Lead',
  tags        text[] not null default '{}',
  notes       text not null default '',
  charter     boolean not null default false,
  premium     boolean not null default false,
  approved    boolean not null default false,
  certified   boolean not null default false,
  cert_number text not null default '',
  cert_date   text not null default '',
  cert_expiry text not null default '',

  constraint crm_members_id_len check (length(id) between 1 and 64),
  constraint crm_members_len check (
    length(name) <= 200 and length(company) <= 200 and length(email) <= 200 and
    length(phone) <= 60 and length(address) <= 300 and length(city) <= 120 and
    length(country) <= 120 and length(status) <= 40 and length(kind) <= 40 and
    length(notes) <= 5000 and coalesce(array_length(tags, 1), 0) <= 30
  )
);

-- Suppression douce, et non DELETE : sans elle, un appareil resté hors
-- connexion pendant la suppression d'un membre le recréerait à sa prochaine
-- remontée, puisque sa copie locale existe toujours. La date de suppression se
-- propage comme n'importe quelle autre modification.
create index if not exists crm_members_live_idx
  on public.crm_members (updated_at desc) where deleted_at is null;
create index if not exists crm_members_email_idx
  on public.crm_members (lower(email)) where deleted_at is null and email <> '';

drop trigger if exists crm_members_touch on public.crm_members;
create trigger crm_members_touch before insert or update on public.crm_members
  for each row execute function private.touch_updated_at();

alter table public.crm_members enable row level security;
alter table public.crm_members force row level security;

drop policy if exists crm_members_all_admin on public.crm_members;
create policy crm_members_all_admin on public.crm_members
  for all to authenticated
  using ((select private.is_crm_admin()))
  with check ((select private.is_crm_admin()));

-- ---------------------------------------------------------------------------
-- Photos des membres
-- ---------------------------------------------------------------------------
-- La photo sert à reconnaître un membre au guichet : tout administrateur du
-- CRM la voit. Elle est séparée de la fiche pour la même raison que côté
-- navigateur — une image en base64 pèse cinquante fois le reste, et la liste
-- des membres n'a pas à la transporter à chaque chargement.
create table if not exists public.crm_member_photos (
  member_id   text primary key references public.crm_members (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  photo       text not null,        -- URL de données, déjà réduite à 256 px
  px          integer not null default 0,

  -- ~64 Ko : très au-delà de ce que produit le redimensionnement du CRM
  -- (12 à 18 Ko), et assez bas pour qu'un envoi non conforme soit refusé.
  constraint crm_member_photos_len check (length(photo) <= 65536)
);

drop trigger if exists crm_member_photos_touch on public.crm_member_photos;
create trigger crm_member_photos_touch before insert or update on public.crm_member_photos
  for each row execute function private.touch_updated_at();

alter table public.crm_member_photos enable row level security;
alter table public.crm_member_photos force row level security;

drop policy if exists crm_member_photos_all_admin on public.crm_member_photos;
create policy crm_member_photos_all_admin on public.crm_member_photos
  for all to authenticated
  using ((select private.is_crm_admin()))
  with check ((select private.is_crm_admin()));

-- ---------------------------------------------------------------------------
-- Pièces d'identité — table à part, politique à part
-- ---------------------------------------------------------------------------
-- Le numéro de pièce ne sort d'ici que pour un Super Admin. Un administrateur
-- ordinaire ne reçoit pas une valeur masquée : il ne reçoit rien. C'est la
-- différence entre un masquage d'affichage, contournable par la console, et un
-- refus du serveur.
--
-- Le statut de vérification, lui, intéresse tout le monde (« la pièce de ce
-- membre a-t-elle été vue ? ») et vit donc avec la photo, sans le numéro.
create table if not exists public.crm_member_ids (
  member_id    text primary key references public.crm_members (id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  doc_number   text not null default '',   -- normalisé : majuscules, sans espaces
  doc_type     text not null default 'CNI',
  verified     boolean not null default false,
  verified_at  timestamptz,
  verified_by  text not null default '',
  note         text not null default '',

  constraint crm_member_ids_len check (
    length(doc_number) <= 32 and length(doc_type) <= 60 and
    length(verified_by) <= 120 and length(note) <= 2000
  )
);

-- Une pièce ne vaut que pour une adhésion : le contrôle de doublon que le CRM
-- fait à la saisie est ici rendu inviolable. Sans lui, deux appareils hors
-- connexion pouvaient enregistrer la même pièce sur deux membres et se
-- synchroniser tous les deux sans erreur.
--
-- Index partiel, et non contrainte UNIQUE : le numéro vaut '' tant qu'il n'est
-- pas renseigné, et une contrainte ordinaire aurait fait entrer en collision
-- tous les dossiers sans numéro — c'est-à-dire tous les dossiers au premier
-- jour. Seuls les numéros réellement saisis sont comparés.
create unique index if not exists crm_member_ids_doc_uniq
  on public.crm_member_ids (doc_number) where doc_number <> '';

drop trigger if exists crm_member_ids_touch on public.crm_member_ids;
create trigger crm_member_ids_touch before insert or update on public.crm_member_ids
  for each row execute function private.touch_updated_at();

alter table public.crm_member_ids enable row level security;
alter table public.crm_member_ids force row level security;

drop policy if exists crm_member_ids_super on public.crm_member_ids;
create policy crm_member_ids_super on public.crm_member_ids
  for all to authenticated
  using ((select private.is_crm_super()))
  with check ((select private.is_crm_super()));

-- ---------------------------------------------------------------------------
-- Demandes & signalements
-- ---------------------------------------------------------------------------
create table if not exists public.crm_tickets (
  id          text primary key,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,

  member_id   text references public.crm_members (id) on delete set null,
  title       text not null default '',
  description text not null default '',
  priority    text not null default 'Moyen',
  status      text not null default 'Ouvert',
  due_date    text not null default '',

  constraint crm_tickets_id_len check (length(id) between 1 and 64),
  constraint crm_tickets_len check (
    length(title) <= 300 and length(description) <= 10000 and
    length(priority) <= 40 and length(status) <= 40
  )
);

-- Index sur la clé étrangère : Postgres n'en crée pas d'office, et sans lui la
-- suppression d'un membre balaie toute la table des demandes.
create index if not exists crm_tickets_member_idx on public.crm_tickets (member_id);
create index if not exists crm_tickets_live_idx
  on public.crm_tickets (updated_at desc) where deleted_at is null;

drop trigger if exists crm_tickets_touch on public.crm_tickets;
create trigger crm_tickets_touch before insert or update on public.crm_tickets
  for each row execute function private.touch_updated_at();

alter table public.crm_tickets enable row level security;
alter table public.crm_tickets force row level security;

drop policy if exists crm_tickets_all_admin on public.crm_tickets;
create policy crm_tickets_all_admin on public.crm_tickets
  for all to authenticated
  using ((select private.is_crm_admin()))
  with check ((select private.is_crm_admin()));

-- ---------------------------------------------------------------------------
-- Cotisations & factures
-- ---------------------------------------------------------------------------
create table if not exists public.crm_invoices (
  id          text primary key,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,

  member_id   text references public.crm_members (id) on delete set null,
  number      text not null default '',
  kind        text not null default 'Facture',
  status      text not null default 'Brouillon',
  issue_date  text not null default '',
  due_date    text not null default '',
  -- numeric et non float : un montant en virgule flottante accumule des écarts
  -- de centimes qu'aucun rapprochement comptable ne rattrape.
  total       numeric(14, 2) not null default 0,

  constraint crm_invoices_id_len check (length(id) between 1 and 64),
  constraint crm_invoices_len check (
    length(number) <= 60 and length(kind) <= 40 and length(status) <= 40
  )
);

create index if not exists crm_invoices_member_idx on public.crm_invoices (member_id);
create index if not exists crm_invoices_live_idx
  on public.crm_invoices (updated_at desc) where deleted_at is null;

drop trigger if exists crm_invoices_touch on public.crm_invoices;
create trigger crm_invoices_touch before insert or update on public.crm_invoices
  for each row execute function private.touch_updated_at();

alter table public.crm_invoices enable row level security;
alter table public.crm_invoices force row level security;

drop policy if exists crm_invoices_all_admin on public.crm_invoices;
create policy crm_invoices_all_admin on public.crm_invoices
  for all to authenticated
  using ((select private.is_crm_admin()))
  with check ((select private.is_crm_admin()));

-- ---------------------------------------------------------------------------
-- Journal d'audit
-- ---------------------------------------------------------------------------
-- Le journal ne se modifie ni ne s'efface : un journal qu'on peut retoucher
-- n'atteste de rien. Aucune politique UPDATE ni DELETE n'est accordée, y
-- compris au Super Admin.
create table if not exists public.crm_audit (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),

  actor       text not null default '',      -- identifiant lisible de l'auteur
  entity      text not null default '',
  entity_id   text not null default '',
  action      text not null default '',
  detail      text not null default '',

  constraint crm_audit_len check (
    length(actor) <= 120 and length(entity) <= 60 and
    length(entity_id) <= 64 and length(action) <= 200 and length(detail) <= 500
  )
);

create index if not exists crm_audit_recent_idx on public.crm_audit (created_at desc);
create index if not exists crm_audit_entity_idx on public.crm_audit (entity, entity_id);

alter table public.crm_audit enable row level security;
alter table public.crm_audit force row level security;

drop policy if exists crm_audit_insert_admin on public.crm_audit;
create policy crm_audit_insert_admin on public.crm_audit
  for insert to authenticated
  with check ((select private.is_crm_admin()));

drop policy if exists crm_audit_select_admin on public.crm_audit;
create policy crm_audit_select_admin on public.crm_audit
  for select to authenticated
  using ((select private.is_crm_admin()));

-- ---------------------------------------------------------------------------
-- Commentaires
-- ---------------------------------------------------------------------------
comment on table public.crm_admins is
  'Droits des comptes Supabase dans le CRM. Pivot de toutes les politiques.';
comment on table public.crm_members is
  'Annuaire partagé des membres et partenaires. Suppression douce (deleted_at).';
comment on table public.crm_member_photos is
  'Portraits des membres. Lisibles par tout administrateur approuvé.';
comment on table public.crm_member_ids is
  'Numéros de pièce d''identité. Lecture et écriture réservées au Super Admin : le serveur ne les transmet pas aux autres.';
comment on table public.crm_tickets is 'Demandes et signalements.';
comment on table public.crm_invoices is 'Cotisations et factures.';
comment on table public.crm_audit is
  'Journal d''audit. Insertion et lecture seulement : ni modification ni suppression.';

-- ---------------------------------------------------------------------------
-- PREMIER COMPTE — à exécuter une fois, à la main
-- ---------------------------------------------------------------------------
-- Toutes les politiques exigent d'être déjà administrateur : la première ligne
-- de crm_admins ne peut donc être créée par personne depuis l'application.
-- Elle s'insère depuis le SQL Editor, qui passe outre RLS.
--
--   1. Authentication → Users → Add user : créez le compte avec son e-mail.
--   2. Puis, en remplaçant l'adresse :
--
-- insert into public.crm_admins (user_id, name, role, approved)
-- select id, 'Prénom Nom', 'super_admin', true
--   from auth.users where email = 'president@ivoiriens.ac.ci'
-- on conflict (user_id) do update
--   set role = 'super_admin', approved = true;
--
-- Les comptes suivants se créent depuis le CRM, par ce premier Super Admin.
