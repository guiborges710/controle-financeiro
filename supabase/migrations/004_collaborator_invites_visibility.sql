-- Allow invited users to see and answer pending invites.

drop policy if exists "collaborators_accepted_view" on public.collaborators;
drop policy if exists "collaborators_invitee_select" on public.collaborators;
drop policy if exists "collaborators_invitee_delete" on public.collaborators;

create policy "collaborators_invitee_select"
  on public.collaborators for select
  using (
    lower(invited_email) = lower((select email from auth.users where id = auth.uid()))
  );

create policy "collaborators_invitee_delete"
  on public.collaborators for delete
  using (
    lower(invited_email) = lower((select email from auth.users where id = auth.uid()))
    and status = 'pending'
  );

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
    and lower(invited_email) = lower((select email from auth.users where id = auth.uid()))
    and status = 'pending';

  if not found then
    raise exception 'Convite não encontrado';
  end if;
end;
$$;

notify pgrst, 'reload schema';
