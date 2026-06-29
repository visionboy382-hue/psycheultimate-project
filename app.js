-- ============================================================
-- PSYCHE v20 · Supabase schema
-- Run this in your Supabase project → SQL Editor → New query → Run.
-- Then run seed.sql (optional) to make rarity stats meaningful immediately.
-- ============================================================

-- ---------- readings: stats population + share-link backing ----------
create table if not exists public.readings (
  id          uuid primary key default gen_random_uuid(),
  short_id    text unique,
  archetype   text not null,
  code        text,
  prim        text,
  p int not null, r int not null, i int not null, s int not null, m int not null,
  display_name text,
  is_shared   boolean not null default false,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.readings enable row level security;

-- anyone may contribute a reading (anonymous, no PII beyond an optional display name)
drop policy if exists "readings insert" on public.readings;
create policy "readings insert" on public.readings
  for insert to anon, authenticated with check (true);

-- only rows explicitly shared are individually selectable (for share links)
drop policy if exists "readings select shared" on public.readings;
create policy "readings select shared" on public.readings
  for select to anon, authenticated using (is_shared = true);

-- ---------- user_readings: private cross-device sync ----------
create table if not exists public.user_readings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_ts   bigint not null,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  unique (user_id, client_ts)
);

alter table public.user_readings enable row level security;

drop policy if exists "ur select own" on public.user_readings;
create policy "ur select own" on public.user_readings for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ur insert own" on public.user_readings;
create policy "ur insert own" on public.user_readings for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "ur update own" on public.user_readings;
create policy "ur update own" on public.user_readings for update to authenticated using (auth.uid() = user_id);
drop policy if exists "ur delete own" on public.user_readings;
create policy "ur delete own" on public.user_readings for delete to authenticated using (auth.uid() = user_id);

-- ---------- get_stats: percentiles + archetype rarity + distribution ----------
create or replace function public.get_stats(
  p_p int, p_r int, p_i int, p_s int, p_m int, p_arch text
) returns jsonb
language sql security definer set search_path = public as $$
  with pop as (select * from public.readings),
       cnt as (select count(*)::int n from pop)
  select jsonb_build_object(
    'count', (select n from cnt),
    'percentiles', jsonb_build_object(
      'P', coalesce((select round(100.0*count(*) filter (where p <= p_p)/nullif((select n from cnt),0)) from pop),0),
      'R', coalesce((select round(100.0*count(*) filter (where r <= p_r)/nullif((select n from cnt),0)) from pop),0),
      'I', coalesce((select round(100.0*count(*) filter (where i <= p_i)/nullif((select n from cnt),0)) from pop),0),
      'S', coalesce((select round(100.0*count(*) filter (where s <= p_s)/nullif((select n from cnt),0)) from pop),0),
      'M', coalesce((select round(100.0*count(*) filter (where m <= p_m)/nullif((select n from cnt),0)) from pop),0)
    ),
    'archetype_pct', coalesce((select round(100.0*count(*) filter (where archetype = p_arch)/nullif((select n from cnt),0)) from pop),0),
    'distribution', coalesce((
      select jsonb_agg(d order by (d->>'pct')::int desc) from (
        select jsonb_build_object('archetype', archetype,
               'pct', round(100.0*count(*)/nullif((select n from cnt),0))) d
        from pop group by archetype order by count(*) desc limit 6
      ) t
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.get_stats(int,int,int,int,int,text) to anon, authenticated;
