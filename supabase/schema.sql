-- =============================================================================
-- Atlas Agro — schema do banco de dados
-- =============================================================================
-- Como usar:
-- 1. Abra o projeto no Supabase (https://supabase.com)
-- 2. Vá em SQL Editor → New query
-- 3. Cole este arquivo inteiro e clique em Run
-- Pode rodar de novo se o schema antigo (sem fazendas) já tiver sido aplicado.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Fazendas (uma conta pode ter várias propriedades)
-- -----------------------------------------------------------------------------

create table if not exists public.fazendas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  municipio text,
  uf text,
  observacoes text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.fazenda_membros (
  id uuid primary key default gen_random_uuid(),
  fazenda_id uuid not null references public.fazendas (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  papel text not null default 'DONO' check (papel in ('DONO', 'FUNCIONARIO')),
  created_at timestamptz not null default now(),
  unique (fazenda_id, user_id)
);

create or replace function public.fazendas_do_usuario()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select fazenda_id
  from public.fazenda_membros
  where user_id = auth.uid();
$$;

revoke all on function public.fazendas_do_usuario() from public, anon;
grant execute on function public.fazendas_do_usuario() to authenticated;

create or replace function public.ao_criar_fazenda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    insert into public.fazenda_membros (fazenda_id, user_id, papel)
    values (new.id, auth.uid(), 'DONO')
    on conflict (fazenda_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ao_criar_fazenda on public.fazendas;
create trigger trg_ao_criar_fazenda
  after insert on public.fazendas
  for each row execute procedure public.ao_criar_fazenda();

-- -----------------------------------------------------------------------------
-- Tabelas de manejo
-- -----------------------------------------------------------------------------

create table if not exists public.talhoes (
  id uuid primary key default gen_random_uuid(),
  fazenda_id uuid references public.fazendas (id) on delete cascade,
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
  fazenda_id uuid references public.fazendas (id) on delete cascade,
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

alter table public.talhoes add column if not exists fazenda_id uuid references public.fazendas (id) on delete cascade;
alter table public.lotes add column if not exists fazenda_id uuid references public.fazendas (id) on delete cascade;

do $$
declare
  farm_id uuid;
begin
  if exists (select 1 from public.talhoes where fazenda_id is null)
     or exists (select 1 from public.lotes where fazenda_id is null) then
    insert into public.fazendas (nome)
    values ('Fazenda principal')
    returning id into farm_id;

    update public.talhoes set fazenda_id = farm_id where fazenda_id is null;
    update public.lotes set fazenda_id = farm_id where fazenda_id is null;

    insert into public.fazenda_membros (fazenda_id, user_id, papel)
    select farm_id, id, 'DONO' from auth.users
    on conflict (fazenda_id, user_id) do nothing;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.talhoes where fazenda_id is null)
     and not exists (select 1 from public.lotes where fazenda_id is null) then
    begin
      alter table public.talhoes alter column fazenda_id set not null;
    exception when others then
      null;
    end;
    begin
      alter table public.lotes alter column fazenda_id set not null;
    exception when others then
      null;
    end;
  end if;
end $$;

create index if not exists talhoes_fazenda_id_idx on public.talhoes (fazenda_id);
create index if not exists lotes_fazenda_id_idx on public.lotes (fazenda_id);
create index if not exists plantios_talhao_id_idx on public.plantios (talhao_id);
create index if not exists eventos_plantio_plantio_id_idx on public.eventos_plantio (plantio_id);
create index if not exists eventos_plantio_data_idx on public.eventos_plantio (data desc);
create index if not exists eventos_sanitarios_lote_id_idx on public.eventos_sanitarios (lote_id);
create index if not exists eventos_sanitarios_data_idx on public.eventos_sanitarios (data desc);
create index if not exists eventos_sanitarios_proxima_aplicacao_idx
  on public.eventos_sanitarios (proxima_aplicacao);
create index if not exists fazenda_membros_user_id_idx on public.fazenda_membros (user_id);

-- -----------------------------------------------------------------------------
-- Row Level Security — cada usuário só vê as fazendas das quais participa
-- -----------------------------------------------------------------------------

alter table public.fazendas enable row level security;
alter table public.fazenda_membros enable row level security;
alter table public.talhoes enable row level security;
alter table public.plantios enable row level security;
alter table public.eventos_plantio enable row level security;
alter table public.lotes enable row level security;
alter table public.eventos_sanitarios enable row level security;

drop policy if exists "Usuários autenticados podem ler e escrever" on public.talhoes;
drop policy if exists "Usuários autenticados podem ler e escrever" on public.plantios;
drop policy if exists "Usuários autenticados podem ler e escrever" on public.eventos_plantio;
drop policy if exists "Usuários autenticados podem ler e escrever" on public.lotes;
drop policy if exists "Usuários autenticados podem ler e escrever" on public.eventos_sanitarios;

drop policy if exists "Membros podem ver fazendas" on public.fazendas;
drop policy if exists "Usuário autenticado pode criar fazenda" on public.fazendas;
drop policy if exists "Membros podem atualizar fazenda" on public.fazendas;
drop policy if exists "Membros podem excluir fazenda" on public.fazendas;
create policy "Membros podem ver fazendas"
  on public.fazendas for select to authenticated
  using (id in (select public.fazendas_do_usuario()));
create policy "Usuário autenticado pode criar fazenda"
  on public.fazendas for insert to authenticated
  with check (true);
create policy "Membros podem atualizar fazenda"
  on public.fazendas for update to authenticated
  using (id in (select public.fazendas_do_usuario()))
  with check (id in (select public.fazendas_do_usuario()));
create policy "Membros podem excluir fazenda"
  on public.fazendas for delete to authenticated
  using (id in (select public.fazendas_do_usuario()));

drop policy if exists "Membros podem ver participação" on public.fazenda_membros;
drop policy if exists "Membros podem gerenciar participação" on public.fazenda_membros;
create policy "Membros podem ver participação"
  on public.fazenda_membros for select to authenticated
  using (user_id = auth.uid() or fazenda_id in (select public.fazendas_do_usuario()));
create policy "Membros podem gerenciar participação"
  on public.fazenda_membros for all to authenticated
  using (fazenda_id in (select public.fazendas_do_usuario()))
  with check (fazenda_id in (select public.fazendas_do_usuario()));

drop policy if exists "Membros podem ler e escrever talhoes" on public.talhoes;
create policy "Membros podem ler e escrever talhoes"
  on public.talhoes for all to authenticated
  using (fazenda_id in (select public.fazendas_do_usuario()))
  with check (fazenda_id in (select public.fazendas_do_usuario()));

drop policy if exists "Membros podem ler e escrever plantios" on public.plantios;
create policy "Membros podem ler e escrever plantios"
  on public.plantios for all to authenticated
  using (
    exists (
      select 1 from public.talhoes t
      where t.id = plantios.talhao_id
        and t.fazenda_id in (select public.fazendas_do_usuario())
    )
  )
  with check (
    exists (
      select 1 from public.talhoes t
      where t.id = plantios.talhao_id
        and t.fazenda_id in (select public.fazendas_do_usuario())
    )
  );

drop policy if exists "Membros podem ler e escrever eventos_plantio" on public.eventos_plantio;
create policy "Membros podem ler e escrever eventos_plantio"
  on public.eventos_plantio for all to authenticated
  using (
    exists (
      select 1
      from public.plantios p
      join public.talhoes t on t.id = p.talhao_id
      where p.id = eventos_plantio.plantio_id
        and t.fazenda_id in (select public.fazendas_do_usuario())
    )
  )
  with check (
    exists (
      select 1
      from public.plantios p
      join public.talhoes t on t.id = p.talhao_id
      where p.id = eventos_plantio.plantio_id
        and t.fazenda_id in (select public.fazendas_do_usuario())
    )
  );

drop policy if exists "Membros podem ler e escrever lotes" on public.lotes;
create policy "Membros podem ler e escrever lotes"
  on public.lotes for all to authenticated
  using (fazenda_id in (select public.fazendas_do_usuario()))
  with check (fazenda_id in (select public.fazendas_do_usuario()));

drop policy if exists "Membros podem ler e escrever eventos_sanitarios" on public.eventos_sanitarios;
create policy "Membros podem ler e escrever eventos_sanitarios"
  on public.eventos_sanitarios for all to authenticated
  using (
    exists (
      select 1 from public.lotes l
      where l.id = eventos_sanitarios.lote_id
        and l.fazenda_id in (select public.fazendas_do_usuario())
    )
  )
  with check (
    exists (
      select 1 from public.lotes l
      where l.id = eventos_sanitarios.lote_id
        and l.fazenda_id in (select public.fazendas_do_usuario())
    )
  );

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.fazendas to authenticated;
grant select, insert, update, delete on public.fazenda_membros to authenticated;
grant select, insert, update, delete on public.talhoes to authenticated;
grant select, insert, update, delete on public.plantios to authenticated;
grant select, insert, update, delete on public.eventos_plantio to authenticated;
grant select, insert, update, delete on public.lotes to authenticated;
grant select, insert, update, delete on public.eventos_sanitarios to authenticated;
