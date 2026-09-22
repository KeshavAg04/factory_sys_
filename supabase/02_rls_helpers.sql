-- RLS HELPER FUNCTIONS
-- Identity is derived only from auth.uid() and public.profiles.
-- No client-provided role/factory values are trusted.

begin;

create or replace function public.km_auth_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.km_auth_factory()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.factory
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.km_is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(public.km_auth_role(), '') = 'Admin';
$$;

create or replace function public.km_is_accounts()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(public.km_auth_role(), '') = 'accounts';
$$;

create or replace function public.km_is_production()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(public.km_auth_role(), '') = 'production';
$$;

create or replace function public.km_is_demo()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(public.km_auth_role(), '') = 'demo'
     and coalesce(public.km_auth_factory(), '') = 'Demo Factory';
$$;

-- Dadi uses the existing application role model: role='production' and
-- factory='Dadi'. Factory alone must not grant Dadi privileges to another role.
create or replace function public.km_is_dadi()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.km_is_production()
     and coalesce(public.km_auth_factory(), '') = 'Dadi';
$$;

create or replace function public.km_has_assigned_factory()
returns boolean
language sql
stable
set search_path = ''
as $$
  select nullif(trim(coalesce(public.km_auth_factory(), '')), '') is not null;
$$;

-- The company-wide Production Manager is exactly role='production' with no
-- assigned factory. No other NULL-factory role receives this meaning.
create or replace function public.km_is_all_factory_production()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.km_is_production()
     and not public.km_has_assigned_factory();
$$;

create or replace function public.km_factory_matches(row_factory text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.km_has_assigned_factory()
     and row_factory = public.km_auth_factory();
$$;

revoke execute on function public.km_auth_role() from public;
revoke execute on function public.km_auth_factory() from public;
revoke execute on function public.km_is_admin() from public;
revoke execute on function public.km_is_accounts() from public;
revoke execute on function public.km_is_production() from public;
revoke execute on function public.km_is_demo() from public;
revoke execute on function public.km_is_dadi() from public;
revoke execute on function public.km_has_assigned_factory() from public;
revoke execute on function public.km_is_all_factory_production() from public;
revoke execute on function public.km_factory_matches(text) from public;

grant execute on function public.km_auth_role() to authenticated;
grant execute on function public.km_auth_factory() to authenticated;
grant execute on function public.km_is_admin() to authenticated;
grant execute on function public.km_is_accounts() to authenticated;
grant execute on function public.km_is_production() to authenticated;
grant execute on function public.km_is_demo() to authenticated;
grant execute on function public.km_is_dadi() to authenticated;
grant execute on function public.km_has_assigned_factory() to authenticated;
grant execute on function public.km_is_all_factory_production() to authenticated;
grant execute on function public.km_factory_matches(text) to authenticated;

commit;
