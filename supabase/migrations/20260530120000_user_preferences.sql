-- Preferencias de usuario v4.0 (plataformas, prime time, deportes ocultos)
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  platforms text[] not null default '{}',
  prime_time text not null default '18:00',
  hidden_sports text[] not null default '{}',
  spoilers_off boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.touch_user_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_preferences_updated_at on public.user_preferences;

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute function public.touch_user_preferences_updated_at();
