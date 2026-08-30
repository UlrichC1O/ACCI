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
-- membres, dossiers d'identité, demandes, cotisations, journal d'audit.
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
-- PAS de « force » sur CETTE table, contrairement aux autres.
--
-- « force » retire au propriétaire de la table sa dispense de RLS. Or les deux
-- fonctions ci-dessous sont SECURITY DEFINER précisément pour lire crm_admins
-- SANS repasser par sa politique — et cette politique les appelle. Forcer RLS
-- ici, c'est refermer la boucle : la politique appelle la fonction, qui relit
-- la table, qui applique la politique. Le commentaire juste en dessous
-- annonçait cette précaution ; la ligne « force » la défaisait.
--
-- C'est aussi ce qui aurait empêché de créer le tout premier compte. Les
-- politiques de crm_admins exigent d'être déjà administrateur : sur une table
-- vide, aucune ne peut être satisfaite, et l'insertion d'amorçage depuis
-- l'éditeur SQL n'aurait plus eu d'issue.
--
-- La protection reste entière là où elle compte : « enable » gouverne anon et
-- authenticated, c'est-à-dire tout ce qui arrive par l'API. Seul le
-- propriétaire — postgres, l'éditeur SQL — conserve sa dispense, et c'est
-- exactement à lui qu'il revient d'amorcer la table.
-- Les tables de données, elles, gardent « force » : aucune de leurs politiques
-- ne se rappelle elle-même.

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
-- Dossier d'un membre : photo, type de pièce, vérification
-- ---------------------------------------------------------------------------
-- Tout ce qui n'est PAS le numéro lui-même. La photo sert à reconnaître un
-- membre au guichet et le statut de vérification répond à « la pièce de ce
-- membre a-t-elle été vue ? » : les deux intéressent chaque administrateur.
--
-- La table s'appelle « pieces » comme le magasin du navigateur qu'elle reçoit
-- (acci_member_pieces) : le même dossier des deux côtés, sans traduction.
--
-- Séparée de la fiche membre pour la même raison que côté navigateur : une
-- image en base64 pèse cinquante fois le reste, et la liste des membres n'a
-- pas à la transporter à chaque chargement.
create table if not exists public.crm_member_pieces (
  member_id   text primary key references public.crm_members (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  photo       text not null default '',   -- URL de données, déjà réduite à 256 px
  px          integer not null default 0,
  doc_type    text not null default 'CNI',
  verified    boolean not null default false,
  verified_at timestamptz,                -- nul tant que rien n'est vérifié
  verified_by text not null default '',
  note        text not null default '',

  -- ~64 Ko : très au-delà de ce que produit le redimensionnement du CRM
  -- (12 à 18 Ko), et assez bas pour qu'un envoi non conforme soit refusé.
  constraint crm_member_pieces_len check (
    length(photo) <= 65536 and length(doc_type) <= 60 and
    length(verified_by) <= 120 and length(note) <= 2000
  )
);

drop trigger if exists crm_member_pieces_touch on public.crm_member_pieces;
create trigger crm_member_pieces_touch before insert or update on public.crm_member_pieces
  for each row execute function private.touch_updated_at();

alter table public.crm_member_pieces enable row level security;
alter table public.crm_member_pieces force row level security;

drop policy if exists crm_member_pieces_all_admin on public.crm_member_pieces;
create policy crm_member_pieces_all_admin on public.crm_member_pieces
  for all to authenticated
  using ((select private.is_crm_admin()))
  with check ((select private.is_crm_admin()));

-- ---------------------------------------------------------------------------
-- Le numéro de pièce, et lui seul
-- ---------------------------------------------------------------------------
-- Cette table ne porte qu'une donnée : le numéro. C'est le seul élément du
-- dossier qui soit réellement confidentiel, et l'isoler est ce qui permet au
-- SERVEUR de refuser de l'envoyer — RLS étant une sécurité par ligne et non
-- par colonne, une table par niveau de confidentialité est le seul découpage
-- que Postgres sache faire respecter. Un administrateur ordinaire ne reçoit
-- pas une valeur masquée : il ne reçoit rien.
--
-- LIRE ET ÉCRIRE NE SE GOUVERNENT PAS PAREIL, et c'est le point délicat.
-- Celui qui tient le guichet recopie le numéro de la carte qu'il a sous les
-- yeux : lui interdire d'écrire rendrait le registre inutilisable, et c'est
-- ce que faisait la politique « for all » précédente. Mais il n'a aucune
-- raison de RELIRE le numéro d'un autre membre plus tard.
-- D'où quatre politiques distinctes plutôt qu'une : il peut inscrire et
-- corriger sans jamais lire, et cela reflète exactement ce que fait déjà
-- l'écran (champ vide, numéro en place indiqué en repère masqué).
create table if not exists public.crm_member_ids (
  member_id    text primary key references public.crm_members (id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  doc_number   text not null default '',   -- normalisé : majuscules, sans espaces

  constraint crm_member_ids_len check (length(doc_number) <= 32)
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

-- Lire : Super Admin seulement. C'est toute la raison d'être de la table.
drop policy if exists crm_member_ids_select_super on public.crm_member_ids;
create policy crm_member_ids_select_super on public.crm_member_ids
  for select to authenticated
  using ((select private.is_crm_super()));

-- Inscrire un numéro : tout administrateur approuvé. Il l'a sous les yeux.
drop policy if exists crm_member_ids_insert_admin on public.crm_member_ids;
create policy crm_member_ids_insert_admin on public.crm_member_ids
  for insert to authenticated
  with check ((select private.is_crm_admin()));

-- Corriger un numéro : de même. USING sans politique SELECT autorise la mise à
-- jour sans ouvrir la lecture — c'est précisément la distinction recherchée.
drop policy if exists crm_member_ids_update_admin on public.crm_member_ids;
create policy crm_member_ids_update_admin on public.crm_member_ids
  for update to authenticated
  using ((select private.is_crm_admin()))
  with check ((select private.is_crm_admin()));

-- Effacer : Super Admin seulement. Retirer une pièce attestée est un acte de
-- gestion, pas une correction de saisie.
drop policy if exists crm_member_ids_delete_super on public.crm_member_ids;
create policy crm_member_ids_delete_super on public.crm_member_ids
  for delete to authenticated
  using ((select private.is_crm_super()));

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
comment on table public.crm_member_pieces is
  'Dossier d''identité hors numéro : photo, type de pièce, vérification. Lisible par tout administrateur approuvé.';
comment on table public.crm_member_ids is
  'Numéros de pièce d''identité, et rien d''autre. Lecture réservée au Super Admin ; tout administrateur peut inscrire et corriger sans jamais relire.';
comment on table public.crm_tickets is 'Demandes et signalements.';
comment on table public.crm_invoices is 'Cotisations et factures.';
comment on table public.crm_audit is
  'Journal d''audit. Insertion et lecture seulement : ni modification ni suppression.';

-- ---------------------------------------------------------------------------
-- POUR LA COUCHE DE SYNCHRONISATION — trois conversions obligatoires
-- ---------------------------------------------------------------------------
-- Le CRM du navigateur emploie la chaîne vide là où Postgres attend autre
-- chose. Les trois cas ci-dessous provoqueraient une erreur à la première
-- remontée ; ils sont notés ici parce que c'est le schéma qui les impose, et
-- qu'un commentaire dans le code client se serait perdu.
--
--   1. verified_at : le CRM écrit "" tant qu'aucune pièce n'est vérifiée.
--      Envoyer "" dans une colonne timestamptz échoue
--      (« invalid input syntax for type timestamp »). Convertir en null.
--
--   2. member_id des demandes et des cotisations : le CRM écrit "" quand
--      aucun membre n'est rattaché. La clé étrangère refuse "" — aucun membre
--      ne porte cet identifiant. Convertir en null ; la colonne l'accepte, et
--      « on delete set null » repose sur cette même valeur.
--
--   3. total d'une cotisation : envoyer un nombre, jamais "". numeric refuse
--      la chaîne vide, et 0 n'est pas la même chose qu'« inconnu ».
--
-- Dans l'autre sens, une colonne nulle revient en null et non en "" : c'est au
-- client de retomber sur sa valeur par défaut.

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
