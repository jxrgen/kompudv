-- Kompetenceudviklings-app — databaseskema til Supabase (Postgres)
-- Kør denne fil i Supabase Studio → SQL Editor på et NYT projekt (EU-region: eu-central-1 / eu-west).
-- Skemaet er idempotent nok til at kunne køres igen, men vær forsigtig på et projekt med data.

-- ---------------------------------------------------------------------------
-- 1) Profiler: én række pr. bruger, kobles til auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Brugerprofil. is_admin styrer adgang til alle brugeres data.';

-- ---------------------------------------------------------------------------
-- 2) Kompetenceregistreringer
-- ---------------------------------------------------------------------------
create table if not exists public.competences (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  activity_date  date not null,
  duration_value numeric(6,2) not null check (duration_value >= 0),
  duration_unit  text not null default 'timer' check (duration_unit in ('timer', 'dage')),
  activity_type  text not null check (activity_type in ('Kursus m/ bevis', 'Kursus', 'Praktik', 'Andet')),
  title          text not null check (char_length(title) between 1 and 4000),
  created_at     timestamptz not null default now()
);

create index if not exists competences_user_id_idx on public.competences (user_id);
create index if not exists competences_activity_date_idx on public.competences (activity_date);

comment on table public.competences is 'En brugers registrerede kompetenceudvikling.';

-- ---------------------------------------------------------------------------
-- 3) Hjælpefunktion: er den aktuelle bruger admin?
--    security definer, så den kan læse profiles uden at ramme RLS rekursivt.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- 4) Opret automatisk en profil, når en bruger oprettes
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5) Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.competences enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- competences
drop policy if exists competences_select on public.competences;
create policy competences_select on public.competences
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists competences_insert_own on public.competences;
create policy competences_insert_own on public.competences
  for insert with check (user_id = auth.uid());

drop policy if exists competences_update_own on public.competences;
create policy competences_update_own on public.competences
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists competences_delete_own on public.competences;
create policy competences_delete_own on public.competences
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 6) Gør dig selv til admin (kør EFTER du har oprettet din egen bruger i appen)
--    update public.profiles set is_admin = true where id = (
--      select id from auth.users where email = 'din.mail@au.dk'
--    );
-- ---------------------------------------------------------------------------
