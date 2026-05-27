-- Controle financeiro: empresa (delivery)

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null unique,
  industry text not null default 'delivery' check (industry in ('delivery')),
  business_name text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Collaborators: compartilhamento do dashboard
create table if not exists public.collaborators (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.business_profiles (id) on delete cascade not null,
  invited_email text not null,
  invited_by uuid references auth.users (id) on delete set null,
  role text not null check (role in ('editor', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(business_id, invited_email)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  universe text not null check (universe in ('business')),
  type text not null check (type in ('income', 'expense')),
  category_slug text not null,
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  occurred_at date not null default current_date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Empresa: ingredientes/insumos
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  name text not null,
  unit text not null check (unit in ('g', 'ml', 'unidade')),
  unit_cost numeric(10, 2) not null check (unit_cost >= 0),
  unit_scale numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Empresa: produtos vendáveis
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  name text not null,
  size text not null,
  sale_price numeric(10, 2) not null check (sale_price > 0),
  recipe_id uuid,
  created_at timestamptz not null default now()
);

-- Empresa: receitas
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  name text not null,
  yield_quantity numeric(10, 2) not null check (yield_quantity > 0),
  created_at timestamptz not null default now()
);

-- Empresa: linhas de receita (ingredientes em receitas)
create table if not exists public.recipe_lines (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes (id) on delete cascade not null,
  ingredient_id uuid references public.ingredients (id) on delete cascade not null,
  quantity numeric(10, 2) not null check (quantity > 0),
  unit text not null check (unit in ('g', 'ml', 'unidade')),
  created_at timestamptz not null default now()
);

-- Empresa: vendas
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  product_id uuid references public.products (id) on delete cascade not null,
  description text,
  quantity numeric(10, 2) not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price > 0),
  total numeric(12, 2) not null check (total > 0),
  occurred_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- Empresa: despesas/gastos
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  type text not null check (type in ('insumo', 'energia', 'gas', 'embalagem', 'outros')),
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  occurred_at date not null default current_date,
  ingredient_id uuid references public.ingredients (id) on delete set null,
  ingredient_name text,
  ingredient_unit text check (ingredient_unit in ('g', 'ml', 'unidade')),
  quantity_purchased numeric(10, 2) check (quantity_purchased > 0),
  unit_cost numeric(10, 2),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists transactions_user_universe_date_idx
  on public.transactions (user_id, universe, occurred_at desc);

create index if not exists ingredients_user_idx
  on public.ingredients (user_id);

create index if not exists products_user_idx
  on public.products (user_id);

create index if not exists recipes_user_idx
  on public.recipes (user_id);

create index if not exists recipe_lines_recipe_idx
  on public.recipe_lines (recipe_id);

create index if not exists sales_user_date_idx
  on public.sales (user_id, occurred_at desc);

create index if not exists expenses_user_date_idx
  on public.expenses (user_id, occurred_at desc);

-- Enable RLS
alter table public.business_profiles enable row level security;
alter table public.collaborators enable row level security;
alter table public.transactions enable row level security;
alter table public.ingredients enable row level security;
alter table public.products enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_lines enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;

-- Policies: business_profiles
create policy "business_profiles_select_own"
  on public.business_profiles for select
  using (auth.uid() = user_id);

create policy "business_profiles_insert_own"
  on public.business_profiles for insert
  with check (auth.uid() = user_id);

create policy "business_profiles_update_own"
  on public.business_profiles for update
  using (auth.uid() = user_id);

-- Policies: collaborators (only owner and accepted collaborators can view)
create policy "collaborators_owner_all"
  on public.collaborators for all
  using (
    business_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  )
  with check (
    business_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

create policy "collaborators_accepted_view"
  on public.collaborators for select
  using (
    invited_email = (select email from auth.users where id = auth.uid())
    and status = 'accepted'
  );

-- Policies: transactions (owner + accepted collaborators)
create policy "transactions_owner_all"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: ingredients (owner + collaborators)
create policy "ingredients_all_own"
  on public.ingredients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: products (owner + collaborators)
create policy "products_all_own"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: recipes (owner + collaborators)
create policy "recipes_all_own"
  on public.recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: recipe_lines (via recipe ownership)
create policy "recipe_lines_all_own"
  on public.recipe_lines for all
  using (
    recipe_id in (
      select id from public.recipes where user_id = auth.uid()
    )
  )
  with check (
    recipe_id in (
      select id from public.recipes where user_id = auth.uid()
    )
  );

-- Policies: sales (owner + collaborators)
create policy "sales_all_own"
  on public.sales for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: expenses (owner + collaborators)
create policy "expenses_all_own"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
