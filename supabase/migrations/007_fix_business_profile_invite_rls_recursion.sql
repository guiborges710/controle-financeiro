-- Avoid RLS recursion while still allowing invitees to see project names.

drop policy if exists "business_profiles_select_invited" on public.business_profiles;

create or replace function public.can_view_invited_business(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.collaborators c
    where c.business_id = target_business_id
      and lower(c.invited_email) = lower((select email from auth.users where id = auth.uid()))
      and c.status in ('pending', 'accepted')
  );
$$;

create policy "business_profiles_select_invited"
  on public.business_profiles for select
  using (public.can_view_invited_business(id));

notify pgrst, 'reload schema';
