-- =============================================================================
-- Atlas Agro — schema do banco de dados
-- =============================================================================
-- Como usar:
-- 1. Abra o projeto no Supabase (https://supabase.com)
-- 2. Vá em SQL Editor → New query
-- 3. Cole este arquivo inteiro e clique em Run
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------

create table if not exists public.talhoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  area_hectares numeric(12, 2),
  observacoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.plantios (
  id uuid primary key default gen_random_uuid(),
  talhao_id uuid not null references public.talhoes (id) on delete cascade,
  cultura text not null,
  data_plantio date not null,
  safra text,
  observacoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.eventos_plantio (
  id uuid primary key default gen_random_uuid(),
  plantio_id uuid not null references public.plantios (id) on delete cascade,
  tipo text not null check (tipo in ('ADUBACAO', 'DEFENSIVO', 'IRRIGACAO', 'COLHEITA', 'OUTRO')),
  data date not null,
  produto_usado text,
  quantidade text,
  observacoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.lotes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  especie text,
  quantidade_animais integer,
  observacoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.eventos_sanitarios (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null references public.lotes (id) on delete cascade,
  tipo text not null check (tipo in ('VACINA', 'VERMIFUGO', 'TRATAMENTO', 'OUTRO')),
  data date not null,
  produto text,
  dose text,
  proxima_aplicacao date,
  observacoes text,
  created_at timestamptz not null default now()
);

create index if not exists plantios_talhao_id_idx on public.plantios (talhao_id);
create index if not exists eventos_plantio_plantio_id_idx on public.eventos_plantio (plantio_id);
create index if not exists eventos_plantio_data_idx on public.eventos_plantio (data desc);
create index if not exists eventos_sanitarios_lote_id_idx on public.eventos_sanitarios (lote_id);
create index if not exists eventos_sanitarios_data_idx on public.eventos_sanitarios (data desc);
create index if not exists eventos_sanitarios_proxima_aplicacao_idx
  on public.eventos_sanitarios (proxima_aplicacao);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- Política simples: qualquer usuário autenticado pode ler e escrever.
-- Depois dá para refinar por usuário/propriedade.
-- -----------------------------------------------------------------------------

alter table public.talhoes enable row level security;
alter table public.plantios enable row level security;
alter table public.eventos_plantio enable row level security;
alter table public.lotes enable row level security;
alter table public.eventos_sanitarios enable row level security;

drop policy if exists "Usuários autenticados podem ler e escrever" on public.talhoes;
create policy "Usuários autenticados podem ler e escrever"
  on public.talhoes for all to authenticated
  using (true) with check (true);

drop policy if exists "Usuários autenticados podem ler e escrever" on public.plantios;
create policy "Usuários autenticados podem ler e escrever"
  on public.plantios for all to authenticated
  using (true) with check (true);

drop policy if exists "Usuários autenticados podem ler e escrever" on public.eventos_plantio;
create policy "Usuários autenticados podem ler e escrever"
  on public.eventos_plantio for all to authenticated
  using (true) with check (true);

drop policy if exists "Usuários autenticados podem ler e escrever" on public.lotes;
create policy "Usuários autenticados podem ler e escrever"
  on public.lotes for all to authenticated
  using (true) with check (true);

drop policy if exists "Usuários autenticados podem ler e escrever" on public.eventos_sanitarios;
create policy "Usuários autenticados podem ler e escrever"
  on public.eventos_sanitarios for all to authenticated
  using (true) with check (true);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.talhoes to authenticated;
grant select, insert, update, delete on public.plantios to authenticated;
grant select, insert, update, delete on public.eventos_plantio to authenticated;
grant select, insert, update, delete on public.lotes to authenticated;
grant select, insert, update, delete on public.eventos_sanitarios to authenticated;
