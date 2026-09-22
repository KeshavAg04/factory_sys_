-- OPTIONAL DEMO SEED/RESET
-- Run only after RLS policies are approved and the Demo Auth user/profile has
-- been created manually:
--   username = demo
--   role = demo
--   factory = Demo Factory
--
-- This script deletes only Demo Factory-owned rows. It does not touch KM-New,
-- KM-Old, Dadi, or NULL-factory rows.

begin;

delete from public.sales_adjustments where factory = 'Demo Factory';
delete from public.dispatch_entries where factory = 'Demo Factory';
delete from public.production_entries where factory = 'Demo Factory';
delete from public.opening_stock where factory = 'Demo Factory';
delete from public.transporter_master where factory = 'Demo Factory';
delete from public.bag_name_master where factory = 'Demo Factory';
delete from public.rate_master where factory = 'Demo Factory';
delete from public.machine_master where factory = 'Demo Factory';
delete from public.factory_master where factory_name = 'Demo Factory';

insert into public.factory_master (factory_name)
values ('Demo Factory');

insert into public.machine_master (machine_name, factory)
values
  ('Demo Machine 1', 'Demo Factory'),
  ('Demo Machine 2', 'Demo Factory'),
  ('Demo Machine 3', 'Demo Factory');

insert into public.bag_name_master (bag_name, factory)
values
  ('Demo Premium 50kg', 'Demo Factory'),
  ('Demo Jumbo 1250kg', 'Demo Factory'),
  ('Demo Jumbo 1400kg', 'Demo Factory');

insert into public.rate_master (mesh, bag_type, rate, factory)
values
  ('200#', '50kg', 18, 'Demo Factory'),
  ('200#', 'Jumbo Bag (1250kg)', 420, 'Demo Factory'),
  ('300#', 'Jumbo Bag (1400kg)', 455, 'Demo Factory');

insert into public.opening_stock (bag_name, opening_quantity, minimum_stock, factory)
values
  ('Demo Premium 50kg', 800, 200, 'Demo Factory'),
  ('Demo Jumbo 1250kg', 120, 30, 'Demo Factory'),
  ('Demo Jumbo 1400kg', 90, 25, 'Demo Factory');

insert into public.transporter_master (transporter_name, factory)
values
  ('Demo Logistics', 'Demo Factory'),
  ('Sample Roadlines', 'Demo Factory');

insert into public.production_entries
  (production_date, factory, machine, labour_name, shift, mesh, bag_type, bag_name, quantity, rate, amount)
values
  ('2026-06-16', 'Demo Factory', 'Demo Machine 2', 'Ravi Demo', 'Night', '200#', 'Jumbo Bag (1250kg)', 'Demo Jumbo 1250kg', 115, 420, 48300),
  ('2026-08-21', 'Demo Factory', 'Demo Machine 3', 'Sohan Demo', 'Day', '300#', 'Jumbo Bag (1400kg)', 'Demo Jumbo 1400kg', 104, 455, 47320);

insert into public.dispatch_entries
  (
    dispatch_date, customer_name, factory, invoice_number, transporter_name,
    bag_type, bag_name, mesh, quantity, sales_rate, sales_amount,
    dispatch_bags, vehicle_no, lr_number, lr_freight, freight_type,
    freight_pmt, total_freight, loading_amount, loading_rate,
    loading_pending, vasuli, remarks
  )
values
  ('2026-05-19', 'Fictional Minerals Co', 'Demo Factory', 'DEMO-INV-26001', 'Demo Logistics', 'Jumbo Bag (1400kg)', 'Demo Jumbo 1400kg', '300#', 145.60, 2925, 425880, 104, 'RJ00DEMO3', 'DL-26001', 1200, 'Advance', 980, 142688, 13104, 90, false, 32032, 'Fictional demo dispatch');

insert into public.sales_adjustments
  (adjustment_date, customer_name, invoice_number, adjustment_type, amount, reason, remarks, factory)
values
  ('2026-05-24', 'Fictional Minerals Co', 'DEMO-INV-26001', 'Debit Note', 1800, 'Demo freight difference', 'Fictional demo adjustment', 'Demo Factory');

commit;
