-- Push: vincular suscripción a usuario y modo solo favoritos

alter table public.push_subscriptions
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.push_subscriptions
  add column if not exists favorites_only boolean not null default false;

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id)
  where user_id is not null;
