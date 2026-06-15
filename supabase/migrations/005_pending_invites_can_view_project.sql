-- Let invited users see the project name before accepting an invite.

drop policy if exists "business_profiles_select_invited" on public.business_profiles;

create policy "business_profiles_select_invited"
  on public.business_profiles for select
  using (
    exists (
      select 1
      from public.collaborators c
      where c.business_id = business_profiles.id
        and lower(c.invited_email) = lower((select email from auth.users where id = auth.uid()))
        and c.status in ('pending', 'accepted')
    )
  );

notify pgrst, 'reload schema';
