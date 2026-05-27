-- Controle financeiro: universos pessoal e empresa (delivery)

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null unique,
  industry text not null default 'delivery' check (industry in ('delivery')),
  business_name text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  universe text not null check (universe in ('personal', 'business')),
  type text not null check (type in ('income', 'expense')),
  category_slug text not null,
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  occurred_at date not null default current_date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_universe_date_idx
  on public.transactions (user_id, universe, occurred_at desc);

alter table public.business_profiles enable row level security;
alter table public.transactions enable row level security;

create policy "business_profiles_select_own"
  on public.business_profiles for select
  using (auth.uid() = user_id);

create policy "business_profiles_insert_own"
  on public.business_profiles for insert
  with check (auth.uid() = user_id);

create policy "business_profiles_update_own"
  on public.business_profiles for update
  using (auth.uid() = user_id);

create policy "transactions_all_own"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
