-- Ensure project owners can always see their own active project.

drop policy if exists "business_profiles_select_owner" on public.business_profiles;

create policy "business_profiles_select_owner"
  on public.business_profiles for select
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
