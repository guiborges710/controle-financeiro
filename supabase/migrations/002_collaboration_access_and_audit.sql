-- Collaboration access and last-editor audit fields.

alter table public.ingredients
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists created_by_email text;

alter table public.products
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists created_by_email text;

alter table public.recipes
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists created_by_email text;

alter table public.sales
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists created_by_email text;

alter table public.expenses
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists created_by_email text;

create or replace function public.is_business_owner(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_profiles
    where id = target_business_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.can_view_business(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_business_owner(target_business_id)
    or exists (
      select 1
      from public.collaborators
      where business_id = target_business_id
        and invited_email = (select email from auth.users where id = auth.uid())
        and status = 'accepted'
    );
$$;

create or replace function public.can_edit_business(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_business_owner(target_business_id)
    or exists (
      select 1
      from public.collaborators
      where business_id = target_business_id
        and invited_email = (select email from auth.users where id = auth.uid())
        and status = 'accepted'
        and role = 'editor'
    );
$$;

create or replace function public.can_view_owner(owner_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select auth.uid() = owner_user_id
    or exists (
      select 1
      from public.business_profiles bp
      join public.collaborators c on c.business_id = bp.id
      where bp.user_id = owner_user_id
        and c.invited_email = (select email from auth.users where id = auth.uid())
        and c.status = 'accepted'
    );
$$;

create or replace function public.can_edit_owner(owner_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select auth.uid() = owner_user_id
    or exists (
      select 1
      from public.business_profiles bp
      join public.collaborators c on c.business_id = bp.id
      where bp.user_id = owner_user_id
        and c.invited_email = (select email from auth.users where id = auth.uid())
        and c.status = 'accepted'
        and c.role = 'editor'
    );
$$;

create or replace function public.accept_collaborator_invite(invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.collaborators
  set
    status = 'accepted',
    accepted_at = now()
  where id = invite_id
    and invited_email = (select email from auth.users where id = auth.uid())
    and status = 'pending';

  if not found then
    raise exception 'Convite não encontrado';
  end if;
end;
$$;

drop policy if exists "business_profiles_select_own" on public.business_profiles;
drop policy if exists "business_profiles_insert_own" on public.business_profiles;
drop policy if exists "business_profiles_update_own" on public.business_profiles;
drop policy if exists "collaborators_owner_all" on public.collaborators;
drop policy if exists "collaborators_accepted_view" on public.collaborators;
drop policy if exists "ingredients_all_own" on public.ingredients;
drop policy if exists "products_all_own" on public.products;
drop policy if exists "recipes_all_own" on public.recipes;
drop policy if exists "recipe_lines_all_own" on public.recipe_lines;
drop policy if exists "sales_all_own" on public.sales;
drop policy if exists "expenses_all_own" on public.expenses;

create policy "business_profiles_select_access"
  on public.business_profiles for select
  using (public.can_view_business(id));

create policy "business_profiles_insert_own"
  on public.business_profiles for insert
  with check (auth.uid() = user_id);

create policy "business_profiles_update_owner"
  on public.business_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "collaborators_owner_all"
  on public.collaborators for all
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

create policy "collaborators_invitee_select"
  on public.collaborators for select
  using (invited_email = (select email from auth.users where id = auth.uid()));

create policy "collaborators_invitee_delete"
  on public.collaborators for delete
  using (
    invited_email = (select email from auth.users where id = auth.uid())
    and status = 'pending'
  );

create policy "ingredients_select_access"
  on public.ingredients for select
  using (public.can_view_owner(user_id));

create policy "ingredients_insert_access"
  on public.ingredients for insert
  with check (public.can_edit_owner(user_id));

create policy "ingredients_update_access"
  on public.ingredients for update
  using (public.can_edit_owner(user_id))
  with check (public.can_edit_owner(user_id));

create policy "ingredients_delete_access"
  on public.ingredients for delete
  using (public.can_edit_owner(user_id));

create policy "products_select_access"
  on public.products for select
  using (public.can_view_owner(user_id));

create policy "products_insert_access"
  on public.products for insert
  with check (public.can_edit_owner(user_id));

create policy "products_update_access"
  on public.products for update
  using (public.can_edit_owner(user_id))
  with check (public.can_edit_owner(user_id));

create policy "products_delete_access"
  on public.products for delete
  using (public.can_edit_owner(user_id));

create policy "recipes_select_access"
  on public.recipes for select
  using (public.can_view_owner(user_id));

create policy "recipes_insert_access"
  on public.recipes for insert
  with check (public.can_edit_owner(user_id));

create policy "recipes_update_access"
  on public.recipes for update
  using (public.can_edit_owner(user_id))
  with check (public.can_edit_owner(user_id));

create policy "recipes_delete_access"
  on public.recipes for delete
  using (public.can_edit_owner(user_id));

create policy "recipe_lines_select_access"
  on public.recipe_lines for select
  using (
    recipe_id in (
      select id from public.recipes where public.can_view_owner(user_id)
    )
  );

create policy "recipe_lines_insert_access"
  on public.recipe_lines for insert
  with check (
    recipe_id in (
      select id from public.recipes where public.can_edit_owner(user_id)
    )
  );

create policy "recipe_lines_update_access"
  on public.recipe_lines for update
  using (
    recipe_id in (
      select id from public.recipes where public.can_edit_owner(user_id)
    )
  )
  with check (
    recipe_id in (
      select id from public.recipes where public.can_edit_owner(user_id)
    )
  );

create policy "recipe_lines_delete_access"
  on public.recipe_lines for delete
  using (
    recipe_id in (
      select id from public.recipes where public.can_edit_owner(user_id)
    )
  );

create policy "sales_select_access"
  on public.sales for select
  using (public.can_view_owner(user_id));

create policy "sales_insert_access"
  on public.sales for insert
  with check (public.can_edit_owner(user_id));

create policy "sales_update_access"
  on public.sales for update
  using (public.can_edit_owner(user_id))
  with check (public.can_edit_owner(user_id));

create policy "sales_delete_access"
  on public.sales for delete
  using (public.can_edit_owner(user_id));

create policy "expenses_select_access"
  on public.expenses for select
  using (public.can_view_owner(user_id));

create policy "expenses_insert_access"
  on public.expenses for insert
  with check (public.can_edit_owner(user_id));

create policy "expenses_update_access"
  on public.expenses for update
  using (public.can_edit_owner(user_id))
  with check (public.can_edit_owner(user_id));

create policy "expenses_delete_access"
  on public.expenses for delete
  using (public.can_edit_owner(user_id));
