-- COMPLETE PERMISSIVE RLS POLICY MODEL
-- Live database currently has RLS disabled and zero policies.
-- This file creates policies only. It does not enable RLS.
--
-- PostgreSQL RLS semantics:
-- - Policies below are PERMISSIVE allow policies.
-- - Once RLS is enabled, access is denied unless at least one policy allows it.
-- - No RESTRICTIVE policies are used in this design.

begin;

-- PROFILES
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy profiles_admin_all
on public.profiles
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

-- FACTORY MASTER
create policy factory_master_admin_all
on public.factory_master
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy factory_master_accounts_select_real
on public.factory_master
for select
to authenticated
using (
  public.km_is_accounts()
  and factory_name <> 'Demo Factory'
);

create policy factory_master_all_production_select_real
on public.factory_master
for select
to authenticated
using (
  public.km_is_all_factory_production()
  and factory_name <> 'Demo Factory'
);

create policy factory_master_dadi_select
on public.factory_master
for select
to authenticated
using (
  public.km_is_dadi()
  and factory_name = 'Dadi'
);

create policy factory_master_demo_select
on public.factory_master
for select
to authenticated
using (
  public.km_is_demo()
  and factory_name = 'Demo Factory'
);

-- MACHINE MASTER
create policy machine_master_admin_all
on public.machine_master
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy machine_master_all_production_select_real
on public.machine_master
for select
to authenticated
using (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
);

create policy machine_master_dadi_select
on public.machine_master
for select
to authenticated
using (
  public.km_is_dadi()
  and factory = 'Dadi'
);

create policy machine_master_demo_select
on public.machine_master
for select
to authenticated
using (
  public.km_is_demo()
  and factory = 'Demo Factory'
);

-- PRODUCTION ENTRIES
create policy production_entries_admin_all
on public.production_entries
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy production_entries_accounts_dashboard_select
on public.production_entries
for select
to authenticated
using (
  public.km_is_accounts()
  and factory <> 'Demo Factory'
);

create policy production_entries_all_production_crud_real
on public.production_entries
for all
to authenticated
using (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
)
with check (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
);

create policy production_entries_dadi_crud
on public.production_entries
for all
to authenticated
using (
  public.km_is_dadi()
  and factory = 'Dadi'
)
with check (
  public.km_is_dadi()
  and factory = 'Dadi'
);

create policy production_entries_demo_crud
on public.production_entries
for all
to authenticated
using (
  public.km_is_demo()
  and factory = 'Demo Factory'
)
with check (
  public.km_is_demo()
  and factory = 'Demo Factory'
);

-- DISPATCH ENTRIES
create policy dispatch_entries_admin_all
on public.dispatch_entries
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy dispatch_entries_accounts_crud_real
on public.dispatch_entries
for all
to authenticated
using (
  public.km_is_accounts()
  and factory <> 'Demo Factory'
)
with check (
  public.km_is_accounts()
  and factory <> 'Demo Factory'
);

create policy dispatch_entries_all_production_select_real
on public.dispatch_entries
for select
to authenticated
using (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
);

create policy dispatch_entries_dadi_crud
on public.dispatch_entries
for all
to authenticated
using (
  public.km_is_dadi()
  and factory = 'Dadi'
)
with check (
  public.km_is_dadi()
  and factory = 'Dadi'
);

create policy dispatch_entries_demo_crud
on public.dispatch_entries
for all
to authenticated
using (
  public.km_is_demo()
  and factory = 'Demo Factory'
)
with check (
  public.km_is_demo()
  and factory = 'Demo Factory'
);

-- SALES ADJUSTMENTS
create policy sales_adjustments_admin_all
on public.sales_adjustments
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy sales_adjustments_accounts_crud_real_and_legacy
on public.sales_adjustments
for all
to authenticated
using (
  public.km_is_accounts()
  and (factory is null or factory <> 'Demo Factory')
)
with check (
  public.km_is_accounts()
  and (factory is null or factory <> 'Demo Factory')
);

create policy sales_adjustments_dadi_crud
on public.sales_adjustments
for all
to authenticated
using (
  public.km_is_dadi()
  and factory = 'Dadi'
)
with check (
  public.km_is_dadi()
  and factory = 'Dadi'
);

create policy sales_adjustments_demo_crud
on public.sales_adjustments
for all
to authenticated
using (
  public.km_is_demo()
  and factory = 'Demo Factory'
)
with check (
  public.km_is_demo()
  and factory = 'Demo Factory'
);

-- RATE MASTER
-- factory IS NULL = global real-company confidential rate.
create policy rate_master_admin_all
on public.rate_master
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy rate_master_real_roles_select_global_real
on public.rate_master
for select
to authenticated
using (
  (
    public.km_is_all_factory_production()
    or public.km_is_accounts()
    or public.km_is_dadi()
  )
  and factory is null
);

create policy rate_master_demo_select
on public.rate_master
for select
to authenticated
using (
  public.km_is_demo()
  and factory = 'Demo Factory'
);

-- BAG NAME MASTER
-- factory IS NULL = global real-company bag name.
create policy bag_name_master_admin_all
on public.bag_name_master
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy bag_name_master_all_production_crud_real
on public.bag_name_master
for all
to authenticated
using (
  public.km_is_all_factory_production()
  and factory is null
)
with check (
  public.km_is_all_factory_production()
  and factory is null
);

create policy bag_name_master_dadi_select_global_real
on public.bag_name_master
for select
to authenticated
using (
  public.km_is_dadi()
  and factory is null
);

create policy bag_name_master_accounts_select_global_real
on public.bag_name_master
for select
to authenticated
using (
  public.km_is_accounts()
  and factory is null
);

create policy bag_name_master_demo_select
on public.bag_name_master
for select
to authenticated
using (
  public.km_is_demo()
  and factory = 'Demo Factory'
);

-- TRANSPORTER MASTER
-- factory IS NULL = global real-company transporter.
create policy transporter_master_admin_all
on public.transporter_master
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy transporter_master_accounts_crud_global_real
on public.transporter_master
for all
to authenticated
using (
  public.km_is_accounts()
  and factory is null
)
with check (
  public.km_is_accounts()
  and factory is null
);

create policy transporter_master_dadi_select_global_real
on public.transporter_master
for select
to authenticated
using (
  public.km_is_dadi()
  and factory is null
);

create policy transporter_master_demo_crud
on public.transporter_master
for all
to authenticated
using (
  public.km_is_demo()
  and factory = 'Demo Factory'
)
with check (
  public.km_is_demo()
  and factory = 'Demo Factory'
);

-- GLOBAL SAFE MASTERS
create policy mesh_master_select_authenticated
on public.mesh_master
for select
to authenticated
using (
  public.km_is_admin()
  or public.km_is_all_factory_production()
  or public.km_is_accounts()
  or public.km_is_dadi()
  or public.km_is_demo()
);

create policy mesh_master_admin_all
on public.mesh_master
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy bag_type_master_select_authenticated
on public.bag_type_master
for select
to authenticated
using (
  public.km_is_admin()
  or public.km_is_all_factory_production()
  or public.km_is_accounts()
  or public.km_is_dadi()
  or public.km_is_demo()
);

create policy bag_type_master_admin_all
on public.bag_type_master
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

-- OPENING STOCK
create policy opening_stock_admin_all
on public.opening_stock
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy opening_stock_all_production_crud_real
on public.opening_stock
for all
to authenticated
using (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
)
with check (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
);

create policy opening_stock_dadi_crud
on public.opening_stock
for all
to authenticated
using (
  public.km_is_dadi()
  and factory = 'Dadi'
)
with check (
  public.km_is_dadi()
  and factory = 'Dadi'
);

create policy opening_stock_demo_crud
on public.opening_stock
for all
to authenticated
using (
  public.km_is_demo()
  and factory = 'Demo Factory'
)
with check (
  public.km_is_demo()
  and factory = 'Demo Factory'
);

-- EMPTY BAG INWARD
create policy empty_bag_inward_admin_all
on public.empty_bag_inward
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy empty_bag_inward_all_production_crud_real
on public.empty_bag_inward
for all
to authenticated
using (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
)
with check (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
);

create policy empty_bag_inward_dadi_crud
on public.empty_bag_inward
for all
to authenticated
using (
  public.km_is_dadi()
  and factory = 'Dadi'
)
with check (
  public.km_is_dadi()
  and factory = 'Dadi'
);

-- INVENTORY CLOSING
create policy inventory_closing_admin_all
on public.inventory_closing
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy inventory_closing_all_production_crud_real
on public.inventory_closing
for all
to authenticated
using (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
)
with check (
  public.km_is_all_factory_production()
  and factory <> 'Demo Factory'
);

create policy inventory_closing_dadi_crud
on public.inventory_closing
for all
to authenticated
using (
  public.km_is_dadi()
  and factory = 'Dadi'
)
with check (
  public.km_is_dadi()
  and factory = 'Dadi'
);

-- FACTORY TRANSFERS
create policy factory_transfers_admin_all
on public.factory_transfers
for all
to authenticated
using (public.km_is_admin())
with check (public.km_is_admin());

create policy factory_transfers_all_production_crud_real
on public.factory_transfers
for all
to authenticated
using (
  public.km_is_all_factory_production()
  and from_factory <> 'Demo Factory'
  and to_factory <> 'Demo Factory'
)
with check (
  public.km_is_all_factory_production()
  and from_factory <> 'Demo Factory'
  and to_factory <> 'Demo Factory'
);

commit;
