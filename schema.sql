-- Schema completo - Plantel Sub-15
-- Use este arquivo para uma instalação NOVA (Supabase do zero).
-- Se você já tem um projeto Supabase rodando com dados, use
-- migrations/002_status_plantel_photos.sql em vez deste arquivo.
-- Cole no SQL Editor do Supabase e clique em Run.

create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'coordinator' check (role in ('admin', 'coordinator', 'viewer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.plantels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  season text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.players (
  id uuid primary key default uuid_generate_v4(),
  plantel_id uuid references public.plantels(id) on delete cascade,
  name text not null,
  birth_date date not null,
  primary_position text not null check (primary_position in (
    'Goleiro', 'Lateral Direito', 'Zagueiro', 'Lateral Esquerdo',
    'Volante', 'Meia', 'Ponta Direita', 'Centroavante', 'Ponta Esquerda'
  )),
  dominant_foot text not null check (dominant_foot in ('Direito', 'Esquerdo', 'Ambos')),
  technical_rating text not null check (technical_rating in ('A', 'B', 'C', 'D', 'E', 'F')),
  status text not null default 'No clube' check (status in ('No clube', 'Em avaliação', 'Lesionado')),
  is_registered boolean not null default false,
  secondary_positions text[] default '{}',
  indicated_by text default '',
  photo_url text,
  documents jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.users(id)
);

create table if not exists public.lineups (
  id uuid primary key default uuid_generate_v4(),
  plantel_id uuid references public.plantels(id) on delete cascade,
  name text not null,
  formation text not null check (formation in ('4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3')),
  is_primary boolean default false,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.users(id)
);

create table if not exists public.lineup_players (
  id uuid primary key default uuid_generate_v4(),
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  slot_key text not null,
  is_bench boolean default false,
  unique (lineup_id, slot_key),
  unique (lineup_id, player_id)
);

create index if not exists idx_players_plantel on public.players (plantel_id);
create index if not exists idx_players_position on public.players (primary_position);
create index if not exists idx_players_status on public.players (status);
create index if not exists idx_players_registered on public.players (is_registered);
create index if not exists idx_players_rating on public.players (technical_rating);
create index if not exists idx_players_indicated on public.players (indicated_by);
create index if not exists idx_lineups_plantel on public.lineups (plantel_id);
create index if not exists idx_lineup_players_lineup on public.lineup_players (lineup_id);

create or replace function public.ensure_single_primary_lineup()
returns trigger as $$
begin
  if new.is_primary then
    update public.lineups set is_primary = false where id <> new.id and is_primary = true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_single_primary_lineup on public.lineups;
create trigger trg_single_primary_lineup
  before insert or update on public.lineups
  for each row execute function public.ensure_single_primary_lineup();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_players_updated on public.players;
create trigger trg_players_updated before update on public.players
  for each row execute function public.set_updated_at();

drop trigger if exists trg_lineups_updated on public.lineups;
create trigger trg_lineups_updated before update on public.lineups
  for each row execute function public.set_updated_at();

drop trigger if exists trg_plantels_updated on public.plantels;
create trigger trg_plantels_updated before update on public.plantels
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.plantels enable row level security;
alter table public.players enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_players enable row level security;

-- Políticas públicas para a versão sem login.
alter table public.users enable row level security;
alter table public.plantels enable row level security;
alter table public.players enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_players enable row level security;

drop policy if exists "plantels_anon_all" on public.plantels;
create policy "plantels_anon_all" on public.plantels for all to anon, authenticated using (true) with check (true);
drop policy if exists "players_anon_all" on public.players;
create policy "players_anon_all" on public.players for all to anon, authenticated using (true) with check (true);
drop policy if exists "lineups_anon_all" on public.lineups;
create policy "lineups_anon_all" on public.lineups for all to anon, authenticated using (true) with check (true);
drop policy if exists "lineup_players_anon_all" on public.lineup_players;
create policy "lineup_players_anon_all" on public.lineup_players for all to anon, authenticated using (true) with check (true);
