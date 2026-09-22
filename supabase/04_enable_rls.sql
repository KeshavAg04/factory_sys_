-- ENABLE RLS - RUN ONLY AFTER DATA REVIEW, BACKFILL, AND POLICY REVIEW.
-- This file is deliberately separate so preparation scripts cannot enable RLS.

begin;

alter table public.profiles enable row level security;
alter table public.factory_master enable row level security;
alter table public.machine_master enable row level security;
alter table public.rate_master enable row level security;
alter table public.bag_name_master enable row level security;
alter table public.bag_type_master enable row level security;
alter table public.mesh_master enable row level security;
alter table public.transporter_master enable row level security;
alter table public.opening_stock enable row level security;
alter table public.empty_bag_inward enable row level security;
alter table public.inventory_closing enable row level security;
alter table public.production_entries enable row level security;
alter table public.dispatch_entries enable row level security;
alter table public.sales_adjustments enable row level security;
alter table public.factory_transfers enable row level security;

commit;
