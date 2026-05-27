-- Suscripciones Web Push (avisos de eventos destacados)
-- Ejecutar en el SQL Editor de Supabase (Dashboard → SQL)

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  topics jsonb not null default '["futbol","ufc","series","motor"]'::jsonb,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  notify_count_date date,
  notify_count int not null default 0
);

create index if not exists push_subscriptions_updated_idx
  on public.push_subscriptions (updated_at desc);

create table if not exists public.push_sent (
  subscription_id uuid not null references public.push_subscriptions (id) on delete cascade,
  event_id bigint not null,
  sent_at timestamptz not null default now(),
  primary key (subscription_id, event_id)
);

create index if not exists push_sent_sent_at_idx
  on public.push_sent (sent_at desc);

alter table public.push_subscriptions enable row level security;
alter table public.push_sent enable row level security;

-- Solo service role (API server) accede; sin políticas públicas.
