-- MIGRAÇÃO 004 — versão definitiva sem login
-- Segura para bancos já existentes: não apaga atletas, plantéis ou escalações.
-- Rode no Supabase SQL Editor se as colunas/plantéis abaixo ainda não existirem.

create extension if not exists "uuid-ossp";

create table if not exists public.plantels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  season text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.players add column if not exists plantel_id uuid references public.plantels(id) on delete cascade;
alter table public.lineups add column if not exists plantel_id uuid references public.plantels(id) on delete cascade;
alter table public.players add column if not exists is_registered boolean not null default false;
alter table public.players add column if not exists photo_url text;
alter table public.players add column if not exists documents jsonb not null default '[]'::jsonb;

-- Garante que exista ao menos uma categoria para associar registros antigos.
do $$
declare
  pid uuid;
begin
  select id into pid from public.plantels order by created_at limit 1;
  if pid is null then
    insert into public.plantels (name, category, season)
    values ('Sub-15', 'Sub-15', extract(year from now())::text)
    returning id into pid;
  end if;
  update public.players set plantel_id = pid where plantel_id is null;
  update public.lineups set plantel_id = pid where plantel_id is null;
end $$;

create index if not exists idx_players_plantel on public.players (plantel_id);
create index if not exists idx_players_registered on public.players (is_registered);
create index if not exists idx_lineups_plantel on public.lineups (plantel_id);

-- Vocabulário definitivo de situação.
update public.players set status = 'No clube' where status in ('Disponível','Titular','Reserva','Observação');
update public.players set status = 'Lesionado' where status = 'Indisponível';

alter table public.players drop constraint if exists players_status_check;
alter table public.players add constraint players_status_check
  check (status in ('No clube', 'Em avaliação', 'Lesionado'));
alter table public.players alter column status set default 'No clube';

-- Acesso público da aplicação (sem login).
alter table public.plantels enable row level security;
alter table public.players enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_players enable row level security;

drop policy if exists "plantels_anon_all" on public.plantels;
drop policy if exists "plantels_authenticated_all" on public.plantels;
create policy "plantels_anon_all" on public.plantels for all to anon, authenticated using (true) with check (true);

drop policy if exists "players_anon_all" on public.players;
drop policy if exists "players_authenticated_all" on public.players;
create policy "players_anon_all" on public.players for all to anon, authenticated using (true) with check (true);

drop policy if exists "lineups_anon_all" on public.lineups;
drop policy if exists "lineups_authenticated_all" on public.lineups;
create policy "lineups_anon_all" on public.lineups for all to anon, authenticated using (true) with check (true);

drop policy if exists "lineup_players_anon_all" on public.lineup_players;
drop policy if exists "lineup_players_authenticated_all" on public.lineup_players;
create policy "lineup_players_anon_all" on public.lineup_players for all to anon, authenticated using (true) with check (true);

-- Storage de fotos: leitura e escrita para o app sem login.
insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "player_photos_public_read" on storage.objects;
drop policy if exists "player_photos_anon_read" on storage.objects;
create policy "player_photos_anon_read" on storage.objects for select to anon, authenticated using (bucket_id = 'player-photos');

drop policy if exists "player_photos_anon_write" on storage.objects;
drop policy if exists "player_photos_authenticated_write" on storage.objects;
create policy "player_photos_anon_write" on storage.objects for insert to anon, authenticated with check (bucket_id = 'player-photos');

drop policy if exists "player_photos_anon_update" on storage.objects;
drop policy if exists "player_photos_authenticated_update" on storage.objects;
create policy "player_photos_anon_update" on storage.objects for update to anon, authenticated using (bucket_id = 'player-photos') with check (bucket_id = 'player-photos');

drop policy if exists "player_photos_anon_delete" on storage.objects;
drop policy if exists "player_photos_authenticated_delete" on storage.objects;
create policy "player_photos_anon_delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'player-photos');
