-- PRE-RLS DATA REVIEW QUERIES
-- Run these manually before enabling RLS. Do not modify data from this file.

-- Production users without a factory become all-real-factory Production
-- Managers under the final model. Review this list before enabling RLS and
-- confirm each NULL-factory production profile is intentional.
select id, username, role, factory, created_at
from public.profiles
where role = 'production'
  and factory is null;

-- Demo profile must include username because profiles.username is NOT NULL.
select id, username, role, factory, created_at
from public.profiles
where role = 'demo'
   or factory = 'Demo Factory';

-- These tables require ownership review/backfill before RLS can be enabled
-- safely without breaking existing real users or exposing rows to demo.
select 'opening_stock' as table_name, count(*) as null_factory_rows
from public.opening_stock
where factory is null;

select 'sales_adjustments' as table_name, count(*) as null_factory_rows
from public.sales_adjustments
where factory is null;

select 'rate_master' as table_name, count(*) as null_factory_rows
from public.rate_master
where factory is null;

select 'bag_name_master' as table_name, count(*) as null_factory_rows
from public.bag_name_master
where factory is null;

select 'transporter_master' as table_name, count(*) as null_factory_rows
from public.transporter_master
where factory is null;

-- Candidate sales_adjustments backfill review. Do not update automatically:
-- invoice numbers may collide or be blank.
select
  s.id,
  s.invoice_number,
  s.customer_name,
  s.adjustment_date,
  count(distinct d.factory) as matching_factory_count,
  string_agg(distinct d.factory, ', ' order by d.factory) as matching_factories
from public.sales_adjustments s
left join public.dispatch_entries d
  on d.invoice_number = s.invoice_number
where s.factory is null
group by s.id, s.invoice_number, s.customer_name, s.adjustment_date
order by s.adjustment_date desc nulls last, s.id;

-- Verify only the live table name exists.
select to_regclass('public.factory_transfers') as factory_transfers_table,
       to_regclass('public.factory_transfer') as obsolete_factory_transfer_table;
