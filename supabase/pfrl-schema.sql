-- PFRL Paddock: run in Supabase SQL Editor after creating a project.
-- Enable Discord under Authentication > Providers > Discord.
create table if not exists public.driver_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 driver_name text not null default '',
 platform text check (platform in ('Xbox','PlayStation','PC')),
 input_device text check (input_device in ('Wheel','Controller')),
 default_visibility text not null default 'private' check (default_visibility in ('private','public')),
 updated_at timestamptz not null default now()
);
create table if not exists public.driver_setups (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 track text not null,
 title text not null default '',
 settings jsonb not null default '{}'::jsonb,
 fuel_laps numeric(4,1),
 strategy jsonb not null default '[]'::jsonb,
 notes text not null default '',
 visibility text not null default 'private' check (visibility in ('private','public')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.driver_profiles enable row level security;
alter table public.driver_setups enable row level security;
revoke all on public.driver_profiles from anon;
revoke all on public.driver_setups from anon;
grant select,insert,update,delete on public.driver_profiles to authenticated;
grant select,insert,update,delete on public.driver_setups to authenticated;
-- Public published setups are viewable by everyone, including anonymous visitors.
grant select on public.driver_setups to anon;
drop policy if exists "profiles owner read" on public.driver_profiles;
create policy "profiles owner read" on public.driver_profiles for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "profiles owner insert" on public.driver_profiles;
create policy "profiles owner insert" on public.driver_profiles for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "profiles owner update" on public.driver_profiles;
create policy "profiles owner update" on public.driver_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "profiles owner delete" on public.driver_profiles;
create policy "profiles owner delete" on public.driver_profiles for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists "setups public or owner read" on public.driver_setups;
create policy "setups public or owner read" on public.driver_setups for select to anon,authenticated using (visibility = 'public' or user_id = (select auth.uid()));
drop policy if exists "setups owner insert" on public.driver_setups;
create policy "setups owner insert" on public.driver_setups for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "setups owner update" on public.driver_setups;
create policy "setups owner update" on public.driver_setups for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "setups owner delete" on public.driver_setups;
create policy "setups owner delete" on public.driver_setups for delete to authenticated using (user_id = (select auth.uid()));
