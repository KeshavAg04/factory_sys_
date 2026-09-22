-- SCHEMA CHANGES FOR FINAL RLS DESIGN
-- Safe to review. Do not enable RLS from this file.
-- No data is deleted, truncated, seeded, or backfilled here.

begin;

-- opening_stock is operational stock and must be factory-scoped before demo
-- access can be safely allowed.
alter table public.opening_stock
  add column if not exists factory text;

-- sales_adjustments contains financial/customer data. RLS must use explicit
-- factory ownership, not invoice_number matching.
alter table public.sales_adjustments
  add column if not exists factory text;

-- rate_master contains confidential rates. Demo must receive only fictional
-- Demo Factory rates. Existing NULL rows require review/backfill before RLS.
alter table public.rate_master
  add column if not exists factory text;

-- bag_name_master can reveal product/business context. Demo gets fictional
-- Demo Factory bag names only.
alter table public.bag_name_master
  add column if not exists factory text;

-- transporter_master can reveal real transport/vendor information. Demo gets
-- fictional Demo Factory transporters only.
alter table public.transporter_master
  add column if not exists factory text;

commit;
