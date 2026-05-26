-- Favoritos de usuario (eventos marcados desde Destacados)
-- Ejecutar en el SQL Editor de Supabase (Dashboard → SQL)

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id bigint not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists favorites_user_created_idx
  on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);
